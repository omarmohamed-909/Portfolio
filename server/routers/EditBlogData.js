import express from "express";
import mongoose from "mongoose";
const Router = express.Router();
import Blog from "../models/BlogSchema.js";
import validateBlogInput from "../middlewares/BlogValidation.js";
import { isAdminOnly, isAdminOrViewer } from "../middlewares/isAdminOnly.js";
import BlogImgFolderValidation from "../middlewares/BlogImgFolder.js";
import { removeCloudinaryAsset, upload } from "../controllers/storage.js";
import { activityLoggerMiddleware } from "../utils/activityLogger.js";

function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

async function uniqueSlug(baseSlug) {
  let slug = baseSlug;
  let counter = 1;
  while (await Blog.findOne({ Slug: slug })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  return slug;
}

const ALLOWED_UPDATE_FIELDS = new Set([
  "Title", "Content", "Excerpt", "Tags", "Author", "Published",
]);

Router.post(
  "/blog/add",
  isAdminOnly,
  BlogImgFolderValidation,
  upload.single("image"),
  validateBlogInput,
  activityLoggerMiddleware("blog"),
  async (req, res) => {
    try {
      const slug = await uniqueSlug(generateSlug(req.body.Title));
      const post = new Blog({
        Title: req.body.Title,
        Slug: slug,
        Content: req.body.Content,
        Excerpt: req.body.Excerpt || "",
        CoverImage: req.file?.path,
        Tags: Array.isArray(req.body.Tags)
          ? req.body.Tags
          : typeof req.body.Tags === "string" && req.body.Tags.trim()
            ? req.body.Tags.split(",").map((t) => t.trim()).filter(Boolean)
            : [],
        Author: req.body.Author || "Omar",
        Published: String(req.body.Published || "false").toLowerCase() === "true",
      });
      const saved = await post.save();
      req.activityDetails = { title: saved.Title };
      return res.status(201).json(saved);
    } catch (error) {
      return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
  }
);

Router.get("/show/blog", async (req, res) => {
  try {
    const posts = await Blog.find({ Published: true }).sort({ createdAt: -1 });
    const data = posts.map((doc) => ({
      _id: doc._id,
      Title: doc.Title,
      Slug: doc.Slug,
      Content: doc.Content,
      Excerpt: doc.Excerpt,
      CoverImage: doc.CoverImage,
      Tags: doc.Tags,
      Author: doc.Author,
      Published: doc.Published,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    }));
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ message: "Server Error" });
  }
});

Router.get("/show/blog/:slug", async (req, res) => {
  try {
    const post = await Blog.findOne({ Slug: req.params.slug, Published: true });
    if (!post) return res.status(404).json({ message: "Post not found" });
    return res.status(200).json(post);
  } catch (err) {
    return res.status(500).json({ message: "Server Error" });
  }
});

Router.get("/blog/all", isAdminOrViewer, async (req, res) => {
  try {
    const posts = await Blog.find().sort({ createdAt: -1 });
    return res.status(200).json(posts);
  } catch (err) {
    return res.status(500).json({ message: "Server Error" });
  }
});

Router.get("/blog/:id", isAdminOrViewer, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid ID" });
    }
    const post = await Blog.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    return res.status(200).json(post);
  } catch (err) {
    return res.status(500).json({ message: "Server Error" });
  }
});

Router.put(
  "/blog/edit/:id",
  isAdminOnly,
  BlogImgFolderValidation,
  upload.single("image"),
  activityLoggerMiddleware("blog"),
  async (req, res) => {
    try {
      const id = req.params.id;
      const image = req.file?.path;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }

      const existing = await Blog.findById(id);
      if (!existing) {
        return res.status(404).json({ message: "Post not found" });
      }

      const bodyKeys = Object.keys(req.body || {});
      const unexpected = bodyKeys.filter((k) => !ALLOWED_UPDATE_FIELDS.has(k));
      if (unexpected.length > 0) {
        return res.status(400).json({
          message: `Unexpected fields: ${unexpected.join(", ")}`,
        });
      }

      const NewData = Object.fromEntries(
        Object.entries(req.body || {}).filter(([k]) =>
          ALLOWED_UPDATE_FIELDS.has(k)
        )
      );

      if ("Published" in NewData) {
        NewData.Published = String(NewData.Published).toLowerCase() === "true";
      }

      if ("Tags" in NewData) {
        if (Array.isArray(NewData.Tags)) {
          NewData.Tags = NewData.Tags;
        } else if (typeof NewData.Tags === "string") {
          NewData.Tags = NewData.Tags.split(",").map((t) => t.trim()).filter(Boolean);
        } else {
          return res.status(400).json({
            message: "Tags must be an array or comma-separated string",
          });
        }
      }

      if ("Title" in NewData && NewData.Title !== existing.Title) {
        NewData.Slug = await uniqueSlug(generateSlug(NewData.Title));
      }

      if (Object.keys(NewData).length === 0 && !image) {
        return res.status(400).json({ message: "No valid fields provided" });
      }

      if (image) {
        NewData.CoverImage = image;
        try { await removeCloudinaryAsset(existing.CoverImage); } catch {}
      }

      const updated = await Blog.findByIdAndUpdate(id, NewData, {
        runValidators: true,
        new: true,
      });

      if (!updated) {
        return res.status(409).json({ message: "Update failed" });
      }

      req.activityDetails = { title: updated.Title };
      return res.status(200).json({ message: "Post updated successfully" });
    } catch (err) {
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }
);

Router.delete("/blog/delete/:id", isAdminOnly, activityLoggerMiddleware("blog"), async (req, res) => {
  try {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID" });
    }
    const post = await Blog.findById(id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.CoverImage !== "Nothing") {
      try { await removeCloudinaryAsset(post.CoverImage); } catch {}
    }

    await Blog.findByIdAndDelete(id);
    req.activityDetails = { title: post.Title };
    return res.status(200).json({ message: "Post deleted" });
  } catch (err) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

Router.put("/blog/image/remove/:id", isAdminOnly, activityLoggerMiddleware("blog"), async (req, res) => {
  try {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID" });
    }

    const post = await Blog.findById(id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    try { await removeCloudinaryAsset(post.CoverImage); } catch {}

    const updated = await Blog.findByIdAndUpdate(
      id,
      { CoverImage: "Nothing" },
      { new: true }
    );

    if (!updated) {
      return res.status(409).json({ message: "Image remove failed" });
    }

    req.activityDetails = { title: updated.Title };
    return res.status(200).json({ message: "Image removed successfully" });
  } catch (err) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

export default Router;
