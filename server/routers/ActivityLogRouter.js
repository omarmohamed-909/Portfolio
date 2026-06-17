import express from "express";
const Router = express.Router();
import ActivityLog from "../models/ActivityLogSchema.js";
import { isAdminOnly, isAdminOrViewer } from "../middlewares/isAdminOnly.js";

Router.get("/activity-logs", isAdminOnly, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 50));
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.action) filter.action = req.query.action;
    if (req.query.resource) filter.resource = req.query.resource;

    const [logs, total] = await Promise.all([
      ActivityLog.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      ActivityLog.countDocuments(filter),
    ]);

    return res.status(200).json({
      logs,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    return res.status(500).json({ message: "Server Error" });
  }
});

Router.delete("/activity-logs/clear", isAdminOnly, async (req, res) => {
  try {
    await ActivityLog.deleteMany({});
    return res.status(200).json({ message: "All activity logs cleared" });
  } catch (err) {
    return res.status(500).json({ message: "Server Error" });
  }
});

export default Router;
