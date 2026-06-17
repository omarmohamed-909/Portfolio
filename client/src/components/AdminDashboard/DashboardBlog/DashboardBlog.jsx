import React, { useState, useEffect } from "react";
import styles from "./DashboardBlog.module.css";
import { verifyJWTToken } from "../utils/authUtils";
import { Plus, Edit3, Trash2, Save, X, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Backend_Root_Url } from "../../../config/AdminUrl.js";
import { motion, AnimatePresence } from "framer-motion";

const DashboardBlog = ({ userRole }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { isAuthenticated } = await verifyJWTToken();
      if (!isAuthenticated) {
        window.location.href = "/denied";
        return;
      }
      fetchPosts();
    };
    checkAuth();
  }, [navigate]);

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState({});
  const [slidePanel, setSlidePanel] = useState({ isOpen: false, type: "", data: null, title: "" });
  const [deleteConfirmation, setDeleteConfirmation] = useState({ isOpen: false, id: null, title: "" });
  const [formData, setFormData] = useState({});
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${Backend_Root_Url}/api/blog/all`, { withCredentials: true });
      setPosts(response.data);
      setError("");
    } catch (err) {
      setError("Failed to load posts.");
    } finally {
      setLoading(false);
    }
  };

  const openSlidePanel = (type, data = null, title = "") => {
    setSlidePanel({ isOpen: true, type, data, title });
    setImageFile(null);
    setImagePreview(null);
    if (data) {
      setFormData({
        Title: data.Title || "",
        Content: data.Content || "",
        Excerpt: data.Excerpt || "",
        Tags: Array.isArray(data.Tags) ? data.Tags.join(", ") : "",
        Author: data.Author || "Omar",
        Published: data.Published || false,
      });
      setImagePreview(data.CoverImage && data.CoverImage !== "Nothing" ? data.CoverImage : null);
    } else {
      setFormData({ Title: "", Content: "", Excerpt: "", Tags: "", Author: "Omar", Published: false });
    }
    setValidationErrors({});
  };

  const closeSlidePanel = () => {
    setSlidePanel({ isOpen: false, type: "", data: null, title: "" });
    setFormData({});
    setImageFile(null);
    setImagePreview(null);
    setValidationErrors({});
  };

  const openDeleteConfirmation = (id, title) => {
    setDeleteConfirmation({ isOpen: true, id, title });
  };

  const closeDeleteConfirmation = () => {
    setDeleteConfirmation({ isOpen: false, id: null, title: "" });
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.Title || formData.Title.trim().length < 3) errors.Title = "Title must be at least 3 characters";
    if (!formData.Content || formData.Content.trim().length < 10) errors.Content = "Content must be at least 10 characters";
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    const { type, data } = slidePanel;

    try {
      const fd = new FormData();
      fd.append("Title", formData.Title);
      fd.append("Content", formData.Content);
      fd.append("Excerpt", formData.Excerpt || "");
      fd.append("Tags", formData.Tags || "");
      fd.append("Author", formData.Author || "Omar");
      fd.append("Published", formData.Published ? "true" : "false");

      if (imageFile) fd.append("image", imageFile);

      const config = { withCredentials: true, headers: { "Content-Type": "multipart/form-data" } };
      const folder = "?folder=blogimg";

      if (type === "add") {
        await axios.post(`${Backend_Root_Url}/api/blog/add${folder}`, fd, config);
      } else if (type === "edit") {
        await axios.put(`${Backend_Root_Url}/api/blog/edit/${data._id}${folder}`, fd, config);
      }

      await fetchPosts();
      closeSlidePanel();
    } catch (err) {
      setError(err.response?.data?.message || "Operation failed");
    }
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`${Backend_Root_Url}/api/blog/delete/${deleteConfirmation.id}`, { withCredentials: true });
      await fetchPosts();
      closeDeleteConfirmation();
    } catch (err) {
      setError("Failed to delete post");
      closeDeleteConfirmation();
    }
  };

  const removeImage = async (postId) => {
    try {
      await axios.put(`${Backend_Root_Url}/api/blog/image/remove/${postId}`, {}, { withCredentials: true });
      await fetchPosts();
    } catch {
      setError("Failed to remove image");
    }
  };

  const renderDeleteConfirmation = () => {
    if (!deleteConfirmation.isOpen) return null;
    return (
      <div className={styles.overlay}>
        <div className={styles.modal}>
          <h3>Confirm Delete</h3>
          <p>Are you sure you want to delete "{deleteConfirmation.title}"?</p>
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

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  };

  const renderSlidePanel = () => {
    const { type, title } = slidePanel;
    return (
      <motion.div
        className={styles.slidePanel}
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 300 }}
      >
        <div className={styles.slidePanelHeader}>
          <h3>{title}</h3>
          <button className={styles.closeBtn} onClick={closeSlidePanel}><X size={20} /></button>
        </div>
        <div className={styles.slidePanelContent}>
          {error && <div className={styles.errorMessage}>{error}</div>}

          <div className={styles.formGroup}>
            <label>Title *</label>
            <input
              type="text"
              value={formData.Title || ""}
              onChange={(e) => setFormData((p) => ({ ...p, Title: e.target.value }))}
              placeholder="Post title"
              className={validationErrors.Title ? styles.inputError : ""}
            />
            {validationErrors.Title && <span className={styles.errorText}>{validationErrors.Title}</span>}
          </div>

          <div className={styles.formGroup}>
            <label>Content *</label>
            <textarea
              value={formData.Content || ""}
              onChange={(e) => setFormData((p) => ({ ...p, Content: e.target.value }))}
              placeholder="Write your post content here..."
              rows={10}
              className={validationErrors.Content ? styles.inputError : ""}
            />
            {validationErrors.Content && <span className={styles.errorText}>{validationErrors.Content}</span>}
          </div>

          <div className={styles.formGroup}>
            <label>Excerpt</label>
            <textarea
              value={formData.Excerpt || ""}
              onChange={(e) => setFormData((p) => ({ ...p, Excerpt: e.target.value }))}
              placeholder="Short summary (optional)"
              rows={2}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Tags (comma separated)</label>
            <input
              type="text"
              value={formData.Tags || ""}
              onChange={(e) => setFormData((p) => ({ ...p, Tags: e.target.value }))}
              placeholder="e.g. React, TypeScript, Performance"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Author</label>
            <input
              type="text"
              value={formData.Author || "Omar"}
              onChange={(e) => setFormData((p) => ({ ...p, Author: e.target.value }))}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={formData.Published || false}
                onChange={(e) => setFormData((p) => ({ ...p, Published: e.target.checked }))}
              />
              Published
            </label>
          </div>

          <div className={styles.formGroup}>
            <label>Cover Image</label>
            <input type="file" accept="image/*" onChange={handleImageChange} />
            {imagePreview && (
              <div className={styles.imagePreview}>
                <img src={imagePreview} alt="Cover preview" />
                {userRole === "admin" && (
                <button
                  type="button"
                  className={styles.removeImageBtn}
                  onClick={() => { setImageFile(null); setImagePreview(null); }}
                >
                  <X size={14} />
                </button>
                )}
              </div>
            )}
            {type === "edit" && !imageFile && imagePreview && userRole === "admin" && (
              <button
                type="button"
                className={styles.btnSecondary}
                onClick={() => removeImage(slidePanel.data._id)}
                style={{ marginTop: "0.5rem" }}
              >
                Remove current image
              </button>
            )}
          </div>
        </div>
        <div className={styles.slidePanelFooter}>
          <button className={styles.btnSecondary} onClick={closeSlidePanel}>Cancel</button>
          {userRole === "admin" && (
          <button className={styles.btnPrimary} onClick={handleSave}><Save size={16} /> Save</button>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <div className={styles.blogSection}>
      <div className={styles.sectionHeader}>
        {userRole === "admin" && (
        <button className={styles.btnPrimary} onClick={() => openSlidePanel("add", null, "New Blog Post")}>
          <Plus size={16} /> New Post
        </button>
        )}
      </div>

      {loading ? (
        <div className={styles.loadingMessage}>Loading posts...</div>
      ) : error && posts.length === 0 ? (
        <div className={styles.errorMessage}>
          {error}
          <button className={styles.btnSecondary} onClick={fetchPosts} style={{ marginLeft: "1rem" }}>Retry</button>
        </div>
      ) : posts.length === 0 ? (
        <div className={styles.emptyMessage}>No posts yet. Click "New Post" to create one.</div>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Title</th>
                <th>Status</th>
                <th>Tags</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post._id}>
                  <td className={styles.titleCell}>
                    <span className={styles.postTitle}>{post.Title}</span>
                    {post.Slug && <span className={styles.postSlug}>/{post.Slug}</span>}
                  </td>
                  <td>
                    <span className={`${styles.statusBadge} ${post.Published ? styles.statusPublished : styles.statusDraft}`}>
                      {post.Published ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td>
                    <div className={styles.tagList}>
                      {(post.Tags || []).slice(0, 3).map((t, i) => (
                        <span key={i} className={styles.tag}>{t}</span>
                      ))}
                      {(post.Tags || []).length > 3 && <span className={styles.tagMore}>+{post.Tags.length - 3}</span>}
                    </div>
                  </td>
                  <td className={styles.dateCell}>{formatDate(post.createdAt)}</td>
                  <td>
                    <div className={styles.actionButtons}>
                      {userRole === "admin" && (
                      <button
                        className={styles.iconBtn}
                        onClick={() => openSlidePanel("edit", post, "Edit Post")}
                        title="Edit"
                      >
                        <Edit3 size={14} />
                      </button>
                      )}
                      {userRole === "admin" && (
                      <button
                        className={styles.iconBtn}
                        onClick={() => openDeleteConfirmation(post._id, post.Title)}
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
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

export default DashboardBlog;
