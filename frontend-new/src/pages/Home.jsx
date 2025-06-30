import React from 'react';
import { Link } from 'react-router-dom';
import RecipeFinder from '../components/RecipeFinder';

function Home() {
  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Welcome to Recipe Buddy</h1>
        <p style={{ fontSize: '1.2rem', maxWidth: 500, textAlign: 'center' }}>
          Discover, share, and create amazing recipes. Find inspiration for your next meal and connect with a community of food lovers.
        </p>
      </div>
      <RecipeFinder />
    </>
  );
}

export default Home;
