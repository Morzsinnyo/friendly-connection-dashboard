import * as React from "react";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface AuthErrorBoundaryProps {
  children: React.ReactNode;
}

export function AuthErrorBoundary({ children }: AuthErrorBoundaryProps) {
  const handleError = (error: Error) => {
    console.error("Auth Error Boundary caught an error:", error);
    return (
      <Alert variant="destructive" className="max-w-lg mx-auto mt-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Authentication Error</AlertTitle>
        <AlertDescription>
          {error.message || "An error occurred during authentication. Please try again."}
        </AlertDescription>
      </Alert>
    );
  };

  return (
    <ErrorBoundary fallback={handleError}>
      {children}
    </ErrorBoundary>
  );
}
