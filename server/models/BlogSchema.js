import mongoose from "mongoose";

const BlogSchema = new mongoose.Schema(
  {
    Title:       { type: String, required: true, trim: true },
    Slug:        { type: String, required: true, unique: true, trim: true },
    Content:     { type: String, required: true },
    Excerpt:     { type: String, trim: true, default: "" },
    CoverImage:  { type: String, default: "Nothing", trim: true },
    Tags:        { type: [String], default: [] },
    Author:      { type: String, default: "Omar", trim: true },
    Published:   { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Blog = mongoose.model("Blog", BlogSchema);
export default Blog;
