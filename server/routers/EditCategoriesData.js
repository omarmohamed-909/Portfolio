import express from "express";
import Category from "../models/CategorySchema.js";
import Skills from "../models/SkillsSchema.js";
import { isAdminOnly, isAdminOrViewer } from "../middlewares/isAdminOnly.js";
import mongoose from "mongoose";
const Router = express.Router();

Router.post("/categories/add/category", isAdminOnly, async (req, res) => {
  try {
    const { name, icon, order } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Category name is required" });
    }
    const existing = await Category.findOne({ name: name.trim() });
    if (existing) {
      return res.status(409).json({ message: "Category already exists" });
    }
    const newCategory = new Category({
      name: name.trim(),
      icon: icon || "Code2",
      order: order ?? 0,
    });
    await newCategory.save();
    return res.status(201).json({ message: "Category added successfully", category: newCategory });
  } catch (err) {
    return res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
});

Router.put("/categories/edit/category/:id", isAdminOnly, async (req, res) => {
  try {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    const updates = {};
    if (req.body.name !== undefined) updates.name = req.body.name.trim();
    if (req.body.icon !== undefined) updates.icon = req.body.icon;
    if (req.body.order !== undefined) updates.order = req.body.order;

    const updated = await Category.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
    if (!updated) {
      return res.status(400).json({ message: "Category could not be updated" });
    }
    return res.status(200).json({ message: "Category updated successfully", category: updated });
  } catch (err) {
    return res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
});

Router.delete("/categories/delete/category/:id", isAdminOnly, async (req, res) => {
  try {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    const skillsUsing = await Skills.countDocuments({ Category: id });
    if (skillsUsing > 0) {
      return res.status(409).json({
        message: `Cannot delete — ${skillsUsing} skill(s) are using this category. Reassign them first.`,
      });
    }
    await Category.findByIdAndDelete(id);
    return res.status(200).json({ message: "Category deleted successfully" });
  } catch (err) {
    return res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
});

Router.get("/show/categories", async (req, res) => {
  try {
    const categories = await Category.find().sort({ order: 1, name: 1 });
    return res.status(200).json(categories);
  } catch (err) {
    return res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
});

export default Router;
