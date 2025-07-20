import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { DarkModeProvider } from './contexts/DarkModeContext';
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import Recipes from './pages/Recipes';
import RecipeDetail from './pages/RecipeDetail';
import RecipeForm from './pages/RecipeForm';
import EditRecipe from './pages/EditRecipe';
import Dashboard from './pages/Dashboard';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import './styles/dark-mode.css';

function App() {
  return (
    <DarkModeProvider>
      <AuthProvider>
        <Router future={{ v7_relativeSplatPath: true }}>
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/recipes" element={<Recipes />} />
            <Route path="/recipes/:id" element={<RecipeDetail />} />
            <Route path="/recipes/create" element={<ProtectedRoute><RecipeForm /></ProtectedRoute>} />
            <Route path="/recipes/edit/:id" element={<ProtectedRoute><EditRecipe /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          </Routes>
        </Router>
      </AuthProvider>
    </DarkModeProvider>
  );
}

export default App;
