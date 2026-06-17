import AboutUsData from "../models/AboutUsSchema.js";
import Experience from "../models/ExperienceSchema.js";
import express from "express";
const Router = express.Router();

Router.get("/about/data", async (req, res) => {
  try {
    const [aboutUsData, experiences] = await Promise.all([
      AboutUsData.findOne().select(
        "AboutUsTitle AboutUsDescription AboutSkills AcademicTitle AcademicMeta AcademicDescription IdentityCard1Title IdentityCard1Subtitle IdentityCard1Items IdentityCard2Title IdentityCard2Subtitle IdentityCard2Items IdentityCard3Title IdentityCard3Subtitle IdentityCard3Items PhilosophyQuote PhilosophyMeta AboutUsSlides"
      ).populate({
        path: "AboutUsSlides",
        select: "slideTitle slideDescription",
      }),
      Experience.find().sort({ DisplayOrder: 1, createdAt: -1 }),
    ]);

    if (!aboutUsData) {
      return res.status(200).json({
        AboutUsTitle: "",
        AboutUsDescription: "",
        AboutSkills: [],          // array — not ""
        AcademicTitle: "",
        AcademicMeta: "",
        AcademicDescription: "",
        IdentityCard1Title: "",
        IdentityCard1Subtitle: "",
        IdentityCard1Items: [],   // array — not ""
        IdentityCard2Title: "",
        IdentityCard2Subtitle: "",
        IdentityCard2Items: [],   // array — not ""
        IdentityCard3Title: "",
        IdentityCard3Subtitle: "",
        IdentityCard3Items: [],   // array — not ""
        PhilosophyQuote: "",
        PhilosophyMeta: "",       // removed duplicate key
        AboutUsSlides: [],
        Experiences: [],
        _empty: true,
      });
    }

    return res.status(200).json({
      ...aboutUsData.toObject(),
      Experiences: experiences,
    });
  } catch (error) {
    console.error("Error fetching about data:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

export default Router;
