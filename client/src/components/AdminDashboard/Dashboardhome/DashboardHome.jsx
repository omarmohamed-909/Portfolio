import React, { useState, useRef, useEffect } from "react";
import styles from "./DashboardHome.module.css";
import { Edit3, Upload, Save, X } from "lucide-react";
import axios from "axios";
import { Backend_Root_Url } from "../../../config/AdminUrl.js";
import { resolveAssetUrl } from "../../../lib/assetUrl.js";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

const DashboardHome = ({ userRole }) => {
  const [MainHomeData, setMainHomeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(
          `${Backend_Root_Url}/api/home/main/data`
        );
        setMainHomeData(response.data);
      } catch (error) {
        console.error("Error fetching home data:", error);
        setError("Failed to fetch home data. Please check your connection.");
        setMainHomeData({
          DisplayName: "Your Name",
          MainRoles: [
            "Full Stack Developer",
            "UI/UX Designer",
            "Tech Consultant",
          ],
          description:
            "Passionate about creating digital solutions that make a difference",
          HomeLogo: "default.png",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  const HomeLogoImg =
    resolveAssetUrl(MainHomeData?.HomeLogo, `${Backend_Root_Url}/uploads/logo/`) ||
    null;

  const GetRoles = MainHomeData?.MainRoles
    ? Array.isArray(MainHomeData.MainRoles)
      ? MainHomeData.MainRoles
      : Object.values(MainHomeData.MainRoles)
    : [];

  const [slidePanel, setSlidePanel] = useState({
    isOpen: false,
    type: "",
    data: null,
    title: "",
  });

  const [formData, setFormData] = useState({});
  const [dragActive, setDragActive] = useState(false);
  const [saving, setSaving] = useState(false);

  const fileInputRef = useRef(null);

  const openSlidePanel = (type, data = null, title = "") => {
    setSlidePanel({ isOpen: true, type, data, title });

    if (data) {
      if (type === "editHome") {
        setFormData({
          DisplayName: data.DisplayName || "",
          MainRoles: Array.isArray(data.MainRoles)
            ? data.MainRoles.join(", ")
            : data.MainRoles
            ? Object.values(data.MainRoles).join(", ")
            : "",
          description: data.description || "",
          TechStack: data.TechStack || "",
          FocusArea: data.FocusArea || "",
          AvailabilityStatus: data.AvailabilityStatus || "",
          CalendlyUrl: data.CalendlyUrl || "",
          HomeLogo: data.HomeLogo || "",
          ArchitectureSectionTitle: data.ArchitectureSectionTitle || "",
          ProjectsSectionTitle: data.ProjectsSectionTitle || "",
          PresenceHeadingPrefix: data.PresenceHeadingPrefix || "",
          PresenceHeadingHighlight: data.PresenceHeadingHighlight || "",
          PresenceDescription: data.PresenceDescription || "",
        });
      } else {
        setFormData(data);
      }
    } else {
      setFormData({});
    }
  };

  const closeSlidePanel = () => {
    setSlidePanel({ isOpen: false, type: "", data: null, title: "" });
    setFormData({});
    setSaving(false);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileUpload = (file) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload only image files");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      setFormData((prev) => ({
        ...prev,
        HomeLogoImg: e.target.result,
        imageFile: file,
      }));
    };
    reader.readAsDataURL(file);
  };

  const updateHomeLogo = async (file) => {
    const formDataObj = new FormData();
    formDataObj.append("image", file);
    const response = await axios.put(
      `${Backend_Root_Url}/api/home/update/logo?folder=logo`,
      formDataObj,
      { withCredentials: true, headers: { "Content-Type": "multipart/form-data" } }
    );
    return response.data.filename;
  };

  const updateHomeData = async (data) => {
    const response = await axios.put(
      `${Backend_Root_Url}/api/home/edit/homedata`,
      data,
      { withCredentials: true }
    );
    return response.data;
  };

  const handleSave = async () => {
    const { type, data } = slidePanel;
    setSaving(true);

    try {
      switch (type) {
        case "editHome": {
          let logoFilename = formData.HomeLogo;
          if (formData.imageFile) {
            logoFilename = await updateHomeLogo(formData.imageFile);
          }
          const homeDataToUpdate = {
            DisplayName: formData.DisplayName,
            MainRoles: formData.MainRoles
              ? formData.MainRoles.split(",").map((role) => role.trim()).filter((role) => role)
              : [],
            description: formData.description,
            TechStack: formData.TechStack || "",
            FocusArea: formData.FocusArea || "",
            AvailabilityStatus: formData.AvailabilityStatus || "",
            CalendlyUrl: formData.CalendlyUrl || "",
            ArchitectureSectionTitle: formData.ArchitectureSectionTitle || "",
            ProjectsSectionTitle: formData.ProjectsSectionTitle || "",
            PresenceHeadingPrefix: formData.PresenceHeadingPrefix || "",
            PresenceHeadingHighlight: formData.PresenceHeadingHighlight || "",
            PresenceDescription: formData.PresenceDescription || "",
          };
          await updateHomeData(homeDataToUpdate);
          setMainHomeData((prev) => ({ ...prev, ...homeDataToUpdate, HomeLogo: logoFilename }));
          toast.success("Home data saved successfully");
        }
      }
      closeSlidePanel();
    } catch (error) {
      console.error("Error saving data:", error);
      toast.error("Failed to save data. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.homeSection}>
        <div className={styles.loadingState}>
          <div className={styles.spinner} />
          <p>Loading home data...</p>
        </div>
      </div>
    );
  }

  const renderSlidePanel = () => {
    if (!slidePanel.isOpen) return null;

    const { type, title } = slidePanel;

    return (
      <motion.div
        className={styles.slidePanel}
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
      >
        <div className={styles.slidePanelHeader}>
          <h3>{title}</h3>
          <button className={styles.closeBtn} onClick={closeSlidePanel}>
            <X size={20} />
          </button>
        </div>

        <div className={styles.slidePanelContent}>
          {type === "editHome" && (
            <div className={styles.form}>
              <div className={styles.formGroup}>
                <label>Display Name</label>
                <input
                  type="text"
                  value={formData.DisplayName || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, DisplayName: e.target.value }))
                  }
                  placeholder="Enter your display name"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Main Roles (comma separated)</label>
                <input
                  type="text"
                  value={formData.MainRoles || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, MainRoles: e.target.value }))
                  }
                  placeholder="e.g., Full Stack Developer, UI/UX Designer"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Description</label>
                <textarea
                  value={formData.description || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, description: e.target.value }))
                  }
                  placeholder="Brief description about yourself"
                  rows={3}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Tech Stack</label>
                <input
                  type="text"
                  value={formData.TechStack || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, TechStack: e.target.value }))
                  }
                  placeholder="e.g., MERN · Next.js · TypeScript"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Focus Area</label>
                <input
                  type="text"
                  value={formData.FocusArea || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, FocusArea: e.target.value }))
                  }
                  placeholder="e.g., Systems Design · Clean Architecture"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Availability Status</label>
                <input
                  type="text"
                  value={formData.AvailabilityStatus || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, AvailabilityStatus: e.target.value }))
                  }
                  placeholder="e.g., Available for hire"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Calendly URL</label>
                <input
                  type="url"
                  value={formData.CalendlyUrl || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, CalendlyUrl: e.target.value }))
                  }
                  placeholder="https://calendly.com/yourusername"
                />
                <small>Link for scheduling meetings on the Contact page</small>
              </div>

              <div className={styles.formGroup}>
                <label>Profile Image</label>
                <div
                  className={`${styles.uploadArea} ${dragActive ? styles.dragActive : ""}`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {formData.HomeLogoImg ? (
                    <div className={styles.imagePreview}>
                      <img src={formData.HomeLogoImg} alt="Profile preview" loading="lazy" decoding="async" />
                    </div>
                  ) : HomeLogoImg ? (
                    <div className={styles.imagePreview}>
                      <img src={HomeLogoImg} alt="Current profile" loading="lazy" decoding="async" />
                    </div>
                  ) : userRole === "admin" ? (
                    <div className={styles.uploadPlaceholder}>
                      <Upload size={24} />
                      <p>Click or drag image here</p>
                    </div>
                  ) : null}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e.target.files[0])}
                  style={{ display: "none" }}
                />
              </div>

              {/* ── Section Titles ── */}
              <h4 className={styles.formSectionHeading}>Section Titles</h4>

              <div className={styles.formGroup}>
                <label>Architecture Section Title</label>
                <input
                  type="text"
                  value={formData.ArchitectureSectionTitle || ""}
                  onChange={(e) => setFormData((prev) => ({ ...prev, ArchitectureSectionTitle: e.target.value }))}
                  placeholder="e.g., Core Architecture"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Projects Section Title</label>
                <input
                  type="text"
                  value={formData.ProjectsSectionTitle || ""}
                  onChange={(e) => setFormData((prev) => ({ ...prev, ProjectsSectionTitle: e.target.value }))}
                  placeholder="e.g., Featured Engineering Work"
                />
              </div>

              {/* ── Global Presence ── */}
              <h4 className={styles.formSectionHeading}>Global Presence</h4>

              <div className={styles.formGroup}>
                <label>Presence Heading Prefix</label>
                <input
                  type="text"
                  value={formData.PresenceHeadingPrefix || ""}
                  onChange={(e) => setFormData((prev) => ({ ...prev, PresenceHeadingPrefix: e.target.value }))}
                  placeholder="e.g., Working"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Presence Heading Highlight</label>
                <input
                  type="text"
                  value={formData.PresenceHeadingHighlight || ""}
                  onChange={(e) => setFormData((prev) => ({ ...prev, PresenceHeadingHighlight: e.target.value }))}
                  placeholder="e.g., Worldwide."
                />
              </div>

              <div className={styles.formGroup}>
                <label>Presence Description</label>
                <textarea
                  value={formData.PresenceDescription || ""}
                  onChange={(e) => setFormData((prev) => ({ ...prev, PresenceDescription: e.target.value }))}
                  placeholder="Describe your global presence..."
                  rows={3}
                />
              </div>
            </div>
          )}

        </div>

        <div className={styles.slidePanelFooter}>
          <button className={styles.btnSecondary} onClick={closeSlidePanel}>
            Cancel
          </button>
          {userRole === "admin" && (
          <button
            className={styles.btnPrimary}
            onClick={handleSave}
            disabled={saving}
          >
            <Save size={16} />
            {saving ? "Saving..." : "Save Changes"}
          </button>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <div className={styles.homeSection}>

      {/* ── Page Header ── */}
      <div className={styles.pageHeader}>
        <div>
          <h2 className={styles.pageTitle}>Home Page</h2>
          <p className={styles.pageSubtitle}>Preview and manage all home section content</p>
        </div>
        <div className={styles.headerActions}>
          {error && <span className={styles.errorBadge}>{error}</span>}
          {userRole === "admin" && (
          <motion.button
            className={styles.btnPrimary}
            onClick={() => openSlidePanel("editHome", MainHomeData, "Edit Home Section")}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
          >
            <Edit3 size={15} />
            Edit Home
          </motion.button>
          )}
        </div>
      </div>

      {/* ── Content Grid ── */}
      <div className={styles.contentGrid}>

        {/* Profile Card */}
        <motion.div
          className={styles.previewCard}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className={styles.previewCardLabel}>
            <span className={styles.labelDot} />
            Profile
          </div>
          <div className={styles.profileRow}>
            <div className={styles.profileAvatar}>
              {HomeLogoImg ? (
                <img src={HomeLogoImg} alt="Profile" loading="lazy" decoding="async" />
              ) : (
                <div className={styles.profilePlaceholder}>
                  {MainHomeData?.DisplayName?.charAt(0) || "?"}
                </div>
              )}
            </div>
            <div>
              <h3 className={styles.previewTitle}>{MainHomeData?.DisplayName || "—"}</h3>
              <div className={styles.rolesList}>
                {GetRoles.map((role, i) => (
                  <span key={i} className={styles.roleTag}>{role}</span>
                ))}
              </div>
            </div>
          </div>
          <p className={styles.previewDesc}>{MainHomeData?.description || "No description yet."}</p>
        </motion.div>

        {/* Identity Card */}
        <motion.div
          className={styles.previewCard}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
        >
          <div className={styles.previewCardLabel}>
            <span className={styles.labelDot} />
            Identity
          </div>
          <div className={styles.identityRows}>
            <div className={styles.identityRow}>
              <span className={styles.identityKey}>Stack</span>
              <span className={styles.identityVal}>{MainHomeData?.TechStack || "—"}</span>
            </div>
            <div className={styles.identityRow}>
              <span className={styles.identityKey}>Focus</span>
              <span className={styles.identityVal}>{MainHomeData?.FocusArea || "—"}</span>
            </div>
            <div className={styles.identityRow}>
              <span className={styles.identityKey}>Status</span>
              <span className={styles.identityVal}>{MainHomeData?.AvailabilityStatus || "—"}</span>
            </div>
          </div>
        </motion.div>

        {/* Section Titles Card */}
        <motion.div
          className={styles.previewCard}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <div className={styles.previewCardLabel}>
            <span className={styles.labelDot} />
            Section Titles
          </div>
          <div className={styles.identityRows}>
            <div className={styles.identityRow}>
              <span className={styles.identityKey}>Architecture</span>
              <span className={styles.identityVal}>{MainHomeData?.ArchitectureSectionTitle || "—"}</span>
            </div>
            <div className={styles.identityRow}>
              <span className={styles.identityKey}>Projects</span>
              <span className={styles.identityVal}>{MainHomeData?.ProjectsSectionTitle || "—"}</span>
            </div>
          </div>
        </motion.div>

        {/* Global Presence Card */}
        <motion.div
          className={styles.previewCard}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
        >
          <div className={styles.previewCardLabel}>
            <span className={styles.labelDot} />
            Global Presence
          </div>
          <p className={styles.presenceHeading}>
            <span className={styles.presencePrefix}>{MainHomeData?.PresenceHeadingPrefix || "—"}</span>
            {" "}
            <span className={styles.presenceHighlight}>{MainHomeData?.PresenceHeadingHighlight || ""}</span>
          </p>
          <p className={styles.previewDesc}>{MainHomeData?.PresenceDescription || "No description yet."}</p>
        </motion.div>

      </div>

      <AnimatePresence>
        {slidePanel.isOpen && renderSlidePanel()}
      </AnimatePresence>
    </div>
  );
};

export default DashboardHome;
