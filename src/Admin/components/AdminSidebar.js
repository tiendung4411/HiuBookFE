import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styles from "../styles/AdminSidebar.module.css";
import {
  FaTachometerAlt,
  FaUsers,
  FaBook,
  FaSignOutAlt,
  FaSearch,
  FaBookOpen // Đã import icon cho Quản Lý Truyện
} from "react-icons/fa";
import logo from "../../assets/images/logo_hiu.png"; // Đảm bảo file logo tồn tại

const AdminSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { path: "/admin/dashboard", label: "Tổng Quan", icon: <FaTachometerAlt /> },
    { path: "/admin/users", label: "Người Dùng", icon: <FaUsers /> },
    { path: "/admin/summaries", label: "Tóm Tắt", icon: <FaBook /> },
    { path: "/admin/stories", label: "Quản Lý Truyện", icon: <FaBookOpen /> } // Đã thêm đúng
  ];

  const handleLogout = () => {
    navigate("/login");
  };

  return (
    <div className={styles.sidebar}>
      <div className={styles.logo}>
        <img src={logo} alt="HUIBOOK Logo" className={styles.logoImg} />
      </div>
      <div className={styles.search}>
        <input type="text" placeholder="Search..." />
        <FaSearch className={styles.searchIcon} />
      </div>
      <ul className={styles.menu}>
        {menuItems.map((item) => (
          <li
            key={item.path}
            className={`${styles.menuItem} ${
              location.pathname === item.path ? styles.active : ""
            }`}
            onClick={() => navigate(item.path)}
          >
            <span className={styles.icon}>{item.icon}</span>
            <span className={styles.label}>{item.label}</span>
          </li>
        ))}
      </ul>
      <div className={styles.logout} onClick={handleLogout}>
        <FaSignOutAlt className={styles.logoutIcon} />
        <span>Đăng xuất</span>
      </div>
    </div>
  );
};

export default AdminSidebar;
