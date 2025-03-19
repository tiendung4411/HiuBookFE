import React, { useState, useEffect } from "react";
import AdminSidebar from "../components/AdminSidebar";
import AdminHeader from "../components/AdminHeader";
import StatCard from "../components/StatCard";
import StoryTable from "../components/StoryTable";
import ModalStory from "../components/ModalStory";
import DeleteConfirmationModal from "../components/DeleteConfirmationModal";
import styles from "../styles/StoryManagement.module.css";
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
import { motion } from "framer-motion";

// Dữ liệu tĩnh (giả lập, bao gồm tóm tắt)
const initialStories = [
  {
    id: 1,
    title: "Thỏ và Rùa",
    class: "Lớp 1",
    status: "Approved",
    createdAt: "2025-03-16",
    content: "Câu chuyện về chú thỏ và chú rùa.",
    summaries: {
      extract: "Tóm tắt trích xuất: Thỏ và Rùa thi chạy, Rùa thắng.",
      paraphrase:
        "Tóm tắt diễn giải: Một cuộc đua giữa Thỏ và Rùa, với bài học về sự kiên trì."
    }
  },
  {
    id: 2,
    title: "Cậu Bé và Cây Táo",
    class: "Lớp 1",
    status: "Pending",
    createdAt: "2025-03-15",
    content: "Câu chuyện cảm động về tình yêu gia đình.",
    summaries: {
      extract: "Tóm tắt trích xuất: Cậu bé lấy táo từ cây táo.",
      paraphrase:
        "Tóm tắt diễn giải: Câu chuyện về tình cảm giữa cậu bé và cây táo qua nhiều năm."
    }
  },
  {
    id: 3,
    title: "Bạn Thân",
    class: "Lớp 2",
    status: "Approved",
    createdAt: "2025-03-14",
    content: "Bài học về tình bạn.",
    summaries: {
      extract: "Tóm tắt trích xuất: Hai bạn giúp nhau vượt khó.",
      paraphrase:
        "Tóm tắt diễn giải: Một câu chuyện cảm động về tình bạn vượt qua thử thách."
    }
  },
  {
    id: 4,
    title: "Nước và Thời Tiết",
    class: "Lớp 3",
    status: "Approved",
    createdAt: "2025-03-13",
    content: "Khám phá cách nước ảnh hưởng đến thời tiết.",
    summaries: {
      extract: "Tóm tắt trích xuất: Nước tạo mưa và sương mù.",
      paraphrase:
        "Tóm tắt diễn giải: Nước đóng vai trò quan trọng trong việc hình thành các hiện tượng thời tiết."
    }
  },
  {
    id: 5,
    title: "Tấm Cám",
    class: "Lớp 5",
    status: "Pending",
    createdAt: "2025-03-12",
    content: "Truyện cổ tích về lòng tốt.",
    summaries: {
      extract: "Tóm tắt trích xuất: Tấm vượt qua gian khổ để thành hoàng hậu.",
      paraphrase:
        "Tóm tắt diễn giải: Câu chuyện về sự chiến thắng của lòng tốt trước sự độc ác."
    }
  },
  {
    id: 6,
    title: "Bí Ẩn Đại Dương",
    class: "Lớp 5",
    status: "Approved",
    createdAt: "2025-03-11",
    content: "Cuộc phiêu lưu dưới lòng đại dương.",
    summaries: {
      extract: "Tóm tắt trích xuất: Khám phá sinh vật biển.",
      paraphrase:
        "Tóm tắt diễn giải: Một hành trình thú vị dưới đại dương với nhiều khám phá."
    }
  }
];

// Cài đặt root cho modal
Modal.setAppElement("#root");

const StoryManagement = () => {
  const [stories, setStories] = useState(initialStories);
  const [searchTerm, setSearchTerm] = useState("");
  const [classFilter, setClassFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("All");
  const [sortOrder, setSortOrder] = useState("A-Z");
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isViewMode, setIsViewMode] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentStory, setCurrentStory] = useState(null);
  const [selectedStories, setSelectedStories] = useState([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    class: "",
    status: "Pending",
    createdAt: new Date().toISOString().split("T")[0],
    content: "",
    summaries: { extract: "", paraphrase: "" } // Thêm trường để quản lý tóm tắt
  });
  const itemsPerPage = 4;

  // Lọc và tìm kiếm truyện
  const filteredStories = stories.filter((story) => {
    const matchesSearch =
      story.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      story.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (story.summaries.extract &&
        story.summaries.extract
          .toLowerCase()
          .includes(searchTerm.toLowerCase())) ||
      (story.summaries.paraphrase &&
        story.summaries.paraphrase
          .toLowerCase()
          .includes(searchTerm.toLowerCase()));
    const matchesClass = classFilter === "All" || story.class === classFilter;
    const matchesStatus =
      statusFilter === "All" || story.status === statusFilter;
    const matchesDate =
      dateFilter === "All" ||
      (dateFilter === "Last7Days" &&
        new Date(story.createdAt) >=
          new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
    return matchesSearch && matchesClass && matchesStatus && matchesDate;
  });

  // Sắp xếp truyện
  const sortedStories = [...filteredStories].sort((a, b) => {
    if (sortOrder === "A-Z") {
      return a.title.localeCompare(b.title);
    } else {
      return b.title.localeCompare(a.title);
    }
  });

  // Phân trang
  const totalPages = Math.ceil(sortedStories.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedStories = sortedStories.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // Thẻ thống kê
  const totalStories = stories.length;
  const approvedStories = stories.filter((s) => s.status === "Approved").length;
  const classStories = [...new Set(stories.map((s) => s.class))].length;

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "A-Z" ? "Z-A" : "A-Z");
  };

  const handleSelectStory = (id) => {
    setSelectedStories((prev) =>
      prev.includes(id)
        ? prev.filter((storyId) => storyId !== id)
        : [...prev, id]
    );
  };

  const handleBulkDelete = () => {
    setIsDeleteModalOpen(true);
  };

  const confirmBulkDelete = () => {
    setStories(stories.filter((story) => !selectedStories.includes(story.id)));
    setSelectedStories([]);
    setIsDeleteModalOpen(false);
  };

  const openAddModal = () => {
    setIsEditMode(false);
    setIsViewMode(false);
    setFormData({
      title: "",
      class: "",
      status: "Pending",
      createdAt: new Date().toISOString().split("T")[0],
      content: "",
      summaries: { extract: "", paraphrase: "" }
    });
    setIsModalOpen(true);
  };

  const openEditModal = (story) => {
    setIsEditMode(true);
    setIsViewMode(false);
    setCurrentStory(story);
    setFormData({ ...story });
    setIsModalOpen(true);
  };

  const openViewModal = (story) => {
    setIsEditMode(false);
    setIsViewMode(true);
    setCurrentStory(story);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentStory(null);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    if (name === "extract" || name === "paraphrase") {
      setFormData((prev) => ({
        ...prev,
        summaries: { ...prev.summaries, [name]: value }
      }));
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleFormSubmit = () => {
    if (isEditMode) {
      setStories(
        stories.map((s) =>
          s.id === currentStory.id ? { ...formData, id: s.id } : s
        )
      );
    } else if (!isViewMode) {
      const newStory = { ...formData, id: stories.length + 1 };
      setStories([...stories, newStory]);
    }
    closeModal();
  };

  const handleDelete = (id) => {
    setSelectedStories([id]);
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
            <h1 className={styles.title}>Quản Lý Truyện</h1>
            <button className={styles.themeButton} onClick={toggleTheme}>
              {isDarkMode ? "Chuyển sang sáng" : "Chuyển sang tối"}
            </button>
          </div>
          <div className={styles.statsContainer}>
            <StatCard
              title="Tổng số truyện"
              value={totalStories}
              color="#3498db"
              icon="📚"
            />
            <StatCard
              title="Truyện đã duyệt"
              value={approvedStories}
              color="#2ecc71"
              icon="✅"
            />
            <StatCard
              title="Số lớp học"
              value={classStories}
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
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className={styles.filterSelect}
              >
                <option value="All">Tất cả trạng thái</option>
                <option value="Approved">Đã duyệt</option>
                <option value="Pending">Chưa duyệt</option>
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
                Thêm Truyện
              </button>
            </div>
          </div>
          {selectedStories.length > 0 && (
            <motion.div
              className={styles.bulkActions}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <span>Đã chọn {selectedStories.length} truyện</span>
              <button
                className={styles.bulkDeleteButton}
                onClick={handleBulkDelete}
              >
                <FaTrash className={styles.bulkDeleteIcon} />
                Xóa
              </button>
            </motion.div>
          )}
          <StoryTable
            stories={paginatedStories}
            onView={openViewModal}
            onEdit={openEditModal}
            onDelete={handleDelete}
            selectedStories={selectedStories}
            onSelectStory={handleSelectStory}
          />
          <div className={styles.pagination}>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              className={styles.pageButton}
            >
              <FaArrowLeft />
            </motion.button>
            <span>
              Trang {currentPage} / {totalPages}
            </span>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className={styles.pageButton}
            >
              <FaArrowRight />
            </motion.button>
          </div>
        </div>
      </div>

      <ModalStory
        isOpen={isModalOpen}
        onClose={closeModal}
        isViewMode={isViewMode}
        isEditMode={isEditMode}
        formData={formData}
        onChange={handleFormChange}
        onSubmit={handleFormSubmit}
        currentStory={currentStory}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onConfirm={confirmBulkDelete}
        onCancel={closeDeleteModal}
        count={selectedStories.length}
      />
    </div>
  );
};

export default StoryManagement;
