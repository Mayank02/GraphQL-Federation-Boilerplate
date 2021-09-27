// TODO: perform a real health check e.g. can we connect to a service?
export function healthCheck(req, res) {
  res.json({ status: 'pass', ts: new Date().toISOString() });
}
