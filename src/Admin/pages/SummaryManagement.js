import React, { useState, useEffect, useRef } from "react";
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
  FaEye,
} from "react-icons/fa";
import Modal from "react-modal";
import { motion, AnimatePresence } from "framer-motion";
import { getAllSummariesAdmin } from "../../api/summaries";
import {
  Chart,
  BarController,
  PieController,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register Chart.js components
Chart.register(
  BarController,
  PieController,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

// Set modal root
Modal.setAppElement("#root");

const SummaryManagement = () => {
  const gradeChartRef = useRef(null);
  const methodChartRef = useRef(null);
  const gradeChartInstance = useRef(null);
  const methodChartInstance = useRef(null);

  const [summaries, setSummaries] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [methodFilter, setMethodFilter] = useState("All");
  const [classFilter, setClassFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All"); // New status filter
  const [dateFilter, setDateFilter] = useState("All");
  const [sortOrder, setSortOrder] = useState("A-Z");
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isViewMode, setIsViewMode] = useState(false);
  const [formData, setFormData] = useState({}); 
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentSummary, setCurrentSummary] = useState(null);
  const [selectedSummaries, setSelectedSummaries] = useState([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const itemsPerPage = 4;

  // Fetch summaries on mount
  useEffect(() => {
    const fetchSummaries = async () => {
      try {
        setLoading(true);
        const response = await getAllSummariesAdmin();
        setSummaries(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching summaries:", error);
        setLoading(false);
      }
    };
    fetchSummaries();
  }, []);

  // Filter and search summaries
  const filteredSummaries = summaries.filter((summary) => {
    const matchesSearch =
      (summary.title?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (summary.content?.toLowerCase() || "").includes(searchTerm.toLowerCase());
    const matchesMethod =
      methodFilter === "All" || summary.method === methodFilter;
    const matchesClass =
      classFilter === "All" || summary.grade === classFilter; // Assuming grade is the field
    const matchesStatus =
      statusFilter === "All" || summary.status === statusFilter;
    const matchesDate =
      dateFilter === "All" ||
      (dateFilter === "Last7Days" &&
        new Date(summary.createdAt) >=
          new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
    return matchesSearch && matchesMethod && matchesClass && matchesStatus && matchesDate;
  });

  // Sort summaries
  const sortedSummaries = [...filteredSummaries].sort((a, b) => {
    if (sortOrder === "A-Z") {
      return (a.title || "").localeCompare(b.title || "");
    } else {
      return (b.title || "").localeCompare(a.title || "");
    }
  });

  // Pagination
  const totalPages = Math.ceil(sortedSummaries.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedSummaries = sortedSummaries.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // Stats
  const totalSummaries = summaries.length;
  const approvedSummaries = summaries.filter((s) => s.status === "APPROVED").length;
  const pendingSummaries = summaries.filter((s) => s.status === "PENDING").length;

  // Charts
  useEffect(() => {
    if (!summaries.length || loading) return;

    // Grade Bar Chart
    const gradeCount = {
      "Lớp 1": 0,
      "Lớp 2": 0,
      "Lớp 3": 0,
      "Lớp 4": 0,
      "Lớp 5": 0,
      "Khác": 0,
    };

    summaries.forEach((summary) => {
      const grade = summary.grade ? String(summary.grade) : null;
      const normalizedGrade = grade ? `Lớp ${grade}` : "Khác";
      if (gradeCount.hasOwnProperty(normalizedGrade)) {
        gradeCount[normalizedGrade]++;
      } else {
        gradeCount["Khác"]++;
      }
    });

    if (gradeChartInstance.current) gradeChartInstance.current.destroy();
    if (gradeChartRef.current) {
      gradeChartInstance.current = new Chart(gradeChartRef.current, {
        type: "bar",
        data: {
          labels: Object.keys(gradeCount),
          datasets: [
            {
              label: "Số tóm tắt",
              data: Object.values(gradeCount),
              backgroundColor: "#3498db",
              borderColor: "#3498db",
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          scales: {
            y: { beginAtZero: true, title: { display: true, text: "Số lượng" } },
            x: { title: { display: true, text: "Lớp học" } },
          },
          plugins: {
            legend: { display: false },
            title: { display: true, text: "Số lượng tóm tắt theo lớp học" },
          },
        },
      });
    }

    // Method Pie Chart
    const methodCount = {
      "Diễn giải": 0,
      "Trích xuất": 0,
    };

    summaries.forEach((summary) => {
      const method = summary.method ? summary.method.toLowerCase() : null;
      if (method === "paraphrase" || method === "abstractive" || method === "a") {
        methodCount["Diễn giải"]++;
      } else if (method === "extractive" || method === "a" || method === "extraction") {
        methodCount["Trích xuất"]++;
      }
      // Ignore any other values or typos
    });

    if (methodChartInstance.current) methodChartInstance.current.destroy();
    if (methodChartRef.current) {
      methodChartInstance.current = new Chart(methodChartRef.current, {
        type: "pie",
        data: {
          labels: ["Diễn giải", "Trích xuất"],
          datasets: [
            {
              label: "Tỷ lệ tóm tắt",
              data: [methodCount["Diễn giải"], methodCount["Trích xuất"]],
              backgroundColor: ["#2ecc71", "#f1c40f"],
              borderColor: ["#2ecc71", "#f1c40f"],
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: { position: "top" },
            title: { display: true, text: "Tỷ lệ tóm tắt theo kiểu" },
          },
        },
      });
    }

    return () => {
      if (gradeChartInstance.current) gradeChartInstance.current.destroy();
      if (methodChartInstance.current) methodChartInstance.current.destroy();
    };
  }, [summaries, loading]);

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
      prev.includes(id) ? prev.filter((summaryId) => summaryId !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = () => {
    setIsDeleteModalOpen(true);
  };

  const confirmBulkDelete = () => {
    setSummaries(summaries.filter((summary) => !selectedSummaries.includes(summary.summaryId)));
    setSelectedSummaries([]);
    setIsDeleteModalOpen(false);
  };

  const openAddModal = () => {
    setIsEditMode(false);
    setIsViewMode(false);
    setFormData({
      title: "",
      grade: "",
      method: "Extract",
      createdAt: new Date().toISOString().split("T")[0],
      content: "",
      status: "PENDING",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (summary) => {
    setIsEditMode(true);
    setIsViewMode(false);
    setCurrentSummary(summary);
    setFormData({
      title: summary.title,
      grade: summary.grade,
      method: summary.method,
      createdAt: summary.createdAt.split("T")[0],
      content: summary.content,
      status: summary.status,
    });
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
    // This would ideally call an API to save the summary; here we simulate it
    const newSummary = {
      ...formData,
      summaryId: isEditMode ? currentSummary.summaryId : Date.now().toString(),
    };
    if (isEditMode) {
      setSummaries(summaries.map((s) => (s.summaryId === currentSummary.summaryId ? newSummary : s)));
    } else {
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
              title="Tóm tắt Đã duyệt"
              value={approvedSummaries}
              color="#2ecc71"
              icon="✅"
            />
            <StatCard
              title="Tóm tắt Chờ duyệt"
              value={pendingSummaries}
              color="#e74c3c"
              icon="⏳"
            />
          </div>
          <div className={styles.chartsContainer}>
            <motion.div
              className={styles.chart}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <canvas ref={gradeChartRef} id="gradeChart"></canvas>
            </motion.div>
            <motion.div
              className={styles.chart}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <canvas ref={methodChartRef} id="methodChart"></canvas>
            </motion.div>
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
                <option value="1">Lớp 1</option>
                <option value="2">Lớp 2</option>
                <option value="3">Lớp 3</option>
                <option value="4">Lớp 4</option>
                <option value="5">Lớp 5</option>
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className={styles.filterSelect}
              >
                <option value="All">Tất cả trạng thái</option>
                <option value="APPROVED">Đã duyệt</option>
                <option value="PENDING">Chờ duyệt</option>
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
                          : paginatedSummaries.map((summary) => summary.summaryId)
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
                    {sortOrder === "A-Z" ? <FaSortAlphaDown /> : <FaSortAlphaUp />}
                  </button>
                </th>
                <th>Lớp học</th>
                <th>Kiểu</th>
                <th>Ngày tạo</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className={styles.noData}>
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : paginatedSummaries.length > 0 ? (
                paginatedSummaries.map((summary) => (
                  <motion.tr
                    key={summary.summaryId}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedSummaries.includes(summary.summaryId)}
                        onChange={() => handleSelectSummary(summary.summaryId)}
                      />
                    </td>
                    <td>{summary.summaryId.substring(0, 8)}...</td>
                    <td>{summary.title}</td>
                    <td>{summary.grade}</td>
                    <td>{summary.method}</td>
                    <td>{summary.createdAt.split("T")[0]}</td>
                    <td>
                      <span
                        className={`${styles.status} ${
                          summary.status === "APPROVED" ? styles.approved : styles.pending
                        }`}
                      >
                        {summary.status === "APPROVED" ? "Đã duyệt" : "Chờ duyệt"}
                      </span>
                    </td>
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
                        onClick={() => handleDelete(summary.summaryId)}
                      >
                        Xóa
                      </button>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className={styles.noData}>
                    Không có dữ liệu tóm tắt
                  </td>
                </tr>
              )}
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

      {/* Modal for Add/Edit/View */}
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
              <p><strong>ID:</strong> {currentSummary?.summaryId}</p>
              <p><strong>Tiêu đề:</strong> {currentSummary?.title}</p>
              <p><strong>Lớp học:</strong> {currentSummary?.grade}</p>
              <p><strong>Kiểu:</strong> {currentSummary?.method}</p>
              <p><strong>Ngày tạo:</strong> {currentSummary?.createdAt.split("T")[0]}</p>
              <p><strong>Trạng thái:</strong> {currentSummary?.status}</p>
              <p><strong>Nội dung:</strong> {currentSummary?.content}</p>
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
                  name="grade"
                  value={formData.grade}
                  onChange={handleFormChange}
                  required
                >
                  <option value="">Chọn lớp</option>
                  <option value="1">Lớp 1</option>
                  <option value="2">Lớp 2</option>
                  <option value="3">Lớp 3</option>
                  <option value="4">Lớp 4</option>
                  <option value="5">Lớp 5</option>
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
                <label>Trạng thái</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleFormChange}
                >
                  <option value="PENDING">Chờ duyệt</option>
                  <option value="APPROVED">Đã duyệt</option>
                </select>
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

      {/* Delete Confirmation Modal */}
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