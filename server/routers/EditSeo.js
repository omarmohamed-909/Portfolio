import express from "express";
import Seo from "../models/SeoSchema.js";
import { isAdminOnly } from "../middlewares/isAdminOnly.js";
import EditSeoValidation from "../middlewares/EditSeoValidation.js";
//static Seo
import StaticSeo from "../models/StaticSeo.js";
import EditStaticSeoValidation from "../middlewares/EditStaticSeo.js";
import { removeCloudinaryAsset, upload } from "../controllers/storage.js";
const Router = express.Router();

// Static Seo
Router.put(
  "/edit/static/seo",
  isAdminOnly,
  EditStaticSeoValidation,
  async (req, res) => {
    try {
      // upsert: true creates the doc if setup was never run
      await StaticSeo.findOneAndUpdate(
        {},
        { $set: req.body },
        { new: true, runValidators: true, upsert: true }
      );
      return res
        .status(200)
        .json({ message: "Static Seo Updated Successfully" });
    } catch (err) {
      return res.status(500).json({ message: "Server Error" });
    }
  }
);

// ── GET /seo/static MUST come before GET /seo/:page ──────────────────────────
// Express matches routes in order — if :page came first it would intercept
// every /seo/static request and treat "static" as a page name (no document
// with Page:"static" exists, so it would always return an empty object).
Router.get("/seo/static", async (req, res) => {
  try {
    const findPage = await StaticSeo.findOne({});
    if (!findPage) {
      // Return empty defaults instead of 404 so frontend doesn't break
      return res.status(200).json({
        WebLogo: "",
        Author: "",
        WebsiteName: "",
        LangCode: "",
        Lang: "",
        CountryCode: "",
        City: "",
        Geographic: "",
        ICBM: "",
        _empty: true,
      });
    }
    return res.status(200).json(findPage);
  } catch (err) {
    return res.status(500).json({ message: "Server Error" });
  }
});

// Single Pages Seo — upsert so missing pages get created automatically
Router.put(
  "/edit/seo/:page",
  isAdminOnly,
  EditSeoValidation,
  async (req, res) => {
    try {
      const { page } = req.params;

      const allowedPages = ["home", "projects", "skills", "cv", "contact", "about", "blog"];
      if (!allowedPages.includes(page)) {
        return res.status(400).json({ message: "Invalid page name" });
      }

      // upsert: create the document if it doesn't exist yet
      await Seo.findOneAndUpdate(
        { Page: page },
        { ...req.body, Page: page },
        { new: true, upsert: true, runValidators: false }
      );

      return res.status(200).json({ message: "Seo Data Updated Successfully" });
    } catch (err) {
      console.error("SEO update error:", err);
      return res.status(500).json({ message: "Server Error", error: err.message });
    }
  }
);

Router.get("/seo/:page", async (req, res) => {
  try {
    const { page } = req.params;
    const findPage = await Seo.findOne({ Page: page });
    if (!findPage) {
      // Return empty defaults instead of 404 so frontend doesn't break
      return res.status(200).json({
        Page: page,
        Title: "",
        Description: "",
        Keywords: [],
        SocialTitle: "",
        SocialDescription: "",
        PageUrl: "",
        SocialImage: "",
        TwitterTitle: "",
        TwitterDescription: "",
        TwitterImage: "",
        _empty: true,
      });
    }
    return res.status(200).json(findPage);
  } catch (err) {
    return res.status(500).json({ message: "Server Error" });
  }
});


// OG Image Upload
Router.post(
  "/upload/seo/image",
  isAdminOnly,
  (req, res, next) => {
    req.query.folder = "seoimg";
    next();
  },
  upload.single("ogImage"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      const imageUrl = req.file.path;
      return res.status(200).json({ url: imageUrl });
    } catch (err) {
      return res.status(500).json({ message: "Upload failed", error: err.message });
    }
  }
);

// Delete OG Image
Router.delete(
  "/delete/seo/image",
  isAdminOnly,
  async (req, res) => {
    try {
      const { url } = req.body;
      if (!url) {
        return res.status(400).json({ message: "No image URL provided" });
      }
      await removeCloudinaryAsset(url);
      return res.status(200).json({ message: "Image deleted successfully" });
    } catch (err) {
      return res.status(500).json({ message: "Delete failed", error: err.message });
    }
  }
);

export default Router;
