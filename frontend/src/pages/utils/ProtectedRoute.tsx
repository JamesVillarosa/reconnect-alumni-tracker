import { Outlet, Navigate } from "react-router-dom";
import { useAuthContext } from "../../hooks/useAuthContext";

/**
 * A component that protects routes by conditionally rendering child components or redirecting users
 * based on their authentication status, role (admin/user), and control flags.
 *
 * @param {string} props.destination - The path to redirect users when they are not authorized.
 * @param {boolean} [props.inverted=false] - If true, allows unauthenticated users to access the route (e.g., login or register),
 *                                           and redirects authenticated users (admins to `/admin/dashboard`, users to `destination`).
 *                                           If false (default), only authenticated users can access the route.
 * @param {boolean} [props.adminOnly=false] - If true, restricts access only to users with role `"admin"`. Non-admins are redirected to `destination`.
 *
 * @returns {JSX.Element | null} - Renders `<Outlet />` for authorized access, or `<Navigate />` for redirection.
 *
 * @example
 * // 1. Protect a user dashboard (only authenticated users can access)
 * <ProtectedRoutes destination="/login">
 *   <UserDashboard />
 * </ProtectedRoutes>
 *
 * @example
 * // 2. Protect login page from authenticated users (guest access only)
 * <ProtectedRoutes destination="/dashboard" inverted>
 *   <LoginPage />
 * </ProtectedRoutes>
 *
 * @example
 * // 3. Admin-only route protection
 * <ProtectedRoutes destination="/unauthorized" adminOnly>
 *   <AdminPanel />
 * </ProtectedRoutes>
 */
export default function ProtectedRoutes({
  destination,
  inverted = false,
  adminOnly = false
}: {
  destination: string;
  inverted?: boolean;
  adminOnly?: boolean;
}) {
  const { user, loading } = useAuthContext(); // Get current user and loading state

  if (loading) return null; // Prevent rendering until auth check is complete

  const isAdmin = user?.role === "admin"; // Check if the user is an admin

  if (adminOnly) { // Blocks access to non-admin users by redirecting them to the destination
    // Admin-only route logic
    return isAdmin ? <Outlet /> : <Navigate to={destination} />;
  }

  if (inverted) {
    // Public route logic (e.g., login, register)
    if (user) {
      return isAdmin
        ? <Navigate to="/admin/dashboard" /> // Redirect admin to dashboard
        : <Navigate to={destination} />; // Redirect user to destination
    }
    return <Outlet />; // Allow unauthenticated users to access the route
  }

  // Protected user route: both admin and user allowed
  // Basically saying that if the user is not logged in, redirect to the destination
  // If the user is logged in, render the child components (Outlet)
  return user ? <Outlet /> : <Navigate to={destination} />;
}
