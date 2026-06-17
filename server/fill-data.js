import dotenv from "dotenv";
import readline from "readline";
import mongoose from "mongoose";
import dbconnection from "./config/dbConnect.js";
import HomeData from "./models/HomeDataSchema.js";
import AboutUs from "./models/AboutUsSchema.js";
import Footer from "./models/FooterSchema.js";
import FooterSocialLinks from "./models/FooterSocialLinksSchema.js";
import Seo from "./models/SeoSchema.js";
import StaticSeo from "./models/StaticSeo.js";
import Stats from "./models/StatsSchema.js";
dotenv.config();

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

const ask = (question, defaultVal = "") =>
  new Promise((resolve) => {
    const hint = defaultVal ? ` (default: ${defaultVal})` : "";
    rl.question(`  ${question}${hint}: `, (ans) => {
      resolve(ans.trim() || defaultVal);
    });
  });

const askMulti = (question) =>
  new Promise((resolve) => {
    rl.question(`  ${question} (افصل بفاصلة): `, (ans) => {
      resolve(ans.split(",").map((s) => s.trim()).filter(Boolean));
    });
  });

const separator = (title) =>
  console.log(`\n${"─".repeat(50)}\n  📦 ${title}\n${"─".repeat(50)}`);

async function main() {
  console.log(`
╔══════════════════════════════════════════════════╗
║         🚀  Portfolio Data Setup Wizard          ║
║  سيسألك السكريبت عن بياناتك الشخصية الحقيقية    ║
║  اضغط Enter للتخطي واستخدام القيمة الافتراضية   ║
╚══════════════════════════════════════════════════╝
`);

  await dbconnection();
  console.log("✅ Connected to MongoDB\n");

  // ────────────────────────────────────────────────────
  separator("المعلومات الأساسية — Basic Info");
  const displayName    = await ask("اسمك الكامل (بالانجليزي)", "Omar Mohamed");
  const email          = await ask("ايميلك", "omar@example.com");
  const phone          = await ask("رقم الموبايل", "+20 1000000000");
  const city           = await ask("مدينتك / بلدك", "Cairo, Egypt");
  const websiteName    = await ask("اسم الموقع / البورتفوليو", `${displayName} | Portfolio`);
  const websiteUrl     = await ask("رابط الموقع", "https://yourwebsite.com");
  const langCode       = await ask("كود اللغة (2 حروف)", "en");
  const lang           = await ask("اللغة كاملة", "English");
  const countryCode    = await ask("كود الدولة (2 حروف)", "EG");

  // ────────────────────────────────────────────────────
  separator("الصفحة الرئيسية — Home Page");
  const roles          = await askMulti("ما هي أدوارك المهنية؟ مثال: Full Stack Developer, UI Designer");
  const description    = await ask("وصف مختصر عنك (هيظهر في الهوم)", "Full Stack Developer passionate about building great products.");
  const techStack      = await ask("التكنولوجيا اللي بتشتغل بيها (كلمة أو جملة قصيرة)", "React · Node.js · MongoDB");
  const focusArea      = await ask("مجال التركيز", "Web Development & System Architecture");
  const availability   = await ask("حالة الإتاحة", "Open to work");
  const calendlyUrl    = await ask("رابط Calendly (اختياري)", "");

  // ────────────────────────────────────────────────────
  separator("Stats — الإحصائيات");
  const projectsCount  = await ask("كم مشروع أنجزت؟", "10+");
  const yearsExp       = await ask("كم سنة خبرة؟", "2+");
  const clientsCount   = await ask("عدد العملاء / Clients", "5+");
  const techCount      = await ask("عدد التكنولوجيا", "15+");

  // ────────────────────────────────────────────────────
  separator("About Page — صفحة عني");
  const aboutTitle     = await ask("عنوان قسم About", `Passionate about creating digital solutions`);
  const aboutDesc      = await ask("وصف طويل عنك (صفحة About)", `Experienced full-stack developer who loves building clean, scalable systems.`);
  const aboutSkills    = await askMulti("مهاراتك (هتظهر في About بشكل chips)");
  const academicTitle  = await ask("الدرجة العلمية", "B.Sc. Computer Science");
  const academicMeta   = await ask("الجامعة والسنة", "Cairo University · 2025");
  const academicDesc   = await ask("وصف قصير للتعليم", "Studied algorithms, systems, and full-stack engineering.");
  const philosophy     = await ask("الـ Philosophy Quote بتاعتك", "I build systems from DB to UI with clean architecture.");
  const philosophyMeta = await ask("وصف الـ quote", "Full-stack from schema design to production deployment");

  // ────────────────────────────────────────────────────
  separator("السوشيال ميديا — Social Links");
  const github   = await ask("GitHub URL", "");
  const linkedin = await ask("LinkedIn URL", "");
  const twitter  = await ask("Twitter/X URL", "");
  const facebook = await ask("Facebook URL", "");

  // ────────────────────────────────────────────────────
  separator("SEO - الصفحة الرئيسية");
  const seoHomeTitle = await ask("SEO Title للهوم", `${displayName} | Portfolio`);
  const seoHomeDesc  = await ask("SEO Description للهوم", `Portfolio of ${displayName} — ${roles[0] || "Developer"}`);

  // ────────────────────────────────────────────────────
  console.log(`\n${"─".repeat(50)}`);
  console.log("  ✍️  ملخص البيانات اللي هتتحفظ:");
  console.log(`  الاسم: ${displayName}`);
  console.log(`  الإيميل: ${email}`);
  console.log(`  الأدوار: ${roles.join(", ")}`);
  console.log(`  الموقع: ${websiteUrl}`);
  console.log(`${"─".repeat(50)}`);

  const confirm = await ask("\nتأكيد؟ (y/n)", "y");
  if (confirm.toLowerCase() !== "y") {
    console.log("❌ تم الإلغاء.");
    rl.close();
    mongoose.connection.close();
    return process.exit(0);
  }

  // ══════════════════ SAVE TO DB ══════════════════════
  console.log("\n⏳ جاري الحفظ في MongoDB...\n");

  // 1. Stats
  await Stats.deleteMany({});
  await Stats.insertMany([
    { StatsNumber: projectsCount, StatsLabel: "Projects Completed" },
    { StatsNumber: yearsExp,      StatsLabel: "Years Experience" },
    { StatsNumber: clientsCount,  StatsLabel: "Happy Clients" },
    { StatsNumber: techCount,     StatsLabel: "Technologies" },
  ]);
  console.log("  ✅ Stats");

  // 2. About
  await AboutUs.deleteMany({});
  const newAbout = new AboutUs({
    AboutUsTitle: aboutTitle,
    AboutUsDescription: aboutDesc,
    AboutSkills: aboutSkills,
    AboutUsSlides: [],
    AcademicTitle: academicTitle,
    AcademicMeta: academicMeta,
    AcademicDescription: academicDesc,
    PhilosophyQuote: philosophy,
    PhilosophyMeta: philosophyMeta,
  });
  await newAbout.save();
  console.log("  ✅ About Us");

  // 3. Footer Social Links
  await FooterSocialLinks.deleteMany({});
  const socialLinks = [];
  if (github)   socialLinks.push({ SocialIcon: "Github",   SocialLink: github });
  if (linkedin) socialLinks.push({ SocialIcon: "Linkedin", SocialLink: linkedin });
  if (twitter)  socialLinks.push({ SocialIcon: "Twitter",  SocialLink: twitter });
  if (facebook) socialLinks.push({ SocialIcon: "Facebook", SocialLink: facebook });
  const savedLinks = socialLinks.length > 0 ? await FooterSocialLinks.insertMany(socialLinks) : [];
  console.log("  ✅ Social Links");

  // 4. Footer
  await Footer.deleteMany({});
  const newFooter = new Footer({
    FooterTitle: websiteName,
    FooterDescription: `Crafting digital experiences with passion and precision. Let's build something amazing together.`,
    OwnerEmail: email,
    OwnerPhone: phone,
    OwnerAddress: city,
    FooterSocialLinks: savedLinks.map((l) => l._id),
  });
  await newFooter.save();
  console.log("  ✅ Footer");

  // 5. Home Data
  const statsData = await Stats.find();
  await HomeData.deleteMany({});
  const newHome = new HomeData({
    DisplayName: displayName,
    MainRoles: roles,
    description: description,
    TechStack: techStack,
    FocusArea: focusArea,
    AvailabilityStatus: availability,
    CalendlyUrl: calendlyUrl,
    AboutUs: newAbout._id,
  });
  await newHome.save();
  console.log("  ✅ Home Data");

  // 6. Static SEO
  await StaticSeo.deleteMany({});
  await StaticSeo.create({
    Author: displayName,
    WebsiteName: websiteName,
    WebLogo: "",
    LangCode: langCode,
    Lang: lang,
    CountryCode: countryCode,
    City: city.split(",")[0].trim(),
    Geographic: "",
    ICBM: "",
  });
  console.log("  ✅ Static SEO");

  // 7. Page SEO (upsert for all pages)
  const pages = [
    {
      Page: "home",
      Title: seoHomeTitle,
      Description: seoHomeDesc,
      Keywords: [displayName, "portfolio", "developer", roles[0] || ""].filter(Boolean),
      SocialTitle: seoHomeTitle,
      SocialDescription: seoHomeDesc,
      PageUrl: websiteUrl,
    },
    {
      Page: "projects",
      Title: `${displayName} | Projects`,
      Description: `Explore the projects built by ${displayName}.`,
      Keywords: ["projects", "portfolio", displayName],
      PageUrl: `${websiteUrl}/projects`,
    },
    {
      Page: "skills",
      Title: `${displayName} | Skills`,
      Description: `Technical skills and expertise of ${displayName}.`,
      Keywords: ["skills", "technologies", displayName],
      PageUrl: `${websiteUrl}/skills`,
    },
    {
      Page: "cv",
      Title: `${displayName} | CV`,
      Description: `View the curriculum vitae of ${displayName}.`,
      Keywords: ["cv", "resume", displayName],
      PageUrl: `${websiteUrl}/cv`,
    },
    {
      Page: "about",
      Title: `${displayName} | About`,
      Description: `Learn more about ${displayName} — ${roles[0] || "Developer"}.`,
      Keywords: ["about", "background", displayName],
      PageUrl: `${websiteUrl}/about`,
    },
    {
      Page: "contact",
      Title: `${displayName} | Contact`,
      Description: `Get in touch with ${displayName}.`,
      Keywords: ["contact", "hire", displayName],
      PageUrl: `${websiteUrl}/contact`,
    },
  ];

  for (const pageData of pages) {
    await Seo.findOneAndUpdate(
      { Page: pageData.Page },
      { ...pageData, SocialImage: "", TwitterImage: "", TwitterTitle: pageData.Title, TwitterDescription: pageData.Description },
      { upsert: true, new: true, runValidators: false }
    );
  }
  console.log("  ✅ SEO (6 pages)");

  // ── Done ─────────────────────────────────────────────
  console.log(`
╔══════════════════════════════════════════════════╗
║     ✅  تم حفظ كل البيانات في MongoDB بنجاح!    ║
║  افتح الداشبورد وستجد كل المعلومات جاهزة 🎉     ║
╚══════════════════════════════════════════════════╝
`);
  rl.close();
  mongoose.connection.close();
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ خطأ:", err.message);
  rl.close();
  mongoose.connection.close();
  process.exit(1);
});
