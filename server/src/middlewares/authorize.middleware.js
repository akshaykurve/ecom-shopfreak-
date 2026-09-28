// Must run after `authenticate`. Rejects a logged-in user whose role isn't allowed.
// This is the 403 case (wrong role) as opposed to authenticate's 401 (no/invalid login).
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to perform this action",
      });
    }
    next();
  };
};

module.exports = authorize;
