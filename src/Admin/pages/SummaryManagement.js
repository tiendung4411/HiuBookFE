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
  FaCheck,
  FaTimes
} from "react-icons/fa";
import Modal from "react-modal";
import { motion, AnimatePresence } from "framer-motion";
import { 
  getAllSummariesAdmin, 
  updateSummary, 
  updateSummaryStatus, 
  updateSummaryContent, 
  updateSummaryImage,
  deleteSummary // Added deleteSummary
} from "../../api/summaries";
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
  Legend
} from "chart.js";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
  const miniChartInstance = useRef(null);

  const [summaries, setSummaries] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchCriteria, setSearchCriteria] = useState("title");
  const [methodFilter, setMethodFilter] = useState("All");
  const [classFilter, setClassFilter] = useState("All");
  const [activeTab, setActiveTab] = useState("PENDING");
  const [dateFilter, setDateFilter] = useState("All");
  const [sortOrder, setSortOrder] = useState("A-Z");
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isViewMode, setIsViewMode] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmSummaryId, setConfirmSummaryId] = useState(null);
  const [formData, setFormData] = useState({});
  const [currentSummary, setCurrentSummary] = useState(null);
  const [selectedSummaries, setSelectedSummaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const itemsPerPage = 4;

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

  // Thêm phím tắt
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === "n") {
        e.preventDefault();
        openAddModal();
      }
      if (e.ctrlKey && e.key === "a" && currentSummary?.status === "PENDING") {
        e.preventDefault();
        handleQuickApprove(currentSummary.summaryId);
      }
      if (e.ctrlKey && e.key === "r" && currentSummary?.status === "PENDING") {
        e.preventDefault();
        handleQuickReject(currentSummary.summaryId);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentSummary]);

  // Filter and search summaries
  const filteredSummaries = summaries.filter((summary) => {
    const searchValue = searchTerm.toLowerCase();
    const matchesSearch =
      (searchCriteria === "title" &&
        (summary.title?.toLowerCase() || "").includes(searchValue)) ||
      (searchCriteria === "content" &&
        (summary.content?.toLowerCase() || "").includes(searchValue)) ||
      (searchCriteria === "grade" &&
        (summary.grade?.toString() || "").includes(searchValue)) ||
      (searchCriteria === "method" &&
        (summary.method?.toLowerCase() || "").includes(searchValue)) ||
      (searchCriteria === "status" &&
        (summary.status?.toLowerCase() || "").includes(searchValue));
    const matchesMethod =
      methodFilter === "All" || summary.method === methodFilter;
    const matchesClass = classFilter === "All" || summary.grade === classFilter;
    const matchesStatus = summary.status === activeTab;
    const matchesDate =
      dateFilter === "All" ||
      (dateFilter === "Last7Days" &&
        new Date(summary.createdAt) >=
          new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
    return (
      matchesSearch &&
      matchesMethod &&
      matchesClass &&
      matchesStatus &&
      matchesDate
    );
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
  const approvedSummaries = summaries.filter(
    (s) => s.status === "APPROVED"
  ).length;
  const pendingSummaries = summaries.filter(
    (s) => s.status === "PENDING"
  ).length;
  const rejectedSummaries = summaries.filter(
    (s) => s.status === "REJECTED"
  ).length;

  // Charts
  useEffect(() => {
    if (!summaries.length || loading) return;

    const gradeCount = {
      "Lớp 1": 0,
      "Lớp 2": 0,
      "Lớp 3": 0,
      "Lớp 4": 0,
      "Lớp 5": 0,
      Khác: 0
    };
    summaries.forEach((summary) => {
      const grade = summary.grade ? `Lớp ${summary.grade}` : "Khác";
      gradeCount[grade] = (gradeCount[grade] || 0) + 1;
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
              backgroundColor: "#3498db"
            }
          ]
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true,
              title: { display: true, text: "Số lượng" }
            },
            x: { title: { display: true, text: "Lớp học" } }
          },
          plugins: {
            legend: { display: false },
            title: { display: true, text: "Số lượng tóm tắt theo lớp học" }
          }
        }
      });
    }

    const methodCount = { "Diễn giải": 0, "Trích xuất": 0 };
    summaries.forEach((summary) => {
      const method = summary.method?.toLowerCase();
      if (["paraphrase", "abstractive", "a"].includes(method))
        methodCount["Diễn giải"]++;
      else if (["extractive", "e", "extraction"].includes(method))
        methodCount["Trích xuất"]++;
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
              backgroundColor: ["#2ecc71", "#f1c40f"]
            }
          ]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { position: "top" },
            title: { display: true, text: "Tỷ lệ tóm tắt theo kiểu" }
          }
        }
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
      prev.includes(id)
        ? prev.filter((summaryId) => summaryId !== id)
        : [...prev, id]
    );
  };

  const handleBulkDelete = () => {
    setIsDeleteModalOpen(true);
  };

  const confirmBulkDelete = async () => {
    try {
      // Call deleteSummary for each selected summary
      await Promise.all(
        selectedSummaries.map((id) => deleteSummary(id))
      );
      setSummaries(
        summaries.filter(
          (summary) => !selectedSummaries.includes(summary.summaryId)
        )
      );
      setSelectedSummaries([]);
      setIsDeleteModalOpen(false);
      toast.success("Đã xóa thành công!");
    } catch (error) {
      console.error("Error deleting summaries:", error);
      toast.error("Xóa thất bại!");
    }
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
      status: "PENDING"
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
      status: summary.status
    });
    setIsModalOpen(true);
  };

  const openViewModal = (summary) => {
    setIsEditMode(false);
    setIsViewMode(true);
    setCurrentSummary(summary);
    setIsModalOpen(true);

    setTimeout(() => {
      const ctx = document.getElementById("miniChart")?.getContext("2d");
      if (ctx && !miniChartInstance.current) {
        miniChartInstance.current = new Chart(ctx, {
          type: "doughnut",
          data: {
            labels: ["Nội dung gốc", "Nội dung tóm tắt"],
            datasets: [
              {
                data: [
                  summary.content?.length || 0,
                  summary.summaryContent?.length || summary.content?.length || 0
                ],
                backgroundColor: ["#3498db", "#2ecc71"]
              }
            ]
          },
          options: {
            responsive: true,
            plugins: { legend: { position: "bottom" } }
          }
        });
      }
    }, 100);
  };

  const openReviewModal = (summary) => {
    setCurrentSummary(summary);
    setIsReviewModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentSummary(null);
    if (miniChartInstance.current) {
      miniChartInstance.current.destroy();
      miniChartInstance.current = null;
    }
  };

  const closeReviewModal = () => {
    setIsReviewModalOpen(false);
    setCurrentSummary(null);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
  };

  const closeConfirmModal = () => {
    setIsConfirmModalOpen(false);
    setConfirmAction(null);
    setConfirmSummaryId(null);
  };

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = async () => {
    const newSummary = {
      ...formData,
      summaryId: isEditMode ? currentSummary.summaryId : Date.now().toString()
    };
    try {
      if (isEditMode) {
        await updateSummary(newSummary.summaryId, {
          title: newSummary.title,
          grade: newSummary.grade,
          method: newSummary.method,
          createdAt: newSummary.createdAt,
          content: newSummary.content,
          status: newSummary.status
        });
        setSummaries(
          summaries.map((s) =>
            s.summaryId === currentSummary.summaryId ? newSummary : s
          )
        );
        toast.success("Đã cập nhật thành công!");
      } else {
        setSummaries([...summaries, newSummary]);
        toast.success("Đã thêm thành công!");
      }
      closeModal();
    } catch (error) {
      console.error("Error updating summary:", error);
      toast.error("Cập nhật thất bại!");
    }
  };

  const handleDelete = (id) => {
    setSelectedSummaries([id]);
    setIsDeleteModalOpen(true);
  };

  const handleApprove = async () => {
    if (!currentSummary) return;
    try {
      await updateSummaryStatus(currentSummary.summaryId, "APPROVED");
      setSummaries((prev) =>
        prev.map((s) =>
          s.summaryId === currentSummary.summaryId
            ? { ...s, status: "APPROVED" }
            : s
        )
      );
      setIsReviewModalOpen(false);
      toast.success("Đã duyệt thành công!");
    } catch (error) {
      console.error("Error approving summary:", error);
      toast.error("Duyệt thất bại!");
    }
  };

  const handleReject = async () => {
    if (!currentSummary) return;
    try {
      await updateSummaryStatus(currentSummary.summaryId, "REJECTED");
      setSummaries((prev) =>
        prev.map((s) =>
          s.summaryId === currentSummary.summaryId
            ? { ...s, status: "REJECTED" }
            : s
        )
      );
      setIsReviewModalOpen(false);
      toast.success("Đã từ chối thành công!");
    } catch (error) {
      console.error("Error rejecting summary:", error);
      toast.error("Từ chối thất bại!");
    }
  };

  const handleQuickApprove = async (id) => {
    setConfirmAction("approve");
    setConfirmSummaryId(id);
    setIsConfirmModalOpen(true);
  };

  const handleQuickReject = async (id) => {
    setConfirmAction("reject");
    setConfirmSummaryId(id);
    setIsConfirmModalOpen(true);
  };

  const confirmQuickAction = async () => {
    if (!confirmSummaryId || !confirmAction) return;
    try {
      if (confirmAction === "approve") {
        await updateSummaryStatus(confirmSummaryId, "APPROVED");
        setSummaries((prev) =>
          prev.map((s) =>
            s.summaryId === confirmSummaryId ? { ...s, status: "APPROVED" } : s
          )
        );
        toast.success("Đã duyệt nhanh thành công!");
      } else if (confirmAction === "reject") {
        await updateSummaryStatus(confirmSummaryId, "REJECTED");
        setSummaries((prev) =>
          prev.map((s) =>
            s.summaryId === confirmSummaryId ? { ...s, status: "REJECTED" } : s
          )
        );
        toast.success("Đã từ chối nhanh thành công!");
      }
    } catch (error) {
      console.error(`Error ${confirmAction}ing summary:`, error);
      toast.error(
        `${confirmAction === "approve" ? "Duyệt" : "Từ chối"} thất bại!`
      );
    } finally {
      closeConfirmModal();
    }
  };

  const handleUpdateContent = async (id, title, content) => {
    try {
      await updateSummaryContent(id, title, content);
      setSummaries((prev) =>
        prev.map((s) =>
          s.summaryId === id ? { ...s, title, content } : s
        )
      );
      toast.success("Đã cập nhật nội dung thành công!");
    } catch (error) {
      console.error("Error updating summary content:", error);
      toast.error("Cập nhật nội dung thất bại!");
    }
  };

  const handleUpdateImage = async (id, imageUrl) => {
    try {
      await updateSummaryImage(id, imageUrl);
      setSummaries((prev) =>
        prev.map((s) =>
          s.summaryId === id ? { ...s, imageUrl } : s
        )
      );
      toast.success("Đã cập nhật hình ảnh thành công!");
    } catch (error) {
      console.error("Error updating summary image:", error);
      toast.error("Cập nhật hình ảnh thất bại!");
    }
  };

  return (
    <div className={styles.container}>
      <AdminSidebar />
      <div className={styles.main}>
        <AdminHeader />
        <div className={styles.content}>
          <div className={styles.header}>
            <h1 className={styles.title}>Quản Lý Tóm Tắt</h1>
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
            <StatCard
              title="Tóm tắt Bị từ chối"
              value={rejectedSummaries}
              color="#f39c12"
              icon="❌"
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
              <select
                value={searchCriteria}
                onChange={(e) => setSearchCriteria(e.target.value)}
                className={styles.searchCriteria}
              >
                <option value="title">Tiêu đề</option>
                <option value="content">Nội dung</option>
                <option value="grade">Lớp học</option>
                <option value="method">Kiểu</option>
                <option value="status">Trạng thái</option>
              </select>
              <input
                type="text"
                placeholder={`Tìm kiếm theo ${searchCriteria}...`}
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

          <div className={styles.tabContainer}>
            <button
              className={`${styles.tabButton} ${
                activeTab === "PENDING" ? styles.activeTab : ""
              }`}
              onClick={() => {
                setActiveTab("PENDING");
                setCurrentPage(1);
              }}
            >
              Chờ duyệt ({pendingSummaries})
            </button>
            <button
              className={`${styles.tabButton} ${
                activeTab === "APPROVED" ? styles.activeTab : ""
              }`}
              onClick={() => {
                setActiveTab("APPROVED");
                setCurrentPage(1);
              }}
            >
              Đã duyệt ({approvedSummaries})
            </button>
            <button
              className={`${styles.tabButton} ${
                activeTab === "REJECTED" ? styles.activeTab : ""
              }`}
              onClick={() => {
                setActiveTab("REJECTED");
                setCurrentPage(1);
              }}
            >
              Bị từ chối ({rejectedSummaries})
            </button>
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
                          : paginatedSummaries.map(
                              (summary) => summary.summaryId
                            )
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
                <th>Trạng thái</th>
                <th>Hành động</th>
                <th>Duyệt</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="9" className={styles.noData}>
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
                    <td>
                      <div className={styles.tooltip}>
                        {summary.title}
                        <span className={styles.tooltipText}>
                          {summary.content || "Không có nội dung"}
                        </span>
                      </div>
                    </td>
                    <td>{summary.grade}</td>
                    <td>{summary.method}</td>
                    <td>{summary.createdAt.split("T")[0]}</td>
                    <td>
                      <span
                        className={`${styles.status} ${
                          summary.status === "APPROVED"
                            ? styles.approved
                            : summary.status === "REJECTED"
                            ? styles.rejected
                            : styles.pending
                        }`}
                      >
                        {summary.status === "APPROVED"
                          ? "Đã duyệt"
                          : summary.status === "REJECTED"
                          ? "Bị từ chối"
                          : "Chờ duyệt"}
                      </span>
                    </td>
                    <td>
                      <button
                        className={styles.viewButton}
                        onClick={() =>
                          summary.status === "PENDING"
                            ? openReviewModal(summary)
                            : openViewModal(summary)
                        }
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
                        <FaTrash />
                      </button>
                    </td>
                    <td>
                      {summary.status === "PENDING" ? (
                        <div className={styles.quickActions}>
                          <button
                            className={styles.quickApproveButton}
                            onClick={() =>
                              handleQuickApprove(summary.summaryId)
                            }
                          >
                            <FaCheck />
                          </button>
                          <button
                            className={styles.quickRejectButton}
                            onClick={() => handleQuickReject(summary.summaryId)}
                          >
                            <FaTimes />
                          </button>
                        </div>
                      ) : (
                        "—"
                      )}
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className={styles.noData}>
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
              <p>
                <strong>ID:</strong> {currentSummary?.summaryId}
              </p>
              <p>
                <strong>Tiêu đề:</strong> {currentSummary?.title}
              </p>
              <p>
                <strong>Lớp học:</strong> {currentSummary?.grade}
              </p>
              <p>
                <strong>Kiểu:</strong> {currentSummary?.method}
              </p>
              <p>
                <strong>Ngày tạo:</strong>{" "}
                {currentSummary?.createdAt.split("T")[0]}
              </p>
              <p>
                <strong>Trạng thái:</strong> {currentSummary?.status}
              </p>
              <p>
                <strong>Nội dung:</strong> {currentSummary?.content}
              </p>
              <canvas id="miniChart" className={styles.miniChart}></canvas>
              {currentSummary?.imageUrl && (
                <div className={styles.modalImageContainer}>
                  <img
                    src={currentSummary.imageUrl}
                    alt="Hình ảnh tóm tắt"
                    className={styles.modalImage}
                  />
                </div>
              )}
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
                  <option value="REJECTED">Bị từ chối</option>
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

      {/* Modal for Review */}
      <Modal
        isOpen={isReviewModalOpen}
        onRequestClose={closeReviewModal}
        className={styles.modal}
        overlayClassName={styles.modalOverlay}
      >
        <motion.div
          className={styles.modalContent}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <h2>Duyệt Bản Tóm Tắt</h2>
          <div className={styles.reviewDetails}>
            <div className={styles.detailSection}>
              <h3>Thông Tin Chung</h3>
              <p>
                <strong>Tiêu đề:</strong>{" "}
                {currentSummary?.title || "Chưa có tiêu đề"}
              </p>
              <p>
                <strong>Lớp học:</strong>{" "}
                {currentSummary?.grade || "Không xác định"}
              </p>
              <p>
                <strong>Kiểu tóm tắt:</strong>{" "}
                {currentSummary?.method || "Không xác định"}
              </p>
              <p>
                <strong>Ngày tạo:</strong>{" "}
                {currentSummary?.createdAt?.split("T")[0] || "Không xác định"}
              </p>
              <p>
                <strong>Trạng thái:</strong>{" "}
                {currentSummary?.status === "PENDING"
                  ? "Chờ duyệt"
                  : currentSummary?.status === "APPROVED"
                  ? "Đã duyệt"
                  : "Bị từ chối"}
              </p>
            </div>
            <div className={styles.detailSection}>
              <h3>Nội Dung Gốc</h3>
              <div className={styles.contentBox}>
                <p>{currentSummary?.content || "Không có nội dung gốc"}</p>
              </div>
            </div>
            <div className={styles.detailSection}>
              <h3>Nội Dung Tóm Tắt</h3>
              <div className={styles.contentBox}>
                <p>
                  {currentSummary?.summaryContent ||
                    "Không có nội dung tóm tắt"}
                </p>
              </div>
            </div>
            {currentSummary?.imageUrl && (
              <div className={styles.detailSection}>
                <h3>Hình Ảnh</h3>
                <div className={styles.modalImageContainer}>
                  <img
                    src={currentSummary.imageUrl}
                    alt="Hình ảnh tóm tắt"
                    className={styles.modalImage}
                  />
                </div>
              </div>
            )}
          </div>
          {currentSummary?.status === "PENDING" && (
            <div className={styles.modalButtons}>
              <button className={styles.approveButton} onClick={handleApprove}>
                Duyệt
              </button>
              <button className={styles.rejectButton} onClick={handleReject}>
                Từ chối
              </button>
            </div>
          )}
          <button onClick={closeReviewModal} className={styles.cancelButton}>
            Đóng
          </button>
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

      {/* Confirm Action Modal (Duyệt/Từ chối nhanh) */}
      <Modal
        isOpen={isConfirmModalOpen}
        onRequestClose={closeConfirmModal}
        className={styles.deleteModal}
        overlayClassName={styles.modalOverlay}
      >
        <motion.div
          className={styles.deleteModalContent}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <h2>Xác nhận hành động</h2>
          <p>
            Bạn có chắc muốn {confirmAction === "approve" ? "duyệt" : "từ chối"}{" "}
            bản tóm tắt này không?
          </p>
          <div className={styles.modalButtons}>
            <button
              onClick={confirmQuickAction}
              className={styles.confirmActionButton}
            >
              Xác nhận
            </button>
            <button onClick={closeConfirmModal} className={styles.cancelButton}>
              Hủy
            </button>
          </div>
        </motion.div>
      </Modal>

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default SummaryManagement;