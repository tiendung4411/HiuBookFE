import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "../styles/AdminHeader.module.css";
import logo from "../../assets/images/logo_hiu.png"; // Logo bạn đã có
import { FaSignOutAlt } from "react-icons/fa";

const AdminHeader = () => {
  const navigate = useNavigate();

  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        <img src={logo} alt="HUIBOOK Logo" className={styles.logoImg} />
      </div>
      <div className={styles.navButtons}>
        <button className={styles.navButton} onClick={() => navigate("/")}>
          Trang chủ
        </button>
        <button className={styles.navButton} onClick={() => navigate("/login")}>
          <FaSignOutAlt className={styles.icon} />
          Đăng xuất
        </button>
      </div>
    </header>
  );
};

export default AdminHeader;
