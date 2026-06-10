export const getDashboardRoute = (user) => (user?.isAdmin ? '/admin/dashboard' : '/dashboard');
