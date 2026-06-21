import Joi from "joi";
import mongoose from "mongoose";
function validateAddSkill(req, res, next) {
  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({ message: "No data provided for validation" });
  }
  const schema = Joi.object({
    Category: Joi.string().custom((value, helpers) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        return helpers.error("any.invalid");
      }
      return value;
    }).required().messages({
      "any.invalid": "Category must be a valid ObjectId",
      "any.required": "Category is required",
    }),
    SkillName: Joi.string().min(1).required(),
    Skill_Level: Joi.number().required(),
    Detail: Joi.string().allow('').optional(),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
}
export default validateAddSkill;
