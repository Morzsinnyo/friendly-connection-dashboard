
import React, { useEffect, useState } from 'react';

export function TestComponent() {
  const [renderTime, setRenderTime] = useState(new Date());
  const [renderCount, setRenderCount] = useState(1);
  const isInIframe = window !== window.parent;
  
  useEffect(() => {
    console.log('TestComponent mounted successfully at', renderTime);
    
    // Update time every second to show component is alive
    const timer = setInterval(() => {
      setRenderTime(new Date());
      setRenderCount(prev => prev + 1);
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  return (
    <div className="test-component" style={{ 
      padding: '20px', 
      margin: '20px',
      border: '2px solid green',
      borderRadius: '8px',
      backgroundColor: '#f0fff0',
      textAlign: 'center',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      maxWidth: '800px',
      marginLeft: 'auto',
      marginRight: 'auto'
    }}>
      <div style={{
        width: '60px',
        height: '60px',
        borderRadius: '50%',
        backgroundColor: '#22c55e',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 16px auto',
        color: 'white',
        fontSize: '24px',
        fontWeight: 'bold'
      }}>
        ✓
      </div>
      
      <h2 style={{ color: '#166534', marginBottom: '16px' }}>React is working!</h2>
      
      <div style={{
        padding: '12px',
        backgroundColor: 'white',
        borderRadius: '6px',
        marginBottom: '16px'
      }}>
        <p style={{ margin: '0 0 8px 0' }}>If you can see this message, React has successfully initialized.</p>
        <p style={{ margin: '0', fontWeight: 'bold' }}>Current time: {renderTime.toLocaleTimeString()}</p>
        <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#4b5563' }}>
          Component has rendered {renderCount} times
        </p>
      </div>
      
      <div style={{
        padding: '12px',
        backgroundColor: 'rgba(255,255,255,0.6)',
        borderRadius: '6px',
        textAlign: 'left',
        fontSize: '14px'
      }}>
        <h3 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>Environment Information:</h3>
        <ul style={{ margin: '0', paddingLeft: '20px' }}>
          <li><strong>In iframe:</strong> {isInIframe ? 'Yes' : 'No'}</li>
          <li><strong>React initialized at:</strong> {window.__REACT_INIT_TIME ? new Date(window.__REACT_INIT_TIME).toLocaleTimeString() : 'Unknown'}</li>
          <li><strong>User agent:</strong> {navigator.userAgent.split(' ').slice(0, 3).join(' ')}...</li>
          <li><strong>Window size:</strong> {window.innerWidth}x{window.innerHeight}</li>
        </ul>
      </div>
    </div>
  );
}
