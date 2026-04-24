import express from "express";
import { Resend } from "resend";
import dotenv from "dotenv";
import { readFile } from "fs/promises";
import path from "path";
import HomeData from "../models/HomeDataSchema.js";
import contactLimiter from "../middlewares/RateLimit.js";
dotenv.config();

const Router = express.Router();
const resend = new Resend(process.env.RESEND_API || "missing-api-key");

const AdminMail = process.env.ADMIN_MAIL;
let cachedEmailTemplate = null;

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

async function readEmailTemplate() {
  if (cachedEmailTemplate) {
    return cachedEmailTemplate;
  }

  const templatePath = path.join(
    process.cwd(),
    "EmailTemplate",
    "emailTemplate.html"
  );

  cachedEmailTemplate = await readFile(templatePath, "utf-8");
  return cachedEmailTemplate;
}

async function getEmailTemplate({ fullname, address, subject, message }) {
  const adminDoc = await HomeData.findOne();
  const template = await readEmailTemplate();

  const replacements = {
    AdminName: escapeHtml(adminDoc?.DisplayName || "Admin"),
    fullname: escapeHtml(fullname),
    email: escapeHtml(address),
    subject: escapeHtml(subject),
    message: escapeHtml(message),
    year: String(new Date().getFullYear()),
  };

  let parsedTemplate = template;
  for (const [key, value] of Object.entries(replacements)) {
    parsedTemplate = parsedTemplate.replaceAll(`{{${key}}}`, value);
  }

  return parsedTemplate;
}

Router.post("/contact", contactLimiter, async (req, res) => {
  try {
    if (!resend) {
      console.error("ContactRouter: Missing Resend API config");
      return res.status(500).json({ message: "Incomplete configuration" });
    }

    if (!AdminMail) {
      console.error("ContactRouter: Missing Admin email");
      return res.status(500).json({ message: "Incomplete configuration" });
    }

    if (!req.body) {
      return res.status(400).json({ error: "Invalide Request" });
    }
    const { fullname, address, subject, message } = req.body;

    if (!fullname || !address || !subject || !message) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address)) {
      return res.status(400).json({ error: "Invalid email address" });
    }

    if (message.length < 10) {
      return res
        .status(400)
        .json({ error: "Message must be at least 10 characters long" });
    }

    const htmlContent = await getEmailTemplate({
      fullname,
      address,
      subject,
      message,
    });

    const resendDomain =
      process.env.RESEND_MAIL_DOMAIN || "onboarding@resend.dev";

    const { data, error } = await resend.emails.send({
      from: `!! New Message From My Portfolio Website <${resendDomain}>`,
      to: `${AdminMail}`,
      subject: subject,
      reply_to: address,
      html: htmlContent,
    });

    if (error) {
      return res.status(400).json({ error });
    }

    return res.status(200).json({ success: true, data });
  } catch (err) {
    console.error("ContactRouter error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

export default Router;
