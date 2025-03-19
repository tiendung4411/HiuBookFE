// src/Admin/components/DeleteConfirmationModal.js
import React from "react";
import styles from "../styles/StoryManagement.module.css";
import { motion } from "framer-motion";

const DeleteConfirmationModal = ({ isOpen, onConfirm, onCancel, count }) => {
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <motion.div
        className={styles.deleteModal}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <h2>Xác nhận xóa</h2>
        <p>Bạn có chắc muốn xóa {count} truyện đã chọn?</p>
        <div className={styles.modalButtons}>
          <button onClick={onConfirm} className={styles.deleteConfirmButton}>
            Xóa
          </button>
          <button onClick={onCancel} className={styles.cancelButton}>
            Hủy
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default DeleteConfirmationModal;
