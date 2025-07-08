import React, { useRef } from 'react';
import './HomeHero.css';

function HomeHero({ onSearch }) {
  const inputRef = useRef();

  function handleFocus() {
    inputRef.current.classList.add('expanded');
  }
  function handleBlur() {
    inputRef.current.classList.remove('expanded');
  }
  function handleSubmit(e) {
    e.preventDefault();
    if (onSearch) onSearch(inputRef.current.value);
  }

  return (
    <section className="home-hero-full fade-in">
      <div className="home-hero-content slide-up">
        <h1 className="home-hero-title fade-in">Find. Cook. Eat. Better.</h1>
        <form className="home-hero-search-form fade-in" onSubmit={handleSubmit} autoComplete="off">
          <input
            ref={inputRef}
            type="text"
            className="home-hero-search-input"
            placeholder="Search recipes, ingredients, or cuisines..."
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
          <button type="submit" className="home-hero-search-btn">Search</button>
        </form>
      </div>
    </section>
  );
}

export default HomeHero; 