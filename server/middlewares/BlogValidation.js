import Joi from "joi";

function validateBlogInput(req, res, next) {
  const schema = Joi.object({
    Title: Joi.string().min(3).max(200).required(),
    Content: Joi.string().min(10).required(),
    Excerpt: Joi.string().max(500).allow(""),
    Tags: Joi.alternatives().try(
      Joi.array().items(Joi.string()),
      Joi.string()
    ),
    Author: Joi.string().allow(""),
    Published: Joi.alternatives().try(Joi.boolean(), Joi.string()),
  });

  const { error } = schema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  next();
}

export default validateBlogInput;
