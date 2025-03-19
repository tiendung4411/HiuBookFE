import React, { useState, useEffect } from "react";
import AdminSidebar from "../components/AdminSidebar";
import AdminHeader from "../components/AdminHeader";
import StatCard from "../components/StatCard";
import styles from "../styles/SummaryManagement.module.css";
import {
  FaSearch,
  FaPlus,
  FaArrowLeft,
  FaArrowRight,
  FaSortAlphaDown,
  FaSortAlphaUp,
  FaTrash,
  FaEye
} from "react-icons/fa";
import Modal from "react-modal";
import { motion, AnimatePresence } from "framer-motion";

// Dữ liệu tĩnh (giả lập)
const initialSummaries = [
  {
    id: 1,
    title: "Thỏ và Rùa",
    class: "Lớp 1",
    method: "Extract",
    createdAt: "2025-03-16",
    content: "Câu chuyện về chú thỏ và chú rùa."
  },
  {
    id: 2,
    title: "Cậu Bé và Cây Táo",
    class: "Lớp 1",
    method: "Paraphrase",
    createdAt: "2025-03-15",
    content: "Câu chuyện cảm động về tình yêu gia đình."
  },
  {
    id: 3,
    title: "Bạn Thân",
    class: "Lớp 2",
    method: "Extract",
    createdAt: "2025-03-14",
    content: "Bài học về tình bạn."
  },
  {
    id: 4,
    title: "Nước và Thời Tiết",
    class: "Lớp 3",
    method: "Paraphrase",
    createdAt: "2025-03-13",
    content: "Khám phá cách nước ảnh hưởng đến thời tiết."
  },
  {
    id: 5,
    title: "Tấm Cám",
    class: "Lớp 5",
    method: "Extract",
    createdAt: "2025-03-12",
    content: "Truyện cổ tích về lòng tốt."
  },
  {
    id: 6,
    title: "Bí Ẩn Đại Dương",
    class: "Lớp 5",
    method: "Paraphrase",
    createdAt: "2025-03-11",
    content: "Cuộc phiêu lưu dưới lòng đại dương."
  }
];

// Cài đặt root cho modal
Modal.setAppElement("#root");

const SummaryManagement = () => {
  const [summaries, setSummaries] = useState(initialSummaries);
  const [searchTerm, setSearchTerm] = useState("");
  const [methodFilter, setMethodFilter] = useState("All");
  const [classFilter, setClassFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("All");
  const [sortOrder, setSortOrder] = useState("A-Z");
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isViewMode, setIsViewMode] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentSummary, setCurrentSummary] = useState(null);
  const [selectedSummaries, setSelectedSummaries] = useState([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    class: "",
    method: "Extract",
    createdAt: new Date().toISOString().split("T")[0],
    content: ""
  });
  const itemsPerPage = 4;

  // Lọc và tìm kiếm tóm tắt
  const filteredSummaries = summaries.filter((summary) => {
    const matchesSearch =
      summary.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      summary.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMethod =
      methodFilter === "All" || summary.method === methodFilter;
    const matchesClass = classFilter === "All" || summary.class === classFilter;
    const matchesDate =
      dateFilter === "All" ||
      (dateFilter === "Last7Days" &&
        new Date(summary.createdAt) >=
          new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
    return matchesSearch && matchesMethod && matchesClass && matchesDate;
  });

  // Sắp xếp tóm tắt
  const sortedSummaries = [...filteredSummaries].sort((a, b) => {
    if (sortOrder === "A-Z") {
      return a.title.localeCompare(b.title);
    } else {
      return b.title.localeCompare(a.title);
    }
  });

  // Phân trang
  const totalPages = Math.ceil(sortedSummaries.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedSummaries = sortedSummaries.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // Thẻ thống kê
  const totalSummaries = summaries.length;
  const extractSummaries = summaries.filter(
    (s) => s.method === "Extract"
  ).length;
  const classSummaries = [...new Set(summaries.map((s) => s.class))].length;

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "A-Z" ? "Z-A" : "A-Z");
  };

  const handleSelectSummary = (id) => {
    setSelectedSummaries((prev) =>
      prev.includes(id)
        ? prev.filter((summaryId) => summaryId !== id)
        : [...prev, id]
    );
  };

  const handleBulkDelete = () => {
    setIsDeleteModalOpen(true);
  };

  const confirmBulkDelete = () => {
    setSummaries(
      summaries.filter((summary) => !selectedSummaries.includes(summary.id))
    );
    setSelectedSummaries([]);
    setIsDeleteModalOpen(false);
  };

  const openAddModal = () => {
    setIsEditMode(false);
    setIsViewMode(false);
    setFormData({
      title: "",
      class: "",
      method: "Extract",
      createdAt: new Date().toISOString().split("T")[0],
      content: ""
    });
    setIsModalOpen(true);
  };

  const openEditModal = (summary) => {
    setIsEditMode(true);
    setIsViewMode(false);
    setCurrentSummary(summary);
    setFormData({ ...summary });
    setIsModalOpen(true);
  };

  const openViewModal = (summary) => {
    setIsEditMode(false);
    setIsViewMode(true);
    setCurrentSummary(summary);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentSummary(null);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
  };

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = () => {
    if (isEditMode) {
      setSummaries(
        summaries.map((s) =>
          s.id === currentSummary.id ? { ...formData, id: s.id } : s
        )
      );
    } else if (!isViewMode) {
      const newSummary = { ...formData, id: summaries.length + 1 };
      setSummaries([...summaries, newSummary]);
    }
    closeModal();
  };

  const handleDelete = (id) => {
    setSelectedSummaries([id]);
    setIsDeleteModalOpen(true);
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <div className={`${styles.container} ${isDarkMode ? styles.darkMode : ""}`}>
      <AdminSidebar />
      <div className={styles.main}>
        <AdminHeader />
        <div className={styles.content}>
          <div className={styles.header}>
            <h1 className={styles.title}>Quản Lý Tóm Tắt</h1>
            <button className={styles.themeButton} onClick={toggleTheme}>
              {isDarkMode ? "Chuyển sang sáng" : "Chuyển sang tối"}
            </button>
          </div>
          <div className={styles.statsContainer}>
            <StatCard
              title="Tổng số tóm tắt"
              value={totalSummaries}
              color="#3498db"
              icon="📝"
            />
            <StatCard
              title="Tóm tắt Trích xuất"
              value={extractSummaries}
              color="#2ecc71"
              icon="✂️"
            />
            <StatCard
              title="Số lớp học"
              value={classSummaries}
              color="#e74c3c"
              icon="🏫"
            />
          </div>
          <div className={styles.controls}>
            <div className={styles.search}>
              <input
                type="text"
                placeholder="Tìm kiếm theo tiêu đề hoặc nội dung..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <FaSearch className={styles.searchIcon} />
            </div>
            <div className={styles.filters}>
              <select
                value={methodFilter}
                onChange={(e) => setMethodFilter(e.target.value)}
                className={styles.filterSelect}
              >
                <option value="All">Tất cả kiểu</option>
                <option value="Extract">Trích xuất</option>
                <option value="Paraphrase">Diễn giải</option>
              </select>
              <select
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
                className={styles.filterSelect}
              >
                <option value="All">Tất cả lớp</option>
                <option value="Lớp 1">Lớp 1</option>
                <option value="Lớp 2">Lớp 2</option>
                <option value="Lớp 3">Lớp 3</option>
                <option value="Lớp 4">Lớp 4</option>
                <option value="Lớp 5">Lớp 5</option>
              </select>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className={styles.filterSelect}
              >
                <option value="All">Tất cả thời gian</option>
                <option value="Last7Days">7 ngày qua</option>
              </select>
              <button className={styles.addButton} onClick={openAddModal}>
                <FaPlus className={styles.addIcon} />
                Thêm Tóm Tắt
              </button>
            </div>
          </div>
          {selectedSummaries.length > 0 && (
            <motion.div
              className={styles.bulkActions}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <span>Đã chọn {selectedSummaries.length} tóm tắt</span>
              <button
                className={styles.bulkDeleteButton}
                onClick={handleBulkDelete}
              >
                <FaTrash className={styles.bulkDeleteIcon} />
                Xóa
              </button>
            </motion.div>
          )}
          <motion.table
            className={styles.table}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    checked={
                      selectedSummaries.length === paginatedSummaries.length &&
                      paginatedSummaries.length > 0
                    }
                    onChange={() =>
                      setSelectedSummaries(
                        selectedSummaries.length === paginatedSummaries.length
                          ? []
                          : paginatedSummaries.map((summary) => summary.id)
                      )
                    }
                  />
                </th>
                <th>ID</th>
                <th>
                  Tiêu đề{" "}
                  <button
                    onClick={toggleSortOrder}
                    className={styles.sortButton}
                  >
                    {sortOrder === "A-Z" ? (
                      <FaSortAlphaDown />
                    ) : (
                      <FaSortAlphaUp />
                    )}
                  </button>
                </th>
                <th>Lớp học</th>
                <th>Kiểu</th>
                <th>Ngày tạo</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {paginatedSummaries.map((summary) => (
                <motion.tr
                  key={summary.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedSummaries.includes(summary.id)}
                      onChange={() => handleSelectSummary(summary.id)}
                    />
                  </td>
                  <td>{summary.id}</td>
                  <td>{summary.title}</td>
                  <td>{summary.class}</td>
                  <td>{summary.method}</td>
                  <td>{summary.createdAt}</td>
                  <td>
                    <button
                      className={styles.viewButton}
                      onClick={() => openViewModal(summary)}
                    >
                      <FaEye />
                    </button>
                    <button
                      className={styles.editButton}
                      onClick={() => openEditModal(summary)}
                    >
                      Sửa
                    </button>
                    <button
                      className={styles.deleteButton}
                      onClick={() => handleDelete(summary.id)}
                    >
                      Xóa
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </motion.table>
          <div className={styles.pagination}>
            <button
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              className={styles.pageButton}
            >
              <FaArrowLeft />
            </button>
            <span>
              Trang {currentPage} / {totalPages}
            </span>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className={styles.pageButton}
            >
              <FaArrowRight />
            </button>
          </div>
        </div>
      </div>

      {/* Modal để thêm/chỉnh sửa/xem tóm tắt */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        className={styles.modal}
        overlayClassName={styles.modalOverlay}
      >
        <motion.div
          className={styles.modalContent}
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
                <strong>Kiểu:</strong> {currentSummary?.method}
              </p>
              <p>
                <strong>Ngày tạo:</strong> {currentSummary?.createdAt}
              </p>
              <p>
                <strong>Nội dung:</strong> {currentSummary?.content}
              </p>
              <button onClick={closeModal} className={styles.cancelButton}>
                Đóng
              </button>
            </div>
          ) : (
            <form
              className={styles.modalForm}
              onSubmit={(e) => {
                e.preventDefault();
                handleFormSubmit();
              }}
            >
              <div className={styles.formGroup}>
                <label>Tiêu đề</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleFormChange}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label>Lớp học</label>
                <select
                  name="class"
                  value={formData.class}
                  onChange={handleFormChange}
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
                  onChange={handleFormChange}
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
                  onChange={handleFormChange}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label>Nội dung</label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleFormChange}
                  required
                  rows="5"
                />
              </div>
              <div className={styles.modalButtons}>
                <button type="submit" className={styles.saveButton}>
                  {isEditMode ? "Lưu" : "Thêm"}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className={styles.cancelButton}
                >
                  Hủy
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </Modal>

      {/* Modal xác nhận xóa */}
      <Modal
        isOpen={isDeleteModalOpen}
        onRequestClose={closeDeleteModal}
        className={styles.deleteModal}
        overlayClassName={styles.modalOverlay}
      >
        <motion.div
          className={styles.deleteModalContent}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <h2>Xác nhận xóa</h2>
          <p>
            Bạn có chắc muốn xóa {selectedSummaries.length} tóm tắt đã chọn?
          </p>
          <div className={styles.modalButtons}>
            <button
              onClick={confirmBulkDelete}
              className={styles.deleteConfirmButton}
            >
              Xóa
            </button>
            <button onClick={closeDeleteModal} className={styles.cancelButton}>
              Hủy
            </button>
          </div>
        </motion.div>
      </Modal>
    </div>
  );
};

export default SummaryManagement;
