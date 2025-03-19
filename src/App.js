import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomeScreen from "./pages/HomeScreen";
import LoginPage from "./pages/LoginPage";
import DualViewLayout from "./pages/DualViewLayout";
import RegisterPage from "./pages/RegisterPage";
import SummaryPage from "./pages/SummaryPage";
import ReadingListPage from "./pages/ReadingListPage";
import AdminDashboard from "./Admin/pages/AdminDashboard.js"; // Bỏ thư mục Admin/
import UserManagement from "./Admin/pages/UserManagement.js"; // Thêm .js
import SummaryManagement from "./Admin/pages/SummaryManagement.js"; // Đã đúng, thêm .js
import StoryManagement from "./Admin/pages/StoryManagement.js"; // Bỏ thư mục Story/

// Tách biệt các route không phải admin
const nonAdminRoutes = [
  { path: "/", element: <HomeScreen /> },
  { path: "/login", element: <LoginPage /> },
  { path: "/create-summary", element: <SummaryPage /> },
  { path: "/summary", element: <DualViewLayout /> },
  { path: "/register", element: <RegisterPage /> },
  { path: "/reading-list/:classLevel", element: <ReadingListPage /> },
  { path: "/story/:id", element: <DualViewLayout /> }
];

// Tách biệt các route dành cho admin
const adminRoutes = [
  { path: "/admin/dashboard", element: <AdminDashboard /> },
  { path: "/admin/users", element: <UserManagement /> },
  { path: "/admin/summaries", element: <SummaryManagement /> },
  { path: "/admin/stories", element: <StoryManagement /> }
];

function App() {
  return (
    <Router>
      <Routes>
        {/* Non-Admin Routes */}
        {nonAdminRoutes.map((route, index) => (
          <Route key={index} path={route.path} element={route.element} />
        ))}

        {/* Admin Routes */}
        {adminRoutes.map((route, index) => (
          <Route key={index} path={route.path} element={route.element} />
        ))}
      </Routes>
    </Router>
  );
}

export default App;
