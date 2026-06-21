import React, { useState, useEffect, useRef } from "react";
import styles from "./DashboardCategories.module.css";
import { verifyJWTToken } from "../utils/authUtils";
import { Plus, Edit3, Trash2, Save, X, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Backend_Root_Url } from "../../../config/AdminUrl.js";
import { motion, AnimatePresence } from "framer-motion";

const ICON_OPTIONS = [
  "Code2", "Server", "Database", "FileCode", "ScanSearch",
  "Brain", "Box", "Cloud", "Wrench", "Layers",
  "Globe", "Smartphone", "PenTool", "Figma", "Terminal",
  "Cpu", "GitBranch", "Container", "Atom", "Zap",
];

const DashboardCategories = ({ userRole }) => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isIconOpen, setIsIconOpen] = useState(false);
  const iconDropdownRef = useRef(null);

  const [slidePanel, setSlidePanel] = useState({ isOpen: false, type: "", data: null, title: "" });
  const [deleteConfirmation, setDeleteConfirmation] = useState({ isOpen: false, id: null, itemName: "" });
  const [formData, setFormData] = useState({});
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    const checkAuth = async () => {
      const { isAuthenticated } = await verifyJWTToken();
      if (!isAuthenticated) { window.location.href = "/denied"; return; }
      fetchCategories();
    };
    checkAuth();
  }, [navigate]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (iconDropdownRef.current && !iconDropdownRef.current.contains(e.target)) {
        setIsIconOpen(false);
      }
    };
    const handleEscape = (e) => { if (e.key === "Escape") setIsIconOpen(false); };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${Backend_Root_Url}/api/show/categories`, { withCredentials: true });
      setCategories(Array.isArray(res.data) ? res.data : []);
      setError("");
    } catch (err) {
      setError("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  const addCategory = async (data) => {
    try {
      await axios.post(`${Backend_Root_Url}/api/categories/add/category`, data, { withCredentials: true });
      await fetchCategories();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || "Failed to add category" };
    }
  };

  const editCategory = async (id, data) => {
    try {
      await axios.put(`${Backend_Root_Url}/api/categories/edit/category/${id}`, data, { withCredentials: true });
      await fetchCategories();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || "Failed to update category" };
    }
  };

  const deleteCategory = async (id) => {
    try {
      const res = await axios.delete(`${Backend_Root_Url}/api/categories/delete/category/${id}`, { withCredentials: true });
      await fetchCategories();
      return { success: true, message: res.data.message };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || "Failed to delete category" };
    }
  };

  const openSlidePanel = (type, data = null, title = "") => {
    setSlidePanel({ isOpen: true, type, data, title });
    setFormData(data ? { ...data } : { name: "", icon: "Code2", order: 0 });
    setValidationErrors({});
  };

  const closeSlidePanel = () => {
    setSlidePanel({ isOpen: false, type: "", data: null, title: "" });
    setFormData({});
    setValidationErrors({});
  };

  const openDeleteConfirmation = (id, itemName) => {
    setDeleteConfirmation({ isOpen: true, id, itemName });
  };
  const closeDeleteConfirmation = () => {
    setDeleteConfirmation({ isOpen: false, id: null, itemName: "" });
  };

  const confirmDelete = async () => {
    const result = await deleteCategory(deleteConfirmation.id);
    if (!result.success) {
      setError(result.error);
    }
    closeDeleteConfirmation();
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name || formData.name.trim() === "") errors.name = "Category name is required";
    if (!formData.icon) errors.icon = "Icon is required";
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    const { type, data } = slidePanel;
    let result;
    if (type === "addCategory") result = await addCategory(formData);
    else if (type === "editCategory") result = await editCategory(data._id, formData);
    if (result?.success) closeSlidePanel();
    else if (result?.error) setError(result.error);
  };

  const renderSlidePanel = () => {
    const { type, title } = slidePanel;
    return (
      <motion.div className={styles.slidePanel} initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 28, stiffness: 300 }}>
        <div className={styles.slidePanelHeader}>
          <h3>{title}</h3>
          <button className={styles.closeBtn} onClick={closeSlidePanel}><X size={20} /></button>
        </div>
        <div className={styles.slidePanelContent}>
          <div className={styles.form}>
            {error && <div className={styles.errorMessage}>{error}</div>}
            <div className={styles.formGroup}>
              <label>Category Name *</label>
              <input type="text" value={formData.name || ""} onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))} placeholder="e.g., Frontend" className={validationErrors.name ? styles.inputError : ""} />
              {validationErrors.name && <span className={styles.errorText}>{validationErrors.name}</span>}
            </div>
            <div className={styles.formGroup}>
              <label>Icon *</label>
              <div className={`${styles.customSelect} ${validationErrors.icon ? styles.inputError : ""}`} ref={iconDropdownRef}>
                <div className={styles.selectTrigger} onClick={() => setIsIconOpen((prev) => !prev)}>
                  <span className={formData.icon ? styles.selectValue : styles.selectPlaceholder}>
                    {formData.icon || "Select an icon"}
                  </span>
                  <ChevronDown size={16} className={`${styles.selectChevron} ${isIconOpen ? styles.selectChevronOpen : ""}`} />
                </div>
                {isIconOpen && (
                  <ul className={styles.selectMenu}>
                    {ICON_OPTIONS.map((icon) => (
                      <li key={icon} className={`${styles.selectOption} ${formData.icon === icon ? styles.selectOptionActive : ""}`} onClick={() => { setFormData((prev) => ({ ...prev, icon })); setIsIconOpen(false); }}>
                        {formData.icon === icon && <span className={styles.selectOptionCheckmark}>&#10003;</span>}
                        {icon}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              {validationErrors.icon && <span className={styles.errorText}>{validationErrors.icon}</span>}
            </div>
            <div className={styles.formGroup}>
              <label>Display Order</label>
              <input type="number" value={formData.order ?? 0} onChange={(e) => setFormData((prev) => ({ ...prev, order: parseInt(e.target.value) || 0 }))} placeholder="0" />
            </div>
          </div>
        </div>
        <div className={styles.slidePanelFooter}>
          <button className={styles.btnSecondary} onClick={closeSlidePanel}>Cancel</button>
          {userRole === "admin" && (
            <button className={styles.btnPrimary} onClick={handleSave}><Save size={16} /> Save Changes</button>
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
            {userRole === "admin" && <button className={styles.btnDanger} onClick={confirmDelete}>Delete</button>}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.categoriesSection}>
      <div className={styles.sectionHeader}>
        {userRole === "admin" && (
          <button className={styles.btnPrimary} onClick={() => openSlidePanel("addCategory", null, "Add New Category")}>
            <Plus size={16} /> Add Category
          </button>
        )}
      </div>

      {loading ? (
        <div className={styles.loadingMessage}>Loading categories...</div>
      ) : error && categories.length === 0 ? (
        <div className={styles.errorMessage}>
          {error}
          <button className={styles.btnSecondary} onClick={fetchCategories} style={{ marginLeft: "1rem" }}>Retry</button>
        </div>
      ) : categories.length === 0 ? (
        <div className={styles.emptyMessage}>No categories yet. Click "Add Category" to get started.</div>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Order</th>
                <th>Name</th>
                <th>Icon</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat._id}>
                  <td>{cat.order}</td>
                  <td className={styles.catName}>{cat.name}</td>
                  <td><code className={styles.iconBadge}>{cat.icon}</code></td>
                  <td>
                    <div className={styles.actionButtons}>
                      <button className={styles.iconBtn} onClick={() => openSlidePanel("editCategory", cat, "Edit Category")}><Edit3 size={14} /></button>
                      {userRole === "admin" && (
                        <button className={styles.iconBtn} onClick={() => openDeleteConfirmation(cat._id, cat.name)}><Trash2 size={14} /></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AnimatePresence>{slidePanel.isOpen && renderSlidePanel()}</AnimatePresence>
      {renderDeleteConfirmation()}
    </div>
  );
};

export default DashboardCategories;
