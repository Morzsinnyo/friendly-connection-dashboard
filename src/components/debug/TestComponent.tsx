
import React from 'react';

export function TestComponent() {
  console.log('TestComponent rendering');
  
  return (
    <div className="test-component" style={{ 
      padding: '20px', 
      margin: '20px',
      border: '2px solid green',
      borderRadius: '8px',
      backgroundColor: '#f0fff0'
    }}>
      <h2>React is working!</h2>
      <p>If you can see this message, React has successfully initialized.</p>
      <p>{new Date().toLocaleTimeString()}</p>
    </div>
  );
}
