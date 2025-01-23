import { useState, useCallback } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { ApiError } from '@/api/utils/error-handling';

export function useErrorHandler() {
  const { toast } = useToast();
  const [error, setError] = useState<Error | null>(null);

  const handleError = useCallback((error: unknown) => {
    console.error('Error caught by handler:', error);
    
    let message = 'An unexpected error occurred';
    
    if (error instanceof ApiError) {
      message = error.message;
    } else if (error instanceof Error) {
      message = error.message;
    }

    setError(error instanceof Error ? error : new Error(message));
    
    toast({
      title: "Error",
      description: message,
      variant: "destructive",
    });

    return error;
  }, [toast]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    error,
    handleError,
    clearError
  };
}