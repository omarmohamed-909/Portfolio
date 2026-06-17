import mongoose from "mongoose";
const SkillsSchema = new mongoose.Schema({
  Category: {
    type: String,
    required: true,
    minlength: 1,
  },
  SkillName: {
    type: String,
    required: true,
    minlength: 1,
  },
  Skill_Level: {
    type: Number,
    required: true,
  },
  Detail: {
    type: String,
  },
});
const Skills = mongoose.model("Skills", SkillsSchema);
export default Skills;
