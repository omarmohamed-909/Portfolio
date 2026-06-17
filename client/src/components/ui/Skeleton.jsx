import React from "react";
import styles from "./Skeleton.module.css";

export const Skeleton = ({ width, height, borderRadius = "8px", className = "", variant = "text" }) => {
  return (
    <div
      className={`${styles.skeleton} ${styles[variant] || ""} ${className}`}
      style={{ width, height, borderRadius }}
      aria-hidden="true"
    />
  );
};

export const SkeletonCard = ({ className = "" }) => (
  <div className={`${styles.skeletonCard} ${className}`} aria-hidden="true">
    <Skeleton width="100%" height="180px" borderRadius="8px" variant="image" />
    <div className={styles.skeletonCardBody}>
      <Skeleton width="75%" height="16px" />
      <Skeleton width="100%" height="12px" />
      <Skeleton width="60%" height="12px" />
      <div className={styles.skeletonTags}>
        <Skeleton width="50px" height="20px" borderRadius="4px" />
        <Skeleton width="60px" height="20px" borderRadius="4px" />
        <Skeleton width="40px" height="20px" borderRadius="4px" />
      </div>
    </div>
  </div>
);
