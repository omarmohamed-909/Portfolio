import express from "express";
import { isAdminOnly, isAdminOrViewer } from "../middlewares/isAdminOnly.js";
import BlockHistory from "../models/BlockHistorySchema.js";

const Router = express.Router();

Router.get("/admin/block-history/stats", isAdminOnly, async (req, res) => {
  try {
    const stats = await BlockHistory.getStats();
    return res.status(200).json(stats);
  } catch (err) {
    return res.status(500).json({ message: "Server Error", error: err.message });
  }
});

Router.get("/admin/block-history/list", isAdminOnly, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const [records, total] = await Promise.all([
      BlockHistory.find()
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      BlockHistory.countDocuments(),
    ]);

    return res.status(200).json({
      records,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    return res.status(500).json({ message: "Server Error", error: err.message });
  }
});

Router.post("/admin/block-history/unblock/:key", isAdminOnly, async (req, res) => {
  try {
    const { key } = req.params;
    const unblocked = await BlockHistory.unblock(decodeURIComponent(key));

    if (unblocked) {
      return res.status(200).json({ message: "Unblocked successfully" });
    }
    return res.status(404).json({ message: "Record not found or already unblocked" });
  } catch (err) {
    return res.status(500).json({ message: "Server Error", error: err.message });
  }
});

export default Router;
