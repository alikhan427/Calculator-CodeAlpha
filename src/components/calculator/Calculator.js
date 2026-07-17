import React, { useState, useEffect, useCallback } from 'react';
import './Calculator.css';
import Display from '../display/Display';
import Button from '../button/Button';

/**
 * Calculator Component - Main calculator logic and UI
 * Uses functional components and React Hooks
 */
const Calculator = () => {
  // State management
  const [input, setInput] = useState(''); // Current input/expression
  const [result, setResult] = useState('0'); // Display result
  const [shouldReset, setShouldReset] = useState(false); // Flag to reset after calculation

  /**
   * Safe evaluation function without using eval()
   * Uses a safer alternative with Function constructor
   */
  const evaluateExpression = useCallback((expression) => {
    // Remove any whitespace
    const sanitized = expression.replace(/\s/g, '');
    
    // Check for empty expression
    if (!sanitized) {
      return '0';
    }

    // First, replace display symbols with calculation symbols
    let calcExpression = sanitized.replace(/×/g, '*').replace(/÷/g, '/');
    
    // Validate expression - only allow numbers, operators, and decimal
    // Now checking against the calculation symbols (* and /)
    const validChars = /^[0-9+\-*/.%]+$/;
    if (!validChars.test(calcExpression)) {
      return 'Error';
    }
    
    // Handle percentage: convert X% to X/100
    calcExpression = calcExpression.replace(/(\d+)%/g, '($1/100)');

    // Handle consecutive operators - simplify them
    calcExpression = calcExpression.replace(/\+\+/g, '+');
    calcExpression = calcExpression.replace(/--/g, '+');
    calcExpression = calcExpression.replace(/\*-/g, '*(-');
    calcExpression = calcExpression.replace(/\/-/g, '/(-');

    try {
      // Using Function constructor as a safer alternative to eval
      // eslint-disable-next-line no-new-func
      const result = new Function(`return (${calcExpression})`)();
      
      // Check if result is a valid number
      if (!isFinite(result)) {
        return 'Error';
      }
      
      // Round to avoid floating point issues
      const rounded = parseFloat(result.toPrecision(12));
      return rounded.toString();
    } catch (error) {
      return 'Error';
    }
  }, []);

  /**
   * Handle button click from child components
   * @param {string} value - The value of the clicked button
   */
  const handleButtonClick = useCallback((value) => {
    // If result is 'Error', clear everything on next input
    if (result === 'Error' && value !== 'C' && value !== '⌫') {
      setInput('');
      setResult('0');
      setShouldReset(false);
      return;
    }

    // Handle Clear
    if (value === 'C') {
      setInput('');
      setResult('0');
      setShouldReset(false);
      return;
    }

    // Handle Delete (Backspace)
    if (value === '⌫') {
      if (shouldReset) {
        setInput('');
        setResult('0');
        setShouldReset(false);
        return;
      }
      setInput((prev) => prev.slice(0, -1));
      return;
    }

    // Handle Percentage
    if (value === '%') {
      if (input === '') {
        setInput('0');
        return;
      }
      setInput((prev) => {
        // Find the last number and convert it to percentage
        const match = prev.match(/([\d.]+)$/);
        if (match) {
          const num = parseFloat(match[1]);
          if (!isNaN(num)) {
            const percent = (num / 100).toString();
            return prev.slice(0, -match[1].length) + percent;
          }
        }
        return prev + '%';
      });
      return;
    }

    // Handle Equals
    if (value === '=') {
      if (input === '') {
        setResult('0');
        return;
      }
      
      // If input ends with an operator, remove it
      let expressionToEvaluate = input;
      const lastChar = input.slice(-1);
      if (['+', '-', '×', '÷', '%'].includes(lastChar)) {
        expressionToEvaluate = input.slice(0, -1);
      }
      
      if (expressionToEvaluate === '') {
        setResult('0');
        return;
      }
      
      const evaluated = evaluateExpression(expressionToEvaluate);
      setResult(evaluated);
      // Store result in input for continuous calculation
      if (evaluated !== 'Error') {
        setInput(evaluated);
        setShouldReset(true);
      } else {
        setResult('Error');
        setInput('');
        setShouldReset(false);
      }
      return;
    }

    // Handle Operators (+, -, ×, ÷)
    const operators = ['+', '-', '×', '÷'];
    if (operators.includes(value)) {
      // If input is empty and value is not '-', don't allow
      if (input === '' && value !== '-') {
        return;
      }

      // If input is empty and value is '-', allow negative sign
      if (input === '' && value === '-') {
        setInput('-');
        return;
      }

      // If we just calculated a result, start new expression with result
      if (shouldReset && result !== 'Error') {
        setInput(result + value);
        setShouldReset(false);
        return;
      }

      // Prevent multiple operators in a row
      const lastChar = input.slice(-1);
      if (operators.includes(lastChar)) {
        // Replace the last operator with the new one
        setInput((prev) => prev.slice(0, -1) + value);
        return;
      }
      
      // If last character is %, replace it with operator
      if (lastChar === '%') {
        setInput((prev) => prev.slice(0, -1) + value);
        return;
      }

      // Append operator to input
      setInput((prev) => prev + value);
      return;
    }

    // Handle numbers
    if (value >= '0' && value <= '9') {
      // If shouldReset is true, start fresh
      if (shouldReset) {
        setInput(value);
        setResult('0');
        setShouldReset(false);
        return;
      }

      // If current input is '0', replace it
      if (input === '0') {
        setInput(value);
        return;
      }

      // Append number to input
      setInput((prev) => prev + value);
      return;
    }

    // Handle Decimal point
    if (value === '.') {
      // If shouldReset is true, start with '0.'
      if (shouldReset) {
        setInput('0.');
        setResult('0');
        setShouldReset(false);
        return;
      }

      // Find the current number being typed
      const parts = input.split(/[+\-*/%×÷]/);
      const currentNumber = parts[parts.length - 1];
      
      // Prevent multiple decimals in the same number
      if (currentNumber.includes('.')) {
        return;
      }
      
      // If input is empty or ends with operator, add '0.'
      if (input === '' || ['+', '-', '×', '÷', '%'].includes(input.slice(-1))) {
        setInput((prev) => prev + '0.');
        return;
      }

      // Append decimal to input
      setInput((prev) => prev + '.');
      return;
    }
  }, [input, result, shouldReset, evaluateExpression]);

  /**
   * Keyboard event handler for keyboard support
   */
  useEffect(() => {
    const handleKeyDown = (event) => {
      const key = event.key;
      
      // Prevent default behavior for calculator keys
      const calculatorKeys = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 
                             '.', '+', '-', '*', '/', '%', 'Enter', 'Backspace', 
                             'Escape', 'Delete'];
      
      if (!calculatorKeys.includes(key) && !event.key.startsWith('Arrow')) {
        return;
      }

      event.preventDefault();

      // Map keyboard keys to calculator buttons
      switch (key) {
        case 'Enter':
          handleButtonClick('=');
          break;
        case 'Backspace':
          handleButtonClick('⌫');
          break;
        case 'Escape':
        case 'Delete':
          handleButtonClick('C');
          break;
        case '*':
          handleButtonClick('×');
          break;
        case '/':
          handleButtonClick('÷');
          break;
        default:
          handleButtonClick(key);
          break;
      }
    };

    // Add event listener for keyboard support
    window.addEventListener('keydown', handleKeyDown);
    
    // Cleanup event listener on component unmount
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleButtonClick]);

  // Button layout configuration
  const buttons = [
    { label: 'C', type: 'function' },
    { label: '⌫', type: 'function' },
    { label: '%', type: 'function' },
    { label: '÷', type: 'operator' },
    { label: '7', type: 'number' },
    { label: '8', type: 'number' },
    { label: '9', type: 'number' },
    { label: '×', type: 'operator' },
    { label: '4', type: 'number' },
    { label: '5', type: 'number' },
    { label: '6', type: 'number' },
    { label: '-', type: 'operator' },
    { label: '1', type: 'number' },
    { label: '2', type: 'number' },
    { label: '3', type: 'number' },
    { label: '+', type: 'operator' },
    { label: '0', type: 'number', span: '2' },
    { label: '.', type: 'number' },
    { label: '=', type: 'equals' },
  ];

  return (
    <div className="calculator">
      {/* Display component showing input and result */}
      <Display input={input} result={result} />
      
      {/* Buttons grid */}
      <div className="buttons-grid">
        {buttons.map((btn, index) => (
          <Button
            key={index}
            label={btn.label}
            type={btn.type}
            span={btn.span}
            onClick={() => handleButtonClick(btn.label)}
          />
        ))}
      </div>
    </div>
  );
};

export default Calculator;