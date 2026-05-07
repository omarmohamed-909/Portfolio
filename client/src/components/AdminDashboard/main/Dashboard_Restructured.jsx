import React, { useState, useEffect } from "react";
import styles from "./Dashboard_Restructured.module.css";
import { verifyJWTToken, logout } from "../utils/authUtils";
import SlideNavbar from "../slideNavBar/SlideNavbar";
import DashboardHome from "../Dashboardhome/DashboardHome";
import DashboardSEO from "../DashboardSEO/DashboardSEO";
import DashboardAbout from "../DashboardAbout/DashboardAbout";
import DashboardProjects from "../DashboardProjects/DashboardProjects";
import DashboardSkills from "../DashboardSkills/DashboardSkills";
import DashboardCV from "../DashboardCV/DashboardCV";
import DashboardFooter from "../DashboardFooter/DashboardFooter";
import { Menu } from "lucide-react";
import { Backend_Root_Url } from "../../../config/AdminUrl.js";
import "../../../../src/App.css";

import axios from "axios";

const PageHeader = ({ title, children }) => (
  <div className={styles.pageHeader}>
    <h1>{title}</h1>
    {children ? (
      <div className={styles.pageHeaderActions}>{children}</div>
    ) : null}
  </div>
);

const Dashboard = () => {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // User data state
  const [userData, setUserData] = useState(null);

  // Navigation state
  const [activeSection, setActiveSection] = useState("seo");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Function to generate initials from display name
  const generateInitials = (displayName) => {
    if (!displayName) return "UN"; // Unknown User

    const words = displayName.trim().split(/\s+/);

    if (words.length === 1) {
      // Single word: take first 2 characters
      return words[0].substring(0, 2).toUpperCase();
    } else {
      // Multiple words: take first letter of first 2 words
      return words
        .slice(0, 2)
        .map((word) => word.charAt(0).toUpperCase())
        .join("");
    }
  };

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(
          `${Backend_Root_Url}/api/home/main/data`,
          {
            withCredentials: true,
          }
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

  // Authentication check
  useEffect(() => {
    const checkAuth = async () => {
      const isValid = await verifyJWTToken();
      setIsAuthenticated(isValid);
      if (isValid === false) {
        window.location.href = "/denied";
        return;
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (mobileMenuOpen && !event.target.closest(".sidebar")) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [mobileMenuOpen]);

  // Handle logout
  const handleLogout = () => {
    logout();
    setIsAuthenticated(false);
  };

  // Render loading state
  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return null; // Will redirect via useEffect
  }

  // Get section title
  const getSectionTitle = (sectionId) => {
    const sections = {
      seo: "SEO",
      home: "Home",
      about: "About",
      projects: "Projects",
      skills: "Skills",
      cv: "CV",
      footer: "Footer",
    };
    return sections[sectionId] || "Dashboard";
  };

  // Render active section content
  const renderActiveSection = () => {
    let sectionContent = null;

    switch (activeSection) {
      case "seo":
        sectionContent = <DashboardSEO />;
        break;
      case "home":
        sectionContent = <DashboardHome />;
        break;
      case "about":
        sectionContent = <DashboardAbout />;
        break;
      case "projects":
        sectionContent = <DashboardProjects />;
        break;
      case "skills":
        sectionContent = <DashboardSkills />;
        break;
      case "cv":
        sectionContent = <DashboardCV />;
        break;
      case "footer":
        sectionContent = <DashboardFooter />;
        break;
      default:
        sectionContent = <DashboardHome />;
        break;
    }

    return (
      <>
        <PageHeader title={getSectionTitle(activeSection)} />
        {sectionContent}
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
        <div className={styles.content}>{renderActiveSection()}</div>
      </div>
    </div>
  );
};

export default Dashboard;
