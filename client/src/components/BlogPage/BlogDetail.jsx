import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "../Navbar/Navbar";
import Footer from "../Footer/Footer";
import ConstellationBackground from "../NebulaDrift/NebulaDrift";
import styles from "./BlogDetail.module.css";
import { Calendar, User, Tag, ArrowLeft, BookOpen } from "lucide-react";
import axios from "axios";
import { Backend_Root_Url } from "../../config/AdminUrl.js";
import { resolveAssetUrl } from "../../lib/assetUrl.js";
import DOMPurify from "dompurify";

const BlogDetail = () => {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await axios.get(`${Backend_Root_Url}/api/show/blog/${slug}`);
        setPost(res.data);
      } catch {
        setError("Post not found.");
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [slug]);

  const formatDate = (d) => {
    if (!d) return "";
    return new Date(d).toLocaleDateString("en-US", {
      year: "numeric", month: "long", day: "numeric",
    });
  };

  const getCoverSrc = () => {
    if (!post?.CoverImage || post.CoverImage === "Nothing") return null;
    return resolveAssetUrl(post.CoverImage, `${Backend_Root_Url}/uploads/blogimg/`) || null;
  };

  if (loading) {
    return (
      <div className={styles.pageWrapper}>
        <ConstellationBackground />
        <div className={styles.contentLayer}>
          <Navbar />
          <div className={styles.statusContainer}>
            <div className={styles.spinner} />
            <p>Loading post...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className={styles.pageWrapper}>
        <ConstellationBackground />
        <div className={styles.contentLayer}>
          <Navbar />
          <div className={styles.statusContainer}>
            <BookOpen size={48} className={styles.errorIcon} />
            <h2 className={styles.errorTitle}>Post not found</h2>
            <p className={styles.errorDesc}>{error || "This post doesn't exist or has been removed."}</p>
            <Link to="/blog" className={styles.backLink}>
              <ArrowLeft size={16} /> Back to Blog
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const coverSrc = getCoverSrc();

  return (
    <div className={styles.pageWrapper}>
      <ConstellationBackground />
      <div className={styles.contentLayer}>
        <Navbar />
        <main className={styles.mainContent}>
          <article className={styles.container}>
            <div className={styles.backBar}>
              <Link to="/blog" className={styles.backLink}>
                <ArrowLeft size={16} /> Back to Blog
              </Link>
            </div>

            {coverSrc && (
              <div className={styles.coverWrapper}>
                <img src={coverSrc} alt={post.Title} className={styles.coverImage} />
              </div>
            )}

            <header className={styles.articleHeader}>
              <h1 className={styles.articleTitle}>{post.Title}</h1>
              <div className={styles.articleMeta}>
                <span className={styles.metaItem}>
                  <User size={14} /> {post.Author || "Omar"}
                </span>
                <span className={styles.metaItem}>
                  <Calendar size={14} /> {formatDate(post.createdAt)}
                </span>
              </div>
              {(post.Tags || []).length > 0 && (
                <div className={styles.tagList}>
                  {post.Tags.map((t, i) => (
                    <span key={i} className={styles.tag}>
                      <Tag size={12} /> {t}
                    </span>
                  ))}
                </div>
              )}
            </header>

            <div
              className={styles.articleContent}
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(post.Content || "", {
                  USE_PROFILES: { html: true },
                }),
              }}
            />
          </article>
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default BlogDetail;
