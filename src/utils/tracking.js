// src/utils/tracking.js

export const logInteraction = (category, tags) => {
  // 1. Get existing history or start fresh
  const history = JSON.parse(localStorage.getItem('userPreferences')) || {};
  
  // 2. Add points for the main category (weight: 2 points)
  history[category] = (history[category] || 0) + 2;
  
  // 3. Add points for individual tags (weight: 1 point)
  tags.forEach(tag => {
    history[tag] = (history[tag] || 0) + 1;
  });
  
  // 4. Save back to storage
  localStorage.setItem('userPreferences', JSON.stringify(history));
};

export const getTopPreference = () => {
  const history = JSON.parse(localStorage.getItem('userPreferences')) || {};
  const interests = Object.keys(history);
  
  // If brand new user, default to 'All'
  if (interests.length === 0) return 'All'; 
  
  // Find the category/tag with the highest score
  return interests.reduce((top, current) => 
    history[current] > history[top] ? current : top
  );
};