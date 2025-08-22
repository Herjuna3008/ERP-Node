const rbac = (roles = []) => {
  return (req, res, next) => {
    const user = req.admin;
    if (!user || !roles.includes(user.role)) {
      return res.status(403).json({
        success: false,
        result: null,
        message: 'Forbidden',
      });
    }
    next();
  };
};

module.exports = rbac;
