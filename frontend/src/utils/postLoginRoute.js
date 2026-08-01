export function getPostLoginRoute({ isProfileComplete, role }) {
  const normalizedRole = (role || '').toLowerCase();
  if (normalizedRole === 'admin') return '/admin';
  return isProfileComplete ? '/dashboard' : '/onboarding';
}
