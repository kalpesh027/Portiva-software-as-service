import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

export default function PrivateRoute({
  children,
  requireProfileComplete = false,
  requireProfileIncomplete = false,
  requireAdmin = false,
}) {
  const { isAuthenticated, isProfileComplete, isEmailVerified, user, loading } = useSelector((state) => state.auth);

  const normalizedRole = (user?.role || '').toLowerCase();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If we have a token but user data is still being hydrated, wait.
  if (loading || !user) {
    return null;
  }

  if (!isEmailVerified) {
    return <Navigate to="/verify-otp" replace state={{ email: user?.email }} />;
  }

  // Admin users should land on admin dashboard first.
  if (!requireAdmin && normalizedRole === 'admin' && (requireProfileComplete || requireProfileIncomplete)) {
    return <Navigate to="/admin" replace />;
  }

  if (requireProfileComplete && !isProfileComplete) {
    return <Navigate to="/onboarding" replace />;
  }

  if (requireProfileIncomplete && isProfileComplete) {
    return <Navigate to="/dashboard" replace />;
  }

  if (requireAdmin && normalizedRole !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}
