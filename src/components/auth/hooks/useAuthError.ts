import { useState, useCallback } from 'react';
import { useToast } from "@/hooks/use-toast";
import { AuthErrorDetails, parseAuthError } from '../utils/authErrors';

export function useAuthError() {
  const { toast } = useToast();
  const [error, setError] = useState<AuthErrorDetails | null>(null);

  const handleAuthError = useCallback((error: unknown) => {
    console.log("Auth error handler called:", error);
    
    const parsedError = parseAuthError(error);
    console.log("Parsed auth error:", parsedError);
    
    setError(parsedError);
    
    // Show toast notification for the error
    toast({
      title: "Authentication Error",
      description: parsedError.message,
      variant: "destructive",
    });

    return parsedError;
  }, [toast]);

  const clearError = useCallback(() => {
    console.log("Clearing auth error");
    setError(null);
  }, []);

  return {
    error,
    handleAuthError,
    clearError,
    isError: !!error
  };
}