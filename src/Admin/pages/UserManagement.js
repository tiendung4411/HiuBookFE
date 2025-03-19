import React, { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom"; // Sử dụng Outlet và router hooks
import AdminSidebar from "../components/AdminSidebar"; // Import sidebar
import styles from "../styles/UserManagement.module.css";
import StatCard from "../components/StatCard";

const UserManagement = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [users, setUsers] = useState([
    { id: 1, name: "Nguyen Van A", email: "a@example.com", role: "User" },
    { id: 2, name: "Tran Thi B", email: "b@example.com", role: "Admin" },
    { id: 3, name: "Le Van C", email: "c@example.com", role: "User" }
  ]);
  const [searchTerm, setSearchTerm] = useState("");
  const [newUser, setNewUser] = useState({ name: "", email: "", role: "User" });
  const [editUser, setEditUser] = useState(null);
  const [viewUser, setViewUser] = useState(null);
  const [deleteUserId, setDeleteUserId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [isDarkMode, setIsDarkMode] = useState(false);
  const usersPerPage = 5;

  // Tìm kiếm
  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sắp xếp
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    if (!sortConfig.key) return 0;
    const direction = sortConfig.direction === "asc" ? 1 : -1;
    return a[sortConfig.key] > b[sortConfig.key] ? direction : -direction;
  });

  // Phân trang
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = sortedUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  // Thêm người dùng
  const handleAddUser = (e) => {
    e.preventDefault();
    const id = users.length + 1;
    setUsers([...users, { id, ...newUser }]);
    setNewUser({ name: "", email: "", role: "User" });
  };

  // Sửa người dùng
  const handleEditUser = (user) => setEditUser(user);
  const saveEditUser = (e) => {
    e.preventDefault();
    setUsers(users.map((u) => (u.id === editUser.id ? editUser : u)));
    setEditUser(null);
  };

  // Xóa người dùng
  const handleDeleteUser = (id) => setDeleteUserId(id);
  const confirmDeleteUser = () => {
    setUsers(users.filter((user) => user.id !== deleteUserId));
    setDeleteUserId(null);
  };

  // Xem chi tiết
  const handleViewUser = (user) => setViewUser(user);

  // Sắp xếp cột
  const requestSort = (key) => {
    setSortConfig({
      key,
      direction:
        sortConfig.key === key && sortConfig.direction === "asc"
          ? "desc"
          : "asc"
    });
  };

  return (
    <div className={`${styles.container} ${isDarkMode ? styles.darkMode : ""}`}>
      {/* Sidebar */}
      <AdminSidebar />

      <div className={styles.main}>
        <div className={styles.content}>
          {/* Header */}
          <div className={styles.header}>
            <h1 className={styles.title}>Quản lý Người Dùng</h1>
            <button
              className={styles.themeButton}
              onClick={() => setIsDarkMode(!isDarkMode)}
            >
              {isDarkMode ? "Light Mode" : "Dark Mode"}
            </button>
          </div>

          {/* Thống kê */}
          <div className={styles.statsContainer}>
            <StatCard title="Tổng số người dùng" value={users.length} />
            <StatCard
              title="Admin"
              value={users.filter((user) => user.role === "Admin").length}
            />
          </div>

          {/* Điều khiển */}
          <div className={styles.controls}>
            <div className={styles.search}>
              <input
                type="text"
                placeholder="Tìm kiếm theo tên hoặc email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <span className={styles.searchIcon}>🔍</span>
            </div>
            <button
              className={styles.addButton}
              onClick={() =>
                setEditUser({ id: null, name: "", email: "", role: "User" })
              }
            >
              <span className={styles.addIcon}>➕</span> Thêm
            </button>
          </div>

          {/* Bảng */}
          <table className={styles.table}>
            <thead>
              <tr>
                <th onClick={() => requestSort("id")}>
                  ID <button className={styles.sortButton}>↕</button>
                </th>
                <th onClick={() => requestSort("name")}>
                  Tên <button className={styles.sortButton}>↕</button>
                </th>
                <th onClick={() => requestSort("email")}>
                  Email <button className={styles.sortButton}>↕</button>
                </th>
                <th onClick={() => requestSort("role")}>
                  Quyền <button className={styles.sortButton}>↕</button>
                </th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {currentUsers.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td>
                    <button
                      className={styles.viewButton}
                      onClick={() => handleViewUser(user)}
                    >
                      Xem
                    </button>
                    <button
                      className={styles.editButton}
                      onClick={() => handleEditUser(user)}
                    >
                      Sửa
                    </button>
                    <button
                      className={styles.deleteButton}
                      onClick={() => handleDeleteUser(user.id)}
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Phân trang */}
          <div className={styles.pagination}>
            <button
              className={styles.pageButton}
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Trước
            </button>
            <span>
              Trang {currentPage} / {totalPages}
            </span>
            <button
              className={styles.pageButton}
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
            >
              Sau
            </button>
          </div>
        </div>
      </div>

      {/* Modal Xem chi tiết */}
      {viewUser && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h2 className={styles.modalContent}>Chi tiết Người Dùng</h2>
            <div className={styles.viewDetails}>
              <p>ID: {viewUser.id}</p>
              <p>Tên: {viewUser.name}</p>
              <p>Email: {viewUser.email}</p>
              <p>Quyền: {viewUser.role}</p>
            </div>
            <div className={styles.modalButtons}>
              <button
                className={styles.cancelButton}
                onClick={() => setViewUser(null)}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Thêm/Sửa */}
      {editUser && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h2 className={styles.modalContent}>
              {editUser.id ? "Sửa Người Dùng" : "Thêm Người Dùng"}
            </h2>
            <form
              className={styles.modalForm}
              onSubmit={editUser.id ? saveEditUser : handleAddUser}
            >
              <div className={styles.formGroup}>
                <label>Tên</label>
                <input
                  type="text"
                  value={editUser.name}
                  onChange={(e) =>
                    setEditUser({ ...editUser, name: e.target.value })
                  }
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label>Email</label>
                <input
                  type="email"
                  value={editUser.email}
                  onChange={(e) =>
                    setEditUser({ ...editUser, email: e.target.value })
                  }
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label>Quyền</label>
                <select
                  value={editUser.role}
                  onChange={(e) =>
                    setEditUser({ ...editUser, role: e.target.value })
                  }
                >
                  <option value="User">User</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
              <div className={styles.modalButtons}>
                <button type="submit" className={styles.saveButton}>
                  Lưu
                </button>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={() => setEditUser(null)}
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Xác nhận Xóa */}
      {deleteUserId && (
        <div className={styles.modalOverlay}>
          <div className={styles.deleteModal}>
            <div className={styles.deleteModalContent}>
              <h2>Xác nhận Xóa</h2>
              <p>Bạn có chắc muốn xóa người dùng này?</p>
              <div className={styles.modalButtons}>
                <button
                  className={styles.deleteConfirmButton}
                  onClick={confirmDeleteUser}
                >
                  Xóa
                </button>
                <button
                  className={styles.cancelButton}
                  onClick={() => setDeleteUserId(null)}
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
