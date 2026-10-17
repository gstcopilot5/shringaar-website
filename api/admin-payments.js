// Disabled until server-side administrator authentication is implemented.
// Do not load credentials or query the database from this endpoint.
module.exports = async (_req, res) => {
  res.setHeader("Cache-Control", "private, no-store");
  res.setHeader("Vercel-CDN-Cache-Control", "no-store");
  return res.status(403).json({ error: "Forbidden" });
};
