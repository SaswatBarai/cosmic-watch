/**
 * Role-Based Access Control (RBAC) Middleware
 * Restricts routes to specific user roles
 */

export const checkRole = (...allowedRoles) => {
  return (req, res, next) => {
    // Ensure user is authenticated (should be called after auth middleware)
    if (!req.user) {
      return res.status(401).json({ msg: 'Authentication required' });
    }

    // Check if user's role is in the allowed roles list
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        msg: 'Access denied: insufficient permissions',
        required: allowedRoles,
        current: req.user.role
      });
    }

    next();
  };
};

// Convenience middleware for common role checks
export const researcherOnly = checkRole('researcher');
export const userOnly = checkRole('user');
export const anyAuthenticated = checkRole('user', 'researcher');
