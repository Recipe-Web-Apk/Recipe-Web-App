import React, { useEffect, useState } from 'react';
import './DarkModeToggle.css';

const LIGHT_THEME = '/theme-light.css';
const DARK_THEME = '/theme-dark.css';

function DarkModeToggle() {
  const [dark, setDark] = useState(() => {
    const stored = localStorage.getItem('darkMode');
    return stored ? stored === 'true' : window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    // Remove any existing theme link
    const existing = document.getElementById('theme-css');
    if (existing) existing.remove();
    // Add the correct theme
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.id = 'theme-css';
    link.href = dark ? DARK_THEME : LIGHT_THEME;
    document.head.appendChild(link);
    // Set body class for legacy dark-mode CSS if needed
    if (dark) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
    localStorage.setItem('darkMode', dark);
  }, [dark]);

  return (
    <button className={`dark-mode-toggle${dark ? ' active' : ''}`} onClick={() => setDark(d => !d)} aria-label="Toggle dark mode">
      {dark ? '🌙' : '☀️'}
    </button>
  );
}

export default DarkModeToggle; 