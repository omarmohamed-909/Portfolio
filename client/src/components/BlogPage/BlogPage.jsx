import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../Navbar/Navbar";
import Footer from "../Footer/Footer";
import ConstellationBackground from "../NebulaDrift/NebulaDrift";
import styles from "./BlogPage.module.css";
import { Calendar, Tag, ArrowRight, BookOpen } from "lucide-react";
import axios from "axios";
import { Backend_Root_Url } from "../../config/AdminUrl.js";
import { resolveAssetUrl } from "../../lib/assetUrl.js";
import { motion } from "framer-motion";

const BlogPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await axios.get(`${Backend_Root_Url}/api/show/blog`);
        setPosts(Array.isArray(res.data) ? res.data : []);
      } catch {
        setError("Failed to load blog posts.");
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  const formatDate = (d) => {
    if (!d) return "";
    return new Date(d).toLocaleDateString("en-US", {
      year: "numeric", month: "long", day: "numeric",
    });
  };

  const getCoverSrc = (post) => {
    if (!post.CoverImage || post.CoverImage === "Nothing") return null;
    return resolveAssetUrl(post.CoverImage, `${Backend_Root_Url}/uploads/blogimg/`) || null;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
  };

  return (
    <div className={styles.pageWrapper}>
      <ConstellationBackground />
      <div className={styles.bgGlow} aria-hidden="true" />
      <div className={styles.contentLayer}>
        <Navbar />
        <main className={styles.mainContent}>
          <div className={styles.container}>
            <header className={styles.header}>
              <div className={styles.headerDecor}>
                <BookOpen size={24} strokeWidth={1.5} />
              </div>
              <div>
                <h1 className={styles.title}>Blog</h1>
                <p className={styles.subtitle}>
                  Thoughts, tutorials, and deep dives into software engineering, architecture, and problem-solving.
                </p>
              </div>
            </header>

            {loading ? (
              <div className={styles.statusContainer}>
                <div className={styles.spinner} />
                <p>Loading posts...</p>
              </div>
            ) : error ? (
              <div className={styles.statusContainer}>
                <p className={styles.errorText}>{error}</p>
              </div>
            ) : posts.length === 0 ? (
              <div className={styles.statusContainer}>
                <BookOpen size={48} className={styles.emptyIcon} />
                <h3 className={styles.emptyTitle}>No posts yet</h3>
                <p className={styles.emptyDesc}>Check back soon for new content.</p>
              </div>
            ) : (
              <motion.div
                className={styles.grid}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {posts.map((post) => {
                  const coverSrc = getCoverSrc(post);
                  const monogram = (post.Title || "POST").slice(0, 2).toUpperCase();
                  return (
                    <motion.article key={post._id} className={styles.card} variants={cardVariants}>
                      <Link to={`/blog/${post.Slug}`} className={styles.cardLink}>
                        <div className={styles.cardImage}>
                          {coverSrc ? (
                            <img src={coverSrc} alt="" className={styles.cardImg} loading="lazy" decoding="async" />
                          ) : (
                            <div className={styles.cardImgFallback}>
                              <span className={styles.monogram}>{monogram}</span>
                            </div>
                          )}
                        </div>
                        <div className={styles.cardBody}>
                          <div className={styles.cardMeta}>
                            <span className={styles.cardDate}>
                              <Calendar size={12} />
                              {formatDate(post.createdAt)}
                            </span>
                          </div>
                          <h2 className={styles.cardTitle}>{post.Title}</h2>
                          {post.Excerpt && <p className={styles.cardExcerpt}>{post.Excerpt}</p>}
                          <div className={styles.cardFooter}>
                            <div className={styles.tagList}>
                              {(post.Tags || []).slice(0, 3).map((t, i) => (
                                <span key={i} className={styles.tag}>
                                  <Tag size={10} /> {t}
                                </span>
                              ))}
                            </div>
                            <span className={styles.readMore}>
                              Read <ArrowRight size={13} />
                            </span>
                          </div>
                        </div>
                      </Link>
                    </motion.article>
                  );
                })}
              </motion.div>
            )}
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default BlogPage;
