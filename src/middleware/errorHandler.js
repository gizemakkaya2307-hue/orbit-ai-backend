export function errorHandler(err, _req, res, _next) {
  const status = Number.isInteger(err?.status) ? err.status : 500;
  const message = err?.message || "Orbit AI backend failed to process the request.";

  res.status(status).json({
    error: message
  });
}
