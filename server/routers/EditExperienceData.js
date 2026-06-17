import express from "express";
import Experience from "../models/ExperienceSchema.js";
import { isAdminOnly, isAdminOrViewer } from "../middlewares/isAdminOnly.js";
import mongoose from "mongoose";
const Router = express.Router();

Router.post("/experience/add", isAdminOnly, async (req, res) => {
  try {
    const NewExperience = new Experience({
      Company: req.body.Company,
      Role: req.body.Role,
      StartDate: req.body.StartDate,
      EndDate: req.body.EndDate || "",
      Description: req.body.Description || "",
      Technologies: req.body.Technologies || [],
      DisplayOrder: req.body.DisplayOrder || 0,
    });
    await NewExperience.save();
    res.status(201).json({ message: "Experience Added Successfully" });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: err.message });
  }
});

Router.put("/experience/edit/:id", isAdminOnly, async (req, res) => {
  try {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }
    const FindExperience = await Experience.findById(id);
    if (!FindExperience) {
      return res.status(404).json({ message: "Experience Not Found" });
    }
    if (!req.body) {
      return res.status(400).json({ message: "Select Something To Update" });
    }
    const newdata = { ...req.body };
    const updateExperience = await Experience.findByIdAndUpdate(id, newdata, {
      new: true,
      runValidators: true,
    });
    if (!updateExperience) {
      return res
        .status(400)
        .json({ message: "Experience Not Updated" });
    }
    return res.status(200).json({ message: "Experience Updated Successfully" });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: err.message });
  }
});

Router.delete("/experience/delete/:id", isAdminOnly, async (req, res) => {
  try {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }
    const findExperience = await Experience.findById(id);
    if (!findExperience) {
      return res.status(404).json({ message: "Experience Not Found" });
    }
    const DeleteExperience = await Experience.findByIdAndDelete(id);
    if (!DeleteExperience) {
      return res.status(409).json({ message: "Cannot Delete Experience" });
    }
    return res.status(200).json({ message: "Experience Deleted Successfully" });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: err.message });
  }
});

Router.get("/show/experiences", async (req, res) => {
  try {
    const ExperiencesData = await Experience.find().sort({ DisplayOrder: 1, createdAt: -1 });
    return res.status(200).json(ExperiencesData);
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: err.message });
  }
});

export default Router;
