import React, { useRef, useEffect } from "react";
import Navbar from "../Navbar/Navbar";
import Footer from "../Footer/Footer";
import ProjectDetailModal from "../ProjectsPage/ProjectDetailModal";
import SkillProjectModal from "../SkillsPage/SkillProjectModal";
import ConstellationBackground from "../NebulaDrift/NebulaDrift";
import "../../App.css";
import { Backend_Root_Url } from "../../config/AdminUrl.js";
import { resolveAssetUrl } from "../../lib/assetUrl.js";
import { getTechIcon } from "../../lib/techIcons.jsx";
import { ArrowRight, Download, Eye, ExternalLink, Code2, Server, Database, Wrench, FileCode, ScanSearch, Brain, Box, Cloud, Layers, Github } from "lucide-react";
import useHomeData from "../../hooks/useHomeData";
import useTypewriter from "../../hooks/useTypewriter";
import styles from "./Home.module.css";

/* ── Render helpers ────────────────────────────────────────── */
const getCategoryIcon = (catName) => {
  const lowerCat = (catName || "").toLowerCase();
  if (lowerCat.includes("front")) return Code2;
  if (lowerCat.includes("back")) return Server;
  if (lowerCat.includes("data")) return Database;
  if (lowerCat.includes("database")) return Database;
  if (lowerCat.includes("language")) return FileCode;
  if (lowerCat.includes("computer vision") || lowerCat.includes("vision")) return ScanSearch;
  if (lowerCat.includes("core") || lowerCat.includes("algorithm")) return Brain;
  if (lowerCat.includes("3d") || lowerCat.includes("media") || lowerCat.includes("pipeline")) return Box;
  if (lowerCat.includes("cloud") || lowerCat.includes("infra")) return Cloud;
  if (lowerCat.includes("devops") || lowerCat.includes("tool")) return Wrench;
  if (lowerCat.includes("state")) return Layers;
  return Code2;
};

const getProjectImageSrc = (imageName) => {
  if (!imageName || imageName === "Nothing") return null;
  if (typeof imageName === "string" && imageName.includes("ProjectNotFound.png"))
    return null;
  return (
    resolveAssetUrl(imageName, `${Backend_Root_Url}/uploads/projectsimg/`) ||
    null
  );
};

const getStatusClass = (status) => {
  if (!status) return styles.statusDefault;
  const map = {
    completed:   styles.statusCompleted,
    "in progress": styles.statusInProgress,
    launched:    styles.statusLaunched,
    planning:    styles.statusPlanning,
    "on hold":   styles.statusOnHold,
    archived:    styles.statusArchived,
  };
  return map[status.toLowerCase()] || styles.statusDefault;
};

/* ── Component ─────────────────────────────────────────────── */
const Home = () => {
  const {
    MainHomeData, cvData, isDownloading,
    featuredProjects, projectsLoading, projectsError,
    loading, error,
    archData, archLoading, archError,
    selectedProject, selectedSkill, isSkillModalOpen,
    gitStats, GetRoles, githubUrl, HomeLogo,
    handleDownloadCV, handleProjectView, handleCloseModal,
    handleSkillClick, handleSkillModalClose, handleSkillProjectClick,
    getProjectsBySkill, retryFetch,
  } = useHomeData();

  const typedText = useTypewriter(GetRoles, loading);

  const homeRef = useRef(null);

  useEffect(() => {
    const el = homeRef.current;
    if (!el) return;
    const handleMouseMove = (e) => {
      el.style.setProperty("--mouse-x", `${e.clientX}px`);
      el.style.setProperty("--mouse-y", `${e.clientY}px`);
    };
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const handleCardMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    e.currentTarget.style.setProperty("--mouse-x", `${x}px`);
    e.currentTarget.style.setProperty("--mouse-y", `${y}px`);
  };

  if (loading) {
    return (
      <div className={styles.pageWrapper}>
        <ConstellationBackground />
        <div className={styles.bgGlow} aria-hidden="true" />
        <div className={styles.contentLayer}>
          <Navbar />
          <div className="loading-overlay">
            <div className="loading-container">
              <div className="loading-spinner">
                <div className="spinner-ring"></div>
              </div>
              <p className="loading-text">Loading portfolio...</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.pageWrapper}>
      <ConstellationBackground />
      <div className={styles.bgGlow} aria-hidden="true" />
      <div className={styles.contentLayer}>
        <Navbar />
        <main>

          {/* ── Section 1: Hero ─── */}
          <section className={styles.hero} aria-label="Introduction">
            <div className={styles.container}>
              <div className={styles.heroContent}>
                <div>
                  <h1 className={styles.heroName}>
                    {MainHomeData?.DisplayName || "Developer"}
                  </h1>
                  <p className={styles.heroRole}>
                    {typedText}
                    <span className={styles.cursor}>|</span>
                  </p>
                  <div className={styles.specRows}>
                    <div className={styles.specRow}>
                      <span className={styles.specLabel}>Role</span>
                      <span className={styles.specValue}>
                        {GetRoles?.length > 0 ? GetRoles[0] : "Full-Stack Developer"}
                      </span>
                    </div>
                    <div className={styles.specRow}>
                      <span className={styles.specLabel}>Stack</span>
                      <span className={styles.specValue}>
                        {MainHomeData?.TechStack || "MERN · Next.js · TypeScript"}
                      </span>
                    </div>
                    <div className={styles.specRow}>
                      <span className={styles.specLabel}>Focus</span>
                      <span className={styles.specValue}>
                        {MainHomeData?.FocusArea || "Systems Design · Clean Architecture"}
                      </span>
                    </div>
                    <div className={styles.specRow}>
                      <span className={styles.specLabel}>Status</span>
                      <span className={styles.specValue}>
                        <span className={styles.statusDot} />
                        {MainHomeData?.AvailabilityStatus || "Available for hire"}
                      </span>
                    </div>
                  </div>
                  <div className={styles.heroButtons}>
                    <a href="projects" className={styles.primaryButton}>
                      View My Work
                      <ArrowRight size={20} />
                    </a>
                    {cvData?.FindCv?.Cv ? (
                      <button
                        onClick={handleDownloadCV}
                        className={styles.ghostButton}
                        disabled={isDownloading}
                      >
                        <Download size={18} />
                        {isDownloading ? "Downloading..." : "Download CV"}
                      </button>
                    ) : (
                      <a href="contact" className={styles.ghostButton}>
                        Get In Touch
                      </a>
                    )}
                  </div>
                </div>
                <div className={styles.heroPhoto}>
                  {HomeLogo && (
                    <div className={styles.photoFrame}>
                      <img
                        src={HomeLogo}
                        alt={MainHomeData?.DisplayName || "Developer"}
                        className={styles.profileImage}
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* ── Section 2: Core Architecture ─── */}
          <section className={styles.architecture} aria-label="Core architecture">
            <div className={styles.container}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionHeading}>{MainHomeData?.ArchitectureSectionTitle || "Core Architecture"}</h2>
              </div>
              {archLoading ? (
                <div className={styles.archLoading}>Loading architecture data...</div>
              ) : archError ? (
                <div className={styles.archError}>{archError}</div>
              ) : archData.length === 0 ? (
                <div className={styles.archEmpty}>No architecture data available yet.</div>
              ) : (
                <div className={styles.archGrid}>
                  {archData.map((group) => {
                    const IconComponent = getCategoryIcon(group.category);
                    return (
                      <div key={group.category} className={styles.archGroup}>
                        <div className={styles.archGroupHeader}>
                          <div className={styles.archGroupIcon}>
                            <IconComponent size={18} />
                          </div>
                          <h3 className={styles.archGroupTitle}>{group.category}</h3>
                        </div>
                        <div className={styles.archGroupBody}>
                          {group.items.map((item) => (
                            <div
                              key={item.name}
                              className={styles.techRow}
                              title={`${item.detail ? `${item.detail}` : item.name}`}
                              onClick={() => handleSkillClick(item.name)}
                            >
                              {React.createElement(getTechIcon(item.name), { size: 16 })}
                              <div className={styles.techInfo}>
                                <span className={styles.techName}>{item.name}</span>
                                {item.detail && <span className={styles.techDetail}>{item.detail}</span>}
                                <div className={styles.skillLevelBar}>
                                  <div className={styles.skillLevelFill} style={{ width: `${item.level}%` }} />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>

          {/* ── Section 3: Featured Engineering Work ─────────── */}
          <section className={styles.projects} aria-label="Featured projects">
          <div className={styles.container}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionHeading}>{MainHomeData?.ProjectsSectionTitle || "Featured Engineering Work"}</h2>
              <a href="projects" className={styles.viewAllLink} aria-label="View all projects">
                View All <ArrowRight size={15} aria-hidden="true" />
              </a>
            </div>

            <div className={styles.projectList}>
              {projectsLoading ? (
                <div className={styles.projectsStatus} role="status" aria-live="polite">
                  <div className={styles.projectsSpinner} aria-hidden="true" />
                  <p className={styles.projectsStatusText}>Loading projects…</p>
                </div>
              ) : featuredProjects.length === 0 ? (
                <div className={styles.projectsStatus} role="status">
                  <p className={styles.projectsStatusText}>
                    {projectsError || "No featured projects yet."}
                  </p>
                </div>
              ) : (
                featuredProjects.map((project) => {
                  const projectImageSrc = getProjectImageSrc(project.Image);
                  const monogram = (project.Title || "PRJ").slice(0, 3).toUpperCase();

                  return (
                    <article
                      key={project._id || project.Title}
                      className={styles.projectCard}
                      onClick={() => handleProjectView(project)}
                      onMouseMove={handleCardMouseMove}
                    >
                      {/* Image column */}
                      <div className={styles.projectImageCol} aria-hidden="true">
                        {projectImageSrc ? (
                          <img
                            src={projectImageSrc}
                            alt=""
                            className={styles.projectImg}
                            loading="lazy"
                            decoding="async"
                            onError={(e) => {
                              e.target.style.display = "none";
                              e.target.parentNode.classList.add(styles.imgFailed);
                            }}
                          />
                        ) : (
                          <div className={styles.projectImgFallback}>
                            <span className={styles.projectMonogram}>{monogram}</span>
                          </div>
                        )}
                      </div>

                      {/* Content column */}
                      <div className={styles.projectContentCol}>
                        <div className={styles.projectMeta}>
                          <h3 className={styles.projectTitle}>{project.Title}</h3>
                          {project.Status && (
                            <span
                              className={`${styles.statusBadge} ${getStatusClass(project.Status)}`}
                            >
                              {project.Status}
                            </span>
                          )}
                        </div>

                        <p className={styles.projectDescription}>
                          {project.ShortDescription}
                        </p>

                        <div
                          className={styles.projectTech}
                          role="list"
                          aria-label="Technologies used"
                        >
                          {(project.Project_technologies || [])
                            .slice(0, 7)
                            .map((tech, i) => (
                              <span key={i} className={styles.techTag} role="listitem">
                                {(() => { const Icon = getTechIcon(tech); return <Icon size={14} style={{ flexShrink: 0 }} />; })()}
                                {tech}
                              </span>
                            ))}
                        </div>

                        <div className={styles.projectActions}>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleProjectView(project); }}
                            className={styles.projectActionLink}
                            aria-label={`View details for ${project.Title}`}
                          >
                            <Eye size={13} aria-hidden="true" />
                            View Details
                          </button>
                          {project.ProjectLiveUrl?.trim() && (
                            <a
                              href={project.ProjectLiveUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={styles.projectActionLink}
                              onClick={(e) => e.stopPropagation()}
                              aria-label={`Live demo for ${project.Title} (opens in new tab)`}
                            >
                              <ExternalLink size={13} aria-hidden="true" />
                              Live Demo
                            </a>
                          )}
                          {project.GithubUrl?.trim() && (
                            <a
                              href={project.GithubUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={styles.projectActionLink}
                              onClick={(e) => e.stopPropagation()}
                              aria-label={`GitHub for ${project.Title} (opens in new tab)`}
                            >
                              <Github size={13} aria-hidden="true" />
                              GitHub
                            </a>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                })
              )}
            </div>
          </div>
        </section>

        {/* ── Section 4: Global Presence & Github Activity ── */}
        <section className={styles.globalPresenceSection} aria-label="Global presence and Github activity">
          <div className={styles.container}>
            <div className={styles.globalPresenceGrid}>
          {/* Left Column — Presence Content */}
          <div className={styles.presenceContent}>
            <div className={styles.statusBadge}>
              <span className={styles.statusDot} aria-hidden="true" />
              Available for Remote Opportunities
            </div>
            <h2 className={styles.presenceHeading}>
              {MainHomeData?.PresenceHeadingPrefix || "Working"} <br /><span className={styles.cyanText}>{MainHomeData?.PresenceHeadingHighlight || "Worldwide."}</span>
            </h2>
            <p className={styles.presenceText}>
              {MainHomeData?.PresenceDescription || "Based in Egypt. Architecting high-performance MERN applications, real-time systems, and scalable solutions for clients across the globe. Distance is just a detail."}
            </p>
            <a href="contact" className={styles.ctaButton}>
              Let&rsquo;s Build Together
              <ArrowRight size={16} />
            </a>
          </div>

          {/* Right Column — Github Dashboard */}
          <div className={styles.githubDashboard}>
            {/* Github Header */}
            <div className={styles.githubHeader}>
              <div className={styles.githubHeaderLeft}>
                <Github size={18} />
                <span>Github Activity</span>
                <span className={styles.githubStatusDot} aria-hidden="true" />
              </div>
              <a
                href={githubUrl}
                className={styles.githubProfileLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                View profile <ExternalLink size={12} />
              </a>
            </div>

            {/* Bento Grid — 2x2 Metrics */}
            <div className={styles.bentoGrid}>
              <div className={styles.bentoCard}>
                <div className={styles.bentoCardValue}>{gitStats.loading ? "..." : gitStats.stars}</div>
                <div className={styles.bentoCardLabel}>TOTAL STARS</div>
              </div>
              <div className={styles.bentoCard}>
                <div className={styles.bentoCardValue}>{gitStats.loading ? "..." : gitStats.contributions}</div>
                <div className={styles.bentoCardLabel}>CONTRIBUTIONS</div>
              </div>
              <div className={styles.bentoCard}>
                <div className={styles.bentoCardValue}>{gitStats.loading ? "..." : gitStats.commits}</div>
                <div className={styles.bentoCardLabel}>COMMITS {new Date().getFullYear()}</div>
              </div>
              <div className={styles.bentoCard}>
                <div className={styles.bentoCardValue}>{gitStats.loading ? "..." : gitStats.streak}</div>
                <div className={styles.bentoCardLabel}>BEST STREAK</div>
              </div>
            </div>

            {/* Top Languages */}
            <div className={styles.languagesCard}>
              <div className={styles.languagesHeader}>Top Languages</div>
              <div className={styles.langBar}>
                {gitStats.languages.map((lang) => (
                  <div
                    key={lang.name}
                    className={styles.langBarSegment}
                    style={{ width: `${lang.percentage}%`, background: lang.color }}
                  />
                ))}
              </div>
              <div className={styles.langLabels}>
                {gitStats.languages.map((lang) => (
                  <span key={lang.name}>
                    <span className={styles.langDot} style={{ background: lang.color }} />
                    {lang.name} {lang.percentage}%
                  </span>
                ))}
              </div>
            </div>

            {/* Profile Footer */}
            <div className={styles.profileFooter}>
              <Github size={16} />
              <span>omarmohamed-909</span>
              <span className={styles.profileFooterSeparator}>|</span>
              <span>{gitStats.repos} repos</span>
              <a
                href={githubUrl}
                className={styles.profileFooterLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink size={12} />
              </a>
            </div>
          </div>
            </div>
          </div>
        </section>
      </main>

      {/* Error toast */}
      {error && (
        <div className={styles.errorToast} role="alert">
          <span>{error}</span>
          <button onClick={retryFetch} className={styles.retryButton}>
            Retry
          </button>
        </div>
      )}

      {/* Project detail modal */}
      {selectedProject && (
        <ProjectDetailModal
          project={{
            ...selectedProject,
            title: selectedProject.Title,
            shortDescription: selectedProject.ShortDescription,
            description:
              selectedProject.Description || selectedProject.ShortDescription,
            image: getProjectImageSrc(selectedProject.Image),
            technologies: selectedProject.Project_technologies || [],
            status: selectedProject.Status,
            demoUrl: selectedProject.ProjectLiveUrl,
            githubUrl: selectedProject.GithubUrl || "",
            featured: selectedProject.Featured || false,
          }}
          onClose={handleCloseModal}
        />
      )}

      {isSkillModalOpen && selectedSkill && (
        <SkillProjectModal
          skill={selectedSkill}
          projects={getProjectsBySkill(selectedSkill)}
          onClose={handleSkillModalClose}
          onProjectClick={handleSkillProjectClick}
        />
      )}

      <Footer />
      </div>
    </div>
  );
};

export default Home;
