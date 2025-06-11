

export function requireAdmin(req, res, next) {
    if (req.user?.isAdmin) {
      return next();
    }
    return res.status(403).json({ error: 'Acesso restrito a administradores.' });
  }