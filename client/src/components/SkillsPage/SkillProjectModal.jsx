import React, { useEffect } from "react";
import { getTechIcon } from "../../lib/techIcons.jsx";
import { Terminal, ExternalLink } from "lucide-react";
import styles from "./SkillProjectModal.module.css";

const SkillProjectModal = ({ skill, projects, onClose, onProjectClick }) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [onClose]);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  if (!skill) return null;

  const SkillIcon = getTechIcon(skill);

  return (
    <div className={styles.overlay} onClick={handleBackdropClick}>
      <div className={styles.modal}>
        <button className={styles.closeBtn} onClick={onClose} aria-label="Close modal">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        <div className={styles.header}>
          <span className={styles.headerIcon}>
            <SkillIcon size={18} />
          </span>
          <h2 className={styles.headerTitle}>
            Projects using <span className={styles.headerSkill}>{skill}</span>
          </h2>
        </div>

        <div className={styles.body}>
          {projects.length === 0 ? (
            <div className={styles.emptyState}>
              <Terminal size={28} strokeWidth={1.5} />
              <p className={styles.emptyText}>No public projects listed with this technology yet.</p>
            </div>
          ) : (
            <div className={styles.projectList}>
              {projects.map((project) => (
                <button
                  key={project.id}
                  className={styles.projectItem}
                  onClick={() => onProjectClick(project)}
                >
                  <div className={styles.projectInfo}>
                    <span className={styles.projectTitle}>{project.title}</span>
                    {project.shortDescription && (
                      <span className={styles.projectDesc}>{project.shortDescription}</span>
                    )}
                  </div>
                  <div className={styles.projectRight}>
                    {project.status && (
                      <span className={`${styles.statusBadge} ${getStatusClass(project.status)}`}>
                        {project.status}
                      </span>
                    )}
                    <ExternalLink size={14} className={styles.projectArrow} />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className={styles.footer}>
          <span className={styles.footerText}>
            {projects.length} {projects.length === 1 ? "project" : "projects"} found
          </span>
        </div>
      </div>
    </div>
  );
};

const getStatusClass = (status) => {
  if (!status) return styles.statusDefault;
  const map = {
    completed: styles.statusCompleted,
    "in progress": styles.statusInProgress,
    inprogress: styles.statusInProgress,
    planning: styles.statusPlanning,
    planned: styles.statusPlanned,
    "on hold": styles.statusOnHold,
    onhold: styles.statusOnHold,
    canceled: styles.statusCanceled,
    cancelled: styles.statusCanceled,
    prototype: styles.statusPrototype,
    launched: styles.statusLaunched,
    metrics: styles.statusMetrics,
    awarded: styles.statusAwarded,
    passed: styles.statusPassed,
    achievement: styles.statusAchievement,
    archived: styles.statusArchived,
  };
  const normalized = status.toLowerCase().replace(/\s+/g, "");
  return map[status.toLowerCase()] || map[normalized] || styles.statusDefault;
};

export default SkillProjectModal;
