import HomeData from "../models/HomeDataSchema.js";
import AboutUsData from "../models/AboutUsSchema.js";
import Project from "../models/ProjectSchema.js";
import Footer from "../models/FooterSchema.js";
import Experience from "../models/ExperienceSchema.js";
import express from "express";
const Router = express.Router();
Router.get("/home/main/data", async (req, res) => {
  try {
    const homeData = await HomeData.findOne()
      .select(
        "HomeLogo DisplayName MainRoles description TechStack FocusArea AvailabilityStatus CalendlyUrl ArchitectureSectionTitle ProjectsSectionTitle PresenceHeadingPrefix PresenceHeadingHighlight PresenceDescription Stats"
      )
      .populate({ path: "Stats", select: "StatsNumber StatsLabel" });

    if (!homeData) {
      return res.status(200).json({
        HomeLogo: "",
        DisplayName: "",
        MainRoles: [],
        description: "",
        TechStack: "",
        FocusArea: "",
        AvailabilityStatus: "",
        CalendlyUrl: "",
        ArchitectureSectionTitle: "",
        ProjectsSectionTitle: "",
        PresenceHeadingPrefix: "",
        PresenceHeadingHighlight: "",
        PresenceDescription: "",
        Stats: [],
        AboutUs: null,
        AboutUsSlides: null,
        FeaturedProjects: [],
        FooterInfo: null,
        footersociallinks: null,
        _empty: true,
      });
    }

    const [aboutUsData, featuredProjects, footerData, experiences] =
      await Promise.all([
        AboutUsData.findOne()
          .select(
            "AboutUsTitle AboutUsDescription AboutSkills AcademicTitle AcademicMeta AcademicDescription IdentityCard1Title IdentityCard1Subtitle IdentityCard1Items IdentityCard2Title IdentityCard2Subtitle IdentityCard2Items IdentityCard3Title IdentityCard3Subtitle IdentityCard3Items PhilosophyQuote PhilosophyMeta AboutUsSlides"
          )
          .populate({ path: "AboutUsSlides", select: "slideTitle slideDescription" }),
        Project.find({ Featured: true }).sort({
          FeaturedDisplayOrder: 1,
          createdAt: -1,
        }),
        Footer.findOne()
          .select(
            "FooterTitle FooterDescription OwnerEmail OwnerPhone OwnerAddress FooterSocialLinks"
          )
          .populate({ path: "FooterSocialLinks", select: "SocialIcon SocialLink" }),
        Experience.find().sort({ DisplayOrder: 1, createdAt: -1 }),
      ]);

    const filteredData = {
      Stats: homeData.Stats || [],
      HomeLogo: homeData.HomeLogo,
      DisplayName: homeData.DisplayName,
      MainRoles: homeData.MainRoles,
      description: homeData.description,
      TechStack: homeData.TechStack,
      FocusArea: homeData.FocusArea,
      AvailabilityStatus: homeData.AvailabilityStatus,
      CalendlyUrl: homeData.CalendlyUrl,
      ArchitectureSectionTitle: homeData.ArchitectureSectionTitle,
      ProjectsSectionTitle: homeData.ProjectsSectionTitle,
      PresenceHeadingPrefix: homeData.PresenceHeadingPrefix,
      PresenceHeadingHighlight: homeData.PresenceHeadingHighlight,
      PresenceDescription: homeData.PresenceDescription,
      AboutUs: aboutUsData,
      AboutUsSlides: aboutUsData?.AboutUsSlides || [],
      FeaturedProjects: featuredProjects,
      FooterInfo: footerData,
      footersociallinks: footerData,
      Experiences: experiences,
    };
    return res.status(200).json(filteredData);
  } catch (error) {
    console.error("Error fetching home data:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});
export default Router;
