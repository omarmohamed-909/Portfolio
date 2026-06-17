import mongoose from "mongoose";
const homeDataSchema = mongoose.Schema({
  HomeLogo: {
    type: String,
  },
  DisplayName: {
    type: String,
  },
  MainRoles: {
    type: [String],
  },
  description: {
    type: String,
  },
  TechStack: {
    type: String,
  },
  FocusArea: {
    type: String,
  },
  AvailabilityStatus: {
    type: String,
  },
  CalendlyUrl: {
    type: String,
  },
  ArchitectureSectionTitle: {
    type: String,
  },
  ProjectsSectionTitle: {
    type: String,
  },
  PresenceHeadingPrefix: {
    type: String,
  },
  PresenceHeadingHighlight: {
    type: String,
  },
  PresenceDescription: {
    type: String,
  },
  AboutUs: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "AboutUs",
  },
  Stats: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Stats",
    },
  ],
});
const HomeData = mongoose.model("HomePageData", homeDataSchema);
export default HomeData;
