
import { useEffect, useState } from 'react';

export function IframeCompatibilityCheck() {
  const [issues, setIssues] = useState<string[]>([]);
  const [isInIframe, setIsInIframe] = useState(false);
  const [parentOrigin, setParentOrigin] = useState<string | null>(null);
  const [communicationStatus, setCommunicationStatus] = useState<'unchecked' | 'success' | 'failed'>('unchecked');
  
  useEffect(() => {
    // Check if we're in an iframe
    const inIframe = window !== window.parent;
    setIsInIframe(inIframe);
    
    if (!inIframe) {
      return; // Not in iframe, nothing more to check
    }
    
    // Try to determine parent origin
    try {
      // This will fail if cross-origin
      setParentOrigin(window.parent.location.origin);
    } catch (error) {
      console.log('[IFRAME-CHECK] Could not access parent origin, likely cross-origin');
      setIssues(prev => [...prev, 'Cross-origin iframe detected - communication may be restricted']);
    }
    
    // Test communication with parent
    try {
      const checkId = `iframe-check-${Date.now()}`;
      
      // Setup listener for response
      const messageHandler = (event: MessageEvent) => {
        if (event.data?.type === 'IFRAME_CHECK_RESPONSE' && event.data.checkId === checkId) {
          setCommunicationStatus('success');
          window.removeEventListener('message', messageHandler);
        }
      };
      
      window.addEventListener('message', messageHandler);
      
      // Send test message
      window.parent.postMessage({
        type: 'IFRAME_CHECK_REQUEST',
        checkId,
        timestamp: Date.now()
      }, '*');
      
      // Set timeout to mark as failed if no response
      setTimeout(() => {
        if (communicationStatus === 'unchecked') {
          setCommunicationStatus('failed');
          setIssues(prev => [...prev, 'No response from parent - postMessage communication failed']);
          window.removeEventListener('message', messageHandler);
        }
      }, 2000);
      
      return () => window.removeEventListener('message', messageHandler);
    } catch (error) {
      console.error('[IFRAME-CHECK] Error testing parent communication:', error);
      setCommunicationStatus('failed');
      setIssues(prev => [...prev, `Error communicating with parent: ${error.message}`]);
    }
    
    // Check for potential Content Security Policy issues
    const cspMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
    if (cspMeta) {
      const content = cspMeta.getAttribute('content') || '';
      if (content.includes('frame-ancestors') && !content.includes('frame-ancestors *') && !content.includes('frame-ancestors \'self\'')) {
        setIssues(prev => [...prev, 'Restrictive CSP frame-ancestors directive detected']);
      }
    }
    
    // Check for X-Frame-Options restrictions
    const xfoMeta = document.querySelector('meta[http-equiv="X-Frame-Options"]');
    if (xfoMeta) {
      const content = xfoMeta.getAttribute('content') || '';
      if (content === 'DENY' || content === 'SAMEORIGIN' && !parentOrigin?.includes(window.location.origin)) {
        setIssues(prev => [...prev, `Restrictive X-Frame-Options detected: ${content}`]);
      }
    }
  }, [communicationStatus]);
  
  if (!isInIframe) {
    return null; // Don't render anything if not in iframe
  }
  
  return (
    <div 
      style={{
        position: 'fixed',
        bottom: '40px',
        right: '10px',
        width: '300px',
        padding: '10px',
        backgroundColor: 'white',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        borderRadius: '8px',
        fontSize: '12px',
        zIndex: 9999,
        border: '1px solid #e5e7eb'
      }}
    >
      <h4 style={{ margin: '0 0 8px 0', fontSize: '14px' }}>Iframe Compatibility Check</h4>
      
      <div>
        <p style={{ margin: '0 0 4px 0' }}>
          <strong>Status:</strong> {isInIframe ? 'Running in iframe' : 'Not in iframe'}
        </p>
        {parentOrigin && (
          <p style={{ margin: '0 0 4px 0' }}>
            <strong>Parent:</strong> {parentOrigin}
          </p>
        )}
        <p style={{ margin: '0 0 4px 0' }}>
          <strong>Communication:</strong> {' '}
          {communicationStatus === 'unchecked' ? 'Testing...' : 
           communicationStatus === 'success' ? '✅ Working' : '❌ Failed'}
        </p>
      </div>
      
      {issues.length > 0 && (
        <div style={{ marginTop: '8px' }}>
          <p style={{ margin: '0 0 4px 0', fontWeight: 'bold', color: '#b91c1c' }}>Issues Detected:</p>
          <ul style={{ margin: '0', paddingLeft: '20px' }}>
            {issues.map((issue, i) => (
              <li key={i} style={{ margin: '0 0 2px 0' }}>{issue}</li>
            ))}
          </ul>
        </div>
      )}
      
      <button
        onClick={() => {
          const elem = document.getElementById('iframe-debug-report');
          if (elem) elem.remove();
          
          // Create comprehensive report
          const report = document.createElement('div');
          report.id = 'iframe-debug-report';
          report.style.position = 'fixed';
          report.style.top = '20px';
          report.style.left = '20px';
          report.style.right = '20px';
          report.style.bottom = '20px';
          report.style.backgroundColor = 'white';
          report.style.zIndex = '10000';
          report.style.padding = '20px';
          report.style.overflow = 'auto';
          report.style.fontSize = '12px';
          report.style.fontFamily = 'monospace';
          report.style.border = '1px solid #e5e7eb';
          report.style.borderRadius = '8px';
          report.style.boxShadow = '0 4px 15px rgba(0,0,0,0.1)';
          
          report.innerHTML = `
            <h2>Iframe Debug Report</h2>
            <p><button id="close-debug-report" style="padding: 4px 8px; background: #e5e7eb; border: none; border-radius: 4px; cursor: pointer;">Close</button></p>
            <h3>Basic Information</h3>
            <ul>
              <li>Current URL: ${window.location.href}</li>
              <li>In iframe: ${isInIframe}</li>
              <li>Parent origin: ${parentOrigin || 'Unknown (cross-origin)'}</li>
              <li>Communication status: ${communicationStatus}</li>
              <li>User agent: ${navigator.userAgent}</li>
              <li>Timestamp: ${new Date().toISOString()}</li>
            </ul>
            
            <h3>Issues (${issues.length})</h3>
            <ul>
              ${issues.map(issue => `<li>${issue}</li>`).join('')}
            </ul>
            
            <h3>Document Headers</h3>
            <ul>
              ${Array.from(document.getElementsByTagName('meta'))
                  .map(meta => `<li>${meta.outerHTML}</li>`)
                  .join('')}
            </ul>
            
            <h3>Window Properties</h3>
            <ul>
              <li>innerWidth × innerHeight: ${window.innerWidth} × ${window.innerHeight}</li>
              <li>React initialized: ${Boolean(window.__REACT_INITIALIZED)}</li>
              <li>React init time: ${window.__REACT_INIT_TIME ? new Date(window.__REACT_INIT_TIME).toISOString() : 'N/A'}</li>
              <li>Debug mode: ${window.__DEBUG_UTILS ? 'Available' : 'Not available'}</li>
            </ul>
          `;
          
          document.body.appendChild(report);
          
          document.getElementById('close-debug-report')?.addEventListener('click', () => {
            document.getElementById('iframe-debug-report')?.remove();
          });
        }}
        style={{
          padding: '4px 8px',
          marginTop: '8px',
          backgroundColor: '#f3f4f6',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '11px'
        }}
      >
        Generate Debug Report
      </button>
    </div>
  );
}
