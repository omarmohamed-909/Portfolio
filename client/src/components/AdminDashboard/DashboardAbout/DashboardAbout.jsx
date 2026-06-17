import React, { useState, useEffect } from "react";
import styles from "./DashboardAbout.module.css";
import { verifyJWTToken } from "../utils/authUtils";
import { Edit3, Save, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Backend_Root_Url } from "../../../config/AdminUrl.js";
import { toast } from "sonner";

const DashboardAbout = ({ userRole }) => {
  //Authentication check
  useEffect(() => {
    const checkAuth = async () => {
      const { isAuthenticated } = await verifyJWTToken();
      if (!isAuthenticated) {
        window.location.href = "/denied";
        return;
      }
    };
    checkAuth();
  }, []);

  // About section state
  const [aboutData, setAboutData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch initial data
  useEffect(() => {
    const fetchAboutData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(
          `${Backend_Root_Url}/api/home/main/data`,
          {
            withCredentials: true,
          }
        );

        // Extract About data from the response
        const data = response.data;
        setAboutData({
          title: data.AboutUs?.AboutUsTitle || "About Me",
          description: data.AboutUs?.AboutUsDescription || "Description here",
          skills: data.AboutUs?.AboutSkills || [],
          slides: data.AboutUs?.AboutUsSlides || [],
          academicTitle: data.AboutUs?.AcademicTitle || "",
          academicMeta: data.AboutUs?.AcademicMeta || "",
          academicDescription: data.AboutUs?.AcademicDescription || "",
          identityCard1Title: data.AboutUs?.IdentityCard1Title || "",
          identityCard1Subtitle: data.AboutUs?.IdentityCard1Subtitle || "",
          identityCard1Items: data.AboutUs?.IdentityCard1Items || [],
          identityCard2Title: data.AboutUs?.IdentityCard2Title || "",
          identityCard2Subtitle: data.AboutUs?.IdentityCard2Subtitle || "",
          identityCard2Items: data.AboutUs?.IdentityCard2Items || [],
          identityCard3Title: data.AboutUs?.IdentityCard3Title || "",
          identityCard3Subtitle: data.AboutUs?.IdentityCard3Subtitle || "",
          identityCard3Items: data.AboutUs?.IdentityCard3Items || [],
          philosophyQuote: data.AboutUs?.PhilosophyQuote || "",
          philosophyMeta: data.AboutUs?.PhilosophyMeta || "",
        });


      } catch (error) {
        console.error("Error fetching about data:", error);
        setError("Failed to fetch about data. Please check your connection.");
        // Set fallback data when API is down
        setAboutData({
          title: "About Me",
          description:
            "With over 3 years of experience in web development, I specialize in creating modern, responsive web applications using cutting-edge technologies.",
          skills: [
            "React",
            "Node.js",
            "JavaScript",
            "TypeScript",
            "Python",
            "MongoDB",
            "PostgreSQL",
          ],
          slides: [],
          academicTitle: "",
          academicMeta: "",
          academicDescription: "",
          identityCard1Title: "",
          identityCard1Subtitle: "",
          identityCard1Items: [],
          identityCard2Title: "",
          identityCard2Subtitle: "",
          identityCard2Items: [],
          identityCard3Title: "",
          identityCard3Subtitle: "",
          identityCard3Items: [],
          philosophyQuote: "",
          philosophyMeta: "",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAboutData();
  }, []);

  // Slide panel state
  const [slidePanel, setSlidePanel] = useState({
    isOpen: false,
    type: "",
    data: null,
    title: "",
  });

  // Delete confirmation state
  const [deleteConfirmation, setDeleteConfirmation] = useState({
    isOpen: false,
    type: "",
    id: null,
    itemName: "",
  });

  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);

  // Slide panel functions
  const openSlidePanel = (type, data = null, title = "") => {
    setSlidePanel({
      isOpen: true,
      type,
      data,
      title,
    });

    // Initialize form data properly
    if (data) {
      if (type === "editAbout") {
        setFormData({
          AboutUsTitle: data.title || "",
          AboutUsDescription: data.description || "",
          AboutSkills: Array.isArray(data.skills) ? data.skills.join(", ") : "",
          AcademicTitle: data.academicTitle || "",
          AcademicMeta: data.academicMeta || "",
          AcademicDescription: data.academicDescription || "",
          IdentityCard1Title: data.identityCard1Title || "",
          IdentityCard1Subtitle: data.identityCard1Subtitle || "",
          IdentityCard1Items: Array.isArray(data.identityCard1Items) ? data.identityCard1Items.join(", ") : "",
          IdentityCard2Title: data.identityCard2Title || "",
          IdentityCard2Subtitle: data.identityCard2Subtitle || "",
          IdentityCard2Items: Array.isArray(data.identityCard2Items) ? data.identityCard2Items.join(", ") : "",
          IdentityCard3Title: data.identityCard3Title || "",
          IdentityCard3Subtitle: data.identityCard3Subtitle || "",
          IdentityCard3Items: Array.isArray(data.identityCard3Items) ? data.identityCard3Items.join(", ") : "",
          PhilosophyQuote: data.philosophyQuote || "",
          PhilosophyMeta: data.philosophyMeta || "",
        });
      } else if (type === "editSlide") {
        setFormData({
          slideTitle: data.slideTitle || "",
          slideDescription: data.slideDescription || "",
        });
      } else {
        setFormData(data);
      }
    } else {
      if (type === "addSlide") {
        setFormData({
          slideTitle: "",
          slideDescription: "",
        });
      } else {
        setFormData({});
      }
    }
  };

  const closeSlidePanel = () => {
    setSlidePanel({
      isOpen: false,
      type: "",
      data: null,
      title: "",
    });
    setFormData({});
    setSaving(false);
  };

  // Delete confirmation functions
  const openDeleteConfirmation = (type, id, itemName) => {
    setDeleteConfirmation({
      isOpen: true,
      type,
      id,
      itemName,
    });
  };

  const closeDeleteConfirmation = () => {
    setDeleteConfirmation({
      isOpen: false,
      type: "",
      id: null,
      itemName: "",
    });
  };

  const confirmDelete = async () => {
    const { type, id } = deleteConfirmation;

    if (type === "slide") {
      try {
        await axios.delete(
          `${Backend_Root_Url}/api/aboutslide/delete/slide/${id}`,
          {
            withCredentials: true,
          }
        );

        // Update local state
        setAboutData((prev) => ({
          ...prev,
          slides: prev.slides.filter((s) => s._id !== id),
        }));


      } catch (error) {
        console.error("Error deleting slide:", error);
        toast.error("Failed to delete slide. Please try again.");
      }
    }

    closeDeleteConfirmation();
  };

  // API operations
  const updateAboutData = async (data) => {
    try {
      const response = await axios.put(
        `${Backend_Root_Url}/api/about/edit/aboutdata`,
        data,
        {
          withCredentials: true,
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error updating about data:", error);
      throw error;
    }
  };

  const addSlide = async (slideData) => {
    try {
      const response = await axios.post(
        `${Backend_Root_Url}/api/aboutslide/add/slide`,
        {
          slideTitle: slideData.slideTitle,
          slideDescription: slideData.slideDescription,
        },
        { withCredentials: true }
      );
      return response.data;
    } catch (error) {
      console.error("Error adding slide:", error);
      throw error;
    }
  };

  const updateSlide = async (id, slideData) => {
    try {
      const response = await axios.put(
        `${Backend_Root_Url}/api/aboutslide/edit/slide/${id}`,
        {
          slideTitle: slideData.slideTitle,
          slideDescription: slideData.slideDescription,
        },
        { withCredentials: true }
      );
      return response.data;
    } catch (error) {
      console.error("Error updating slide:", error);
      throw error;
    }
  };

  // CRUD operations
  const handleSave = async () => {
    const { type, data } = slidePanel;
    setSaving(true);

    try {
      switch (type) {
        case "editAbout":
          const aboutDataToUpdate = {
            AboutUsTitle: formData.AboutUsTitle,
            AboutUsDescription: formData.AboutUsDescription,
            AboutSkills: formData.AboutSkills
              ? formData.AboutSkills.split(",")
                  .map((skill) => skill.trim())
                  .filter((skill) => skill)
              : [],
            AcademicTitle: formData.AcademicTitle,
            AcademicMeta: formData.AcademicMeta,
            AcademicDescription: formData.AcademicDescription,
            IdentityCard1Title: formData.IdentityCard1Title,
            IdentityCard1Subtitle: formData.IdentityCard1Subtitle,
            IdentityCard1Items: formData.IdentityCard1Items
              ? formData.IdentityCard1Items.split(",")
                  .map((item) => item.trim())
                  .filter((item) => item)
              : [],
            IdentityCard2Title: formData.IdentityCard2Title,
            IdentityCard2Subtitle: formData.IdentityCard2Subtitle,
            IdentityCard2Items: formData.IdentityCard2Items
              ? formData.IdentityCard2Items.split(",")
                  .map((item) => item.trim())
                  .filter((item) => item)
              : [],
            IdentityCard3Title: formData.IdentityCard3Title,
            IdentityCard3Subtitle: formData.IdentityCard3Subtitle,
            IdentityCard3Items: formData.IdentityCard3Items
              ? formData.IdentityCard3Items.split(",")
                  .map((item) => item.trim())
                  .filter((item) => item)
              : [],
            PhilosophyQuote: formData.PhilosophyQuote,
            PhilosophyMeta: formData.PhilosophyMeta,
          };

          await updateAboutData(aboutDataToUpdate);

          // Update local state
          setAboutData((prev) => ({
            ...prev,
            title: aboutDataToUpdate.AboutUsTitle,
            description: aboutDataToUpdate.AboutUsDescription,
            skills: aboutDataToUpdate.AboutSkills,
            academicTitle: aboutDataToUpdate.AcademicTitle,
            academicMeta: aboutDataToUpdate.AcademicMeta,
            academicDescription: aboutDataToUpdate.AcademicDescription,
            identityCard1Title: aboutDataToUpdate.IdentityCard1Title,
            identityCard1Subtitle: aboutDataToUpdate.IdentityCard1Subtitle,
            identityCard1Items: aboutDataToUpdate.IdentityCard1Items,
            identityCard2Title: aboutDataToUpdate.IdentityCard2Title,
            identityCard2Subtitle: aboutDataToUpdate.IdentityCard2Subtitle,
            identityCard2Items: aboutDataToUpdate.IdentityCard2Items,
            identityCard3Title: aboutDataToUpdate.IdentityCard3Title,
            identityCard3Subtitle: aboutDataToUpdate.IdentityCard3Subtitle,
            identityCard3Items: aboutDataToUpdate.IdentityCard3Items,
            philosophyQuote: aboutDataToUpdate.PhilosophyQuote,
            philosophyMeta: aboutDataToUpdate.PhilosophyMeta,
          }));

          toast.success("About data saved successfully");
          break;

        case "addSlide":
          if (!formData.slideTitle || !formData.slideDescription) {
            toast.error("Slide Title and Slide Description are required.");
            setSaving(false);
            return;
          }

          const newSlideData = {
            slideTitle: formData.slideTitle,
            slideDescription: formData.slideDescription,
          };

          await addSlide(newSlideData);

          // Refresh data from server to get the new slide with its MongoDB _id
          const response = await axios.get(
            `${Backend_Root_Url}/api/home/main/data`,
            { withCredentials: true }
          );
          const updatedData = response.data;
          // AboutUs is the populated object returned by ShowHomeData
          setAboutData((prev) => ({
            ...prev,
            slides: updatedData.AboutUs?.AboutUsSlides || [],
          }));

          toast.success("Slide added successfully");
          break;

        case "editSlide":
          const updatedSlideData = {
            slideTitle: formData.slideTitle,
            slideDescription: formData.slideDescription,
          };

          await updateSlide(data._id, updatedSlideData);

          setAboutData((prev) => ({
            ...prev,
            slides: prev.slides.map((s) =>
              s._id === data._id
                ? {
                    ...s,
                    slideTitle: updatedSlideData.slideTitle || s.slideTitle,
                    slideDescription:
                      updatedSlideData.slideDescription || s.slideDescription,
                  }
                : s
            ),
          }));

          toast.success("Slide updated successfully");
          break;
      }

      closeSlidePanel();
    } catch (error) {
      console.error("Error saving data:", error);
      toast.error("Failed to save data. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className={styles.aboutSection}>
        <div className={styles.loadingState}>
          <p>Loading about data...</p>
        </div>
      </div>
    );
  }

  // Render functions
  const renderDeleteConfirmation = () => {
    if (!deleteConfirmation.isOpen) return null;

    return (
      <div className={styles.overlay}>
        <div className={styles.modal}>
          <h3>Confirm Delete</h3>
          <p>
            Are you sure you want to delete "{deleteConfirmation.itemName}"?
            This action cannot be undone.
          </p>
          <div className={styles.modalActions}>
            <button
              className={styles.btnSecondary}
              onClick={closeDeleteConfirmation}
            >
              Cancel
            </button>
            {userRole === "admin" && (
            <button className={styles.btnDanger} onClick={confirmDelete}>
              Delete
            </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderSlidePanel = () => {
    if (!slidePanel.isOpen) return null;

    const { type, title } = slidePanel;

    return (
      <div className={styles.slidePanel}>
        <div className={styles.slidePanelHeader}>
          <h3>{title}</h3>
          <button className={styles.closeBtn} onClick={closeSlidePanel}>
            <X size={20} />
          </button>
        </div>

        <div className={styles.slidePanelContent}>
          {type === "editAbout" && (
            <div className={styles.form}>
              <div className={styles.formGroup}>
                <label>Title</label>
                <input
                  type="text"
                  value={formData.AboutUsTitle || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      AboutUsTitle: e.target.value,
                    }))
                  }
                  placeholder="Section title"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Description</label>
                <textarea
                  value={formData.AboutUsDescription || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      AboutUsDescription: e.target.value,
                    }))
                  }
                  placeholder="About section description"
                  rows={4}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Skills (comma separated)</label>
                <input
                  type="text"
                  value={formData.AboutSkills || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      AboutSkills: e.target.value,
                    }))
                  }
                  placeholder="e.g., React, Node.js, JavaScript"
                />
              </div>

              <h4 style={{ margin: "1rem 0 0.5rem", color: "var(--accent-primary)", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>Academic</h4>

              <div className={styles.formGroup}>
                <label>Academic Title</label>
                <input
                  type="text"
                  value={formData.AcademicTitle || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      AcademicTitle: e.target.value,
                    }))
                  }
                  placeholder="B.Sc. Computer Science &amp; AI"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Academic Meta</label>
                <input
                  type="text"
                  value={formData.AcademicMeta || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      AcademicMeta: e.target.value,
                    }))
                  }
                  placeholder="University · Senior Year (2026)"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Academic Description</label>
                <textarea
                  value={formData.AcademicDescription || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      AcademicDescription: e.target.value,
                    }))
                  }
                  placeholder="Specialising in algorithm design..."
                  rows={3}
                />
              </div>

              <h4 style={{ margin: "2rem 0 0.5rem", color: "var(--accent-primary)", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.08em", borderTop: "1px solid var(--border-color, rgba(255,255,255,0.08))", paddingTop: "1.5rem" }}>Engineering Identity — Card 1</h4>

              <div className={styles.formGroup}>
                <label>Card 1 Title</label>
                <input
                  type="text"
                  value={formData.IdentityCard1Title || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      IdentityCard1Title: e.target.value,
                    }))
                  }
                  placeholder="Competitive Programming"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Card 1 Subtitle</label>
                <input
                  type="text"
                  value={formData.IdentityCard1Subtitle || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      IdentityCard1Subtitle: e.target.value,
                    }))
                  }
                  placeholder="Core CS &amp; Algorithms"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Card 1 Items (comma separated)</label>
                <input
                  type="text"
                  value={formData.IdentityCard1Items || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      IdentityCard1Items: e.target.value,
                    }))
                  }
                  placeholder="Problem Solving (C++), Data Structures &amp; Algorithms"
                />
              </div>

              <h4 style={{ margin: "1.25rem 0 0.5rem", color: "var(--accent-primary)", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>Engineering Identity — Card 2</h4>

              <div className={styles.formGroup}>
                <label>Card 2 Title</label>
                <input
                  type="text"
                  value={formData.IdentityCard2Title || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      IdentityCard2Title: e.target.value,
                    }))
                  }
                  placeholder="Computer Vision &amp; Data"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Card 2 Subtitle</label>
                <input
                  type="text"
                  value={formData.IdentityCard2Subtitle || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      IdentityCard2Subtitle: e.target.value,
                    }))
                  }
                  placeholder="Image Processing &amp; Analysis"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Card 2 Items (comma separated)</label>
                <input
                  type="text"
                  value={formData.IdentityCard2Items || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      IdentityCard2Items: e.target.value,
                    }))
                  }
                  placeholder="OpenCV &amp; Python, Image Processing Pipelines"
                />
              </div>

              <h4 style={{ margin: "1.25rem 0 0.5rem", color: "var(--accent-primary)", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>Engineering Identity — Card 3</h4>

              <div className={styles.formGroup}>
                <label>Card 3 Title</label>
                <input
                  type="text"
                  value={formData.IdentityCard3Title || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      IdentityCard3Title: e.target.value,
                    }))
                  }
                  placeholder="3D &amp; Media Pipelines"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Card 3 Subtitle</label>
                <input
                  type="text"
                  value={formData.IdentityCard3Subtitle || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      IdentityCard3Subtitle: e.target.value,
                    }))
                  }
                  placeholder="Blender · Modeling · Rendering"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Card 3 Items (comma separated)</label>
                <input
                  type="text"
                  value={formData.IdentityCard3Items || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      IdentityCard3Items: e.target.value,
                    }))
                  }
                  placeholder="3D Modeling &amp; Sculpting, Rendering &amp; Compositing"
                />
              </div>

              <h4 style={{ margin: "1.25rem 0 0.5rem", color: "var(--accent-primary)", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>Philosophy</h4>

              <div className={styles.formGroup}>
                <label>Philosophy Quote</label>
                <textarea
                  value={formData.PhilosophyQuote || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      PhilosophyQuote: e.target.value,
                    }))
                  }
                  placeholder="I architect and build complete systems..."
                  rows={3}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Philosophy Meta</label>
                <input
                  type="text"
                  value={formData.PhilosophyMeta || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      PhilosophyMeta: e.target.value,
                    }))
                  }
                  placeholder="Full-stack development from schema to deployment"
                />
              </div>
            </div>
          )}

          {(type === "addSlide" || type === "editSlide") && (
            <div className={styles.form}>
              <div className={styles.formGroup}>
                <label>
                  Title{" "}
                  {type === "addSlide" && (
                    <span className={styles.required}>*Required</span>
                  )}
                </label>
                <input
                  type="text"
                  value={formData.slideTitle || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      slideTitle: e.target.value,
                    }))
                  }
                  placeholder="Slide title"
                  required={type === "addSlide"}
                />
              </div>

              <div className={styles.formGroup}>
                <label>
                  Description{" "}
                  {type === "addSlide" && (
                    <span className={styles.required}>*Required</span>
                  )}
                </label>
                <textarea
                  value={formData.slideDescription || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      slideDescription: e.target.value,
                    }))
                  }
                  placeholder="Slide description"
                  rows={3}
                  required={type === "addSlide"}
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
      </div>
    );
  };

  return (
    <div className={styles.aboutSection}>

      {/* ── Page Header ── */}
      <div className={styles.pageHeader}>
        <div>
          <h2 className={styles.pageTitle}>About Page</h2>
          <p className={styles.pageSubtitle}>Preview and manage all about section content</p>
        </div>
        <div className={styles.headerActions}>
          {error && <span className={styles.errorBadge}>{error}</span>}
          {userRole === "admin" && (
          <button
            className={styles.btnPrimary}
            onClick={() => openSlidePanel("editAbout", aboutData, "Edit About Section")}
          >
            <Edit3 size={15} />
            Edit About
          </button>
          )}
        </div>
      </div>

      {/* ── Content Grid ── */}
      <div className={styles.contentGrid}>

        {/* About Info */}
        <div className={styles.previewCard}>
          <div className={styles.previewCardLabel}>
            <span className={styles.labelDot} />
            About
          </div>
          <h3 className={styles.previewTitle}>{aboutData?.title || "—"}</h3>
          <p className={styles.previewDesc}>{aboutData?.description || "No description yet."}</p>
          {(aboutData?.skills || []).length > 0 && (
            <div className={styles.tagList}>
              {aboutData.skills.map((skill, i) => (
                <span key={i} className={styles.tag}>{skill}</span>
              ))}
            </div>
          )}
        </div>

        {/* Academic */}
        <div className={styles.previewCard}>
          <div className={styles.previewCardLabel}>
            <span className={styles.labelDot} />
            Academic
          </div>
          <h3 className={styles.previewTitle}>{aboutData?.academicTitle || "—"}</h3>
          <p className={styles.previewMeta}>{aboutData?.academicMeta || "—"}</p>
          <p className={styles.previewDesc}>{aboutData?.academicDescription || "No description yet."}</p>
        </div>

        {/* Engineering Identity */}
        <div className={`${styles.previewCard} ${styles.identityCard}`}>
          <div className={styles.previewCardLabel}>
            <span className={styles.labelDot} />
            Engineering Identity
          </div>
          <div className={styles.identityGrid}>
            {[
              { title: aboutData?.identityCard1Title, subtitle: aboutData?.identityCard1Subtitle, items: aboutData?.identityCard1Items },
              { title: aboutData?.identityCard2Title, subtitle: aboutData?.identityCard2Subtitle, items: aboutData?.identityCard2Items },
              { title: aboutData?.identityCard3Title, subtitle: aboutData?.identityCard3Subtitle, items: aboutData?.identityCard3Items },
            ].map((card, i) => (
              <div key={i} className={styles.identityCol}>
                <p className={styles.identityColTitle}>{card.title || `Card ${i + 1}`}</p>
                <p className={styles.identityColSub}>{card.subtitle || "—"}</p>
                {(card.items || []).length > 0 && (
                  <ul className={styles.identityList}>
                    {card.items.map((item, j) => (
                      <li key={j}>{item}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Philosophy */}
        <div className={styles.previewCard}>
          <div className={styles.previewCardLabel}>
            <span className={styles.labelDot} />
            Philosophy
          </div>
          <blockquote className={styles.philosophyQuote}>
            {aboutData?.philosophyQuote || "No quote yet."}
          </blockquote>
          <p className={styles.previewMeta}>{aboutData?.philosophyMeta || "—"}</p>
        </div>

      </div>

      {renderSlidePanel()}
      {renderDeleteConfirmation()}
    </div>
  );
};

export default DashboardAbout;
