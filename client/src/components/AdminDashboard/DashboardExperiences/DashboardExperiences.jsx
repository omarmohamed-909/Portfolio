import React, { useState, useEffect } from "react";
import styles from "./DashboardExperiences.module.css";
import { verifyJWTToken } from "../utils/authUtils";
import { Plus, Edit3, Trash2, Save, X, Briefcase } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Backend_Root_Url } from "../../../config/AdminUrl.js";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

const DashboardExperiences = ({ userRole }) => {
  const navigate = useNavigate();
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [slidePanel, setSlidePanel] = useState({
    isOpen: false,
    mode: "add",
    item: null,
  });
  const [formData, setFormData] = useState({
    Company: "",
    Role: "",
    StartDate: "",
    EndDate: "",
    Description: "",
    Technologies: "",
    DisplayOrder: 0,
  });
  const [deleteConfirmation, setDeleteConfirmation] = useState({
    isOpen: false,
    itemId: null,
    itemName: "",
  });

  useEffect(() => {
    const checkAuth = async () => {
      const { isAuthenticated } = await verifyJWTToken();
      if (!isAuthenticated) {
        window.location.href = "/denied";
        return;
      }
      fetchExperiences();
    };
    checkAuth();
  }, [navigate]);

  const fetchExperiences = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${Backend_Root_Url}/api/show/experiences`, {
        withCredentials: true,
      });
      const data = Array.isArray(response.data) ? response.data : [];
      setExperiences(data);
      setError(null);
    } catch (err) {
      setError("Failed to load experiences");
    } finally {
      setLoading(false);
    }
  };

  const openAddPanel = () => {
    setFormData({
      Company: "",
      Role: "",
      StartDate: "",
      EndDate: "",
      Description: "",
      Technologies: "",
      DisplayOrder: experiences.length,
    });
    setSlidePanel({ isOpen: true, mode: "add", item: null });
  };

  const openEditPanel = (item) => {
    setFormData({
      Company: item.Company || "",
      Role: item.Role || "",
      StartDate: item.StartDate || "",
      EndDate: item.EndDate || "",
      Description: item.Description || "",
      Technologies: (item.Technologies || []).join(", "),
      DisplayOrder: item.DisplayOrder || 0,
    });
    setSlidePanel({ isOpen: true, mode: "edit", item });
  };

  const closeSlidePanel = () => {
    setSlidePanel({ isOpen: false, mode: "add", item: null });
  };

  const handleSave = async () => {
    if (!formData.Company.trim() || !formData.Role.trim() || !formData.StartDate.trim()) {
      toast.error("Company, Role, and Start Date are required");
      return;
    }

    const payload = {
      ...formData,
      Technologies: formData.Technologies ? formData.Technologies.split(",").map((t) => t.trim()).filter(Boolean) : [],
    };

    try {
      if (slidePanel.mode === "add") {
        await axios.post(`${Backend_Root_Url}/api/experience/add`, payload, {
          withCredentials: true,
        });
        toast.success("Experience added successfully");
      } else {
        await axios.put(`${Backend_Root_Url}/api/experience/edit/${slidePanel.item._id}`, payload, {
          withCredentials: true,
        });
        toast.success("Experience updated successfully");
      }
      closeSlidePanel();
      fetchExperiences();
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    }
  };

  const openDeleteConfirmation = (id, name) => {
    setDeleteConfirmation({ isOpen: true, itemId: id, itemName: name });
  };

  const closeDeleteConfirmation = () => {
    setDeleteConfirmation({ isOpen: false, itemId: null, itemName: "" });
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`${Backend_Root_Url}/api/experience/delete/${deleteConfirmation.itemId}`, {
        withCredentials: true,
      });
      toast.success("Experience deleted successfully");
      closeDeleteConfirmation();
      fetchExperiences();
    } catch (err) {
      toast.error("Failed to delete experience");
    }
  };

  const renderSlidePanel = () => {
    return (
      <motion.div
        className={styles.slidePanel}
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 300 }}
      >
        <div className={styles.slidePanelHeader}>
          <h3>{slidePanel.mode === "add" ? "Add Experience" : "Edit Experience"}</h3>
          <button className={styles.btnIcon} onClick={closeSlidePanel}>
            <X size={18} />
          </button>
        </div>

        <div className={styles.slidePanelContent}>
          <div className={styles.form}>
            <div className={styles.formGroup}>
              <label>Company *</label>
              <input
                type="text"
                value={formData.Company}
                onChange={(e) => setFormData((p) => ({ ...p, Company: e.target.value }))}
                placeholder="e.g., Tech Corp"
              />
            </div>

            <div className={styles.formGroup}>
              <label>Role *</label>
              <input
                type="text"
                value={formData.Role}
                onChange={(e) => setFormData((p) => ({ ...p, Role: e.target.value }))}
                placeholder="e.g., Senior Full-Stack Developer"
              />
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Start Date *</label>
                <input
                  type="text"
                  value={formData.StartDate}
                  onChange={(e) => setFormData((p) => ({ ...p, StartDate: e.target.value }))}
                  placeholder="e.g., Jan 2022"
                />
              </div>
              <div className={styles.formGroup}>
                <label>End Date</label>
                <input
                  type="text"
                  value={formData.EndDate}
                  onChange={(e) => setFormData((p) => ({ ...p, EndDate: e.target.value }))}
                  placeholder="e.g., Dec 2024 or Present"
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label>Description</label>
              <textarea
                value={formData.Description}
                onChange={(e) => setFormData((p) => ({ ...p, Description: e.target.value }))}
                placeholder="Describe your responsibilities and achievements"
                rows={4}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Technologies (comma separated)</label>
              <input
                type="text"
                value={formData.Technologies}
                onChange={(e) => setFormData((p) => ({ ...p, Technologies: e.target.value }))}
                placeholder="e.g., React, Node.js, MongoDB"
              />
            </div>

            <div className={styles.formGroup}>
              <label>Display Order</label>
              <input
                type="number"
                value={formData.DisplayOrder}
                onChange={(e) => setFormData((p) => ({ ...p, DisplayOrder: Number(e.target.value) }))}
              />
            </div>
          </div>
        </div>

        <div className={styles.slidePanelFooter}>
          <button className={styles.btnSecondary} onClick={closeSlidePanel}>Cancel</button>
          {userRole === "admin" && (
          <button className={styles.btnPrimary} onClick={handleSave}>
            <Save size={16} />
            Save
          </button>
          )}
        </div>
      </motion.div>
    );
  };

  const renderDeleteConfirmation = () => {
    if (!deleteConfirmation.isOpen) return null;
    return (
      <div className={styles.overlay}>
        <div className={styles.modal}>
          <h3>Confirm Delete</h3>
          <p>Are you sure you want to delete "{deleteConfirmation.itemName}"? This action cannot be undone.</p>
          <div className={styles.modalActions}>
            <button className={styles.btnSecondary} onClick={closeDeleteConfirmation}>Cancel</button>
            {userRole === "admin" && (
            <button className={styles.btnDanger} onClick={confirmDelete}>Delete</button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.experiencesSection}>
      <div className={styles.sectionHeader}>
        {userRole === "admin" && (
        <button className={styles.btnPrimary} onClick={openAddPanel}>
          <Plus size={16} />
          Add Experience
        </button>
        )}
      </div>

      {loading ? (
        <div className={styles.loadingMessage}>Loading experiences...</div>
      ) : error ? (
        <div className={styles.errorMessage}>{error}</div>
      ) : experiences.length === 0 ? (
        <div className={styles.emptyMessage}>No experiences added yet.</div>
      ) : (
        <div className={styles.experiencesList}>
          {experiences.map((exp) => (
            <div key={exp._id} className={styles.experienceCard}>
              <div className={styles.expIcon}>
                <Briefcase size={20} />
              </div>
              <div className={styles.expBody}>
                <div className={styles.expHeader}>
                  <h4 className={styles.expCompany}>{exp.Company}</h4>
                  <span className={styles.expDate}>
                    {exp.StartDate} — {exp.EndDate || "Present"}
                  </span>
                </div>
                <p className={styles.expRole}>{exp.Role}</p>
                {exp.Description && <p className={styles.expDesc}>{exp.Description}</p>}
                {exp.Technologies?.length > 0 && (
                  <div className={styles.expTech}>
                    {exp.Technologies.map((tech, i) => (
                      <span key={i} className={styles.techTag}>{tech}</span>
                    ))}
                  </div>
                )}
              </div>
              <div className={styles.expActions}>
                {userRole === "admin" && (
                <button className={styles.iconBtn} onClick={() => openEditPanel(exp)} title="Edit">
                  <Edit3 size={15} />
                </button>
                )}
                {userRole === "admin" && (
                <button className={styles.iconBtnDanger} onClick={() => openDeleteConfirmation(exp._id, exp.Company)} title="Delete">
                  <Trash2 size={15} />
                </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {slidePanel.isOpen && renderSlidePanel()}
      </AnimatePresence>
      {renderDeleteConfirmation()}
    </div>
  );
};

export default DashboardExperiences;
