import React, { useEffect, useState } from "react";
import styles from "./SlideNavbar.module.css";
import { useNavigate } from "react-router-dom";
import { verifyJWTToken } from "../utils/authUtils";
import { Backend_Root_Url } from "../../../config/AdminUrl.js";
import { resolveAssetUrl } from "../../../lib/assetUrl.js";
import { motion, AnimatePresence } from "framer-motion";

import {
  Home,
  User,
  Briefcase,
  FileText,
  Zap,
  Settings,
  LogOut,
  Menu,
  X,
  Search,
  LayoutDashboard,
  Shield,
  Mail,
  BookOpen,
  ClipboardList,
} from "lucide-react";

const navVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: (i) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.04, duration: 0.3, ease: "easeOut" },
  }),
};

const SlideNavbar = ({
  activeSection,
  setActiveSection,
  sidebarCollapsed,
  setSidebarCollapsed,
  mobileMenuOpen,
  setMobileMenuOpen,
  onLogout,
  userData,
  generateInitials,
  userRole,
}) => {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [mobileMenuOpen, setMobileMenuOpen]);

  const handleNavClick = async (sectionId) => {
    try {
      const { isAuthenticated } = await verifyJWTToken();
      if (isAuthenticated === false) {
        navigate("/denied");
        return;
      }
      setActiveSection(sectionId);
      setMobileMenuOpen(false);
    } catch (error) {
      console.error("JWT verification error:", error);
      navigate("/denied");
    }
  };

  const allSections = [
    { id: "seo", label: "SEO", icon: Search },
    { id: "home", label: "Home", icon: Home },
    { id: "about", label: "About", icon: User },
    { id: "projects", label: "Projects", icon: Briefcase },
    { id: "skills", label: "Skills", icon: Zap },
    { id: "cv", label: "CV", icon: FileText },
    { id: "footer", label: "Footer", icon: Settings },
    { id: "blockhistory", label: "Block History", icon: Shield },
    { id: "messages", label: "Messages", icon: Mail },
    { id: "experiences", label: "Experiences", icon: Briefcase },
    { id: "blog", label: "Blog", icon: BookOpen },
    { id: "activitylog", label: "Activity Log", icon: ClipboardList },
  ];

  const restrictedSections = ["messages", "activitylog", "blockhistory"];
  const sections = userRole === "viewer"
    ? allSections.filter((s) => !restrictedSections.includes(s.id))
    : allSections;

  const sidebarContent = (
    <>
      <div className={styles.sidebarHeader}>
        <div className={styles.logo}>
          <LayoutDashboard size={22} />
          {!sidebarCollapsed && <span>Portfolio Admin</span>}
        </div>
        <button
          className={`${styles.collapseBtn} ${styles.desktopOnly}`}
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <Menu size={18} />
        </button>
        <button
          className={`${styles.collapseBtn} ${styles.mobileOnly}`}
          onClick={() => setMobileMenuOpen(false)}
          aria-label="Close sidebar"
        >
          <X size={18} />
        </button>
      </div>

      <nav className={styles.sidebarNav}>
        {sections.map((section, index) => {
          const Icon = section.icon;
          return (
            <motion.button
              type="button"
              key={section.id}
              custom={index}
              variants={navVariants}
              initial="hidden"
              animate="visible"
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.97 }}
              className={`${styles.navItem} ${
                activeSection === section.id ? styles.active : ""
              }`}
              onClick={(e) => {
                e.preventDefault();
                handleNavClick(section.id);
              }}
            >
              <div className={styles.pill}>
                <span className={styles.navIconWrapper}>
                  <Icon size={18} />
                </span>
                {(!sidebarCollapsed || mobileMenuOpen) && (
                  <span className={styles.navLabel}>{section.label}</span>
                )}
                {sidebarCollapsed && !mobileMenuOpen && (
                  <span className={styles.tooltip}>{section.label}</span>
                )}
              </div>
            </motion.button>
          );
        })}
      </nav>

      <div className={styles.sidebarBottom}>
        <div className={styles.userProfile}>
          <div className={styles.userAvatar}>
            {userData?.HomeLogo ? (
              <img
                src={resolveAssetUrl(
                  userData.HomeLogo,
                  `${Backend_Root_Url}/uploads/logo/`
                )}
                alt="User Avatar"
                className={styles.avatarImage}
                onError={(e) => {
                  e.target.style.display = "none";
                  if (e.target.nextElementSibling) {
                    e.target.nextElementSibling.style.display = "flex";
                  }
                }}
              />
            ) : null}
            <div
              className={styles.avatarInitials}
              style={{ display: userData?.HomeLogo ? "none" : "flex" }}
            >
              {generateInitials
                ? generateInitials(userData?.DisplayName)
                : "UN"}
            </div>
          </div>
          {(!sidebarCollapsed || mobileMenuOpen) && (
            <>
              <span className={styles.userName}>
                {userData?.DisplayName || "Unknown User"}
              </span>
              {userRole === "viewer" && (
                <span className={styles.roleBadge}>View Only</span>
              )}
            </>
          )}
        </div>

        <div className={styles.sidebarFooter}>
          <motion.button
            type="button"
            className={styles.logoutBtn}
            onClick={(e) => {
              e.preventDefault();
              onLogout();
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
          >
            <span className={styles.logoutIcon}>
              <LogOut size={18} />
            </span>
            {(!sidebarCollapsed || mobileMenuOpen) && (
              <span className={styles.logoutLabel}>Logout</span>
            )}
          </motion.button>
        </div>
      </div>
    </>
  );

  return (
    <>
      {mobileMenuOpen && isMobile && (
        <div
          className={styles.sidebarOverlay}
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
      <div
        className={`${styles.sidebar} ${
          sidebarCollapsed && !isMobile ? styles.collapsed : ""
        } ${mobileMenuOpen ? styles.mobileOpen : ""}`}
      >
        {sidebarContent}
      </div>
    </>
  );
};

export default SlideNavbar;
