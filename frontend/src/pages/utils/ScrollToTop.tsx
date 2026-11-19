import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop component.
 *
 * Listens for changes in the current route (`pathname`) and scrolls the window
 * to the top of the page (`window.scrollTo(0, 0)`) whenever the route changes.
 *
 * This ensures that navigating to a new page using `useNavigate()` or a `<Link>` 
 * always starts at the top of the page instead of preserving the previous scroll position.
 *
 * Usage:
 * Place this component inside router.
 *
 * @component
 * @example
 * return (
 *   <BrowserRouter>
 *     <ScrollToTop />
 *     <AppRoutes />
 *   </BrowserRouter>
 * )
 */
export function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]); // runs every time the path changes

  return null; // doesn't render anything
}