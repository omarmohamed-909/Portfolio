import Joi from "joi";
function validateAboutData(req, res, next) {
  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({ message: "No data provided for validation" });
  }
  const schema = Joi.object({
    AboutUsTitle: Joi.string().optional().allow(''),
    AboutUsDescription: Joi.string().optional().allow(''),
    AboutSkills: Joi.array().optional(),
    AcademicTitle: Joi.string().optional().allow(''),
    AcademicMeta: Joi.string().optional().allow(''),
    AcademicDescription: Joi.string().optional().allow(''),
    IdentityCard1Title: Joi.string().optional().allow(''),
    IdentityCard1Subtitle: Joi.string().optional().allow(''),
    IdentityCard1Items: Joi.array().optional(),
    IdentityCard2Title: Joi.string().optional().allow(''),
    IdentityCard2Subtitle: Joi.string().optional().allow(''),
    IdentityCard2Items: Joi.array().optional(),
    IdentityCard3Title: Joi.string().optional().allow(''),
    IdentityCard3Subtitle: Joi.string().optional().allow(''),
    IdentityCard3Items: Joi.array().optional(),
    PhilosophyQuote: Joi.string().optional().allow(''),
    PhilosophyMeta: Joi.string().optional().allow(''),
  });
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
}
export default validateAboutData;
