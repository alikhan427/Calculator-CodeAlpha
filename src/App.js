import React from 'react';
import './App.css';
import Calculator from './components/calculator/Calculator';

/**
 * Main App component
 * Renders the Calculator component
 */
function App() {
  return (
    <div className="app">
      <Calculator />
    </div>
  );
}

export default App;