

A comprehensive full-stack web application for discovering, creating, and managing recipes with advanced features including AI-powered recommendations, intelligent recipe similarity matching, and social interaction features.
  
## Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Installation and Setup](#installation-and-setup)
- [Environment Configuration](#environment-configuration)
- [Database Setup](#database-setup)
- [API Documentation](#api-documentation)
- [Frontend Components](#frontend-components)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [Troubleshooting](#troubleshooting)

## Project Overview

The Recipe Web App is a modern, feature-rich application designed to help users discover, create, and manage recipes. The application combines external recipe data from the Spoonacular API with user-generated content, providing a comprehensive recipe management experience.

### Key Capabilities

- Discover recipes from external APIs with advanced search and filtering
- Create and manage personal recipes with detailed information
- Get AI-powered recipe recommendations based on user preferences
- Save and organize favorite recipes in personal collections
- Like and interact with recipes to build preference profiles
- Search with intelligent autocomplete and advanced filters
- Experience seamless dark and light mode themes
- Receive similarity warnings to prevent duplicate recipes
- Use autofill suggestions to speed up recipe creation

## Features

### Core Functionality

**Recipe Discovery and Search**
- Browse thousands of recipes from the Spoonacular API
- Advanced search with autocomplete suggestions
- Filter by cuisine, diet, cooking time, and calorie content
- Recipe finder tool to discover recipes based on available ingredients

**Recipe Management**
- Create custom recipes with comprehensive details
- Edit and update existing recipes
- Delete recipes from personal collection
- Upload recipe images and add YouTube video links
- Organize recipes with tags and categories

**User Experience**
- Secure user authentication with JWT tokens
- Personal dashboard with recipe statistics
- Save and like recipes to build collections
- Dark and light mode themes for comfortable viewing
- Responsive design for mobile and desktop devices

### Advanced Features

**Intelligent Recipe System**
- AI-powered recipe recommendations based on user preferences
- Recipe similarity detection to prevent duplicates
- Autofill suggestions from external APIs
- Personalized recipe matching using Jaccard similarity algorithms

**Social Features**
- Like and unlike recipes
- Save recipes to personal collections
- View recipe statistics and popularity
- Share recipe information

**Search and Discovery**
- Real-time search with autocomplete
- Advanced filtering options
- Recipe finder based on ingredients
- Calorie range filtering
- Cuisine and dietary preference filters

## Technology Stack

### Frontend Technologies

**React Framework**
- React 18.2.0 with modern hooks and functional components
- React Router DOM 6.30.1 for client-side routing
- Context API for state management across components

**User Interface**
- CSS3 with component-specific styling
- Responsive design principles
- Dark mode implementation with CSS custom properties
- React Icons 5.5.0 for consistent iconography

**Data Management**
- Axios 1.10.0 for HTTP client operations
- Downshift 9.0.9 for accessible autocomplete components
- Local storage for theme preferences and user settings

### Backend Technologies

**Server Framework**
- Node.js runtime environment
- Express.js 5.1.0 web framework
- CORS 2.8.5 for cross-origin resource sharing
- Dotenv 16.6.1 for environment variable management

**Authentication and Security**
- JWT 9.0.2 for secure token-based authentication
- Bcrypt 6.0.0 for password hashing and security
- Row Level Security (RLS) policies in database

**Database and Storage**
- Supabase 2.50.2 as Backend-as-a-Service
- PostgreSQL database with real-time capabilities
- Supabase Auth for user authentication
- Real-time subscriptions for live data updates

### External Integrations

**Recipe Data**
- Spoonacular API for recipe search and information
- YouTube API for recipe video integration
- Image handling and optimization

**Development Tools**
- Nodemon 3.1.10 for development server with auto-restart
- React Scripts 5.0.1 for Create React App functionality
- Jest and Testing Library for comprehensive testing

## Architecture

The application follows a modern client-server architecture with clear separation of concerns:

```
Recipe Web App
├── frontend/                    # React frontend application
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   ├── Authentication/ # Login, Register, ProtectedRoute
│   │   │   ├── Recipe/         # RecipeCard, RecipeForm, RecipeDetail
│   │   │   ├── Search/         # AutoSuggestSearch, SearchResults
│   │   │   ├── UI/             # Navbar, DarkModeToggle, Buttons
│   │   │   └── Forms/          # Form sections and inputs
│   │   ├── pages/              # Main page components
│   │   │   ├── Home.jsx        # Landing page with hero section
│   │   │   ├── Recipes.jsx     # Recipe browsing and search
│   │   │   ├── Dashboard.jsx   # User dashboard
│   │   │   ├── RecipeForm.jsx  # Recipe creation and editing
│   │   │   └── RecipeDetail.jsx # Detailed recipe view
│   │   ├── contexts/           # React context providers
│   │   │   ├── AuthContext.jsx # Authentication state management
│   │   │   └── DarkModeContext.jsx # Theme state management
│   │   ├── api/                # API service functions
│   │   │   ├── axiosInstance.js # HTTP client configuration
│   │   │   ├── auth.js         # Authentication API calls
│   │   │   ├── recipes.js      # Recipe management API calls
│   │   │   ├── similarity.js   # Similarity and autofill API calls
│   │   │   └── recommendations.js # Recommendation API calls
│   │   ├── services/           # Business logic services
│   │   ├── utils/              # Utility functions and helpers
│   │   └── styles/             # Global styles and CSS variables
│   └── public/                 # Static assets and HTML template
├── backend/                     # Node.js/Express backend
│   ├── routes/                 # API route handlers
│   │   ├── auth.js             # Authentication routes
│   │   ├── recipes.js          # Recipe management routes
│   │   ├── spoonacular.js      # External API integration
│   │   ├── savedRecipes.js     # Saved recipes management
│   │   ├── likes.js            # Recipe liking functionality
│   │   └── recommendations.js  # Recommendation system
│   ├── middleware/             # Express middleware
│   │   ├── auth.js             # Authentication middleware
│   │   └── validation.js       # Request validation
│   ├── utils/                  # Utility functions
│   │   ├── computeOptimizedSimilarity.js # Similarity algorithms
│   │   └── generateSimilarityWarning.js  # Warning generation
│   ├── SQL/                    # Database setup scripts
│   ├── Testing/                # Backend test files
│   └── app.js                  # Main Express application
└── docs/                       # Additional documentation
```

## Prerequisites

Before setting up the project, ensure you have the following installed on your system:

**Required Software**
- Node.js version 16 or higher
- npm (Node Package Manager) or yarn package manager
- Git for version control and collaboration

**External Services**
- Supabase account for database and authentication services
- Spoonacular API key for recipe data access
- YouTube API key (optional, for video integration)

**Development Environment**
- Code editor (VS Code recommended)
- Web browser with developer tools
- Terminal or command prompt access

## Installation and Setup

### Step 1: Clone the Repository

Begin by cloning the repository to your local machine:

```bash
git clone <repository-url>
cd Recipe-Web-App-1
```

### Step 2: Backend Setup

Navigate to the backend directory and install dependencies:

```bash
cd backend
npm install
```

### Step 3: Frontend Setup

Navigate to the frontend directory and install dependencies:

```bash
cd frontend
npm install
```

### Step 4: Environment Configuration

Create environment configuration files for both backend and frontend:

**Backend Environment File (.env)**
Create a file named `.env` in the backend directory with the following variables:

```env
# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anonymous_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Spoonacular API Configuration
SPOONACULAR_API_KEY=your_spoonacular_api_key

# JWT Configuration
JWT_SECRET=your_secure_jwt_secret_key

# Server Configuration
PORT=5000
NODE_ENV=development
```

**Frontend Environment File (.env)**
Create a file named `.env` in the frontend directory with the following variables:

```env
REACT_APP_SUPABASE_URL=your_supabase_project_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anonymous_key
REACT_APP_API_BASE_URL=http://localhost:5000/api
```

### Step 5: Database Setup

Initialize the database by running the setup script:

```bash
cd backend
node SQL/setup-database.js
```

This script will output SQL commands that need to be executed in your Supabase dashboard SQL editor.

### Step 6: Start Development Servers

**Start the Backend Server**
```bash
cd backend
npm run dev
```

**Start the Frontend Server**
```bash
cd frontend
npm start
```

The application will be accessible at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Environment Configuration

### Backend Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `SUPABASE_URL` | Your Supabase project URL | Yes | - |
| `SUPABASE_ANON_KEY` | Supabase anonymous key for client operations | Yes | - |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key for admin operations | Yes | - |
| `SPOONACULAR_API_KEY` | Spoonacular API key for recipe data | Yes | - |
| `JWT_SECRET` | Secret key for JWT token signing | Yes | - |
| `PORT` | Server port number | No | 5000 |
| `NODE_ENV` | Environment mode (development/production) | No | development |

### Frontend Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `REACT_APP_SUPABASE_URL` | Your Supabase project URL | Yes | - |
| `REACT_APP_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes | - |
| `REACT_APP_API_BASE_URL` | Backend API base URL | Yes | - |

### Obtaining API Keys

**Spoonacular API Key**
1. Visit https://spoonacular.com/food-api
2. Sign up for a free account
3. Navigate to your profile to find your API key
4. Copy the key to your environment file

**Supabase Configuration**
1. Create a new project at https://supabase.com
2. Go to Settings > API to find your project URL and keys
3. Copy the URL and keys to your environment files

## Database Setup

### Database Schema Overview

The application uses a relational database structure with three main tables:

**Users Table**
Stores user profile information and authentication data:

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Recipes Table**
Stores user-created recipes with comprehensive details:

```sql
CREATE TABLE recipes (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  ingredients TEXT[],
  instructions TEXT,
  image TEXT,
  youtube_url TEXT,
  prep_time INTEGER,
  cook_time INTEGER,
  servings INTEGER,
  difficulty VARCHAR(50),
  cuisine VARCHAR(100),
  diet VARCHAR(100),
  tags TEXT[],
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Saved Recipes Table**
Manages user's saved recipe collections:

```sql
CREATE TABLE saved_recipes (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  recipe_id INTEGER REFERENCES recipes(id) ON DELETE CASCADE,
  spoonacular_id INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, recipe_id),
  UNIQUE(user_id, spoonacular_id)
);
```

### Row Level Security (RLS)

The application implements comprehensive Row Level Security policies to ensure data privacy and security:

**Users Table Policies**
- Users can only view and modify their own profile data
- Profile data is protected from unauthorized access

**Recipes Table Policies**
- Users can create, read, update, and delete their own recipes
- All users can view public recipes for discovery
- Recipe modifications are restricted to the original creator

**Saved Recipes Table Policies**
- Users can only access their own saved recipe collections
- Saved recipes are private to each user
- Cross-user access is prevented through RLS policies

### Database Setup Commands

Run the following commands in your Supabase SQL editor:

```sql
-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_recipes ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
-- Users policies
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Recipes policies
CREATE POLICY "Users can create recipes" ON recipes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view all recipes" ON recipes
  FOR SELECT USING (true);

CREATE POLICY "Users can update own recipes" ON recipes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own recipes" ON recipes
  FOR DELETE USING (auth.uid() = user_id);

-- Saved recipes policies
CREATE POLICY "Users can manage own saved recipes" ON saved_recipes
  FOR ALL USING (auth.uid() = user_id);
```

## API Documentation

### Authentication Endpoints

**User Registration**
```
POST /api/auth/register
```

Register a new user account with username, email, and password.

Request Body:
```json
{
  "username": "string",
  "email": "string",
  "password": "string"
}
```

Response:
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": "uuid",
    "username": "string",
    "email": "string"
  }
}
```

**User Login**
```
POST /api/auth/login
```

Authenticate user credentials and return JWT token for session management.

Request Body:
```json
{
  "email": "string",
  "password": "string"
}
```

Response:
```json
{
  "success": true,
  "message": "Login successful",
  "token": "jwt_token_string",
  "user": {
    "id": "uuid",
    "username": "string",
    "email": "string"
  }
}
```

### Recipe Management Endpoints

**Get All Recipes**
```
GET /api/recipes
```

Retrieve recipes with optional filtering and pagination.

Query Parameters:
- `page` (number): Page number for pagination
- `limit` (number): Number of items per page
- `search` (string): Search term for recipe titles
- `cuisine` (string): Filter by cuisine type
- `diet` (string): Filter by dietary restrictions
- `maxCalories` (number): Maximum calorie content

**Create New Recipe**
```
POST /api/recipes
```

Create a new recipe with comprehensive details.

Request Body:
```json
{
  "title": "string",
  "description": "string",
  "ingredients": ["string"],
  "instructions": "string",
  "prep_time": "number",
  "cook_time": "number",
  "servings": "number",
  "difficulty": "string",
  "cuisine": "string",
  "diet": "string",
  "tags": ["string"],
  "image": "string",
  "youtube_url": "string"
}
```

**Get Recipe by ID**
```
GET /api/recipes/:id
```

Retrieve detailed information for a specific recipe.

**Update Recipe**
```
PUT /api/recipes/:id
```

Update an existing recipe with new information.

**Delete Recipe**
```
DELETE /api/recipes/:id
```

Remove a recipe from the database.

### External API Integration

**Spoonacular Recipe Search**
```
GET /api/spoonacular/search
```

Search for recipes from the Spoonacular API.

Query Parameters:
- `query` (string): Search query for recipe names or ingredients
- `cuisine` (string): Filter by cuisine type
- `diet` (string): Filter by dietary restrictions
- `maxCalories` (number): Maximum calorie content
- `offset` (number): Pagination offset

**Spoonacular Recipe Details**
```
GET /api/spoonacular/recipe/:id
```

Get detailed information for a specific Spoonacular recipe.

### User Interaction Endpoints

**Save Recipe**
```
POST /api/saved-recipes
```

Add a recipe to the user's saved collection.

**Remove Saved Recipe**
```
DELETE /api/saved-recipes/:recipeId
```

Remove a recipe from the user's saved collection.

**Like Recipe**
```
POST /api/likes/:recipeId
```

Like a recipe to indicate user preference.

**Unlike Recipe**
```
DELETE /api/likes/:recipeId
```

Remove like from a recipe.

### Advanced Features

**Recipe Similarity Check**
```
POST /api/recipe/check-similarity
```

Check if a recipe is similar to existing recipes to prevent duplicates.

**Autofill Suggestions**
```
POST /api/recipe/get-autofill-suggestions
```

Get autofill suggestions for recipe creation based on title and ingredients.

**Personalized Recommendations**
```
GET /api/recommendations
```

Get AI-powered recipe recommendations based on user preferences and history.

## Frontend Components

### Authentication Components

**Login Component**
- Handles user authentication with email and password
- Validates input fields and displays error messages
- Redirects to dashboard upon successful login
- Integrates with AuthContext for state management

**Register Component**
- New user registration with username, email, and password
- Password confirmation and validation
- Automatic login after successful registration
- Error handling for duplicate usernames or emails

**Protected Route Component**
- Wrapper component for routes requiring authentication
- Redirects unauthenticated users to login page
- Preserves intended destination for post-login redirect

### Recipe Management Components

**Recipe Card Component**
- Displays recipe information in a compact card format
- Shows recipe image, title, cooking time, and difficulty
- Includes like and save buttons for user interaction
- Handles navigation to detailed recipe view

**Recipe Form Component**
- Comprehensive form for creating and editing recipes
- Multiple sections for different recipe aspects
- Image upload and YouTube URL integration
- Real-time validation and error handling

**Recipe Detail Component**
- Detailed view of recipe information
- Displays ingredients, instructions, and metadata
- Edit and delete options for recipe owners
- Social interaction buttons (like, save)

### Search and Discovery Components

**Auto Suggest Search Component**
- Intelligent search with real-time suggestions
- Integrates with Downshift for accessibility
- Handles search history and popular queries
- Provides instant feedback during typing

**Search Results Component**
- Displays search results in grid or list format
- Implements pagination for large result sets
- Provides filtering and sorting options
- Handles loading states and error conditions

**Recipe Finder Component**
- Advanced search based on available ingredients
- Calorie range filtering
- Cuisine and dietary preference filters
- Generates shopping lists from selected recipes

### User Interface Components

**Navigation Bar Component**
- Main navigation with logo and menu items
- User authentication status display
- Dark mode toggle integration
- Responsive design for mobile devices

**Dark Mode Toggle Component**
- Theme switching between light and dark modes
- Persistent theme preference storage
- Smooth transitions between themes
- Accessible design with proper ARIA labels

**Like Button Component**
- Handles recipe liking and unliking
- Real-time state updates
- Visual feedback for user interactions
- Integration with user preference tracking

**Save Recipe Button Component**
- Manages recipe saving and unsaving
- Updates user's saved recipe collection
- Provides visual confirmation of actions
- Handles error states gracefully

### Form Components

**Basic Info Section Component**
- Recipe title, description, and category inputs
- Image upload functionality
- YouTube URL integration
- Real-time validation and error display

**Ingredients Section Component**
- Dynamic ingredient list management
- Add and remove ingredient functionality
- Ingredient validation and formatting
- Integration with autofill suggestions

**Instructions Section Component**
- Step-by-step instruction management
- Rich text editing capabilities
- Instruction reordering functionality
- Character count and validation

**Recipe Stats Section Component**
- Cooking time, servings, and difficulty inputs
- Calorie and nutrition information
- Cuisine and dietary classification
- Advanced metadata management

### Context Providers

**Auth Context**
Manages global authentication state and provides authentication methods throughout the application:

- User login and logout functionality
- Token management and validation
- User profile information
- Authentication status tracking
- Protected route access control

**Dark Mode Context**
Manages theme state and provides theme switching functionality:

- Theme preference storage
- Theme switching methods
- CSS variable management
- Persistent theme selection
- System theme detection

### Page Components

**Home Page**
- Landing page with hero section and search functionality
- Featured recipes and recommendations
- User onboarding and feature highlights
- Call-to-action buttons for registration

**Recipes Page**
- Main recipe browsing and search interface
- Tab navigation between explore and personal recipes
- Advanced filtering and sorting options
- Recipe grid and list view options

**Dashboard Page**
- User's personal recipe management center
- Statistics and activity overview
- Quick access to saved and created recipes
- User profile management

**Recipe Detail Page**
- Comprehensive recipe information display
- Social interaction features
- Related recipe suggestions
- Print and share functionality

## Testing

### Frontend Testing

The frontend application uses Jest and React Testing Library for comprehensive testing:

**Running Tests**
```bash
cd frontend
npm test
```

**Test Coverage**
```bash
npm test -- --coverage
```

**Test Structure**
- Unit tests for individual components
- Integration tests for component interactions
- API service tests for data fetching
- Context provider tests for state management

### Backend Testing

The backend uses Jest for API endpoint testing:

**Running Tests**
```bash
cd backend
npm test
```

**Test Categories**
- Authentication endpoint tests
- Recipe management tests
- External API integration tests
- Database operation tests
- Error handling tests

### Test Files Organization

```
Testing/
├── test-auth.js              # Authentication tests
├── test-recipe.js            # Recipe management tests
├── test-spoonacular.js       # External API tests
├── test-recommendations.js   # Recommendation system tests
├── test-similarity.js        # Similarity algorithm tests
└── test-database.js          # Database operation tests
```

### Testing Best Practices

- Write tests for all critical user flows
- Test error conditions and edge cases
- Maintain high test coverage for core functionality
- Use descriptive test names and clear assertions
- Mock external dependencies appropriately

## Deployment

### Backend Deployment

**Environment Setup**
1. Configure production environment variables
2. Set up database connections and security
3. Configure CORS settings for production domains
4. Set up logging and monitoring

**Deployment Steps**
```bash
# Install production dependencies
npm install --production

# Set environment variables
export NODE_ENV=production
export PORT=5000

# Start the server
npm start
```

**Recommended Platforms**
- Heroku: Easy deployment with automatic scaling
- Railway: Modern platform with excellent Node.js support
- DigitalOcean: Full control over server configuration
- AWS: Enterprise-grade infrastructure and services

### Frontend Deployment

**Build Process**
```bash
# Install dependencies
npm install

# Create production build
npm run build

# Test production build locally
npm run serve
```

**Deployment Steps**
1. Build the application for production
2. Upload the build folder to your hosting platform
3. Configure environment variables
4. Set up custom domain and SSL certificate

**Recommended Platforms**
- Vercel: Optimized for React applications
- Netlify: Excellent static site hosting
- GitHub Pages: Free hosting for open source projects
- AWS S3: Scalable static website hosting

### Production Configuration

**Environment Variables**
Ensure all production environment variables are properly configured:
- Database connection strings
- API keys and secrets
- Domain and URL configurations
- Security settings

**Performance Optimization**
- Enable compression and caching
- Optimize images and assets
- Implement CDN for static content
- Monitor application performance

**Security Considerations**
- Use HTTPS for all communications
- Implement proper CORS policies
- Secure API endpoints with authentication
- Regular security updates and monitoring

## Contributing

### Development Workflow

1. Fork the repository to your GitHub account
2. Clone your fork to your local machine
3. Create a feature branch for your changes
4. Make your changes and test thoroughly
5. Commit your changes with descriptive messages
6. Push your branch to your fork
7. Create a pull request with detailed description

### Code Style Guidelines

**JavaScript/React**
- Use consistent indentation (2 spaces)
- Follow ESLint configuration
- Use meaningful variable and function names
- Add comments for complex logic
- Use modern JavaScript features appropriately

**CSS/Styling**
- Create separate CSS files for each component
- Use CSS custom properties for theming
- Follow BEM methodology for class naming
- Ensure responsive design principles
- Maintain accessibility standards

**Git Commit Messages**
- Use present tense for commit messages
- Start with a verb describing the action
- Keep messages concise but descriptive
- Reference issue numbers when applicable

### Pull Request Guidelines

**Before Submitting**
- Ensure all tests pass
- Update documentation if needed
- Test on multiple browsers and devices
- Review code for security implications

**Pull Request Description**
- Describe the problem being solved
- Explain the solution approach
- List any breaking changes
- Include screenshots for UI changes
- Reference related issues

### Code Review Process

- All pull requests require review
- Address review comments promptly
- Maintain respectful and constructive feedback
- Ensure code quality and maintainability
- Test changes thoroughly before merging

## Troubleshooting

### Common Issues and Solutions

**Backend Issues**

**Port Already in Use**
If you encounter a port conflict when starting the backend server:

```bash
# Find processes using port 5000
lsof -ti:5000

# Kill the process
lsof -ti:5000 | xargs kill -9
```

**Database Connection Issues**
If you experience database connection problems:

1. Verify Supabase credentials in your environment file
2. Check network connectivity to Supabase
3. Ensure Row Level Security policies are properly configured
4. Verify database tables exist and are accessible

**Authentication Problems**
If users cannot log in or register:

1. Check JWT secret configuration
2. Verify Supabase authentication settings
3. Ensure user table policies are correctly set
4. Check for CORS configuration issues

**Frontend Issues**

**Build Errors**
If you encounter build errors:

```bash
# Clear cache and reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Clear React cache
npm run build -- --reset-cache
```

**API Connection Issues**
If the frontend cannot connect to the backend:

1. Verify the backend server is running
2. Check the API base URL configuration
3. Ensure CORS is properly configured
4. Verify network connectivity

**Component Rendering Issues**
If components are not rendering correctly:

1. Check browser console for JavaScript errors
2. Verify all required props are being passed
3. Ensure context providers are properly configured
4. Check for missing dependencies

### Debug Mode

Enable debug logging for troubleshooting:

**Backend Debug Mode**
```env
NODE_ENV=development
DEBUG=true
```

**Frontend Debug Mode**
```env
REACT_APP_DEBUG=true
```

### Performance Issues

**Slow Loading Times**
- Implement lazy loading for routes
- Optimize images and assets
- Use pagination for large datasets
- Enable compression and caching

**Memory Leaks**
- Clean up event listeners
- Properly unmount components
- Use React.memo for expensive components
- Monitor memory usage in development

### Getting Help

**Documentation**
- Review this README thoroughly
- Check the API documentation
- Examine the code comments
- Look at existing issues and solutions

**Community Support**
- Create an issue in the repository
- Provide detailed error messages
- Include steps to reproduce the problem
- Share relevant code snippets

**Development Tools**
- Use browser developer tools for frontend debugging
- Implement logging for backend debugging
- Use React Developer Tools for component inspection
- Monitor network requests and responses

## License

This project is licensed under the MIT License. See the LICENSE file for full license details.

## Support

For support, questions, or contributions:

- Create an issue in the repository
- Review the troubleshooting section
- Check the API documentation
- Examine the code comments and examples

The project is actively maintained and welcomes contributions from the community. Please follow the contributing guidelines when submitting changes or improvements.

---

This documentation is continuously updated to reflect the current state of the application. For the most recent version, always refer to the repository.

