import express from "express";
const Router = express.Router();
import aboutUsShema from "../models/AboutUsSchema.js";
import AboutUsSlides from "../models/AboutUsSlidesSchema.js";
import { isAdminOnly, isAdminOrViewer } from "../middlewares/isAdminOnly.js";
import validateAboutData from "../middlewares/EditAboutValidation.js";
import mongoose from "mongoose";

Router.post(
  "/aboutslide/add/slide",
  isAdminOnly,
  async (req, res) => {
    try {
      if (!req.body.slideTitle || !req.body.slideDescription) {
        return res.status(400).json({ message: "All fields Required" });
      }
      const NewSlide = new AboutUsSlides({
        slideTitle: req.body.slideTitle,
        slideDescription: req.body.slideDescription,
      });

      const SavedSlide = await NewSlide.save();

      const FindAllAboutUsSlides = await aboutUsShema.findOne();

      if (!FindAllAboutUsSlides) {
        return res.status(404).json({ message: "aboutUs data not found" });
      }

      await FindAllAboutUsSlides.save();

      return res.status(201).json({ message: "About Us Slide Added" });
    } catch {
      return res.status(409).json({ message: "Something Wrong" });
    }
  }
);
Router.delete(
  "/aboutslide/delete/slide/:id",
  isAdminOnly,
  async (req, res) => {
    try {
      const id = req.params.id;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Not Valid Id" });
      }

      const FindSlide = await AboutUsSlides.findById(id);
      if (!FindSlide) {
        return res.status(404).json({ message: "Slide Not Found" });
      }

      const FetchAboutSlides = await aboutUsShema.findOne();

      if (!FetchAboutSlides) {
        return res.status(404).json({
          message: "About Us page data not found",
        });
      }

      const slideExists = FetchAboutSlides.AboutUsSlides.includes(
        FindSlide._id
      );
      if (!slideExists) {
        return res.status(404).json({
          message: "Slide not found in About Us page",
        });
      }

      FetchAboutSlides.AboutUsSlides.pull(FindSlide._id);

      const DeleteFromAboutPage = await FetchAboutSlides.save();

      if (!DeleteFromAboutPage) {
        return res.status(409).json({
          message:
            "Something Wrong I Can't delete This Slide From About Us Page",
        });
      }

      await AboutUsSlides.findByIdAndDelete(FindSlide._id);

      return res.status(200).json({ message: "Slide deleted successfully" });
    } catch (err) {
      console.error("Delete slide error:", err);
      return res
        .status(500)
        .json({ message: "Something Wrong", error: err.message });
    }
  }
);

Router.put(
  "/aboutslide/edit/slide/:id",
  isAdminOnly,
  async (req, res) => {
    try {
      const id = req.params.id;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }

      const FindSlide = await AboutUsSlides.findById(id);
      if (!FindSlide) {
        return res.status(404).json({ message: "Slide Not Found" });
      }

      const NewData = {
        ...req.body,
      };

      const UpdateSlide = await AboutUsSlides.findByIdAndUpdate(
        FindSlide._id,
        NewData,
        { runValidators: true, new: true }
      );

      if (!UpdateSlide) {
        return res.status(409).json({ message: `Slide Update Has Failed` });
      }

      return res.status(200).json({
        message: `Slide Updated Successfully`,
        updatedSlide: UpdateSlide,
      });
    } catch (err) {
      console.error("Error updating Slide:", err);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }
);


Router.put(
  "/about/edit/aboutdata",
  isAdminOnly,
  validateAboutData,
  async (req, res) => {
    try {
      const newdata = req.body;

      // upsert: true ensures the document is created if it doesn't exist yet
      const UpdateData = await aboutUsShema.findOneAndUpdate(
        {},
        { $set: newdata },
        { new: true, runValidators: true, upsert: true }
      );

      if (!UpdateData) {
        return res
          .status(500)
          .json({ error: "Failed to update About Us data" });
      }

      return res.status(200).json({
        message: "About Us data updated successfully",
        data: UpdateData,
      });
    } catch (error) {
      console.error("Error updating About Us data:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
);

export default Router;
