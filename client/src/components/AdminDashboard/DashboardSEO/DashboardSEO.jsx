import React, { useState, useEffect, useRef } from "react";
import styles from "./DashboardSEO.module.css";
import { Save, X, Globe, Search, Share2, Twitter, Tag, ImageUp, Trash2, Loader } from "lucide-react";
import axios from "axios";
import { Backend_Root_Url } from "../../../config/AdminUrl.js";
import { toast } from "sonner";

const DashboardSEO = ({ userRole }) => {
  const [seoData, setSeoData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const [selectedPage, setSelectedPage] = useState("static");

  const [formData, setFormData] = useState({
    static: {
      Author: "",
      WebsiteName: "",
      WebLogo: "",
      LangCode: "",
      Lang: "",
      CountryCode: "",
      City: "",
      Geographic: "",
      ICBM: "",
    },
    pages: {
      home: { Page: "home", Title: "", Description: "", Keywords: [], SocialTitle: "", SocialDescription: "", PageUrl: "", SocialImage: "", TwitterTitle: "", TwitterDescription: "", TwitterImage: "" },
      projects: { Page: "projects", Title: "", Description: "", Keywords: [], SocialTitle: "", SocialDescription: "", PageUrl: "", SocialImage: "", TwitterTitle: "", TwitterDescription: "", TwitterImage: "" },
      skills: { Page: "skills", Title: "", Description: "", Keywords: [], SocialTitle: "", SocialDescription: "", PageUrl: "", SocialImage: "", TwitterTitle: "", TwitterDescription: "", TwitterImage: "" },
      cv: { Page: "cv", Title: "", Description: "", Keywords: [], SocialTitle: "", SocialDescription: "", PageUrl: "", SocialImage: "", TwitterTitle: "", TwitterDescription: "", TwitterImage: "" },
      about: { Page: "about", Title: "", Description: "", Keywords: [], SocialTitle: "", SocialDescription: "", PageUrl: "", SocialImage: "", TwitterTitle: "", TwitterDescription: "", TwitterImage: "" },
      contact: { Page: "contact", Title: "", Description: "", Keywords: [], SocialTitle: "", SocialDescription: "", PageUrl: "", SocialImage: "", TwitterTitle: "", TwitterDescription: "", TwitterImage: "" },
    },
  });

  const [validationErrors, setValidationErrors] = useState({});

  const [message, setMessage] = useState({ type: "", text: "", visible: false });
  const [uploadingField, setUploadingField] = useState(null);
  const [dragOverField, setDragOverField] = useState(null);
  const fileInputRef = useRef(null);

  const pageOptions = [
    { value: "static", label: "Static Info", icon: Globe },
    { value: "home", label: "Home Page", icon: Search },
    { value: "projects", label: "Projects", icon: Search },
    { value: "skills", label: "Skills", icon: Search },
    { value: "cv", label: "Full CV", icon: Search },
    { value: "about", label: "About", icon: Search },
    { value: "contact", label: "Contact", icon: Search },
  ];

  const showMessage = (type, text) => {
    setMessage({ type, text, visible: true });
    setTimeout(() => setMessage({ type: "", text: "", visible: false }), 5000);
  };

  useEffect(() => {
    const fetchSeoData = async () => {
      try {
        setLoading(true);
        setError(null);
        const staticResponse = await axios.get(`${Backend_Root_Url}/api/seo/static`, { withCredentials: true });
        const pagePromises = Object.keys(formData.pages).map(async (page) => {
          try {
            const response = await axios.get(`${Backend_Root_Url}/api/seo/${page}`, { withCredentials: true });
            return { page, data: response.data };
          } catch { return { page, data: formData.pages[page] }; }
        });
        const pageResults = await Promise.all(pagePromises);
        const updatedFormData = {
          static: {
            Author: staticResponse.data.Author || "",
            WebsiteName: staticResponse.data.WebsiteName || "",
            WebLogo: staticResponse.data.WebLogo || "",
            LangCode: staticResponse.data.LangCode || "",
            Lang: staticResponse.data.Lang || "",
            CountryCode: staticResponse.data.CountryCode || "",
            City: staticResponse.data.City || "",
            Geographic: staticResponse.data.Geographic || "",
            ICBM: staticResponse.data.ICBM || "",
          },
          pages: {},
        };
        pageResults.forEach(({ page, data }) => {
          updatedFormData.pages[page] = {
            Page: data.Page || page,
            Title: data.Title || "",
            Description: data.Description || "",
            Keywords: Array.isArray(data.Keywords) ? data.Keywords : [],
            SocialTitle: data.SocialTitle || "",
            SocialDescription: data.SocialDescription || "",
            PageUrl: data.PageUrl || "",
            SocialImage: data.SocialImage || "",
            TwitterTitle: data.TwitterTitle || "",
            TwitterDescription: data.TwitterDescription || "",
            TwitterImage: data.TwitterImage || "",
          };
        });
        setFormData(updatedFormData);
        setSeoData(updatedFormData);
      } catch (error) {
        console.error("Error fetching SEO data:", error);
        setError("Failed to fetch SEO data. Please check your connection.");
        setSeoData(formData);
      } finally { setLoading(false); }
    };
    fetchSeoData();
  }, []);

  const validateLanguageCode = (lang) => {
    if (!lang || lang.trim() === "") return true;
    return /^[a-z]{2}$/i.test(lang);
  };

  const validateGeoPosition = (position) => {
    if (!position || position.trim() === "") return true;
    return /^-?\d+\.?\d*;-?\d+\.?\d*$/.test(position);
  };

  const validateICBM = (icbm) => {
    if (!icbm || icbm.trim() === "") return true;
    return /^-?\d+\.?\d*,\s*-?\d+\.?\d*$/.test(icbm);
  };

  const validateUrl = (url) => {
    if (!url || url.trim() === "") return true;
    try { new URL(url); return true; }
    catch { return false; }
  };

  const handleInputChange = (section, field, value) => {
    setFormData((prev) => ({ ...prev, [section]: { ...prev[section], [field]: value } }));
    if (validationErrors[`${section}.${field}`]) {
      setValidationErrors((prev) => { const n = { ...prev }; delete n[`${section}.${field}`]; return n; });
    }
  };

  const handlePageInputChange = (page, field, value) => {
    if (field === "Keywords") {
      setFormData((prev) => ({
        ...prev, pages: { ...prev.pages, [page]: { ...prev.pages[page], KeywordsString: value, Keywords: value ? value.split(",").map(k => k.trim()).filter(k => k.length > 0) : [] } }
      }));
    } else {
      setFormData((prev) => ({ ...prev, pages: { ...prev.pages, [page]: { ...prev.pages[page], [field]: value } } }));
    }
    if (validationErrors[`pages.${page}.${field}`]) {
      setValidationErrors((prev) => { const n = { ...prev }; delete n[`pages.${page}.${field}`]; return n; });
    }
  };

  const validateForm = () => {
    const errors = {};
    if (formData.static.LangCode && !validateLanguageCode(formData.static.LangCode))
      errors["static.LangCode"] = "Language code must be 2 letters (e.g., en, fr, ar)";
    if (formData.static.Geographic && !validateGeoPosition(formData.static.Geographic))
      errors["static.Geographic"] = "Position must be latitude;longitude (e.g., 40.7128;-74.0060)";
    if (formData.static.ICBM && !validateICBM(formData.static.ICBM))
      errors["static.ICBM"] = "ICBM must be latitude, longitude (e.g., 40.7128, -74.0060)";
    if (formData.static.WebLogo && !validateUrl(formData.static.WebLogo))
      errors["static.WebLogo"] = "Please enter a valid image URL";
    Object.keys(formData.pages).forEach((page) => {
      const d = formData.pages[page];
      const pageLabel = page.charAt(0).toUpperCase() + page.slice(1);
      if (d.PageUrl && !validateUrl(d.PageUrl))
        errors[`pages.${page}.PageUrl`] = `${pageLabel}: Please enter a valid URL`;
      if (d.SocialImage && !validateUrl(d.SocialImage))
        errors[`pages.${page}.SocialImage`] = `${pageLabel}: Please enter a valid image URL`;
      if (d.TwitterImage && !validateUrl(d.TwitterImage))
        errors[`pages.${page}.TwitterImage`] = `${pageLabel}: Please enter a valid image URL`;
    });
    setValidationErrors(errors);
    if (Object.keys(errors).length > 0) {
      const pageErrors = Object.keys(errors).filter(k => k.startsWith("pages."));
      const staticErrors = Object.keys(errors).filter(k => k.startsWith("static."));
      let msg = "Please fix the following errors: ";
      if (staticErrors.length > 0) msg += "Static Info fields are invalid. ";
      if (pageErrors.length > 0) {
        const affectedPages = [...new Set(pageErrors.map(k => k.split(".")[1]))];
        msg += `Issues on: ${affectedPages.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(", ")} page(s).`;
      }
      showMessage("error", msg);
      return false;
    }
    return true;
  };

  const handleImageUpload = async (page, field, file) => {
    if (!file || !file.type.startsWith("image/")) {
      toast.error("Please upload only image files");
      return;
    }
    setUploadingField(`${page}-${field}`);
    try {
      const formData = new FormData();
      formData.append("ogImage", file);
      const res = await axios.post(`${Backend_Root_Url}/api/upload/seo/image`, formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });
      const imageUrl = res.data.url;
      handlePageInputChange(page, field, imageUrl);
      toast.success("Image uploaded successfully");
    } catch {
      toast.error("Failed to upload image");
    } finally {
      setUploadingField(null);
    }
  };

  const handleImageFileSelect = (page, field) => (e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(page, field, file);
    }
    e.target.value = "";
  };

  const handleDrop = (page, field) => (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverField(null);
    const file = e.dataTransfer?.files?.[0];
    if (file) {
      handleImageUpload(page, field, file);
    }
  };

  const handleDragOver = (page, field) => (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverField(`${page}-${field}`);
  };

  const handleDragLeave = (page, field) => (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverField(null);
  };

  const clearSeoImage = (page, field, currentUrl) => async () => {
    if (currentUrl) {
      try {
        await axios.delete(`${Backend_Root_Url}/api/delete/seo/image`, {
          data: { url: currentUrl },
          withCredentials: true,
        });
      } catch {
        // ignore cloudinary delete failure
      }
    }
    handlePageInputChange(page, field, "");
    toast.success("Image removed");
  };

  const renderImageField = (page, field, label, hint) => {
    const pageData = formData.pages[page];
    const value = pageData[field] || "";
    const isUploading = uploadingField === `${page}-${field}`;
    const isDragOver = dragOverField === `${page}-${field}`;

    return (
      <div className={styles.formGroup}>
        <label>{label}</label>
        <div
          className={`${styles.imageUploadWrapper} ${isDragOver ? styles.dragOver : ""}`}
          onDrop={handleDrop(page, field)}
          onDragOver={handleDragOver(page, field)}
          onDragLeave={handleDragLeave(page, field)}
        >
          {value ? (
            <div className={styles.imagePreviewRow}>
              <img
                src={value}
                alt={label}
                className={styles.imagePreview}
                onError={(e) => { e.target.style.display = "none"; }}
              />
              <div className={styles.imagePreviewActions}>
                {userRole === "admin" && (
                <button
                  type="button"
                  className={styles.imageActionBtn}
                  onClick={() => fileInputRef.current?.click()}
                  title="Replace image"
                >
                  <ImageUp size={16} />
                </button>
                )}
                {userRole === "admin" && (
                <button
                  type="button"
                  className={`${styles.imageActionBtn} ${styles.imageActionBtnDanger}`}
                  onClick={clearSeoImage(page, field, value)}
                  title="Remove image"
                >
                  <Trash2 size={16} />
                </button>
                )}
              </div>
            </div>
          ) : userRole === "admin" && (
            <div
              className={styles.uploadPlaceholder}
              onClick={() => fileInputRef.current?.click()}
            >
              {isUploading ? (
                <Loader size={20} className={styles.spinnerIcon} />
              ) : (
                <ImageUp size={20} />
              )}
              <span>{isUploading ? "Uploading..." : "Click or drag to upload"}</span>
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            className={styles.fileInputHidden}
            ref={fileInputRef}
            onChange={handleImageFileSelect(page, field)}
          />
        </div>
        <div className={styles.imageUrlRow}>
          <input
            type="url"
            value={value}
            onChange={(e) => handlePageInputChange(page, field, e.target.value)}
            placeholder="https://yourwebsite.com/image.jpg"
            className={validationErrors[`pages.${page}.${field}`] ? styles.error : ""}
          />
          {validationErrors[`pages.${page}.${field}`] && (
            <span className={styles.errorText}>{validationErrors[`pages.${page}.${field}`]}</span>
          )}
        </div>
        <small>{hint}</small>
      </div>
    );
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    setSaving(true);
    const results = { static: { success: false, error: null }, pages: {} };
    try {
      await axios.put(`${Backend_Root_Url}/api/edit/static/seo`, formData.static, { withCredentials: true });
      results.static.success = true;
    } catch (error) { results.static.error = error.response?.data?.message || "Failed to save static info"; }
    for (const page of Object.keys(formData.pages)) {
      try {
        const d = formData.pages[page];
        await axios.put(`${Backend_Root_Url}/api/edit/seo/${page}`, {
          Title: d.Title, Description: d.Description, Keywords: d.Keywords,
          SocialTitle: d.SocialTitle, SocialDescription: d.SocialDescription,
          PageUrl: d.PageUrl, SocialImage: d.SocialImage,
          TwitterTitle: d.TwitterTitle, TwitterDescription: d.TwitterDescription, TwitterImage: d.TwitterImage,
        }, { withCredentials: true });
        results.pages[page] = { success: true, error: null };
      } catch (error) { results.pages[page] = { success: false, error: error.response?.data?.message || `Failed to save ${page} page SEO` }; }
    }
    const saved = [], failed = [];
    if (results.static.success) saved.push("Static Info");
    else if (results.static.error) failed.push("Static Info");
    Object.keys(results.pages).forEach(p => {
      const label = p.charAt(0).toUpperCase() + p.slice(1) + " Page";
      if (results.pages[p].success) saved.push(label);
      else if (results.pages[p].error) failed.push(label);
    });
    if (saved.length > 0 && failed.length === 0) showMessage("success", `Saved: ${saved.join(", ")}`);
    else if (saved.length > 0) showMessage("warning", `Saved: ${saved.join(", ")} | Failed: ${failed.join(", ")}`);
    else if (failed.length > 0) showMessage("error", `Failed: ${failed.join(", ")}`);
    else showMessage("warning", "No changes were saved");
    setSaving(false);
  };

  if (loading) {
    return (
      <div className={styles.seoSection}>
        <div className={styles.loadingState}>
          <div className={styles.spinner} />
          <p>Loading SEO data...</p>
        </div>
      </div>
    );
  }

  const renderStaticForm = () => (
    <div className={styles.form}>
      <div className={styles.formSection}>
        <h4><Globe size={18} /> Website Information</h4>
        <div className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label>Author</label>
            <input type="text" value={formData.static.Author} onChange={e => handleInputChange("static", "Author", e.target.value)} placeholder="Your name or brand" />
            <small>Your name or brand name used across all pages.</small>
          </div>
          <div className={styles.formGroup}>
            <label>Website Name</label>
            <input type="text" value={formData.static.WebsiteName} onChange={e => handleInputChange("static", "WebsiteName", e.target.value)} placeholder="Your Website Name" />
            <small>Name of your website or brand.</small>
          </div>
          <div className={styles.formGroup}>
            <label>Website Logo (Tab Icon)</label>
            <input type="url" value={formData.static.WebLogo} onChange={e => handleInputChange("static", "WebLogo", e.target.value)} placeholder="https://yourwebsite.com/logo.png" className={validationErrors["static.WebLogo"] ? styles.error : ""} />
            {validationErrors["static.WebLogo"] && <span className={styles.errorText}>{validationErrors["static.WebLogo"]}</span>}
            <small>Direct image URL for favicon (.png, .jpg, .ico recommended).</small>
          </div>
          <div className={styles.formGroup}>
            <label>Language Code</label>
            <input type="text" value={formData.static.LangCode} onChange={e => handleInputChange("static", "LangCode", e.target.value)} placeholder="en, fr, ar, etc." maxLength={2} className={validationErrors["static.LangCode"] ? styles.error : ""} />
            {validationErrors["static.LangCode"] && <span className={styles.errorText}>{validationErrors["static.LangCode"]}</span>}
            <small>2-letter language code (e.g., en, fr).</small>
          </div>
          <div className={styles.formGroup}>
            <label>Language Name</label>
            <input type="text" value={formData.static.Lang} onChange={e => handleInputChange("static", "Lang", e.target.value)} placeholder="English, French, Arabic, etc." />
            <small>Full language name for search engines.</small>
          </div>
          <div className={styles.formGroup}>
            <label>Country Code</label>
            <input type="text" value={formData.static.CountryCode} onChange={e => handleInputChange("static", "CountryCode", e.target.value)} placeholder="US, FR, TN, etc." />
            <small>2-letter country code.</small>
          </div>
          <div className={styles.formGroup}>
            <label>City</label>
            <input type="text" value={formData.static.City} onChange={e => handleInputChange("static", "City", e.target.value)} placeholder="New York, Paris, Egypt, etc." />
            <small>City or location name.</small>
          </div>
          <div className={styles.formGroup}>
            <label>Geographic Position</label>
            <input type="text" value={formData.static.Geographic} onChange={e => handleInputChange("static", "Geographic", e.target.value)} placeholder="40.7128;-74.0060" className={validationErrors["static.Geographic"] ? styles.error : ""} />
            {validationErrors["static.Geographic"] && <span className={styles.errorText}>{validationErrors["static.Geographic"]}</span>}
            <small>Latitude;Longitude format (use semicolon).</small>
          </div>
          <div className={styles.formGroup}>
            <label>ICBM Coordinates</label>
            <input type="text" value={formData.static.ICBM} onChange={e => handleInputChange("static", "ICBM", e.target.value)} placeholder="40.7128, -74.0060" className={validationErrors["static.ICBM"] ? styles.error : ""} />
            {validationErrors["static.ICBM"] && <span className={styles.errorText}>{validationErrors["static.ICBM"]}</span>}
            <small>Latitude, Longitude format (use comma and space).</small>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPageForm = (page) => {
    const pageData = formData.pages[page];
    const keywordsString = pageData.KeywordsString !== undefined ? pageData.KeywordsString : Array.isArray(pageData.Keywords) ? pageData.Keywords.join(", ") : "";
    return (
      <div className={styles.form}>
        <div className={styles.formSection}>
          <h4><Search size={18} /> Basic SEO</h4>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <div className={styles.labelRow}>
                <label>Page Title *</label>
                <span className={styles.charCount}>{pageData.Title.length}/60</span>
              </div>
              <input type="text" value={pageData.Title} onChange={e => handlePageInputChange(page, "Title", e.target.value)} placeholder="Enter page title for search results" maxLength={60} className={validationErrors[`pages.${page}.Title`] ? styles.error : ""} />
              {validationErrors[`pages.${page}.Title`] && <span className={styles.errorText}>{validationErrors[`pages.${page}.Title`]}</span>}
              <small>Appears in search results. Recommended: 50-60 characters.</small>
            </div>
            <div className={styles.formGroup}>
              <label>Keywords</label>
              <input type="text" value={keywordsString} onChange={e => handlePageInputChange(page, "Keywords", e.target.value)} placeholder="keyword1, keyword2, keyword3" className={validationErrors[`pages.${page}.Keywords`] ? styles.error : ""} />
              {validationErrors[`pages.${page}.Keywords`] && <span className={styles.errorText}>{validationErrors[`pages.${page}.Keywords`]}</span>}
              <small>Separate keywords with commas.</small>
              {Array.isArray(pageData.Keywords) && pageData.Keywords.length > 0 && (
                <div className={styles.keywordChips}>
                  <Tag size={14} />
                  {pageData.Keywords.map((kw, i) => <span key={i} className={styles.chip}>{kw}</span>)}
                </div>
              )}
            </div>
            <div className={styles.formGroup}>
              <div className={styles.labelRow}>
                <label>Page Description</label>
                <span className={styles.charCount}>{pageData.Description.length}/160</span>
              </div>
              <textarea value={pageData.Description} onChange={e => handlePageInputChange(page, "Description", e.target.value)} placeholder="Brief description of this page content" maxLength={160} rows={3} />
              <small>Appears in search results. Recommended: 150-160 characters.</small>
            </div>
          </div>
        </div>
        <div className={styles.formSection}>
          <h4><Share2 size={18} /> Social Sharing (Open Graph)</h4>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label>Social Title</label>
              <input type="text" value={pageData.SocialTitle} onChange={e => handlePageInputChange(page, "SocialTitle", e.target.value)} placeholder="Title when shared on social media" />
              <small>Title shown on Facebook, LinkedIn, etc.</small>
            </div>
            <div className={styles.formGroup}>
              <label>Social Description</label>
              <textarea value={pageData.SocialDescription} onChange={e => handlePageInputChange(page, "SocialDescription", e.target.value)} placeholder="Description when shared on social media" rows={2} />
              <small>Description shown when shared on social media.</small>
            </div>
            <div className={styles.formGroup}>
              <label>Page URL</label>
              <input type="url" value={pageData.PageUrl} onChange={e => handlePageInputChange(page, "PageUrl", e.target.value)} placeholder="https://yourwebsite.com/page-url" className={validationErrors[`pages.${page}.PageUrl`] ? styles.error : ""} />
              {validationErrors[`pages.${page}.PageUrl`] && <span className={styles.errorText}>{validationErrors[`pages.${page}.PageUrl`]}</span>}
              <small>Full URL of this page.</small>
            </div>
            {renderImageField(page, "SocialImage", "Social Image",
              "Image shown on social media (1200x630px recommended).")}
          </div>
        </div>
        <div className={styles.formSection}>
          <h4><Twitter size={18} /> Twitter Sharing</h4>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label>Twitter Title</label>
              <input type="text" value={pageData.TwitterTitle} onChange={e => handlePageInputChange(page, "TwitterTitle", e.target.value)} placeholder="Title when shared on Twitter" />
              <small>Title shown when shared on Twitter.</small>
            </div>
            <div className={styles.formGroup}>
              <label>Twitter Description</label>
              <textarea value={pageData.TwitterDescription} onChange={e => handlePageInputChange(page, "TwitterDescription", e.target.value)} placeholder="Description when shared on Twitter" rows={2} />
              <small>Description shown when shared on Twitter.</small>
            </div>
            {renderImageField(page, "TwitterImage", "Twitter Image",
              "Image shown on Twitter (1200x600px recommended).")}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.seoSection}>
      <div className={styles.actionsRow}>
        {userRole === "admin" && (
        <button className={`${styles.btnPrimary} ${styles.desktopSaveBtn}`} onClick={handleSave} disabled={saving}>
          <Save size={18} />{saving ? "Saving..." : "Save Changes"}
        </button>
        )}
      </div>
      {error && <div className={styles.errorMessage}>{error}</div>}
      {message.visible && (
        <div className={`${styles.messageAlert} ${styles[message.type]}`}>
          <span>{message.text}</span>
          <button className={styles.messageClose} onClick={() => setMessage({ type: "", text: "", visible: false })}><X size={16} /></button>
        </div>
      )}
      <div className={styles.tabBar}>
        {pageOptions.map((option) => {
          const Icon = option.icon;
          return (
            <button key={option.value} type="button" className={`${styles.tab} ${selectedPage === option.value ? styles.tabActive : ""}`} onClick={() => setSelectedPage(option.value)}>
              <Icon size={16} /><span>{option.label}</span>
            </button>
          );
        })}
      </div>
      <div className={styles.formContainer}>
        {selectedPage === "static" ? renderStaticForm() : renderPageForm(selectedPage)}
      </div>
      {userRole === "admin" && (
      <div className={styles.stickySaveButton}>
        <button className={styles.btnPrimary} onClick={handleSave} disabled={saving}>
          <Save size={18} />{saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
      )}
    </div>
  );
};

export default DashboardSEO;
