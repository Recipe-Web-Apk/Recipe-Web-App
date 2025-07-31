const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const validateRegistration = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('username').trim().isLength({ min: 3, max: 30 }),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

const validateLogin = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 1 }),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

// Registration endpoint
router.post('/register', validateRegistration, async (req, res) => {
  try {
    const { email, password, username } = req.body;

    if (!email || !password || !username) {
      return res.status(400).json({ 
        error: 'Email, password, and username are required' 
      });
    }

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username
        }
      }
    });

    if (authError) {
      return res.status(400).json({ error: authError.message });
    }

    // Create user profile in public.users table
    const { error: profileError } = await supabase
      .from('users')
      .insert([
        {
          id: authData.user.id,
          email: email,
          username: username,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]);

    if (profileError) {
      console.error('Profile creation error:', profileError);
      // Don't fail registration if profile creation fails
      // The user can still log in and we can retry profile creation
    }

    res.json({ 
      success: true, 
      message: 'Registration successful. Please check your email to verify your account.' 
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login user
router.post('/login', validateLogin, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Authenticate user with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.error('Login error:', error);
      return res.status(401).json({ error: error.message });
    }

    // Get user profile by id (UUID)
    let profile = null;
    const { data: profileData, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .maybeSingle();

    if (profileError) {
      console.error('Profile fetch error:', profileError);
    }
      
    // If profile doesn't exist, create it
    if (!profileData) {
        const { data: newProfile, error: createError } = await supabase
          .from('users')
        .insert([
          {
            id: data.user.id,
            username: data.user.user_metadata?.username || data.user.email.split('@')[0],
            email: data.user.email,
            created_at: new Date().toISOString()
          }
        ], { upsert: true });
        if (createError) {
          console.error('Failed to create profile on login:', createError);
        } else {
          console.log('Profile created successfully on login');
        profile = newProfile ? newProfile[0] : null;
      }
    } else {
      profile = profileData;
    }

    res.json({
      message: 'Login successful',
      user: {
        id: data.user.id, // Always use auth user ID for consistency
        auth_id: data.user.id, // Keep auth ID for reference
        email: data.user.email,
        username: profile?.username || data.user.user_metadata?.username
      },
      session: data.session
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Logout user
router.post('/logout', async (req, res) => {
  try {
    const { access_token } = req.body;

    if (!access_token) {
      return res.status(400).json({ error: 'Access token is required' });
    }

    // Set the session for the request
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('Logout error:', error);
      return res.status(400).json({ error: error.message });
    }

    res.json({ message: 'Logout successful' });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current user
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];

    // Verify the token and get user
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Get user profile by id (UUID) instead of email
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .maybeSingle(); // Use maybeSingle for graceful handling

    if (profileError) {
      console.error('Profile fetch error:', profileError);
    }

    res.json({
      user: {
        id: user.id, // Always use auth user ID for consistency
        auth_id: user.id, // Keep auth ID for reference
        email: user.email,
        username: profile?.username || user.user_metadata?.username
      }
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Refresh token
router.post('/refresh', async (req, res) => {
  try {
    const { refresh_token } = req.body;

    if (!refresh_token) {
      return res.status(400).json({ error: 'Refresh token is required' });
    }

    const { data, error } = await supabase.auth.refreshSession({
      refresh_token
    });

    if (error) {
      console.error('Token refresh error:', error);
      return res.status(401).json({ error: error.message });
    }

    res.json({
      session: data.session
    });

  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Change password
router.post('/change-password', async (req, res) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' })
    }
    const token = authHeader.split(' ')[1]
    const { currentPassword, newPassword } = req.body
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current and new password are required' })
    }
    // Get user from token
    const { data: { user }, error } = await supabase.auth.getUser(token)
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid token' })
    }
    // Authenticate current password
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword
    })
    if (loginError) {
      return res.status(401).json({ error: 'Current password is incorrect' })
    }
    // Update password
    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword }, { accessToken: token })
    if (updateError) {
      return res.status(400).json({ error: updateError.message })
    }
    res.json({ message: 'Password changed successfully' })
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Update profile
router.post('/update-profile', async (req, res) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' })
    }
    const token = authHeader.split(' ')[1]
    const { username } = req.body
    if (!username) {
      return res.status(400).json({ error: 'Username is required' })
    }
    // Get user from token
    const { data: { user }, error } = await supabase.auth.getUser(token)
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid token' })
    }
    // Update username in users table
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .update({ username })
      .eq('id', user.id)
      .select('*')
      .single()
    if (profileError) {
      return res.status(400).json({ error: profileError.message })
    }
    res.json({ user: { id: user.id, email: profile.email, username: profile.username } })
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' })
  }
})

module.exports = router;
