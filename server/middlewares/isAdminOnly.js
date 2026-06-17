import jwt from "jsonwebtoken";
import AdminJti from "../models/JtiSchema.js";

// Shared helper: verifies cookie token and returns decoded payload
async function verifyToken(req, res) {
  const token = req.cookies.token;
  if (!token) {
    res.status(401).json({ message: "Access Denied — No token", access: false });
    return null;
  }
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    res.status(401).json({ message: "Invalid or expired token", access: false });
    return null;
  }
  const session = await AdminJti.findOne({
    AdminObjectId: decoded.id,
    Jti: decoded.jti,
  });
  if (!session) {
    res.status(401).json({ message: "Session expired — please login again", access: false });
    return null;
  }
  return decoded;
}

// ── Allows both admin AND viewer roles (read-only routes) ──────────────────
export async function isAdminOrViewer(req, res, next) {
  try {
    const decoded = await verifyToken(req, res);
    if (!decoded) return;
    if (decoded.role !== "admin" && decoded.role !== "viewer") {
      return res.status(403).json({ message: "Access Denied — Insufficient role", access: false });
    }
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token", access: false });
  }
}

// ── Allows ONLY admin role (write/delete/update routes) ────────────────────
export async function isAdminOnly(req, res, next) {
  try {
    const decoded = await verifyToken(req, res);
    if (!decoded) return;
    if (decoded.role !== "admin") {
      return res.status(403).json({
        message: "Access Denied — This action requires admin privileges.",
        access: false,
        isViewer: true,
      });
    }
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token", access: false });
  }
}

export default isAdminOrViewer;
