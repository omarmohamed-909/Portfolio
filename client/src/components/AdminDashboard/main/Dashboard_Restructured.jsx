import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Dashboard_Restructured.module.css";
import { verifyJWTToken, logout } from "../utils/authUtils";
import PrivacyBlock from "../utils/PrivacyBlock";
import SlideNavbar from "../slideNavBar/SlideNavbar";
import DashboardHome from "../Dashboardhome/DashboardHome";
import DashboardSEO from "../DashboardSEO/DashboardSEO";
import DashboardAbout from "../DashboardAbout/DashboardAbout";
import DashboardProjects from "../DashboardProjects/DashboardProjects";
import DashboardSkills from "../DashboardSkills/DashboardSkills";
import DashboardCV from "../DashboardCV/DashboardCV";
import DashboardFooter from "../DashboardFooter/DashboardFooter";
import DashboardBlockHistory from "../DashboardBlockHistory/DashboardBlockHistory";
import DashboardExperiences from "../DashboardExperiences/DashboardExperiences";
import DashboardMessages from "../DashboardMessages/DashboardMessages";
import DashboardBlog from "../DashboardBlog/DashboardBlog";
import DashboardActivityLog from "../DashboardActivityLog/DashboardActivityLog";
import { Menu } from "lucide-react";
import { Backend_Root_Url } from "../../../config/AdminUrl.js";
import "../AdminTheme.css";
import { motion, AnimatePresence } from "framer-motion";

import axios from "axios";

const PageHeader = ({ title, children }) => (
  <div className={styles.pageHeader}>
    <motion.h1
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {title}
    </motion.h1>
    {children ? (
      <div className={styles.pageHeaderActions}>{children}</div>
    ) : null}
  </div>
);

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [activeSection, setActiveSection] = useState("seo");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const sensitiveTabs = ["messages", "activitylog", "blockhistory"];

  const generateInitials = (displayName) => {
    if (!displayName) return "UN";
    const words = displayName.trim().split(/\s+/);
    if (words.length === 1) {
      return words[0].substring(0, 2).toUpperCase();
    }
    return words
      .slice(0, 2)
      .map((word) => word.charAt(0).toUpperCase())
      .join("");
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(
          `${Backend_Root_Url}/api/home/main/data`,
          { withCredentials: true }
        );
        setUserData(response.data);
      } catch (error) {
        console.error("Error fetching user data:", error);
        setUserData(null);
      }
    };

    if (isAuthenticated) {
      fetchUserData();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const checkAuth = async () => {
      const { isAuthenticated, role } = await verifyJWTToken();
      setIsAuthenticated(isAuthenticated);
      setUserRole(role);
      if (isAuthenticated === false) {
        navigate("/denied");
        return;
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (mobileMenuOpen && !event.target.closest('[class*="sidebar"]')) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [mobileMenuOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "b") {
        e.preventDefault();
        setSidebarCollapsed((prev) => !prev);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleLogout = () => {
    logout();
    setIsAuthenticated(false);
  };

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner} />
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Loading dashboard...
        </motion.p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const getSectionTitle = (sectionId) => {
    const sections = {
      seo: "SEO",
      home: "Home",
      about: "About",
      projects: "Projects",
      skills: "Skills",
      cv: "CV",
      footer: "Footer",
      blockhistory: "Block History",
      experiences: "Experiences",
      messages: "Messages",
      blog: "Blog",
      activitylog: "Activity Log",
    };
    return sections[sectionId] || "Dashboard";
  };

  const renderActiveSection = () => {
    let sectionContent = null;

    if (sensitiveTabs.includes(activeSection) && userRole !== "admin") {
      sectionContent = <PrivacyBlock />;
    } else {
      switch (activeSection) {
        case "seo":
          sectionContent = <DashboardSEO userRole={userRole} />;
          break;
        case "home":
          sectionContent = <DashboardHome userRole={userRole} />;
          break;
        case "about":
          sectionContent = <DashboardAbout userRole={userRole} />;
          break;
        case "projects":
          sectionContent = <DashboardProjects userRole={userRole} />;
          break;
        case "skills":
          sectionContent = <DashboardSkills userRole={userRole} />;
          break;
        case "cv":
          sectionContent = <DashboardCV userRole={userRole} />;
          break;
        case "footer":
          sectionContent = <DashboardFooter userRole={userRole} />;
          break;
        case "experiences":
          sectionContent = <DashboardExperiences userRole={userRole} />;
          break;
        case "blog":
          sectionContent = <DashboardBlog userRole={userRole} />;
          break;
        case "messages":
          sectionContent = <DashboardMessages userRole={userRole} />;
          break;
        case "activitylog":
          sectionContent = <DashboardActivityLog userRole={userRole} />;
          break;
        case "blockhistory":
          sectionContent = <DashboardBlockHistory userRole={userRole} />;
          break;
        default:
          sectionContent = <DashboardHome userRole={userRole} />;
          break;
      }
    }

    return (
      <>
        <PageHeader title={getSectionTitle(activeSection)} />
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection}
            className={styles.contentWrapper}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.25, ease: "easeInOut" }}
          >
            {sectionContent}
          </motion.div>
        </AnimatePresence>
      </>
    );
  };

  return (
    <div className={styles.dashboard}>
      <SlideNavbar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        onLogout={handleLogout}
        userData={userData}
        generateInitials={generateInitials}
        userRole={userRole}
      />

      <div
        className={`${styles.mainContent} ${
          sidebarCollapsed ? styles.collapsed : ""
        }`}
      >
        <button
          className={`${styles.mobileMenuTrigger} ${styles.mobileOnly}`}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle sidebar"
        >
          <Menu size={20} />
        </button>
        {renderActiveSection()}
      </div>
    </div>
  );
};

export default Dashboard;
