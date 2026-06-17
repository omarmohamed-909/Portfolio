import mongoose from "mongoose";
const aboutUsShema = mongoose.Schema(
  {
    AboutUsTitle: {
      type: String,
    },
    AboutUsDescription: {
      type: String,
    },
    AboutSkills: {
      type: [String],
    },
    AboutUsSlides: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "AboutUsSlides",
      },
    ],
    AcademicTitle: {
      type: String,
    },
    AcademicMeta: {
      type: String,
    },
    AcademicDescription: {
      type: String,
    },
    IdentityCard1Title: { type: String },
    IdentityCard1Subtitle: { type: String },
    IdentityCard1Items: { type: [String] },
    IdentityCard2Title: { type: String },
    IdentityCard2Subtitle: { type: String },
    IdentityCard2Items: { type: [String] },
    IdentityCard3Title: { type: String },
    IdentityCard3Subtitle: { type: String },
    IdentityCard3Items: { type: [String] },
    PhilosophyQuote: {
      type: String,
    },
    PhilosophyMeta: {
      type: String,
    },
  },
  { timestamps: true }
);

const AboutUs = mongoose.model("AboutUs", aboutUsShema);
export default AboutUs;
