import mongoose from "mongoose";
import dotenv from "dotenv";
import Category from "../models/CategorySchema.js";
import Skills from "../models/SkillsSchema.js";

dotenv.config();

const iconMap = {
  frontend: "Code2",
  backend: "Server",
  database: "Database",
  languages: "FileCode",
  language: "FileCode",
  "computer vision": "ScanSearch",
  vision: "ScanSearch",
  core: "Brain",
  algorithm: "Brain",
  "3d": "Box",
  media: "Box",
  pipeline: "Box",
  cloud: "Cloud",
  infra: "Cloud",
  devops: "Wrench",
  tool: "Wrench",
  state: "Layers",
};

function guessIcon(categoryName) {
  const lower = (categoryName || "").toLowerCase();
  for (const [keyword, icon] of Object.entries(iconMap)) {
    if (lower.includes(keyword)) return icon;
  }
  return "Code2";
}

async function migrate() {
  const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error("MONGO_URI not found in environment");
    process.exit(1);
  }

  try {
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB");

    const skills = await Skills.find({});
    const distinctCategories = [...new Set(skills.map((s) => s.Category).filter(Boolean))];
    console.log(`Found ${distinctCategories.length} unique categories:`, distinctCategories);

    for (const catName of distinctCategories) {
      let category = await Category.findOne({ name: catName });
      if (!category) {
        const icon = guessIcon(catName);
        category = await Category.create({ name: catName, icon, order: 0 });
        console.log(`Created category: ${catName} (icon: ${icon})`);
      }
      const result = await Skills.updateMany(
        { Category: catName },
        { $set: { Category: category._id } }
      );
      console.log(`Updated ${result.modifiedCount} skills for category "${catName}"`);
    }

    console.log("Migration complete!");
    process.exit(0);
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  }
}

migrate();
