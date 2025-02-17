
import { Navigate } from "react-router-dom";

export const AuthRedirect = () => {
  console.log("[AuthRedirect] Handling 404, redirecting to landing page");
  return <Navigate to="/" replace />;
};

