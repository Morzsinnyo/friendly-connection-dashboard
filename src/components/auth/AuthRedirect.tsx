
import { Navigate, useLocation } from "react-router-dom";

export const AuthRedirect = () => {
  const location = useLocation();
  const hasAuthParams = location.hash.includes("access_token") || 
                       location.hash.includes("error_description") ||
                       location.hash.includes("provider");

  console.log("[AuthRedirect] Current location:", location);
  console.log("[AuthRedirect] Has auth params:", hasAuthParams);

  if (hasAuthParams) {
    console.log("[AuthRedirect] Detected auth params, redirecting to /auth");
    return <Navigate to="/auth" replace state={{ from: location }} />;
  }

  console.log("[AuthRedirect] No auth params, redirecting to landing page");
  return <Navigate to="/" replace />;
};
