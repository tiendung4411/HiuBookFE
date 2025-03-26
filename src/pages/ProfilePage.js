import React, { useState, useEffect, useRef } from "react";
import styles from "../styles/ProfilePage.module.css";
import confetti from "canvas-confetti";
import Header from "../components/Header";
import "slick-carousel/slick/slick.css";
import Slider from "react-slick";
import "slick-carousel/slick/slick-theme.css";
import { getReadHistoryByUser } from "../api/readHistory";
import { getSummariesByContributor } from "../api/summaries";
import { uploadImageToCloudinary, updateUserProfile } from "../api/users"; // Import new functions
import { FaCheckCircle, FaHourglassHalf } from "react-icons/fa";

const ProfilePage = () => {
  const [user, setUser] = useState({
    id: null,
    name: "Bé Mèo Lười",
    grade: "Lớp 3A",
    avatar: "https://via.placeholder.com/150",
    summaries: 0,
  });
  const [history, setHistory] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [readHistory, setReadHistory] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [isImageChanged, setIsImageChanged] = useState(false); // Track image changes
  const fileInputRef = useRef(null);

  // Load user data from localStorage
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      setUser({
        id: storedUser.userId,
        name: storedUser.fullName,
        grade: storedUser.grade,
        avatar: storedUser.avatarUrl || "https://via.placeholder.com/150",
        summaries: storedUser.summaries || 0,
      });
    }
  }, []);

  // Fetch summaries and read history
  useEffect(() => {
    if (user.id) {
      getSummariesByContributor(user.id)
        .then((response) => {
          const summaries = response.data;
          setUser((prevUser) => ({
            ...prevUser,
            summaries: summaries.length,
          }));
          const formattedHistory = summaries.map((summary) => ({
            id: summary.summaryId,
            text: `Tóm tắt "${summary.title}" - ${new Date(
              summary.createdAt
            ).toLocaleDateString("vi-VN")}`,
            status: summary.status,
          }));
          setHistory(formattedHistory);
          setFilteredHistory(formattedHistory);
        })
        .catch((error) => {
          console.error("Error fetching summaries:", error);
          setHistory([]);
          setFilteredHistory([]);
          setUser((prevUser) => ({ ...prevUser, summaries: 0 }));
        });

      getReadHistoryByUser(user.id)
        .then((response) => {
          const uniqueHistory = response.data.filter(
            (item, index, self) =>
              index === self.findIndex((t) => t.title === item.title)
          );
          setReadHistory(uniqueHistory);
        })
        .catch((error) => {
          console.error("Error fetching read history:", error);
          setReadHistory([]);
        });
    }
  }, [user.id]);

  const handleFilter = (status) => {
    setFilterStatus(status);
    if (status === "ALL") {
      setFilteredHistory(history);
    } else {
      setFilteredHistory(history.filter((item) => item.status === status));
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (file && user.id) {
      try {
        const uploadResponse = await uploadImageToCloudinary(file);
        if (uploadResponse.success) {
          const newAvatar = uploadResponse.imageUrl;
          setUser({ ...user, avatar: newAvatar });
          setIsImageChanged(true); // Show save button
          setUploadMessage("Đã tải ảnh lên thành công! 🎉");
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ["#1976d2", "#ffca28", "#f06292"],
          });
          setTimeout(() => setUploadMessage(""), 3000);
        }
      } catch (error) {
        setUploadMessage("Lỗi khi tải ảnh lên!");
        setTimeout(() => setUploadMessage(""), 3000);
      }
    }
  };

  const handleSaveChanges = async () => {
    if (user.id) {
      try {
        const userData = {
          fullName: user.name,
          avatarUrl: user.avatar,
        };
        const updatedUser = await updateUserProfile(user.id, userData);
        setUser((prev) => ({ ...prev, ...updatedUser }));
        setIsImageChanged(false);
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setUploadMessage("Đã lưu thay đổi thành công!");
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        setTimeout(() => setUploadMessage(""), 3000);
      } catch (error) {
        setUploadMessage("Lỗi khi lưu thay đổi!");
        setTimeout(() => setUploadMessage(""), 3000);
      }
    }
  };
  
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    const updatedUserData = {
      fullName: e.target.name.value,
      avatarUrl: user.avatar,
    };
    try {
      const updatedUser = await updateUserProfile(user.id, updatedUserData);
      setUser({ ...user, name: updatedUser.fullName });
      setIsModalOpen(false);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors: ["#1976d2", "#ffca28", "#f06292"] });
    } catch (error) {
      setUploadMessage("Lỗi khi cập nhật thông tin!");
      setTimeout(() => setUploadMessage(""), 3000);
    }
  };

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 1024,
        settings: { slidesToShow: 2, slidesToScroll: 1 },
      },
      {
        breakpoint: 600,
        settings: { slidesToShow: 1, slidesToScroll: 1 },
      },
    ],
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

          {/* Rest of the component remains the same until the modal */}
          <div className={styles.profileStats}>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>{user.summaries}</span>
              <span className={styles.statLabel}>Số bài tóm tắt</span>
            </div>
          </div>

          {/* History and Read History sections remain unchanged */}
          <div className={styles.profileHistory}>
            <h2 className={styles.historyTitle}>Lịch sử tóm tắt</h2>
            <div className={styles.filterButtons}>
              <button
                className={`${styles.filterButton} ${
                  filterStatus === "ALL" ? styles.active : ""
                }`}
                onClick={() => handleFilter("ALL")}
              >
                Tất cả
              </button>
              <button
                className={`${styles.filterButton} ${
                  filterStatus === "APPROVED" ? styles.active : ""
                }`}
                onClick={() => handleFilter("APPROVED")}
              >
                Đã duyệt
              </button>
              <button
                className={`${styles.filterButton} ${
                  filterStatus === "PENDING" ? styles.active : ""
                }`}
                onClick={() => handleFilter("PENDING")}
              >
                Đang chờ
              </button>
            </div>
            <div className={styles.historyList}>
              {filteredHistory.length > 0 ? (
                filteredHistory.map((item) => (
                  <div
                    key={item.id}
                    className={`${styles.historyItem} ${
                      item.status === "APPROVED"
                        ? styles.approved
                        : styles.pending
                    }`}
                  >
                    <p className={styles.historyText}>
                      {item.status === "APPROVED" ? (
                        <FaCheckCircle className={styles.statusIcon} />
                      ) : (
                        <FaHourglassHalf className={styles.statusIcon} />
                      )}
                      {item.text}
                    </p>
                  </div>
                ))
              ) : (
                <p className={styles.emptyMessage}>Chưa có lịch sử tóm tắt.</p>
              )}
            </div>
          </div>

          <div className={styles.readHistorySection}>
            <h2 className={styles.sectionTitle}>Lịch sử đọc</h2>
            {readHistory.length > 0 ? (
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
    </div>
  );
};

export default ProfilePage;