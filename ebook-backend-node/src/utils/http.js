export function ok(res, data = {}) {
  return res.json({ success: true, ...data });
}

export function fail(res, status = 400, message = "Erreur.", fields) {
  return res.status(status).json({
    success: false,
    message,
    ...(fields ? { fields } : {}),
  });
}

export function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}
