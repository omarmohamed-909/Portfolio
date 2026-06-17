import express from "express";
import ContactMessage from "../models/ContactMessageSchema.js";
import { isAdminOnly, isAdminOrViewer } from "../middlewares/isAdminOnly.js";
import { activityLoggerMiddleware } from "../utils/activityLogger.js";
import mongoose from "mongoose";
const Router = express.Router();

Router.get("/messages", isAdminOrViewer, async (req, res) => {
  try {
    const messages = await ContactMessage.find().sort({ createdAt: -1 });
    return res.status(200).json(messages);
  } catch (err) {
    return res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
});

Router.put("/messages/read/:id", isAdminOnly, async (req, res) => {
  try {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }
    const message = await ContactMessage.findByIdAndUpdate(
      id,
      { status: "read" },
      { new: true }
    );
    if (!message) {
      return res.status(404).json({ message: "Message Not Found" });
    }
    return res.status(200).json({ message: "Message marked as read" });
  } catch (err) {
    return res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
});

Router.put("/messages/replied/:id", isAdminOnly, async (req, res) => {
  try {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }
    const message = await ContactMessage.findByIdAndUpdate(
      id,
      { status: "replied" },
      { new: true }
    );
    if (!message) {
      return res.status(404).json({ message: "Message Not Found" });
    }
    return res.status(200).json({ message: "Message marked as replied" });
  } catch (err) {
    return res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
});

Router.delete("/messages/delete/:id", isAdminOnly, activityLoggerMiddleware("message"), async (req, res) => {
  try {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }
    const message = await ContactMessage.findByIdAndDelete(id);
    if (!message) {
      return res.status(404).json({ message: "Message Not Found" });
    }
    req.activityDetails = { name: message.fullname || message.email };
    return res.status(200).json({ message: "Message Deleted Successfully" });
  } catch (err) {
    return res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
});

export default Router;
