import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../components/AdminSidebar";
import AdminHeader from "../components/AdminHeader";
import StatCard from "../components/StatCard";
import styles from "../styles/AdminDashboard.module.css"; 
import { getAllSummariesAdmin } from "../../api/summaries";
import { getAllUsers } from "../../api/users";

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
  const userChartRef = useRef(null);
  const gradeChartInstance = useRef(null);
  const methodChartInstance = useRef(null);
  const userChartInstance = useRef(null);
  
  const [summaries, setSummaries] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statData, setStatData] = useState([
    { title: "Tổng số người dùng", value: "0", color: "#3498db", icon: "👥" },
    { title: "Tổng số tóm tắt", value: "0", color: "#2ecc71", icon: "📝" },
    { title: "Tóm tắt hôm nay", value: "0", color: "#e74c3c", icon: "📅" },
  ]);

  // Fetch summaries and users data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [summariesResponse, usersResponse] = await Promise.all([
          getAllSummariesAdmin(),
          getAllUsers()
        ]);
        
        setSummaries(summariesResponse.data);
        setUsers(usersResponse.data);
        
        // Calculate today's date in the format YYYY-MM-DD
        const today = new Date().toISOString().split('T')[0];
        
        // Count summaries created today
        const todaySummaries = summariesResponse.data.filter(summary => 
          summary.createdAt && summary.createdAt.split('T')[0] === today
        ).length;
        
        // Update stats
        setStatData([
          { 
            title: "Tổng số người dùng", 
            value: usersResponse.data.length.toString(), 
            color: "#3498db", 
            icon: "👥" 
          },
          { 
            title: "Tổng số tóm tắt", 
            value: summariesResponse.data.length.toString(), 
            color: "#2ecc71", 
            icon: "📝" 
          },
          { 
            title: "Tóm tắt hôm nay", 
            value: todaySummaries.toString(), 
            color: "#e74c3c", 
            icon: "📅" 
          },
        ]);
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };
  
    fetchData();
  }, []);

  // Dữ liệu tĩnh cho danh sách tóm tắt gần đây
  const recentSummaries = summaries.slice(0, 5); // Show only the 5 most recent summaries
  
  // Dữ liệu cho danh sách người dùng mới
  const recentUsers = users.slice(0, 5).map(user => ({
    id: user.userId || user.id,
    name: user.fullName || user.name,
    email: user.email,
    date: user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : "23/03/2025"
  }));

  // Vẽ biểu đồ
  useEffect(() => {
    if (!summaries.length || !users.length) return;
    
    // Count summaries by grade
    const gradeCount = {
      "Lớp 1": 0,
      "Lớp 2": 0,
      "Lớp 3": 0,
      "Lớp 4": 0,
      "Lớp 5": 0
    };
    
    summaries.forEach(summary => {
      if (summary.grade && gradeCount.hasOwnProperty(summary.grade)) {
        gradeCount[summary.grade]++;
      }
    });
    
    // Count summaries by method
    const methodCount = {
      "extract": 0,
      "paraphrase": 0
    };
    
    summaries.forEach(summary => {
      if (summary.method) {
        if (summary.method.toLowerCase() === "extract") {
          methodCount.extract++;
        } else if (summary.method.toLowerCase() === "paraphrase") {
          methodCount.paraphrase++;
        }
      }
    });

    // Biểu đồ cột: Số lượng tóm tắt theo lớp học
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
              data: [methodCount.extract, methodCount.paraphrase],
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
    
    // Biểu đồ tròn: Phân bố người dùng theo lớp
    const userGradeCount = {
      "Lớp 1": 0,
      "Lớp 2": 0,
      "Lớp 3": 0,
      "Lớp 4": 0,
      "Lớp 5": 0,
      "Khác": 0
    };
    
    users.forEach(user => {
      if (user.grade && userGradeCount.hasOwnProperty(user.grade)) {
        userGradeCount[user.grade]++;
      } else {
        userGradeCount["Khác"]++;
      }
    });
    
    if (userChartInstance.current) userChartInstance.current.destroy();
    if (userChartRef.current) {
      userChartInstance.current = new Chart(userChartRef.current, {
        type: "pie",
        data: {
          labels: Object.keys(userGradeCount),
          datasets: [
            {
              label: "Người dùng",
              data: Object.values(userGradeCount),
              backgroundColor: [
                "#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF", "#C9CBCF"
              ],
              borderColor: [
                "#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF", "#C9CBCF"
              ],
              borderWidth: 1
            }
          ]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { position: "top" },
            title: { display: true, text: "Phân bố người dùng theo lớp" }
          }
        }
      });
    }

    return () => {
      if (gradeChartInstance.current) gradeChartInstance.current.destroy();
      if (methodChartInstance.current) methodChartInstance.current.destroy();
      if (userChartInstance.current) userChartInstance.current.destroy();
    };
  }, [summaries, users]);

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
            <motion.div
              className={styles.chart}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <canvas ref={userChartRef} id="userChart"></canvas>
            </motion.div>
          </div>
          <motion.div
            className={styles.recentActivity}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <h2 className={styles.sectionTitle}>Tóm Tắt Gần Đây</h2>
            {loading ? (
              <p className={styles.loadingText}>Đang tải dữ liệu...</p>
            ) : (
              <table className={styles.activityTable}>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Tiêu đề</th>
                    <th>Phương pháp</th>
                    <th>Lớp</th>
                    <th>Trạng thái</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {recentSummaries.length > 0 ? (
                    recentSummaries.map((summary) => (
                      <tr key={summary.summaryId}>
                        <td>{summary.summaryId.substring(0, 8)}...</td>
                        <td>{summary.title}</td>
                        <td>{summary.method}</td>
                        <td>{summary.grade}</td>
                        <td>
                          <span className={`${styles.status} ${styles[summary.status.toLowerCase()]}`}>
                            {summary.status}
                          </span>
                        </td>
                        <td>
                          <button
                            className={styles.viewButton}
                            onClick={() => navigate(`/admin/summaries/${summary.summaryId}`)}
                          >
                            Xem
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className={styles.noData}>
                        Không có dữ liệu tóm tắt
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </motion.div>

          <motion.div
            className={styles.recentActivity}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <h2 className={styles.sectionTitle}>Người Dùng Mới</h2>
            {loading ? (
              <p className={styles.loadingText}>Đang tải dữ liệu...</p>
            ) : (
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
                  {recentUsers.length > 0 ? (
                    recentUsers.map((user) => (
                      <tr key={user.id}>
                        <td>{typeof user.id === 'string' ? user.id.substring(0, 8) + '...' : user.id}</td>
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
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className={styles.noData}>
                        Không có dữ liệu người dùng
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
