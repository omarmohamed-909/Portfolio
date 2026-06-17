import mongoose from "mongoose";
const ExperienceSchema = new mongoose.Schema({
  Company: {
    type: String,
    required: true,
    minlength: 1,
  },
  Role: {
    type: String,
    required: true,
    minlength: 1,
  },
  StartDate: {
    type: String,
    required: true,
  },
  EndDate: {
    type: String,
    default: "",
  },
  Description: {
    type: String,
    default: "",
  },
  Technologies: {
    type: [String],
    default: [],
  },
  DisplayOrder: {
    type: Number,
    default: 0,
  },
});
const Experience = mongoose.model("Experience", ExperienceSchema);
export default Experience;
