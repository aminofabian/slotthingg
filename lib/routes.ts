export const PROTECTED_ROUTES = [
  '/dashboard',
  '/dashboard/games',
  '/dashboard/profile',
  '/dashboard/history',
  '/dashboard/marketplace',
  '/dashboard/draws',
  '/roulette'
] as const;

export const AUTH_ROUTES = [
  '/login',
  '/signup'
] as const;

export const PUBLIC_ROUTES = [
  '/',
  ...AUTH_ROUTES
] as const;

export type ProtectedRoute = typeof PROTECTED_ROUTES[number];
export type AuthRoute = typeof AUTH_ROUTES[number];
export type PublicRoute = typeof PUBLIC_ROUTES[number];

export const isProtectedRoute = (path: string) => {
  return PROTECTED_ROUTES.some(route => path.startsWith(route));
};

export const isAuthRoute = (path: string) => {
  return AUTH_ROUTES.includes(path as AuthRoute);
};

export const isPublicRoute = (path: string) => {
  return PUBLIC_ROUTES.includes(path as PublicRoute);
}; 