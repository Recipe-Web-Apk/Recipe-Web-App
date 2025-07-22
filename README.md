# Recipe Web App

A comprehensive full-stack web application for discovering, creating, and managing recipes with advanced features like AI-powered recommendations, recipe similarity matching, and social features.

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Environment Configuration](#environment-configuration)
- [Database Setup](#database-setup)
- [API Documentation](#api-documentation)
- [Frontend Components](#frontend-components)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [Troubleshooting](#troubleshooting)

## 🎯 Project Overview

The Recipe Web App is a modern, feature-rich application that allows users to:
- Discover recipes from external APIs (Spoonacular)
- Create and manage personal recipes
- Get AI-powered recipe recommendations
- Save and organize favorite recipes
- Like and interact with recipes
- Search with intelligent autocomplete
- Experience dark/light mode themes

## ✨ Features

### Core Features
- **Recipe Discovery**: Browse recipes from Spoonacular API
- **Recipe Creation**: Create custom recipes with detailed information
- **Recipe Management**: Edit, delete, and organize personal recipes
- **Recipe Saving**: Save favorite recipes to personal collection
- **Recipe Liking**: Like recipes and track preferences
- **Advanced Search**: Search with autocomplete and filters
- **Recipe Recommendations**: AI-powered personalized recommendations
- **Similar Recipes**: Find similar recipes based on ingredients and preferences
- **User Authentication**: Secure registration and login system
- **User Dashboard**: Personal dashboard with saved recipes and stats
- **Dark/Light Mode**: Theme switching for better user experience

### Advanced Features
- **Autocomplete Search**: Intelligent search suggestions
- **Recipe Similarity**: Find similar recipes using custom algorithms
- **Calorie Range Filtering**: Filter recipes by calorie content
- **Cuisine and Diet Filters**: Advanced filtering options
- **Recipe Statistics**: View cooking times, difficulty, and nutrition info
- **Responsive Design**: Mobile-friendly interface
- **Real-time Updates**: Live updates for likes and saves

## 🛠 Technology Stack

### Frontend
- **React 18.2.0** - Modern React with hooks
- **React Router DOM 6.30.1** - Client-side routing
- **Axios 1.10.0** - HTTP client for API calls
- **Downshift 9.0.9** - Accessible autocomplete components
- **React Icons 5.5.0** - Icon library
- **CSS3** - Styling with component-specific CSS files

### Backend
- **Node.js** - JavaScript runtime
- **Express.js 5.1.0** - Web framework
- **Supabase 2.50.2** - Backend-as-a-Service (Database & Auth)
- **JWT 9.0.2** - JSON Web Tokens for authentication
- **Bcrypt 6.0.0** - Password hashing
- **CORS 2.8.5** - Cross-origin resource sharing
- **Dotenv 16.6.1** - Environment variable management

### Database
- **Supabase PostgreSQL** - Primary database
- **Row Level Security (RLS)** - Data security policies
- **Real-time subscriptions** - Live data updates

### External APIs
- **Spoonacular API** - Recipe data and search
- **YouTube API** - Recipe video integration

### Development Tools
- **Nodemon 3.1.10** - Development server with auto-restart
- **React Scripts 5.0.1** - Create React App scripts
- **Jest & Testing Library** - Testing framework

## 🏗 Architecture

```
Recipe Web App
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── contexts/       # React contexts (Auth, DarkMode)
│   │   ├── api/            # API service functions
│   │   ├── services/       # Business logic services
│   │   ├── utils/          # Utility functions
│   │   └── styles/         # Global styles
│   └── public/             # Static assets
├── backend/                 # Node.js/Express backend
│   ├── routes/             # API route handlers
│   ├── controllers/        # Business logic controllers
│   ├── middleware/         # Express middleware
│   ├── SQL/               # Database setup scripts
│   ├── Testing/           # Backend tests
│   └── utils/             # Utility functions
└── docs/                   # Documentation
```

## 📋 Prerequisites

Before setting up the project, ensure you have:

- **Node.js** (v16 or higher)
- **npm** or **yarn** package manager
- **Git** for version control
- **Supabase account** for database and authentication
- **Spoonacular API key** for recipe data

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Recipe-Web-App-1
```

### 2. Backend Setup

```bash
cd backend
npm install
```

### 3. Frontend Setup

```bash
cd frontend
npm install
```

### 4. Environment Configuration

Create environment files for both backend and frontend:

#### Backend (.env)
```env
# Supabase Configuration
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Spoonacular API
SPOONACULAR_API_KEY=your_spoonacular_api_key

# JWT Configuration
JWT_SECRET=your_jwt_secret_key

# Server Configuration
PORT=5000
NODE_ENV=development
```

#### Frontend (.env)
```env
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
REACT_APP_API_BASE_URL=http://localhost:5000/api
```

### 5. Database Setup

Run the database setup script:

```bash
cd backend
node SQL/setup-database.js
```

This will output SQL commands to run in your Supabase dashboard.

### 6. Start Development Servers

#### Backend Server
```bash
cd backend
npm run dev
```

#### Frontend Server
```bash
cd frontend
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 🔧 Environment Configuration

### Required Environment Variables

#### Backend (.env)
| Variable | Description | Required |
|----------|-------------|----------|
| `SUPABASE_URL` | Your Supabase project URL | Yes |
| `SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Yes |
| `SPOONACULAR_API_KEY` | Spoonacular API key | Yes |
| `JWT_SECRET` | Secret key for JWT tokens | Yes |
| `PORT` | Server port (default: 5000) | No |
| `NODE_ENV` | Environment (development/production) | No |

#### Frontend (.env)
| Variable | Description | Required |
|----------|-------------|----------|
| `REACT_APP_SUPABASE_URL` | Your Supabase project URL | Yes |
| `REACT_APP_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `REACT_APP_API_BASE_URL` | Backend API base URL | Yes |

## 🗄 Database Setup

### Database Schema

The application uses three main tables:

#### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Recipes Table
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

#### Saved Recipes Table
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

The application implements RLS policies for data security:

- Users can only view their own profile data
- Users can only modify their own recipes
- Users can only access their saved recipes
- All users can view public recipes

## 📚 API Documentation

### Authentication Endpoints

#### POST /api/auth/register
Register a new user.

**Request Body:**
```json
{
  "username": "string",
  "email": "string",
  "password": "string"
}
```

**Response:**
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

#### POST /api/auth/login
Authenticate user and return JWT token.

**Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "jwt_token",
  "user": {
    "id": "uuid",
    "username": "string",
    "email": "string"
  }
}
```

### Recipe Endpoints

#### GET /api/recipes
Get all recipes with pagination and filters.

**Query Parameters:**
- `page` (number): Page number
- `limit` (number): Items per page
- `search` (string): Search term
- `cuisine` (string): Cuisine filter
- `diet` (string): Diet filter
- `maxCalories` (number): Maximum calories

#### POST /api/recipes
Create a new recipe.

**Request Body:**
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
  "tags": ["string"]
}
```

#### GET /api/recipes/:id
Get recipe by ID.

#### PUT /api/recipes/:id
Update recipe by ID.

#### DELETE /api/recipes/:id
Delete recipe by ID.

### Spoonacular Integration

#### GET /api/spoonacular/search
Search recipes from Spoonacular API.

**Query Parameters:**
- `query` (string): Search query
- `cuisine` (string): Cuisine filter
- `diet` (string): Diet filter
- `maxCalories` (number): Maximum calories
- `offset` (number): Pagination offset

#### GET /api/spoonacular/recipe/:id
Get recipe details from Spoonacular.

### User Actions

#### POST /api/saved-recipes
Save a recipe to user's collection.

#### DELETE /api/saved-recipes/:recipeId
Remove recipe from saved collection.

#### POST /api/likes/:recipeId
Like a recipe.

#### DELETE /api/likes/:recipeId
Unlike a recipe.

#### GET /api/recommendations
Get personalized recipe recommendations.

#### GET /api/similar-recipes/:recipeId
Find similar recipes.

## 🧩 Frontend Components

### Core Components

#### Authentication Components
- `Login.jsx` - User login form
- `Register.jsx` - User registration form
- `ProtectedRoute.jsx` - Route protection wrapper

#### Recipe Components
- `RecipeCard.jsx` - Recipe display card
- `RecipeForm.jsx` - Recipe creation/editing form
- `RecipeDetail.jsx` - Detailed recipe view
- `RecipeFinder.jsx` - Recipe search interface

#### Search Components
- `AutoSuggestSearch.jsx` - Intelligent search with autocomplete
- `SearchResults.jsx` - Search results display
- `DownshiftAutoComplete.jsx` - Accessible autocomplete

#### User Interface Components
- `Navbar.jsx` - Navigation bar
- `DarkModeToggle.jsx` - Theme switcher
- `LikeButton.jsx` - Recipe like functionality
- `SaveRecipeButton.jsx` - Recipe save functionality

#### Form Components
- `BasicInfoSection.jsx` - Recipe basic information
- `IngredientsSection.jsx` - Ingredients management
- `InstructionsSection.jsx` - Cooking instructions
- `CalorieRangeInput.jsx` - Calorie range selector

### Context Providers

#### AuthContext
Manages user authentication state and provides auth methods.

#### DarkModeContext
Manages dark/light mode theme state.

### Pages

- `Home.jsx` - Landing page with hero section
- `Recipes.jsx` - Recipe browsing page
- `Dashboard.jsx` - User dashboard
- `EditRecipe.jsx` - Recipe editing page

## 🧪 Testing

### Frontend Testing

Run frontend tests:
```bash
cd frontend
npm test
```

### Backend Testing

Run backend tests:
```bash
cd backend
npm test
```

### Test Files Structure

```
Testing/
├── test-auth.js
├── test-recipe.js
├── test-spoonacular.js
├── test-recommendations.js
└── ...
```

## 🚀 Deployment

### Backend Deployment

1. Set up environment variables on your hosting platform
2. Install dependencies: `npm install --production`
3. Start the server: `npm start`

### Frontend Deployment

1. Build the application: `npm run build`
2. Deploy the `build` folder to your hosting platform
3. Configure environment variables

### Recommended Platforms

- **Backend**: Heroku, Railway, or DigitalOcean
- **Frontend**: Vercel, Netlify, or GitHub Pages
- **Database**: Supabase (already configured)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Add tests for new functionality
5. Commit your changes: `git commit -m 'Add feature'`
6. Push to the branch: `git push origin feature-name`
7. Submit a pull request

### Code Style Guidelines

- Use consistent indentation (2 spaces)
- Follow ESLint configuration
- Write meaningful commit messages
- Add comments for complex logic
- Create separate CSS files for each component

## 🔧 Troubleshooting

### Common Issues

#### Backend Issues

**Port already in use:**
```bash
# Kill process using port 5000
lsof -ti:5000 | xargs kill -9
```

**Database connection issues:**
- Verify Supabase credentials in `.env`
- Check network connectivity
- Ensure RLS policies are properly configured

#### Frontend Issues

**Build errors:**
```bash
# Clear cache and reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

**API connection issues:**
- Verify backend server is running
- Check CORS configuration
- Ensure API base URL is correct

### Debug Mode

Enable debug logging by setting:
```env
NODE_ENV=development
DEBUG=true
```

### Performance Optimization

- Use React.memo for expensive components
- Implement lazy loading for routes
- Optimize images and assets
- Use pagination for large datasets

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support and questions:
- Create an issue in the repository
- Check the troubleshooting section
- Review the API documentation

---

**Note**: This documentation is continuously updated. For the latest version, always refer to the repository.