import React from "react";
import styles from "../styles/StatCard.module.css";

const StatCard = ({ title, value }) => {
  return (
    <div className={styles.statCard}>
      <div className={styles.icon}>📊</div>
      <div className={styles.statValue}>{value}</div>
      <h3>{title}</h3>
    </div>
  );
};

export default StatCard;
