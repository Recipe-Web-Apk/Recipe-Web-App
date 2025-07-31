import React from 'react';
import './LoadingSpinner.css';

const LoadingSpinner = ({ 
  size = 'medium', 
  color = 'primary', 
  text = 'Loading...',
  fullScreen = false 
}) => {
  const sizeClass = `spinner--${size}`;
  const colorClass = `spinner--${color}`;
  const fullScreenClass = fullScreen ? 'spinner--fullscreen' : '';

  return (
    <div className={`loading-spinner ${sizeClass} ${colorClass} ${fullScreenClass}`}>
      <div className="spinner">
        <div className="spinner__ring"></div>
        <div className="spinner__ring"></div>
        <div className="spinner__ring"></div>
      </div>
      {text && <p className="spinner__text">{text}</p>}
    </div>
  );
};

export default LoadingSpinner; 