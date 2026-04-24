import HomeData from "../models/HomeDataSchema.js";
import AboutUsData from "../models/AboutUsSchema.js";
import Project from "../models/ProjectSchema.js";
import Footer from "../models/FooterSchema.js";
import express from "express";
const Router = express.Router();
Router.get("/home/main/data", async (req, res) => {
  try {
    const homeData = await HomeData.findOne()
      .select(
        "HomeLogo DisplayName MainRoles description Clients_Counting Rateing Stats"
      )
      .populate({
        path: "Stats",
        select: "StatsNumber StatsLabel",
      });

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

    const [aboutUsInfo, aboutUsSlidesInfo, featuredProjects, footerInfo, footerSocialLinks] =
      await Promise.all([
        AboutUsData.findOne().select(
          "AboutUsTitle AboutUsDescription AboutSkills"
        ),
        AboutUsData.findOne().select("AboutUsSlides").populate({
          path: "AboutUsSlides",
          select: "slideImage slideTitle slideDescription",
        }),
        Project.find({ Featured: true }).sort({
          FeaturedDisplayOrder: 1,
          createdAt: -1,
        }),
        Footer.findOne().select(
          "FooterTitle FooterDescription OwnerEmail OwnerPhone OwnerAddress"
        ),
        Footer.findOne().select("FooterSocialLinks").populate({
          path: "FooterSocialLinks",
          select: "SocialIcon SocialLink",
        }),
      ]);

    const filteredData = {
      HomeLogo: homeData.HomeLogo,
      DisplayName: homeData.DisplayName,
      MainRoles: homeData.MainRoles,
      description: homeData.description,
      Clients_Counting: homeData.Clients_Counting,
      Rateing: homeData.Rateing,
      Stats: homeData.Stats || [],
      AboutUs: aboutUsInfo,
      AboutUsSlides: aboutUsSlidesInfo,
      FeaturedProjects: featuredProjects,
      FooterInfo: footerInfo,
      footersociallinks: footerSocialLinks,
    };
    return res.status(200).json(filteredData);
  } catch (error) {
    console.error("Error fetching home data:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});
export default Router;
