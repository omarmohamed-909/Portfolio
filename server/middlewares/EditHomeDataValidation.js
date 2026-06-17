import Joi from "joi";
function validateEditHomeData(req, res, next) {
  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({ message: "No data provided for validation" });
  }
  const schema = Joi.object({
    DisplayName: Joi.string().optional(),
    MainRoles: Joi.array().items(Joi.string()).optional(),
    description: Joi.string().optional(),
    TechStack: Joi.string().optional().allow(''),
    FocusArea: Joi.string().optional().allow(''),
    AvailabilityStatus: Joi.string().optional().allow(''),
    CalendlyUrl: Joi.string().optional().allow(''),
    ArchitectureSectionTitle: Joi.string().optional().allow(''),
    ProjectsSectionTitle: Joi.string().optional().allow(''),
    PresenceHeadingPrefix: Joi.string().optional().allow(''),
    PresenceHeadingHighlight: Joi.string().optional().allow(''),
    PresenceDescription: Joi.string().optional().allow(''),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
}
export default validateEditHomeData;
