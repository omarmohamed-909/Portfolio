import React, { useEffect, useState } from "react";
import styles from "./SlideNavbar.module.css";
import { useNavigate } from "react-router-dom";
import { verifyJWTToken } from "../utils/authUtils";
import { Backend_Root_Url } from "../../../config/AdminUrl.js";
import { resolveAssetUrl } from "../../../lib/assetUrl.js";

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
} from "lucide-react";

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
}) => {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Track viewport changes
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleNavClick = async (sectionId) => {
    try {
      const isValid = await verifyJWTToken();

      if (isValid === false) {
        window.location.href = "/denied";
        return;
      }

      setActiveSection(sectionId);
      setMobileMenuOpen(false);
    } catch (error) {
      console.error("❌ JWT verification error:", error);
      console.log("🚨 Error details:", error.message, error.stack);
      navigate("/denied");
    }
  };

  // Universal click handler - handles ALL scenarios
  const handleUniversalClick = (sectionId) => {
    handleNavClick(sectionId);
  };

  // Navigation sections
  const sections = [
    { id: "seo", label: "SEO", icon: Search },
    { id: "home", label: "Home", icon: Home },
    { id: "about", label: "About", icon: User },
    { id: "projects", label: "Projects", icon: Briefcase },
    { id: "skills", label: "Skills", icon: Zap },
    { id: "cv", label: "CV", icon: FileText },
    { id: "footer", label: "Footer", icon: Settings },
  ];

  return (
    <div
      className={`${styles.sidebar} ${
        sidebarCollapsed ? styles.collapsed : ""
      } ${mobileMenuOpen ? styles.mobileOpen : ""}`}
    >
      <div className={styles.sidebarHeader}>
        <div className={styles.logo}>
          <LayoutDashboard size={22} />
          {!sidebarCollapsed && <span>Portfolio Admin</span>}
        </div>
        <button
          className={`${styles.collapseBtn} ${styles.desktopOnly}`}
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        >
          <Menu size={20} />
        </button>
        <button
          className={`${styles.collapseBtn} ${styles.mobileOnly}`}
          onClick={() => setMobileMenuOpen(false)}
        >
          <X size={20} />
        </button>
      </div>

      <nav className={styles.sidebarNav}>
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <button
              type="button"
              key={section.id}
              className={`${styles.navItem} ${
                activeSection === section.id ? styles.active : ""
              }`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleUniversalClick(section.id);
              }}
              style={{
                cursor: "pointer",
                userSelect: "none",
                WebkitUserSelect: "none",
                WebkitTapHighlightColor: "rgba(0, 212, 255, 0.25)",
                touchAction: "manipulation",
                position: "relative",
                zIndex: 10,
              }}
            >
              <div className={styles.pill}>
                <Icon size={20} />
                {(!sidebarCollapsed || mobileMenuOpen) && (
                  <span>{section.label}</span>
                )}
              </div>
            </button>
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
            <span className={styles.userName}>
              {userData?.DisplayName || "Unknown User"}
            </span>
          )}
        </div>

        <div className={styles.sidebarFooter}>
          <button
            type="button"
            className={styles.logoutBtn}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onLogout();
            }}
            style={{
              cursor: "pointer",
              userSelect: "none",
              WebkitUserSelect: "none",
              WebkitTapHighlightColor: "rgba(0, 212, 255, 0.25)",
              touchAction: "manipulation",
              position: "relative",
              zIndex: 10,
            }}
          >
            <LogOut size={20} />
            {(!sidebarCollapsed || mobileMenuOpen) && <span>Logout</span>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SlideNavbar;
