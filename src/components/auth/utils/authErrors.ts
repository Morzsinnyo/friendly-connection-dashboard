import { AuthError } from "@supabase/supabase-js";

export type AuthErrorCode = 
  | 'invalid_credentials'
  | 'email_in_use'
  | 'weak_password'
  | 'invalid_email'
  | 'user_not_found'
  | 'network_error'
  | 'unknown_error';

export interface AuthErrorDetails {
  code: AuthErrorCode;
  message: string;
  technical?: string;
}

const AUTH_ERROR_MESSAGES: Record<AuthErrorCode, string> = {
  invalid_credentials: "Invalid email or password. Please try again.",
  email_in_use: "This email is already registered. Please try logging in instead.",
  weak_password: "Password is too weak. Please use a stronger password.",
  invalid_email: "Please enter a valid email address.",
  user_not_found: "No account found with this email. Please sign up first.",
  network_error: "Unable to connect. Please check your internet connection.",
  unknown_error: "An unexpected error occurred. Please try again.",
};

export function parseAuthError(error: unknown): AuthErrorDetails {
  console.error("Auth error occurred:", error);

  if (error instanceof AuthError) {
    // Map Supabase auth error codes to our custom codes
    switch (error.status) {
      case 400:
        if (error.message.includes("password")) {
          return {
            code: "weak_password",
            message: AUTH_ERROR_MESSAGES.weak_password,
            technical: error.message
          };
        }
        if (error.message.includes("email")) {
          return {
            code: "invalid_email",
            message: AUTH_ERROR_MESSAGES.invalid_email,
            technical: error.message
          };
        }
        break;
      case 401:
        return {
          code: "invalid_credentials",
          message: AUTH_ERROR_MESSAGES.invalid_credentials,
          technical: error.message
        };
      case 409:
        return {
          code: "email_in_use",
          message: AUTH_ERROR_MESSAGES.email_in_use,
          technical: error.message
        };
      case 404:
        return {
          code: "user_not_found",
          message: AUTH_ERROR_MESSAGES.user_not_found,
          technical: error.message
        };
    }
  }

  if (error instanceof Error && error.message.includes("fetch")) {
    return {
      code: "network_error",
      message: AUTH_ERROR_MESSAGES.network_error,
      technical: error.message
    };
  }

  return {
    code: "unknown_error",
    message: AUTH_ERROR_MESSAGES.unknown_error,
    technical: error instanceof Error ? error.message : String(error)
  };
}

export function isAuthError(error: unknown): error is AuthError {
  return error instanceof AuthError;
}

export function getAuthErrorMessage(code: AuthErrorCode): string {
  return AUTH_ERROR_MESSAGES[code] || AUTH_ERROR_MESSAGES.unknown_error;
}