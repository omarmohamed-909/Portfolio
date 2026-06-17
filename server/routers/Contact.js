import express from "express";
import { Resend } from "resend";
import dotenv from "dotenv";
import { readFile } from "fs/promises";
import path, { dirname } from "path";
import { fileURLToPath } from "url"; // استدعاء مهم عشان المسار
import HomeData from "../models/HomeDataSchema.js";
import ContactMessage from "../models/ContactMessageSchema.js";
import contactLimiter from "../middlewares/RateLimit.js";
dotenv.config();

const Router = express.Router();
const resend = new Resend(process.env.RESEND_API || "missing-api-key");
const AdminMail = process.env.ADMIN_MAIL;
let cachedEmailTemplate = null;

// تجهيز متغيرات المسار (الـ Fix بتاعك 🎯)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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

  // استخدام المسار الدقيق
  const templatePath = path.join(
    __dirname,
    "..",
    "EmailTemplate",
    "emailTemplate.html",
  );

  cachedEmailTemplate = await readFile(templatePath, "utf-8");
  return cachedEmailTemplate;
}

async function getEmailTemplate({ fullname, email, subject, message }) {
  const adminDoc = await HomeData.findOne();
  const template = await readEmailTemplate();

  const replacements = {
    AdminName: escapeHtml(adminDoc?.DisplayName || "Admin"),
    fullname: escapeHtml(fullname),
    email: escapeHtml(email),
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
    if (!AdminMail) {
      console.error("ContactRouter: Missing Admin email");
      return res.status(500).json({ message: "Incomplete configuration" });
    }

    if (!req.body) {
      return res.status(400).json({ error: "Invalid Request" });
    }
    const { fullname, email, subject, message } = req.body;

    if (!fullname || !email || !subject || !message) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: "Invalid email address" });
    }

    if (message.length < 10) {
      return res
        .status(400)
        .json({ error: "Message must be at least 10 characters long" });
    }

    // maxLength guards to prevent spam / oversized payloads
    if (fullname.length > 100) {
      return res.status(400).json({ error: "Name must be 100 characters or fewer" });
    }
    if (subject.length > 200) {
      return res.status(400).json({ error: "Subject must be 200 characters or fewer" });
    }
    if (message.length > 5000) {
      return res.status(400).json({ error: "Message must be 5000 characters or fewer" });
    }

    const htmlContent = await getEmailTemplate({
      fullname,
      email,
      subject,
      message,
    });

    // الـ Fix المقترح للإيميل (مؤقتاً استخدم onboarding لحد ما تعمل Verify للدومين)
    const resendDomain =
      process.env.RESEND_MAIL_DOMAIN || "onboarding@resend.dev";
    const senderEmail = resendDomain.includes("@")
      ? resendDomain
      : `noreply@${resendDomain}`;

    const { data, error } = await resend.emails.send({
      from: `Portfolio Contact <${senderEmail}>`,
      to: AdminMail,
      subject: subject,
      reply_to: email,
      html: htmlContent,
    });

    if (error) {
      return res.status(400).json({ error });
    }

    // Save message to database
    try {
      const newMessage = new ContactMessage({ fullname, email, subject, message });
      await newMessage.save();
    } catch (dbErr) {
      console.error("Failed to save contact message to DB:", dbErr);
    }

    return res.status(200).json({ success: true, data });
  } catch (err) {
    console.error("ContactRouter error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

export default Router;
