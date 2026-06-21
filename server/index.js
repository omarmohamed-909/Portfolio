import express from "express";
import dotenv from "dotenv";
import dbconnection from "./config/dbConnect.js";
import AddProjectRouter from "./routers/EditProjectData.js";
import AdminLogin from "./routers/auth.js";
import cookieParser from "cookie-parser";
import MainHomeData from "./routers/ShowHomeData.js";
import ShowAboutData from "./routers/ShowAboutData.js";
import EditHomeData from "./routers/EditHomeData.js";
import AdminDashboardSecurity from "./routers/AdminDashboard_securityRule.js";
import EditAboutData from "./routers/EditAboutData.js";
import EditFooter from "./routers/EditFooter.js";
import EditSkills from "./routers/EditSkillsData.js";
import EditCategories from "./routers/EditCategoriesData.js";
import EditCv from "./routers/EditCv.js";
import Contact from "./routers/Contact.js";
import EditMessages from "./routers/EditMessages.js";
import EditSeo from "./routers/EditSeo.js";
import BlockHistory from "./routers/BlockHistory.js";
import GithubStats from "./routers/GithubStats.js";
import EditExperience from "./routers/EditExperienceData.js";
import BlogRouter from "./routers/EditBlogData.js";
import ActivityLogRouter from "./routers/ActivityLogRouter.js";
import cors from "cors";
import helmet from "helmet";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BACKEND_PORT = process.env.PORT || process.env.BACKEND_PORT || 5000;
const FRONTEND_PORT = process.env.FRONTEND_PORT || 3000;

const cleanCustomDomain = () => {
  // Check if CUSTOM_DOMAIN exists and is not empty after trimming
  if (!process.env.CUSTOM_DOMAIN || !process.env.CUSTOM_DOMAIN.trim()) {
    return "";
  }

  let domain = process.env.CUSTOM_DOMAIN.trim() // Remove leading/trailing spaces
    .replace(/\s+/g, "") // Remove any internal spaces
    .toLowerCase(); // Normalize to lowercase

  // Remove trailing slash if present
  if (domain.endsWith("/")) {
    domain = domain.slice(0, -1);
  }

  // If after cleaning it's empty, return empty string
  if (!domain) {
    return "";
  }

  return domain;
};

const customDomain = cleanCustomDomain();



const app = express();

// Derive allowed frontend origin for CSP
const frontendOrigin = customDomain
  ? customDomain
  : `http://localhost:${FRONTEND_PORT}`;

// Security headers via helmet
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  // Content Security Policy: blocks inline script injection (XSS)
  // while allowing the resources the app actually needs.
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      // Scripts: only same-origin (no inline scripts → blocks XSS)
      scriptSrc: ["'self'"],
      // Styles: same-origin + inline (many component libraries need this)
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      // Fonts: Google Fonts CDN
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      // Images: same-origin + Cloudinary (uploads) + data URIs
      imgSrc: ["'self'", "data:", "blob:", "https://res.cloudinary.com"],
      // API connections: same-origin + the backend itself
      connectSrc: ["'self'", frontendOrigin],
      // No embedded frames allowed
      frameSrc: ["'none'"],
      // Block object/embed tags
      objectSrc: ["'none'"],
      // Upgrade HTTP to HTTPS when possible
      upgradeInsecureRequests: process.env.NODE_ENV === "production" ? [] : null,
    },
    // Report-only in dev so it doesn't break anything; enforced in prod
    reportOnly: process.env.NODE_ENV !== "production",
  },
  // HSTS: only meaningful in production behind HTTPS
  strictTransportSecurity: process.env.NODE_ENV === "production"
    ? { maxAge: 31536000, includeSubDomains: true }
    : false,
  referrerPolicy: { policy: "no-referrer-when-downgrade" },
}));

// Selective Cache-Control based on path
app.use((req, res, next) => {
  if (req.path.startsWith("/uploads/")) {
    res.setHeader("Cache-Control", "public, max-age=604800, immutable");
  } else if (req.path.startsWith("/api/") || req.path.startsWith("/auth/")) {
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  } else {
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  }
  next();
});

app.use(cookieParser());
app.use(express.json());

// SINGLE CORS configuration
app.use(
  cors({
    origin: [
      `http://[::1]:${FRONTEND_PORT}`,
      `http://127.0.0.1:${FRONTEND_PORT}`,
      `http://localhost:${FRONTEND_PORT}`,
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      "https://www.omarombark.me",
      "https://omarombark.me"
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Origin",
      "X-Requested-With",
      "Content-Type",
      "Accept",
      "Authorization",
      "Cache-Control",
      "Cookie",
      "Pragma",
      "X-Forwarded-For",
      "X-Real-IP",
      "CF-Connecting-IP",
    ],
    exposedHeaders: [
      "Content-Type",
      "Content-Length",
      "Authorization",
      "Set-Cookie",
    ],
    optionsSuccessStatus: 200,
    preflightContinue: false,
    maxAge: 86400,
  })
);

dbconnection();
app.set("trust proxy", true); // for cloudflare or etc ..

app.get("/", (req, res) => {
  res.send("Server Alive");
});

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/", MainHomeData);
app.use("/api/", ShowAboutData);
app.use("/auth/", AdminLogin);
app.use("/api/", AdminDashboardSecurity);
app.use("/api/", EditSeo);
app.use("/api/", EditHomeData);
app.use("/api/", EditAboutData);
app.use("/api/", AddProjectRouter);
app.use("/api/", EditSkills);
app.use("/api/", EditCategories);
app.use("/api/", EditCv);
app.use("/api/", EditFooter);
app.use("/api/", Contact);
app.use("/api/", EditMessages);
app.use("/api/", BlockHistory);
app.use("/api/", GithubStats);
app.use("/api/", EditExperience);
app.use("/api/", BlogRouter);
app.use("/api/", ActivityLogRouter);

app.listen(BACKEND_PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${BACKEND_PORT}`);
});
