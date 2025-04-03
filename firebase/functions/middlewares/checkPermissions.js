const admin = require("@utils/firebase-admin");

const checkPermissions = (requiredPermission) => {
  return (req, res, next) => {
    const userRole = req.user.data.role || " ";
    // const orgPermissions = req.user.orgPermissions || [];

    if (userRole === "admin") {
      return next();
    }

    res.status(403).json({message: "Forbidden: Insufficient permissions"});
  };
};

// same org can write, org based permissions
const allowedOrgWrites = () => {

};

// same user can write to self file
const allowedUserWrites = () => {

};

const permissions = {
  routes: {
    "/admin/dashboard": {role: "admin", flag: "canViewAdmin"},
    "/user/profile": {role: "user", flag: "canViewProfile"},
    "/posts/create": {role: "editor", flag: "canCreatePosts"},
    "/posts/edit": {role: "editor", flag: "canEditPxosts"},
    "/analytics": {role: "admin", flag: "canViewAnalytics"},
  },

  hasAccess: (user, route) => {
    const permission = permissions.routes[route];
    if (!permission) return false; // Route not found

    const {role, flag} = permission;

    // Check if the user has the required role
    if (user.roles && user.roles.includes(role)) return true;

    // If not, check if they have the required flag
    if (user.flags && user.flags.includes(flag)) return true;

    return false; // No access
  },
};

module.exports = checkPermissions;

