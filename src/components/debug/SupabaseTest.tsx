
import React, { useState, useEffect } from 'react';
import { supabase } from "../../integrations/supabase/client";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

export const SupabaseTest = () => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [serviceStatus, setServiceStatus] = useState<any>(null);

  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    try {
      setStatus('loading');
      setErrorMessage(null);
      
      console.log('Testing Supabase connection...');
      
      // Simple health check
      const { data, error } = await supabase.from('profiles').select('id').limit(1);
      
      if (error) {
        console.error('Supabase connection error:', error);
        setStatus('error');
        setErrorMessage(error.message);
        return;
      }
      
      console.log('Supabase connection successful:', data);
      setStatus('success');
      
      // Get service status
      const healthCheck = await supabase.rpc('get_service_status').catch(e => {
        console.log('RPC not available, but connection works');
        return { data: { message: 'RPC not available, but connection works' } };
      });
      
      setServiceStatus(healthCheck.data || { message: 'Connected to Supabase' });
    } catch (e) {
      console.error('Unexpected error testing Supabase:', e);
      setStatus('error');
      setErrorMessage(e instanceof Error ? e.message : String(e));
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto my-8">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Supabase Connection Test
          <div className="flex items-center gap-2">
            {status === 'loading' && (
              <div className="h-3 w-3 rounded-full bg-yellow-500 animate-pulse"></div>
            )}
            {status === 'success' && (
              <div className="h-3 w-3 rounded-full bg-green-500"></div>
            )}
            {status === 'error' && (
              <div className="h-3 w-3 rounded-full bg-red-500"></div>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {status === 'loading' && <p>Testing connection to Supabase...</p>}
          
          {status === 'success' && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-green-700 font-medium">Connected to Supabase successfully!</p>
              {serviceStatus && (
                <pre className="mt-2 text-xs bg-black/5 p-2 rounded overflow-auto">
                  {JSON.stringify(serviceStatus, null, 2)}
                </pre>
              )}
            </div>
          )}
          
          {status === 'error' && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-700 font-medium">Failed to connect to Supabase</p>
              {errorMessage && (
                <pre className="mt-2 text-xs bg-black/5 p-2 rounded overflow-auto">
                  {errorMessage}
                </pre>
              )}
            </div>
          )}
          
          <Button 
            onClick={testConnection} 
            variant={status === 'error' ? "destructive" : "default"}
            className="w-full"
          >
            {status === 'error' ? 'Try Again' : 'Test Connection'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
