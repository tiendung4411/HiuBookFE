import React, { useState, useEffect, useRef } from "react";
import styles from "../styles/ProfilePage.module.css";
import confetti from "canvas-confetti"; // Thêm thư viện confetti
import Header from "../components/Header"; // Import Header component
import "slick-carousel/slick/slick.css";
import Slider from 'react-slick';
import "slick-carousel/slick/slick-theme.css";
import { getReadHistoryByUser } from '../api/readHistory';
const ProfilePage = () => {
  const [user, setUser] = useState({
    id: null,
    name: "Bé Mèo Lười",
    grade: "Lớp 3A",
    avatar: "https://via.placeholder.com/150",
    summaries: 15,
  });

  const [history, setHistory] = useState([
    { id: 1, text: 'Tóm tắt "Cây khế" - 18/03/2025' },
    { id: 2, text: 'Tóm tắt "Sơn Tinh Thủy Tinh" - 17/03/2025' },
  ]);
  const [readHistory, setReadHistory] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");
  const fileInputRef = useRef(null);

  // Load user data from localStorage on page load
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    console.log("Stored user from localStorage:", storedUser);
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      console.log("Parsed user data:", parsedUser);
      setUser({
        id: parsedUser.userId,
        name: parsedUser.fullName,
        grade: parsedUser.grade,
        avatar: parsedUser.avatarUrl || "https://via.placeholder.com/150",
        summaries: parsedUser.summaries || 0,
      });
      console.log("User data loaded from localStorage:", parsedUser);
    } else {
      console.log("No user data found in localStorage");
    }
  }, []);
  useEffect(() => {
    if (user.id) {
      console.log("Loading read history for user:", user.id);
      getReadHistoryByUser(user.id).then((response) => {
        console.log("Read history loaded:", response.data);
        // Lọc trùng lặp dựa trên title
        const uniqueHistory = response.data
          .filter(
            (item, index, self) =>
              index === self.findIndex((t) => t.title === item.title)
          );
        setReadHistory(uniqueHistory);
      });
    }
  }, [user.id]);
  // Xử lý upload ảnh đại diện
  const handleAvatarClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newAvatar = reader.result;
        setUser({ ...user, avatar: newAvatar });
        setUploadMessage("Upload ảnh thành công! 🎉");
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#1976d2", "#ffca28", "#f06292"],
        });
        setTimeout(() => setUploadMessage(""), 3000);
      };
      reader.readAsDataURL(file);
    }
  };
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    // Thêm responsive để điều chỉnh số slide trên các kích thước màn hình
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };
  const handleUpdateProfile = (updatedUser) => {
    setUser({ ...user, ...updatedUser });
    setIsModalOpen(false);
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#1976d2", "#ffca28", "#f06292"],
    });
  };

  return (
    <div>
      {/* Thêm Header */}
      <Header />

      {/* Nội dung trang Profile */}
      <div className={styles.container}>
        <div className={styles.profileSection}>
          {/* Profile Header */}
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

          {/* Upload Message */}
          {uploadMessage && (
            <div className={styles.uploadMessage}>{uploadMessage}</div>
          )}

          {/* Profile Stats */}
          <div className={styles.profileStats}>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>{user.summaries}</span>
              <span className={styles.statLabel}>Truyện đã tóm tắt</span>
            </div>
          </div>

          {/* Profile History */}
          <div className={styles.profileHistory}>
  <h2 className={styles.historyTitle}>Lịch sử đọc</h2>
  {readHistory.length > 0 ? (
    <Slider {...settings}>
      {readHistory.map((item) => (
        <div key={item.id}>
          <h3>{item.title}</h3>
          <img
            src={item.imageUrl || "https://via.placeholder.com/150?text=Sample+Image"}
            alt={item.title}
            style={{ width: "100%", height: "150px", objectFit: "cover" }}
          />
        </div>
      ))}
    </Slider>
  ) : (
    <p>Không có lịch sử đọc.</p>
  )}
</div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h2 className={styles.modalTitle}>Chỉnh sửa Profile</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const updatedUser = {
                  name: e.target.name.value,
                  grade: e.target.grade.value,
                  avatar: user.avatar,
                };
                handleUpdateProfile(updatedUser);
              }}
            >
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
              <div className={styles.formGroup}>
                <label>Lớp:</label>
                <input
                  type="text"
                  name="grade"
                  defaultValue={user.grade}
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
