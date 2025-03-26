
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { SupabaseTest } from "./SupabaseTest";

export function TestComponent() {
  const [data, setData] = useState({
    userAgent: navigator.userAgent,
    timestamp: new Date().toISOString(),
    inIframe: window !== window.parent,
    location: window.location.href,
    innerWidth: window.innerWidth,
    innerHeight: window.innerHeight,
    devicePixelRatio: window.devicePixelRatio
  });
  
  useEffect(() => {
    const interval = setInterval(() => {
      setData(prev => ({
        ...prev,
        timestamp: new Date().toISOString()
      }));
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  const handleRefresh = () => {
    setData({
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      inIframe: window !== window.parent,
      location: window.location.href,
      innerWidth: window.innerWidth,
      innerHeight: window.innerHeight,
      devicePixelRatio: window.devicePixelRatio
    });
  };
  
  const handleTestIframe = () => {
    if (window.parent && window !== window.parent) {
      try {
        window.parent.postMessage({ type: 'TEST_FROM_IFRAME', data: { timestamp: new Date().toISOString() } }, '*');
        console.log('[TEST] Sent test message to parent frame');
      } catch (e) {
        console.error('[TEST] Error sending message to parent:', e);
      }
    } else {
      console.log('[TEST] Not in iframe, opening test page');
      window.open('/iframe-test.html', '_blank');
    }
  };
  
  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Debug & Test Panel</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Environment Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><strong>Timestamp:</strong> {data.timestamp}</p>
              <p><strong>In iframe:</strong> {data.inIframe ? 'Yes' : 'No'}</p>
              <p><strong>Location:</strong> {data.location}</p>
              <p><strong>Window size:</strong> {data.innerWidth}x{data.innerHeight}</p>
              <p><strong>Pixel ratio:</strong> {data.devicePixelRatio}</p>
              <div className="mt-4">
                <Button onClick={handleRefresh} size="sm">Refresh Data</Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Iframe Communication</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="mb-2">Test iframe communication:</p>
                <Button onClick={handleTestIframe} size="sm">
                  {data.inIframe ? 'Send Message to Parent' : 'Open Iframe Test'}
                </Button>
              </div>
              <div>
                <p className="mb-2">Open test pages:</p>
                <div className="flex flex-wrap gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => window.open('/iframe-test.html', '_blank')}
                  >
                    Iframe Test
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => window.open('/embed-dashboard.html', '_blank')}
                  >
                    Embed Test
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <SupabaseTest />
    </div>
  );
}
