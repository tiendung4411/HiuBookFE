import React, { useState, useRef } from "react";
import styles from "../styles/ProfilePage.module.css";
import confetti from "canvas-confetti"; // Thêm thư viện confetti
import Header from "../components/Header"; // Import Header component

const ProfilePage = () => {
  const [user, setUser] = useState({
    name: "Bé Mèo Lười",
    grade: "Lớp 3A",
    avatar: "https://via.placeholder.com/150",
    summaries: 15
  });

  const [history, setHistory] = useState([
    { id: 1, text: 'Tóm tắt "Cây khế" - 18/03/2025' },
    { id: 2, text: 'Tóm tắt "Sơn Tinh Thủy Tinh" - 17/03/2025' }
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");
  const fileInputRef = useRef(null);

  // Xử lý upload ảnh đại diện
  const handleAvatarClick = () => {
    console.log("Avatar or overlay clicked");
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log("File selected:", file);
      const reader = new FileReader();
      reader.onloadend = () => {
        const newAvatar = reader.result;
        console.log("New avatar URL:", newAvatar);
        setUser({ ...user, avatar: newAvatar });
        setUploadMessage("Upload ảnh thành công! 🎉");
        // Hiệu ứng confetti khi upload thành công
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#1976d2", "#ffca28", "#f06292"]
        });
        setTimeout(() => setUploadMessage(""), 3000);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = (updatedUser) => {
    setUser({ ...user, ...updatedUser });
    setIsModalOpen(false);
    // Hiệu ứng confetti khi nhấn "Lưu"
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#1976d2", "#ffca28", "#f06292"]
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
            <h2 className={styles.historyTitle}>Lịch sử tóm tắt</h2>
            <div className={styles.historyList}>
              {history.map((item) => (
                <div key={item.id} className={styles.historyItem}>
                  <p className={styles.historyText}>{item.text}</p>
                </div>
              ))}
            </div>
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
                  avatar: user.avatar
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
