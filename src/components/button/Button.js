import React from 'react';
import './Button.css';

/**
 * Button Component - Reusable button for calculator
 * @param {Object} props - Component props
 * @param {string} props.label - Button label/text
 * @param {string} props.type - Button type (number, operator, function, equals)
 * @param {string} props.span - Grid column span (for wide buttons like 0)
 * @param {Function} props.onClick - Click handler function
 */
const Button = ({ label, type = 'number', span = '1', onClick }) => {
  // Determine button class based on type
  const getButtonClass = () => {
    const baseClass = 'button';
    const typeClass = `button-${type}`;
    const spanClass = span === '2' ? 'button-span-2' : '';
    return [baseClass, typeClass, spanClass].filter(Boolean).join(' ');
  };

  return (
    <button
      className={getButtonClass()}
      onClick={onClick}
      aria-label={label}
    >
      {label}
    </button>
  );
};

export default Button;