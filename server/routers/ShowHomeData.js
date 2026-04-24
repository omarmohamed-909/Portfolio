import HomeData from "../models/HomeDataSchema.js";
import StatsData from "../models/StatsSchema.js";
import AboutUsData from "../models/AboutUsSchema.js";
import AboutUsSlides from "../models/AboutUsSlidesSchema.js";
import Project from "../models/ProjectSchema.js";
import Footer from "../models/FooterSchema.js";
import FooterSocialLinksModel from "../models/FooterSocialLinksSchema.js";
import express from "express";
const Router = express.Router();
Router.get("/home/main/data", async (req, res) => {
  try {
    const homeData = await HomeData.findOne();
    if (!homeData) {
      // Return empty defaults instead of 404 so frontend doesn't break
      return res.status(200).json({
        HomeLogo: "",
        DisplayName: "",
        MainRoles: [],
        description: "",
        Clients_Counting: 0,
        Rateing: 0,
        Stats: [],
        AboutUs: null,
        AboutUsSlides: null,
        FeaturedProjects: [],
        FooterInfo: null,
        footersociallinks: null,
        _empty: true, // flag so frontend knows data hasn't been seeded
      });
    }

    const StatsInfo = await HomeData.findOne()
      .populate("Stats")
      .select("StatsNumber StatsLabel");

    const AboutUsInfo = await AboutUsData.findOne().select(
      "AboutUsTitle AboutUsDescription AboutSkills"
    );

    const AboutUsSlides = await AboutUsData.findOne()
      .populate("AboutUsSlides")
      .select("slideImage slideTitle slideDescription");
    const FeaturedProjects = await Project.find({ Featured: true }).sort({
      FeaturedDisplayOrder: 1,
      createdAt: -1,
    });

    const FooterInfo = await Footer.findOne().select(
      "FooterTitle FooterDescription OwnerEmail OwnerPhone OwnerAddress"
    );

    const footersociallinks = await Footer.findOne()
      .populate("FooterSocialLinks")
      .select("SocialIcon SocialLink");

    const filteredData = {
      HomeLogo: homeData.HomeLogo,
      DisplayName: homeData.DisplayName,
      MainRoles: homeData.MainRoles,
      description: homeData.description,
      Clients_Counting: homeData.Clients_Counting,
      Rateing: homeData.Rateing,
      Stats: StatsInfo?.Stats || [],
      AboutUs: AboutUsInfo,
      AboutUsSlides: AboutUsSlides,
      FeaturedProjects: FeaturedProjects,
      FooterInfo: FooterInfo,
      footersociallinks: footersociallinks,
    };
    return res.status(200).json(filteredData);
  } catch (error) {
    console.error("Error fetching home data:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});
export default Router;
