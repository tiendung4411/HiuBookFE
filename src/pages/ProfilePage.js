import React, { useState, useEffect, useRef, useMemo } from "react";
import styles from "../styles/ProfilePage.module.css";
import confetti from "canvas-confetti";
import Header from "../components/Header";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { getReadHistoryByUser } from "../api/readHistory";
import { getSummariesByContributor } from "../api/summaries";
import { uploadImageToCloudinary, updateUserProfile } from "../api/users";
import {
  FaCheckCircle,
  FaHourglassHalf,
  FaShareAlt,
  FaTrash,
  FaTimesCircle,
  FaSearch,
  FaTimes,
  FaSortAlphaDown,
  FaSortAlphaUp
} from "react-icons/fa";

const ProfilePage = () => {
  const [user, setUser] = useState({
    id: null,
    name: "Bé Mèo Lười",
    grade: "Lớp 3A",
    avatar: "https://via.placeholder.com/150",
    summaries: 0
  });
  const [history, setHistory] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [readHistory, setReadHistory] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [selectedDate, setSelectedDate] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isImageChanged, setIsImageChanged] = useState(false);
  const [selectedSummary, setSelectedSummary] = useState(null);
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState("desc"); // Thêm tính năng sắp xếp
  const fileInputRef = useRef(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      setUser({
        id: storedUser.userId,
        name: storedUser.fullName,
        grade: storedUser.grade,
        avatar: storedUser.avatarUrl || "https://via.placeholder.com/150",
        summaries: storedUser.summaries || 0
      });
    }
  }, []);

  useEffect(() => {
    if (user.id) {
      getSummariesByContributor(user.id).then((response) => {
        const summaries = response.data;
        const formattedHistory = summaries
          .map((summary) => ({
            id: summary.summaryId,
            text: `Tóm tắt "${summary.title}" - ${new Date(
              summary.createdAt
            ).toLocaleDateString("vi-VN")}`,
            title: summary.title,
            status: summary.status,
            content: summary.content,
            summaryContent: summary.summaryContent,
            imageUrl: summary.imageUrl || "https://via.placeholder.com/150",
            shareLink: `https://example.com/summary/${summary.summaryId}`,
            createdAt: new Date(summary.createdAt)
          }))
          .sort((a, b) => b.createdAt - a.createdAt);
        setHistory(formattedHistory);
        setFilteredHistory(formattedHistory);
        setUser((prev) => ({ ...prev, summaries: summaries.length }));
      });

      getReadHistoryByUser(user.id).then((response) => {
        const uniqueHistory = [
          ...new Map(response.data.map((item) => [item.title, item])).values()
        ];
        setReadHistory(uniqueHistory);
      });
    }
  }, [user.id]);

  const stats = useMemo(
    () => ({
      total: history.length,
      approved: history.filter((item) => item.status === "APPROVED").length,
      pending: history.filter((item) => item.status === "PENDING").length,
      rejected: history.filter((item) => item.status === "REJECTED").length,
      avgTime: history.length
        ? (
            history.reduce(
              (acc, item) => acc + new Date(item.createdAt).getTime(),
              0
            ) / history.length
          ).toFixed(0)
        : 0
    }),
    [history]
  );

  const applyFiltersAndSort = () => {
    let filtered = [...history];
    if (filterStatus !== "ALL")
      filtered = filtered.filter((item) => item.status === filterStatus);
    if (selectedDate)
      filtered = filtered.filter(
        (item) =>
          new Date(item.createdAt).toDateString() ===
          selectedDate.toDateString()
      );
    if (searchQuery)
      filtered = filtered.filter((item) =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    filtered.sort((a, b) =>
      sortOrder === "asc"
        ? a.title.localeCompare(b.title)
        : b.title.localeCompare(a.title)
    );
    setFilteredHistory(filtered);
  };

  useEffect(() => {
    applyFiltersAndSort();
  }, [filterStatus, selectedDate, searchQuery, sortOrder, history]);

  const handleFilter = (status) => setFilterStatus(status);
  const handleDateChange = (e) =>
    setSelectedDate(e.target.value ? new Date(e.target.value) : null);
  const handleSearchChange = (e) => setSearchQuery(e.target.value);
  const toggleSortOrder = () =>
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  const clearFilters = () => {
    setFilterStatus("ALL");
    setSelectedDate(null);
    setSearchQuery("");
    setSortOrder("desc");
  };

  const handleAvatarClick = () => fileInputRef.current?.click();
  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (file && user.id) {
      const uploadResponse = await uploadImageToCloudinary(file);
      if (uploadResponse.success) {
        setUser((prev) => ({ ...prev, avatar: uploadResponse.imageUrl }));
        setIsImageChanged(true);
        setUploadMessage("Đã tải ảnh lên thành công! 🎉");
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        setTimeout(() => setUploadMessage(""), 3000);
      }
    }
  };

  const handleSaveChanges = async () => {
    if (user.id) {
      const userData = { fullName: user.name, avatarUrl: user.avatar };
      const updatedUser = await updateUserProfile(user.id, userData);
      setUser((prev) => ({ ...prev, ...updatedUser }));
      setIsImageChanged(false);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUploadMessage("Đã lưu thay đổi thành công!");
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      setTimeout(() => setUploadMessage(""), 3000);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    const updatedUserData = {
      fullName: e.target.name.value,
      avatarUrl: user.avatar
    };
    const updatedUser = await updateUserProfile(user.id, updatedUserData);
    setUser((prev) => ({ ...prev, name: updatedUser.fullName }));
    setIsModalOpen(false);
    localStorage.setItem("user", JSON.stringify(updatedUser));
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
  };

  const handleSummaryClick = (summary) => {
    setSelectedSummary(summary);
    setIsSummaryModalOpen(true);
  };

  const handleShare = (link) => {
    navigator.clipboard.writeText(link);
    setUploadMessage("Đã sao chép link tóm tắt!");
    setTimeout(() => setUploadMessage(""), 2000);
  };

  const handleDelete = (summaryId) => {
    if (window.confirm("Bạn có chắc muốn xóa tóm tắt này không?")) {
      const updatedHistory = history.filter((item) => item.id !== summaryId);
      setHistory(updatedHistory);
      applyFiltersAndSort();
      setIsSummaryModalOpen(false);
      setUploadMessage("Đã xóa tóm tắt!");
      setTimeout(() => setUploadMessage(""), 2000);
    }
  };

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 2 } },
      { breakpoint: 600, settings: { slidesToShow: 1 } }
    ]
  };

  return (
    <div>
      <Header />
      <div className={styles.container}>
        <div className={styles.profileSection}>
          <div className={styles.profileHeader}>
            <div className={styles.avatarWrapper}>
              <img
                className={styles.profileAvatar}
                src={user.avatar}
                alt="Ảnh đại diện"
                onClick={handleAvatarClick}
              />
              <div className={styles.uploadOverlay} onClick={handleAvatarClick}>
                Thay ảnh
              </div>
              <input
                type="file"
                ref={fileInputRef}
                className={styles.fileInput}
                accept="image/*"
                onChange={handleAvatarChange}
              />
            </div>
            <div className={styles.profileInfo}>
              <h1 className={styles.profileName}>{user.name}</h1>
              <p className={styles.profileGrade}>{user.grade}</p>
              <div className={styles.buttonGroup}>
                <button
                  className={styles.editProfileButton}
                  onClick={() => setIsModalOpen(true)}
                >
                  Chỉnh sửa
                </button>
                <button
                  className={styles.logoutButton}
                  onClick={() => alert("Đăng xuất thành công!")}
                >
                  Đăng xuất
                </button>
              </div>
            </div>
          </div>

          {uploadMessage && (
            <div className={styles.uploadMessage}>{uploadMessage}</div>
          )}

          {isImageChanged && (
            <button
              className={styles.saveChangesButton}
              onClick={handleSaveChanges}
            >
              Lưu thay đổi
            </button>
          )}

          <div className={styles.profileStats}>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>{stats.total}</span>
              <span className={styles.statLabel}>Tổng bài tóm tắt</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>{stats.approved}</span>
              <span className={styles.statLabel}>Đã duyệt</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>{stats.pending}</span>
              <span className={styles.statLabel}>Đang chờ</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>{stats.rejected}</span>
              <span className={styles.statLabel}>Từ chối</span>
            </div>
          </div>

          <div className={styles.profileHistory}>
            <h2 className={styles.historyTitle}>Lịch sử tóm tắt</h2>
            <div className={styles.filterSection}>
              <div className={styles.filterButtons}>
                {["ALL", "APPROVED", "PENDING", "REJECTED"].map((status) => (
                  <button
                    key={status}
                    className={`${styles.filterButton} ${
                      filterStatus === status ? styles.active : ""
                    }`}
                    onClick={() => handleFilter(status)}
                  >
                    {status === "ALL"
                      ? "Tất cả"
                      : status === "APPROVED"
                      ? "Đã duyệt"
                      : status === "PENDING"
                      ? "Đang chờ"
                      : "Từ chối"}{" "}
                    ({stats[status.toLowerCase()] || stats.total})
                  </button>
                ))}
              </div>
              <div className={styles.searchFilter}>
                <FaSearch className={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="Tìm kiếm theo tiêu đề..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className={styles.searchInput}
                />
                <button className={styles.sortButton} onClick={toggleSortOrder}>
                  {sortOrder === "asc" ? (
                    <FaSortAlphaUp />
                  ) : (
                    <FaSortAlphaDown />
                  )}
                </button>
              </div>
              <div className={styles.dateFilter}>
                <input
                  type="date"
                  onChange={handleDateChange}
                  value={
                    selectedDate ? selectedDate.toISOString().split("T")[0] : ""
                  }
                  className={styles.dateInput}
                />
              </div>
              {(filterStatus !== "ALL" || selectedDate || searchQuery) && (
                <button
                  className={styles.clearFilterButton}
                  onClick={clearFilters}
                >
                  <FaTimes /> Xóa bộ lọc
                </button>
              )}
            </div>
            <div className={styles.timeline}>
              {filteredHistory.length ? (
                filteredHistory.map((item) => (
                  <div
                    key={item.id}
                    className={`${styles.timelineItem} ${
                      item.status === "APPROVED"
                        ? styles.approved
                        : item.status === "REJECTED"
                        ? styles.rejected
                        : styles.pending
                    }`}
                    onClick={() => handleSummaryClick(item)}
                  >
                    <div className={styles.timelineIcon}>
                      {item.status === "APPROVED" ? (
                        <FaCheckCircle />
                      ) : item.status === "REJECTED" ? (
                        <FaTimesCircle />
                      ) : (
                        <FaHourglassHalf />
                      )}
                    </div>
                    <div className={styles.timelineContent}>
                      <p className={styles.historyText}>{item.text}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className={styles.emptyMessage}>Chưa có lịch sử tóm tắt.</p>
              )}
            </div>
          </div>

          <div className={styles.readHistorySection}>
            <h2 className={styles.sectionTitle}>Lịch sử đọc</h2>
            {readHistory.length ? (
              <Slider {...settings}>
                {readHistory.map((item, index) => (
                  <div key={index} className={styles.historyCard}>
                    <div className={styles.historyImageContainer}>
                      <img
                        src={item.imageUrl || "https://via.placeholder.com/150"}
                        alt={item.title}
                        className={styles.historyImage}
                      />
                    </div>
                    <h3 className={styles.historyTitle}>{item.title}</h3>
                  </div>
                ))}
              </Slider>
            ) : (
              <p className={styles.emptyMessage}>Không có lịch sử đọc.</p>
            )}
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h2 className={styles.modalTitle}>Chỉnh sửa Profile</h2>
            <form onSubmit={handleUpdateProfile}>
              <div className={styles.formGroup}>
                <label>Tên:</label>
                <input
                  type="text"
                  name="name"
                  defaultValue={user.name}
                  className={styles.textInput}
                  required
                />
              </div>
              <div className={styles.modalButtons}>
                <button type="submit" className={styles.saveButton}>
                  Lưu
                </button>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={() => setIsModalOpen(false)}
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isSummaryModalOpen && selectedSummary && (
        <div className={styles.summaryModalOverlay}>
          <div className={styles.summaryModalContent}>
            <div className={styles.dualLayout}>
              <div className={styles.contentPane}>
                <h3>Nội dung gốc</h3>
                <p>{selectedSummary.content || "Chưa có nội dung"}</p>
              </div>
              <div className={styles.summaryPane}>
                <h3>Tóm tắt</h3>
                <p>{selectedSummary.summaryContent || "Chưa có tóm tắt"}</p>
                {selectedSummary.imageUrl && (
                  <div className={styles.summaryImageContainer}>
                    <img
                      src={selectedSummary.imageUrl}
                      alt="Hình ảnh tóm tắt"
                      className={styles.summaryImage}
                    />
                  </div>
                )}
                <div className={styles.statusInfo}>
                  <p>
                    Trạng thái:{" "}
                    {selectedSummary.status === "APPROVED" ? (
                      <span className={styles.approvedText}>Đã duyệt</span>
                    ) : selectedSummary.status === "REJECTED" ? (
                      <span className={styles.rejectedText}>Từ chối</span>
                    ) : (
                      <span className={styles.pendingText}>Đang chờ</span>
                    )}
                  </p>
                </div>
              </div>
            </div>
            <div className={styles.modalActions}>
              <button
                className={styles.shareButton}
                onClick={() => handleShare(selectedSummary.shareLink)}
              >
                <FaShareAlt /> Chia sẻ
              </button>
              <button
                className={styles.deleteButton}
                onClick={() => handleDelete(selectedSummary.id)}
              >
                <FaTrash /> Xóa
              </button>
              <button
                className={styles.closeButton}
                onClick={() => setIsSummaryModalOpen(false)}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
