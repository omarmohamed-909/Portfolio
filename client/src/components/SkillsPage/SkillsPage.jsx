import React, { useState, useEffect } from "react";
import Navbar from "../Navbar/Navbar";
import Footer from "../Footer/Footer";
import ConstellationBackground from "../NebulaDrift/NebulaDrift";
import ProjectDetailModal from "../ProjectsPage/ProjectDetailModal";
import SkillProjectModal from "./SkillProjectModal";
import styles from "./SkillsPage.module.css";
import axios from "axios";
import { Backend_Root_Url } from "../../config/AdminUrl.js";
import { getTechIcon } from "../../lib/techIcons.jsx";
import { resolveAssetUrl } from "../../lib/assetUrl.js";
import { Code2, Server, Database, FileCode, ScanSearch, Brain, Box, Cloud, Wrench, Layers } from "lucide-react";
import "../../../src/App.css";

const CATEGORY_ICON_MAP = {
  Code2, Server, Database, FileCode, ScanSearch,
  Brain, Box, Cloud, Wrench, Layers,
};

function getCategoryIcon(iconName) {
  return CATEGORY_ICON_MAP[iconName] || Code2;
}

const SkillsPage = () => {
  const [skillsData, setSkillsData] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [isSkillModalOpen, setIsSkillModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [barsAnimated, setBarsAnimated] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [skillsRes, projectsRes] = await Promise.all([
          axios.get(`${Backend_Root_Url}/api/show/skills`),
          axios.get(`${Backend_Root_Url}/api/show/projects`),
        ]);

        // Transform skills
        const raw = skillsRes.data;
        const apiSkills = Array.isArray(raw) ? raw : raw?.SkillsData || raw?.data || raw?.skills || [];
        const groupedSkills = apiSkills.reduce((acc, skill) => {
          const cat = skill.Category;
          const catKey = cat?._id || cat;
          if (!acc[catKey]) {
            acc[catKey] = {
              category: cat?.name || cat || "Uncategorized",
              icon: cat?.icon || "Code2",
              skills: [],
            };
          }
          acc[catKey].skills.push({
            name: skill.SkillName,
            level: skill.Skill_Level,
          });
          return acc;
        }, {});
        const formattedSkills = Object.values(groupedSkills);
        setSkillsData(formattedSkills);

        // Transform projects
        const transformedProjects = (projectsRes.data || []).map((project) => ({
          id: project._id,
          title: project.Title,
          description: project.Description,
          shortDescription: project.ShortDescription,
          image:
            resolveAssetUrl(project.Image, `${Backend_Root_Url}/uploads/projectsimg/`) ||
            null,
          technologies: project.Project_technologies || [],
          category: "Project",
          status: project.Project_Status,
          demoUrl: project.ProjectLiveUrl || "",
          githubUrl: project.GithubUrl || "",
          featured: project.Featured,
          DisplayOrder: project.DisplayOrder ?? null,
        }));
        setProjects(transformedProjects);

        setLoading(false);
        setTimeout(() => setBarsAnimated(true), 200);
      } catch (err) {
        console.error("Failed to fetch data:", err);
        setError("Failed to load skills data. Please try again later.");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getProjectsBySkill = (skillName) => {
    const lowerSkill = skillName.toLowerCase();
    return projects.filter((project) =>
      project.technologies?.some((tech) => {
        const lowerTech = tech.toLowerCase();
        return lowerSkill.includes(lowerTech) || lowerTech.includes(lowerSkill);
      })
    );
  };

  const handleSkillClick = (skill) => {
    setSelectedSkill(skill);
    setIsSkillModalOpen(true);
  };

  const handleCloseSkillModal = () => {
    setIsSkillModalOpen(false);
    setSelectedSkill(null);
  };

  const handleProjectClick = (project) => {
    setIsSkillModalOpen(false);
    setSelectedProject(project);
    setIsProjectModalOpen(true);
  };

  const handleCloseProjectModal = () => {
    setIsProjectModalOpen(false);
    setSelectedProject(null);
  };

  const getSkillLevelColor = (level) => {
    if (level >= 90) return styles.expert;
    if (level >= 75) return styles.advanced;
    if (level >= 60) return styles.intermediate;
    return styles.beginner;
  };

  const getSkillLevelText = (level) => {
    if (level >= 90) return "Expert";
    if (level >= 75) return "Advanced";
    if (level >= 60) return "Intermediate";
    return "Beginner";
  };

  const calculateStats = () => {
    const totalSkills = skillsData.reduce(
      (total, category) => total + category.skills.length,
      0
    );
    const allSkills = skillsData.flatMap((category) => category.skills);
    const averageLevel =
      allSkills.length > 0
        ? Math.round(
            allSkills.reduce((sum, skill) => sum + skill.level, 0) /
              allSkills.length
          )
        : 0;
    const expertSkills = allSkills.filter((skill) => skill.level >= 75).length;
    const categories = skillsData.length;

    return { totalSkills, averageLevel, expertSkills, categories };
  };

  const stats = calculateStats();
  const retryFetch = () => {
    setError(null);
    window.location.reload();
  };
  if (loading) {
    return (
      <div className={styles.pageWrapper}>
        <ConstellationBackground />
        <div className={styles.contentLayer}>
          <Navbar />
          <main className={styles.mainContent}>
            <div className={styles.container}>
              <div className={styles.loadingState}>
                <div className={styles.spinner} />
                <p className={styles.loadingText}>Loading skills...</p>
              </div>
            </div>
          </main>
          <Footer />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.pageContainer}>
        <Navbar />
        <div className={styles.errorContainer}>
          <h2 className={styles.errorTitle}>Oops! Something went wrong</h2>
          <p className={styles.errorMessage}>{error}</p>
          <button
            className={styles.retryButton}
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  if (skillsData.length === 0) {
    return (
      <div className={styles.pageWrapper}>
        <ConstellationBackground />
        <div className={styles.contentLayer}>
          <Navbar />
          <main className={styles.mainContent}>
            <div className={styles.container}>
              <section className={styles.headerSection}>
                <div className={styles.headerContent}>
                  <h1 className={styles.title}>Skills & Technologies</h1>
                  <p className={styles.subtitle}>
                    A comprehensive overview of my technical skills and
                    proficiency levels across various technologies and tools.
                  </p>
                </div>
              </section>
              <section className={styles.noSkillsSection}>
                <div className={styles.noSkillsContainer}>
                  <div className={styles.noSkillsIcon}>
                    <svg
                      className={styles.calendarIcon}
                      width="32"
                      height="32"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
                    </svg>
                  </div>
                  <h3 className={styles.noSkillsTitle}>Skills Coming Soon!</h3>
                  <p className={styles.noSkillsText}>
                    I'm currently building an amazing portfolio of skills and
                    technologies. Check back soon to see my expertise in action!
                  </p>
                  <div className={styles.emptyActions}>
                    <button className={styles.refreshButton} onClick={retryFetch}>
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <polyline points="23,4 23,10 17,10" />
                        <polyline points="1,20 1,14 7,14" />
                        <path d="M20.49,9A9,9,0,0,0,5.64,5.64L1,10m22,4L18.36,18.36A9,9,0,0,1,3.51,15" />
                      </svg>
                      Refresh
                    </button>
                  </div>
                </div>
              </section>
            </div>
          </main>
          <Footer />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageWrapper}>
      <ConstellationBackground />
      <div className={styles.contentLayer}>
      <Navbar />

      <main className={styles.mainContent}>
        <div className={styles.container}>
          {/* Header Section */}
          <section className={styles.headerSection}>
            <div className={styles.headerContent}>
              <h1 className={styles.title}>Skills & Technologies</h1>
              <p className={styles.subtitle}>
                A comprehensive overview of my technical skills and proficiency
                levels across various technologies and tools.
              </p>
            </div>
          </section>

          {/* Skills Grid */}
          <section className={styles.skillsSection}>
            <div className={styles.skillsGrid}>
              {skillsData.map((category, categoryIndex) => (
                <div key={categoryIndex} className={styles.categoryCard}>
                  <div className={styles.categoryHeader}>
                    <div className={styles.categoryTitleGroup}>
                      <span className={styles.categoryIconWrap}>
                        {(() => { const Icon = getCategoryIcon(category.icon); return <Icon size={16} />; })()}
                      </span>
                      <h3 className={styles.categoryTitle}>
                        {category.category}
                      </h3>
                    </div>
                    <div className={styles.categoryCount}>
                      <span className={styles.countNumber}>
                        {category.skills.length}
                      </span>
                    </div>
                  </div>

                  <div className={styles.skillsList}>
                    {category.skills.map((skill, skillIndex) => (
                      <div key={skillIndex} className={styles.skillItem} onClick={() => handleSkillClick(skill.name)}>
                        <div className={styles.skillHeader}>
                          <span className={styles.skillName}>
                            <span className={styles.iconWrapper}>
                              {(() => { const Icon = getTechIcon(skill.name); return <Icon size={15} />; })()}
                            </span>
                            <span className={styles.skillNameText}>{skill.name}</span>
                          </span>
                          <div className={styles.skillLevel}>
                            <span
                              className={`${
                                styles.levelBadge
                              } ${getSkillLevelColor(skill.level)}`}
                            >
                              {getSkillLevelText(skill.level)}
                            </span>
                            <span className={styles.levelPercentage}>
                              {skill.level}%
                            </span>
                          </div>
                        </div>

                        <div className={styles.progressContainer}>
                          <div className={styles.progressBar}>
                            <div
                              className={`${
                                styles.progressFill
                              } ${getSkillLevelColor(skill.level)}`}
                              style={{ transform: `scaleX(${barsAnimated ? skill.level / 100 : 0})` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Stats Section */}
          <section className={styles.statsSection}>
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <div className={styles.statNumber}>{stats.totalSkills}</div>
                <div className={styles.statLabel}>Total Skills</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statNumber}>{stats.categories}</div>
                <div className={styles.statLabel}>Categories</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statNumber}>{stats.expertSkills}</div>
                <div className={styles.statLabel}>High-Level</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statNumber}>{stats.averageLevel}%</div>
                <div className={styles.statLabel}>Average Level</div>
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer />
      </div>

      {isSkillModalOpen && selectedSkill && (
        <SkillProjectModal
          skill={selectedSkill}
          projects={getProjectsBySkill(selectedSkill)}
          onClose={handleCloseSkillModal}
          onProjectClick={handleProjectClick}
        />
      )}

      {isProjectModalOpen && selectedProject && (
        <ProjectDetailModal
          project={selectedProject}
          onClose={handleCloseProjectModal}
        />
      )}
    </div>
  );
};

export default SkillsPage;
