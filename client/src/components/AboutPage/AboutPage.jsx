import React, { useEffect, useState } from "react";
import Navbar from "../Navbar/Navbar";
import Footer from "../Footer/Footer";
import ConstellationBackground from "../NebulaDrift/NebulaDrift";
import { Code2, Brain, ScanSearch, Box, Terminal, ChevronLeft, ChevronRight } from "lucide-react";
import axios from "axios";
import styles from "./AboutPage.module.css";
import "../../App.css";
import { Backend_Root_Url } from "../../config/AdminUrl.js";
import useReveal from "../../hooks/useReveal.js";

const ICON_MAP = [Brain, ScanSearch, Box];

const AboutPage = () => {
  const [headerRef, headerVisible] = useReveal(0.01);
  const [aboutRef, aboutVisible] = useReveal();
  const [academicRef, academicVisible] = useReveal();
  const [identityRef, identityVisible] = useReveal();
  const [philosophyRef, philosophyVisible] = useReveal();
  const [slidesRef, slidesVisible] = useReveal();

  const [aboutData, setAboutData] = useState(null);
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  const identityCards = aboutData
    ? [
        {
          icon: ICON_MAP[0],
          title: aboutData.IdentityCard1Title || "Competitive Programming",
          subtitle: aboutData.IdentityCard1Subtitle || "Core CS & Algorithms",
          items: aboutData.IdentityCard1Items?.length > 0 ? aboutData.IdentityCard1Items : ["Problem Solving (C++)", "Data Structures & Algorithms", "Codeforces & AtCoder"],
        },
        {
          icon: ICON_MAP[1],
          title: aboutData.IdentityCard2Title || "Computer Vision & Data",
          subtitle: aboutData.IdentityCard2Subtitle || "Image Processing & Analysis",
          items: aboutData.IdentityCard2Items?.length > 0 ? aboutData.IdentityCard2Items : ["OpenCV & Python", "Image Processing Pipelines", "Pattern Recognition"],
        },
        {
          icon: ICON_MAP[2],
          title: aboutData.IdentityCard3Title || "3D & Media Pipelines",
          subtitle: aboutData.IdentityCard3Subtitle || "Blender · Modeling · Rendering",
          items: aboutData.IdentityCard3Items?.length > 0 ? aboutData.IdentityCard3Items : ["3D Modeling & Sculpting", "Rendering & Compositing", "Pipeline Automation"],
        },
      ]
    : [];

  useEffect(() => {
    const fetchAbout = async () => {
      try {
        const res = await axios.get(`${Backend_Root_Url}/api/about/data`);
        const data = res.data;
        if (data && !data._empty) {
          setAboutData(data);
          setExperiences(data.Experiences || []);
        }
      } catch (err) {
        console.error("Failed to fetch about data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAbout();
  }, []);

  if (loading) {
    return (
      <div className={styles.aboutPage}>
        <ConstellationBackground />
        <div className={styles.contentLayer}>
          <Navbar />
          <div className={styles.spinnerContainer}>
            <div className={styles.spinner} />
            <p>Loading about...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.aboutPage}>
      <ConstellationBackground />
      <div className={styles.contentLayer}>
      <Navbar />

      <main className={styles.main}>
        <div className={styles.container}>

          {/*** ── Header / Profile Intro ── ***/}
          <header
            ref={headerRef}
            className={`${styles.header} ${headerVisible ? styles.visible : styles.reveal}`}
          >
            <div className={styles.headerInner}>
              <span className={styles.headerDecor} aria-hidden="true">
                <Code2 size={22} strokeWidth={1.5} />
              </span>
              <div>
                <h1 className={styles.headerTitle}>About Me</h1>
                <p className={styles.headerSubtitle}>
                  Full-Stack Engineer <span className={styles.headerSep} /> Systems Builder
                </p>
              </div>
            </div>
          </header>

          {/*** ── About Us (from backend) ── ***/}
          <section
            ref={aboutRef}
            className={`${styles.card} ${aboutVisible ? styles.visible : styles.reveal}`}
          >
            <div className={styles.cardLabel}>
              <span className={styles.cardDot} aria-hidden="true" />
              {aboutData?.AboutUsTitle || "About"}
            </div>
            <p className={styles.aboutDesc}>
              {aboutData?.AboutUsDescription || ""}
            </p>
            {aboutData?.AboutSkills?.length > 0 && (
              <div className={styles.skillsTags}>
                {aboutData.AboutSkills.map((skill) => (
                  <span key={skill} className={styles.skillTag}>{skill}</span>
                ))}
              </div>
            )}
          </section>

          {/*** ── Academic Card ── ***/}
          <section
            ref={academicRef}
            className={`${styles.card} ${academicVisible ? styles.visible : styles.reveal}`}
          >
            <div className={styles.cardLabel}>
              <span className={styles.cardDot} aria-hidden="true" />
              Academic
            </div>
            <div className={styles.academicBody}>
              <div className={styles.academicIcon}>
                <Code2 size={20} />
              </div>
              <div>
                <h3 className={styles.academicTitle}>{aboutData?.AcademicTitle || "B.Sc. Computer Science & Artificial Intelligence"}</h3>
                <p className={styles.academicMeta}>{aboutData?.AcademicMeta || "South Valley University · Senior Year (2026)"}</p>
                <p className={styles.academicDesc}>
                  {aboutData?.AcademicDescription || "Specialising in algorithm design, systems programming, and full-stack architecture. Combining theoretical CS foundations with hands-on engineering across the entire stack."}
                </p>
              </div>
            </div>
          </section>

          {/*** ── Engineering Identity ── ***/}
          <section
            ref={identityRef}
            className={`${styles.card} ${identityVisible ? styles.visible : styles.reveal}`}
          >
            <div className={styles.cardLabel}>
              <span className={styles.cardDot} aria-hidden="true" />
              Engineering Identity
            </div>
            <div className={styles.identityGrid}>
              {identityCards.map((card, i) => {
                const Icon = card.icon;
                return (
                  <div
                    key={card.title}
                    className={styles.identityCard}
                    style={{ transitionDelay: `${i * 80}ms` }}
                  >
                    <div className={styles.identityCardHeader}>
                      <span className={styles.identityIcon}>
                        <Icon size={16} />
                      </span>
                      <div>
                        <p className={styles.identityTitle}>{card.title}</p>
                        <p className={styles.identitySubtitle}>{card.subtitle}</p>
                      </div>
                    </div>
                    <ul className={styles.identityList}>
                      {card.items.map((item) => (
                        <li key={item} className={styles.identityItem}>
                          <span className={styles.identityDot} aria-hidden="true" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </section>

          {/*** ── Philosophy ── ***/}
          <section
            ref={philosophyRef}
            className={`${styles.philosophyCard} ${philosophyVisible ? styles.visible : styles.reveal}`}
          >
            <div className={styles.philosophyAccent} aria-hidden="true" />
            <div className={styles.philosophyContent}>
              <div className={styles.cardLabel}>
                <span className={styles.cardDot} aria-hidden="true" />
                Philosophy
              </div>
              <blockquote className={styles.philosophyQuote}>
                {aboutData?.PhilosophyQuote || "I architect and build complete systems from database to UI. My focus is on clean architecture, algorithmic efficiency, and scalable solutions — not just decorating interfaces."}
              </blockquote>
              <p className={styles.philosophyMeta}>
                <Terminal size={12} strokeWidth={2} className={styles.philosophyMetaIcon} />
                {aboutData?.PhilosophyMeta || "Full-stack development from schema design to production deployment"}
              </p>
            </div>
          </section>

          {/*** ── Slides ── ***/}
          {aboutData?.AboutUsSlides?.length > 0 && (
            <section
              ref={slidesRef}
              className={`${styles.slidesSection} ${slidesVisible ? styles.visible : styles.reveal}`}
            >
              <div className={styles.cardLabel}>
                <span className={styles.cardDot} aria-hidden="true" />
                Highlights
              </div>
              <div className={styles.sliderContainer}>
                <button
                  className={styles.slideBtn}
                  onClick={() => setCurrentSlide((prev) => (prev === 0 ? aboutData.AboutUsSlides.length - 1 : prev - 1))}
                  aria-label="Previous slide"
                >
                  <ChevronLeft size={18} />
                </button>
                <div className={styles.slidesViewport}>
                  <div
                    className={styles.slidesTrack}
                    style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                  >
                    {aboutData.AboutUsSlides.map((slide) => (
                      <div key={slide._id} className={styles.slideCard}>
                        <div className={styles.slideContent}>
                          <h3 className={styles.slideTitle}>{slide.slideTitle}</h3>
                          <p className={styles.slideDescription}>{slide.slideDescription}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <button
                  className={styles.slideBtn}
                  onClick={() => setCurrentSlide((prev) => (prev === aboutData.AboutUsSlides.length - 1 ? 0 : prev + 1))}
                  aria-label="Next slide"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
              <div className={styles.slideDots}>
                {aboutData.AboutUsSlides.map((_, i) => (
                  <button
                    key={i}
                    className={`${styles.slideDot} ${i === currentSlide ? styles.slideDotActive : ""}`}
                    onClick={() => setCurrentSlide(i)}
                    aria-label={`Go to slide ${i + 1}`}
                  />
                ))}
              </div>
            </section>
          )}

          {/*** ── Experience Timeline ── ***/}
          {experiences.length > 0 && (
            <section className={styles.timelineSection}>
              <div className={styles.cardLabel}>
                <span className={styles.cardDot} aria-hidden="true" />
                Experience
              </div>
              <div className={styles.timeline}>
                {experiences.map((exp, i) => (
                  <div key={exp._id} className={styles.timelineItem}>
                    <div className={styles.timelineDot} />
                    {i < experiences.length - 1 && <div className={styles.timelineLine} />}
                    <div className={styles.timelineCard}>
                      <div className={styles.timelineHeader}>
                        <h3 className={styles.timelineCompany}>{exp.Company}</h3>
                        <span className={styles.timelineDate}>{exp.StartDate} — {exp.EndDate || "Present"}</span>
                      </div>
                      <p className={styles.timelineRole}>{exp.Role}</p>
                      {exp.Description && <p className={styles.timelineDesc}>{exp.Description}</p>}
                      {exp.Technologies?.length > 0 && (
                        <div className={styles.timelineTech}>
                          {exp.Technologies.map((tech, j) => (
                            <span key={j} className={styles.timelineTechTag}>{tech}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

        </div>

      </main>

      <Footer />
      </div>
    </div>
  );
};

export default AboutPage;
