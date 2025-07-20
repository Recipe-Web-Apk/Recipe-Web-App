import React, { useState } from 'react';
import Downshift from 'downshift';

const fetchSuggestions = async (inputValue) => {
  if (!inputValue || inputValue.length < 2) return [];
  const res = await fetch(`/api/spoonacular/autocomplete?query=${encodeURIComponent(inputValue)}`);
  const data = await res.json();
  return data || [];
};

const AutoSuggestRecipeTitle = ({ value, onChange }) => {
  const [items, setItems] = useState([]);

  return (
    <Downshift
      inputValue={value}
      onInputValueChange={async (inputValue) => {
        const suggestions = await fetchSuggestions(inputValue);
        setItems(suggestions);
      }}
      onChange={selection => onChange(selection.title)}
      itemToString={item => (item ? item.title : '')}
    >
      {({
        getInputProps,
        getItemProps,
        getMenuProps,
        isOpen,
        highlightedIndex,
        selectedItem,
      }) => (
        <div style={{ position: 'relative' }}>
          <input {...getInputProps({ placeholder: 'Recipe Title' })} />
          <ul {...getMenuProps()} style={{ background: '#fff', border: '1px solid #ccc', position: 'absolute', zIndex: 10, width: '100%', margin: 0, padding: 0, listStyle: 'none' }}>
            {isOpen &&
              items.map((item, index) => (
                <li
                  {...getItemProps({ key: item.id, index, item })}
                  style={{
                    backgroundColor: highlightedIndex === index ? '#f97316' : '#fff',
                    color: highlightedIndex === index ? '#fff' : '#333',
                    padding: '0.5rem',
                    cursor: 'pointer',
                  }}
                >
                  {item.title}
                </li>
              ))}
          </ul>
        </div>
      )}
    </Downshift>
  );
};

export default AutoSuggestRecipeTitle; 