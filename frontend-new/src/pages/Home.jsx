import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Welcome to Recipe Buddy</h1>
        <p style={{ fontSize: '1.2rem', maxWidth: 500, textAlign: 'center' }}>
          Discover, share, and create amazing recipes. Find inspiration for your next meal and connect with a community of food lovers.
        </p>
      </div>
      <div style={{ width: '100%', background: '#f7f7f7', padding: '3rem 0', borderTop: '1px solid #eee', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Recipe Finder</h2>
        <p style={{ fontSize: '1.1rem', maxWidth: 500, textAlign: 'center', color: '#555' }}>
          Enter at least 4 ingredients and a calorie range to discover recipes tailored to your needs. This feature is coming soon.
        </p>
      </div>
    </>
  );
}

export default Home;
