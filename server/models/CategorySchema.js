import mongoose from "mongoose";
const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  icon: { type: String, required: true, default: "Code2" },
  order: { type: Number, default: 0 },
}, { timestamps: true });

const Category = mongoose.model("Category", CategorySchema);
export default Category;
