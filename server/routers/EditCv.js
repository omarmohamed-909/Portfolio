import express from "express";
import isAdminLogged from "../middlewares/isAdminLogged.js";
import { removeCloudinaryAsset, upload } from "../controllers/storage.js";
import Cv from "../models/CvSchema.js";
import CvFolder from "../middlewares/CvFolder.js";
const Router = express.Router();
Router.post(
  "/cv/add/",
  isAdminLogged,
  CvFolder,
  upload.single("cv"),
  async (req, res) => {
    try {
      if (!req.file?.path) {
        return res.status(400).json({ message: "Pdf Required" });
      }

      const cv = req.file?.path;
      const IsExistCv = await Cv.findOne();
      if (IsExistCv) {
        await removeCloudinaryAsset(cv);
        return res.status(400).json({
          message: "You Need To delete Old Cv Pdf And thean Add The new",
        });
      }

      const AddCv = new Cv({
        Cv: cv,
      });
      await AddCv.save();
      return res.status(201).json({ message: "Cv Added Successfully" });
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Internal Server Error", error: error.message });
    }
  }
);
Router.delete("/cv/delete/", isAdminLogged, async (req, res) => {
  try {
    const IsExistCv = await Cv.findOne();
    if (!IsExistCv) {
      return res.status(404).json({ message: "Cv Not Found" });
    }
    await removeCloudinaryAsset(IsExistCv.Cv);

    const deleteCv = await Cv.findByIdAndDelete(IsExistCv._id);
    if (!deleteCv) {
      return res.status(400).json({ message: "something Wrong" });
    }
    return res.status(200).json({ message: "Old Cv Deleted Successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
});
Router.get("/show/cv/", async (req, res) => {
  try {
    const FindCv = await Cv.findOne();

    if (!FindCv) {
      return res.status(404).json({ message: "There Is No Cv Added " });
    }
    return res.status(200).json({ FindCv });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
});
export default Router;
