import express from "express";
const Router = express.Router();
import Project from "../models/ProjectSchema.js";
import validateProjectInput from "../middlewares/validateProjectInput.js";
import { isAdminOnly, isAdminOrViewer } from "../middlewares/isAdminOnly.js";
import { removeCloudinaryAsset, upload } from "../controllers/storage.js";
import { activityLoggerMiddleware } from "../utils/activityLogger.js";
import PorjectsLogoFolderValidation from "../middlewares/ProjectsLogos.js";
import mongoose from "mongoose";

const ALLOWED_PROJECT_UPDATE_FIELDS = new Set([
  "Title",
  "ShortDescription",
  "Description",
  "ProjectLiveUrl",
  "GithubUrl",
  "Project_technologies",
  "Project_Status",
  "DisplayOrder",
  "Featured",
  "FeaturedDisplayOrder",
]);
// Route to add a new project
// This route expects a POST request with project details in the request body
Router.post(
  "/projects/add/project",
  isAdminOnly,
  validateProjectInput,
  PorjectsLogoFolderValidation,
  upload.single("image"),
  activityLoggerMiddleware("project"),
  async (req, res) => {
    try {
      const NewProject = new Project({
        Title: req.body.Title,
        ShortDescription: req.body.ShortDescription,
        Description: req.body.Description,
        Image: req.file?.path,
        ProjectLiveUrl: req.body.ProjectLiveUrl,
        GithubUrl: req.body.GithubUrl,
        Project_technologies: req.body.Project_technologies,
        Project_Status: req.body.Project_Status,
        DisplayOrder: req.body.DisplayOrder,
        Featured: req.body.Featured,
        FeaturedDisplayOrder: req.body.FeaturedDisplayOrder,
      });
      const savedProject = await NewProject.save();
      req.activityDetails = { title: savedProject.Title };
      return res.status(201).json(savedProject);
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Internal Server Error", error: error.message });
    }
  }
);

Router.delete("/projects/delete/:id", isAdminOnly, activityLoggerMiddleware("project"), async (req, res) => {
  try {
    const id = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Not Valid Id" });
    }
    const FindProject = await Project.findById(id);
    if (!FindProject) {
      return res.status(404).json({ message: "Project Not Found" });
    }

    if (FindProject.Image != "Nothing") {
      try {
        await removeCloudinaryAsset(FindProject.Image);
      } catch (err) {
        console.error("Cloudinary remove failed (delete project):", err.message);
      }
    }
    await Project.findByIdAndDelete(id);

    req.activityDetails = { title: FindProject.Title };
    return res.status(200).json({ message: `Project Deleted ` });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
});

Router.put(
  "/projects/edit/:id",
  isAdminOnly,
  PorjectsLogoFolderValidation,
  upload.single("image"),
  activityLoggerMiddleware("project"),
  async (req, res) => {
    try {
      const id = req.params.id;
      const image = req.file?.path;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }

      const FindProject = await Project.findById(id);
      if (!FindProject) {
        return res.status(404).json({ message: "Project Not Found" });
      }

      const bodyKeys = Object.keys(req.body || {});
      const unexpectedFields = bodyKeys.filter(
        (key) => !ALLOWED_PROJECT_UPDATE_FIELDS.has(key)
      );

      if (unexpectedFields.length > 0) {
        return res.status(400).json({
          message: `Unexpected fields: ${unexpectedFields.join(", ")}`,
        });
      }

      const NewData = Object.fromEntries(
        Object.entries(req.body || {}).filter(([key]) =>
          ALLOWED_PROJECT_UPDATE_FIELDS.has(key)
        )
      );

      if ("Featured" in NewData) {
        NewData.Featured = String(NewData.Featured).toLowerCase() === "true";
      }

      if ("DisplayOrder" in NewData) {
        const displayOrder = Number(NewData.DisplayOrder);
        if (Number.isNaN(displayOrder)) {
          return res
            .status(400)
            .json({ message: "DisplayOrder must be a valid number" });
        }
        NewData.DisplayOrder = displayOrder;
      }

      if ("FeaturedDisplayOrder" in NewData) {
        const featuredDisplayOrder = Number(NewData.FeaturedDisplayOrder);
        if (Number.isNaN(featuredDisplayOrder)) {
          return res
            .status(400)
            .json({ message: "FeaturedDisplayOrder must be a valid number" });
        }
        NewData.FeaturedDisplayOrder = featuredDisplayOrder;
      }

      if ("Project_technologies" in NewData) {
        if (Array.isArray(NewData.Project_technologies)) {
          NewData.Project_technologies = NewData.Project_technologies;
        } else if (typeof NewData.Project_technologies === "string") {
          NewData.Project_technologies = NewData.Project_technologies
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean);
        } else {
          return res.status(400).json({
            message: "Project_technologies must be an array or comma-separated string",
          });
        }
      }

      if (Object.keys(NewData).length === 0 && !image) {
        return res.status(400).json({ message: "No valid fields provided" });
      }

      if (image) {
        NewData.Image = image;
        try {
          await removeCloudinaryAsset(FindProject.Image);
        } catch (err) {
          console.error("Cloudinary remove failed (update image):", err.message);
        }
      }

      const UpdateProjec = await Project.findByIdAndUpdate(
        FindProject._id,
        NewData,
        { runValidators: true, new: true }
      );

      if (!UpdateProjec) {
        return res.status(409).json({ message: `Project Update Failed` });
      }

      req.activityDetails = { title: UpdateProjec.Title };
      return res.status(200).json({
        message: `Project Updated Successfully`,
      });
    } catch (err) {
      console.error("Error updating Project:", err);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }
);

// GET REQ TO SHOW ALL PROJECT FOR Frontend
Router.get("/show/projects", async (req, res) => {
  try {
    const Projects = await Project.find();
    if (Projects.length === 0) {
      return res.status(200).json([]);
    }
    const FilteredData = Projects.map((doc) => ({
      _id: doc._id,
      Title: doc.Title,
      ShortDescription: doc.ShortDescription,
      Description: doc.Description,
      Image: doc.Image,
      ProjectLiveUrl: doc.ProjectLiveUrl,
      GithubUrl: doc.GithubUrl,
      Project_technologies: doc.Project_technologies,
      Project_Status: doc.Project_Status,
      DisplayOrder: doc.DisplayOrder,
      Featured: doc.Featured,
      FeaturedDisplayOrder: doc.FeaturedDisplayOrder,
    }));
    return res.status(200).json(FilteredData);
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
});

Router.put("/projects/image/remove/:id", isAdminOnly, activityLoggerMiddleware("project"), async (req, res) => {
  try {
    const id = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    const FindProject = await Project.findById(id);
    if (!FindProject) {
      return res.status(404).json({ message: "Project Not Found" });
    }

    try {
      await removeCloudinaryAsset(FindProject.Image);
    } catch (err) {
      console.error("Cloudinary remove failed (remove image route):", err.message);
    }

    const UpdateProject = await Project.findByIdAndUpdate(
      FindProject._id,
      {
        Image: "Nothing",
      },
      { new: true }
    );

    if (!UpdateProject) {
      return res.status(409).json({ message: `Project Image Update Failed` });
    }

    req.activityDetails = { title: UpdateProject.Title };
    return res.status(200).json({
      message: `Project Image Removed Successfully`,
    });
  } catch (err) {
    console.error("Error updating Image Project:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});
export default Router;
