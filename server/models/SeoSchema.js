import mongoose from "mongoose";
const SeoSchema = new mongoose.Schema(
  {
    Page: {
      type: String,
      enum: ["home", "projects", "skills", "cv", "contact", "about"],
      required: true,
      trim: true,
      minlength: 1,
      unique: true,
    },
    Title: {
      type: String,
      trim: true,
      default: "",
    },
    Description: {
      type: String,
      trim: true,
    },
    Keywords: {
      type: [String],
      trim: true,
    },
    SocialTitle: {
      type: String,
      trim: true,
    },
    SocialDescription: {
      type: String,
      trim: true,
    },
    PageUrl: {
      type: String,
      trim: true,
    },
    SocialImage: {
      type: String,
      trim: true,
    },
    TwitterTitle: {
      type: String,
      trim: true,
    },
    TwitterDescription: {
      type: String,
      trim: true,
    },
    TwitterImage: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);
const Seo = mongoose.model("Seo", SeoSchema);
export default Seo;
