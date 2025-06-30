const {PrismaClient} = require('@prisma/client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

const registerUser = async (req, res) => {
    const {email, username, password} = req.body;
    if (!email || !username || !password) return res.status(400).json({msg: 'Please enter all fields'});

    const existingUser = await prisma.user.findUnique({where: {email}});
    if (existingUser) return res.status(400).json({message: 'User already exists'});

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
        data: {
            email,
            username,
            password: hashedPassword
        }
    });
    res.status(201).json({message: 'User registered successfully', user: {id: user.id, email: user.email}});
};

const loginUser = async (req, res) => {
    const {email, password} = req.body;
    const user = await prisma.user.findUnique({where: {email}});
    if (!user) return res.status(401).json({error: 'Invalid credentials'});

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({error: 'Invalid credentials'});

    const token = jwt.sign({userId: user.id}, process.env.JWT_SECRET || 'fallback_secret', {expiresIn: '1h'});
    res.json({message: 'Login successful', token, user: {id: user.id, email: user.email, username: user.username}});
};

module.exports = {registerUser, loginUser};
