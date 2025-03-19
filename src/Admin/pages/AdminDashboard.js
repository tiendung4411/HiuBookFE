import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../components/AdminSidebar";
import AdminHeader from "../components/AdminHeader";
import StatCard from "../components/StatCard";
import styles from "../styles/AdminDashboard.module.css";
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
import { motion } from "framer-motion";

// Đăng ký các thành phần cần thiết cho Chart.js
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

const AdminDashboard = () => {
  const navigate = useNavigate();
  const gradeChartRef = useRef(null);
  const methodChartRef = useRef(null);
  const gradeChartInstance = useRef(null);
  const methodChartInstance = useRef(null);

  // Dữ liệu tĩnh cho thẻ thống kê
  const statData = [
    {
      title: "Tổng số người dùng",
      value: "1,294",
      color: "#3498db",
      icon: "👥"
    },
    { title: "Tổng số tóm tắt", value: "1,345", color: "#2ecc71", icon: "📝" },
    { title: "Tóm tắt hôm nay", value: "1303", color: "#e74c3c", icon: "📅" },
    { title: "Số truyện", value: "576", color: "#9b59b6", icon: "📚" }
  ];

  // Dữ liệu tĩnh cho danh sách tóm tắt gần đây
  const recentSummaries = [
    { id: 1, title: "Thỏ và Rùa", class: "Lớp 1", date: "2025-03-16" },
    { id: 2, title: "Cậu Bé và Cây Táo", class: "Lớp 1", date: "2025-03-15" },
    { id: 3, title: "Bạn Thân", class: "Lớp 2", date: "2025-03-14" }
  ];

  // Dữ liệu tĩnh cho danh sách người dùng mới
  const recentUsers = [
    { id: 1, name: "Nguyễn Văn A", email: "a@example.com", date: "2025-03-16" },
    { id: 2, name: "Trần Thị B", email: "b@example.com", date: "2025-03-15" }
  ];

  // Vẽ biểu đồ
  useEffect(() => {
    // Biểu đồ cột: Số lượng tóm tắt theo lớp học
    if (gradeChartInstance.current) gradeChartInstance.current.destroy();
    if (gradeChartRef.current) {
      gradeChartInstance.current = new Chart(gradeChartRef.current, {
        type: "bar",
        data: {
          labels: ["Lớp 1", "Lớp 2", "Lớp 3", "Lớp 4", "Lớp 5"],
          datasets: [
            {
              label: "Số tóm tắt",
              data: [300, 500, 400, 600, 200],
              backgroundColor: "#3498db",
              borderColor: "#3498db",
              borderWidth: 1
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
            x: {
              title: { display: true, text: "Lớp học" }
            }
          },
          plugins: {
            legend: { display: false },
            title: { display: true, text: "Số lượng tóm tắt theo lớp học" }
          }
        }
      });
    }

    // Biểu đồ tròn: Tỷ lệ tóm tắt theo kiểu
    if (methodChartInstance.current) methodChartInstance.current.destroy();
    if (methodChartRef.current) {
      methodChartInstance.current = new Chart(methodChartRef.current, {
        type: "pie",
        data: {
          labels: ["Trích xuất", "Diễn giải"],
          datasets: [
            {
              label: "Tỷ lệ tóm tắt",
              data: [70, 30],
              backgroundColor: ["#2ecc71", "#f1c40f"],
              borderColor: ["#2ecc71", "#f1c40f"],
              borderWidth: 1
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
  }, []);

  return (
    <div className={styles.container}>
      <AdminSidebar />
      <div className={styles.main}>
        <AdminHeader />
        <div className={styles.content}>
          <h1 className={styles.title}>Tổng Quan</h1>
          <div className={styles.statsContainer}>
            {statData.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <StatCard
                  title={stat.title}
                  value={stat.value}
                  color={stat.color}
                  icon={stat.icon}
                />
              </motion.div>
            ))}
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
          <motion.div
            className={styles.recentActivity}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <h2 className={styles.sectionTitle}>Tóm Tắt Gần Đây</h2>
            <table className={styles.activityTable}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Tiêu đề</th>
                  <th>Lớp học</th>
                  <th>Ngày tạo</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {recentSummaries.map((summary) => (
                  <tr key={summary.id}>
                    <td>{summary.id}</td>
                    <td>{summary.title}</td>
                    <td>{summary.class}</td>
                    <td>{summary.date}</td>
                    <td>
                      <button
                        className={styles.viewButton}
                        onClick={() => navigate(`/story/${summary.id}`)}
                      >
                        Xem
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
          <motion.div
            className={styles.recentActivity}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <h2 className={styles.sectionTitle}>Người Dùng Mới</h2>
            <table className={styles.activityTable}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Tên</th>
                  <th>Email</th>
                  <th>Ngày đăng ký</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {recentUsers.map((user) => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.date}</td>
                    <td>
                      <button
                        className={styles.viewButton}
                        onClick={() => navigate(`/admin/users`)}
                      >
                        Xem
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
