// src/Admin/components/ModalSummary.js
import React from "react";
import styles from "../styles/SummaryManagement.module.css";
import { motion } from "framer-motion";

const ModalSummary = ({
  isOpen,
  onClose,
  isViewMode,
  isEditMode,
  formData,
  onChange,
  onSubmit,
  currentSummary
}) => {
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <motion.div
        className={styles.modal}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <h2>
          {isViewMode
            ? "Chi Tiết Tóm Tắt"
            : isEditMode
            ? "Chỉnh Sửa Tóm Tắt"
            : "Thêm Tóm Tắt"}
        </h2>
        {isViewMode ? (
          <div className={styles.viewDetails}>
            <p>
              <strong>ID:</strong> {currentSummary?.id}
            </p>
            <p>
              <strong>Tiêu đề:</strong> {currentSummary?.title}
            </p>
            <p>
              <strong>Lớp học:</strong> {currentSummary?.class}
            </p>
            <p>
              <strong>Kiểu:</strong>{" "}
              {currentSummary?.method === "Extract"
                ? "Trích xuất"
                : "Diễn giải"}
            </p>
            <p>
              <strong>Ngày tạo:</strong> {currentSummary?.createdAt}
            </p>
            <p>
              <strong>Nội dung:</strong> {currentSummary?.content}
            </p>
            <p>
              <strong>Tóm tắt Trích xuất:</strong>{" "}
              {currentSummary?.summaries.extract}
            </p>
            <p>
              <strong>Tóm tắt Diễn giải:</strong>{" "}
              {currentSummary?.summaries.paraphrase}
            </p>
            <button onClick={onClose} className={styles.cancelButton}>
              Đóng
            </button>
          </div>
        ) : (
          <form
            className={styles.modalForm}
            onSubmit={(e) => {
              e.preventDefault();
              onSubmit();
            }}
          >
            <div className={styles.formGroup}>
              <label>Tiêu đề</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={onChange}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label>Lớp học</label>
              <select
                name="class"
                value={formData.class}
                onChange={onChange}
                required
              >
                <option value="">Chọn lớp</option>
                <option value="Lớp 1">Lớp 1</option>
                <option value="Lớp 2">Lớp 2</option>
                <option value="Lớp 3">Lớp 3</option>
                <option value="Lớp 4">Lớp 4</option>
                <option value="Lớp 5">Lớp 5</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label>Kiểu tóm tắt</label>
              <select
                name="method"
                value={formData.method}
                onChange={onChange}
                required
              >
                <option value="Extract">Trích xuất</option>
                <option value="Paraphrase">Diễn giải</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label>Ngày tạo</label>
              <input
                type="date"
                name="createdAt"
                value={formData.createdAt}
                onChange={onChange}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label>Nội dung</label>
              <textarea
                name="content"
                value={formData.content}
                onChange={onChange}
                required
                rows="5"
              />
            </div>
            <div className={styles.formGroup}>
              <label>Tóm tắt Trích xuất</label>
              <textarea
                name="extract"
                value={formData.summaries.extract}
                onChange={onChange}
                rows="3"
              />
            </div>
            <div className={styles.formGroup}>
              <label>Tóm tắt Diễn giải</label>
              <textarea
                name="paraphrase"
                value={formData.summaries.paraphrase}
                onChange={onChange}
                rows="3"
              />
            </div>
            <div className={styles.modalButtons}>
              <button type="submit" className={styles.saveButton}>
                {isEditMode ? "Lưu" : "Thêm"}
              </button>
              <button
                type="button"
                onClick={onClose}
                className={styles.cancelButton}
              >
                Hủy
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
};

export default ModalSummary;
