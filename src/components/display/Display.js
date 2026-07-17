import React from 'react';
import './Display.css';

/**
 * Display Component - Shows input and result
 * @param {Object} props - Component props
 * @param {string} props.input - Current input expression
 * @param {string} props.result - Calculated result
 */
const Display = ({ input, result }) => {
  return (
    <div className="display">
      {/* Show input expression or placeholder */}
      <div className="display-input">
        {input || '\u00A0'}
      </div>
      
      {/* Show result */}
      <div className="display-result">
        {result}
      </div>
    </div>
  );
};

export default Display;