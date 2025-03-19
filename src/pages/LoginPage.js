import React, { useEffect, useState } from "react";
import axios from "axios"; // Import Axios for API calls
import "../styles/LoginPage.css"; // Import CSS for styling
import logo from "../assets/images/logo_hiu.png"; // Add a logo for branding

const LoginPage = () => {
    const [fadeIn, setFadeIn] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");

    useEffect(() => {
        const timer = setTimeout(() => {
            setFadeIn(true);
        }, 500);

        return () => clearTimeout(timer);
    }, []);

    const handleLogin = async (event) => {
        event.preventDefault(); // Prevent default form submission
    
        try {
            const response = await axios.post("http://localhost:10000/api/users/auth/login", {
                username: email,
                password: password,
            });
    
            if (response.status === 200) {
                const userData = response.data; // Verify this contains role directly
    
                console.log("Full user data response:", userData); // Debugging log
                
                // Ensure `role` is accessible
                const userRole = userData?.role || userData?.user?.role; // Adjust based on actual structure
                console.log("Detected userRole:", userRole);
    
                if (!userRole) {
                    throw new Error("Role is missing from the response");
                }
    
                // Store user data in localStorage
                localStorage.setItem("user", JSON.stringify(userData));
    
                setMessage("Đăng nhập thành công!");
    
                if (userRole.toLowerCase() === "admin") {
                    window.location.href = "/admin/dashboard";
                } else {
                    window.location.href = "/";
                }
            }
        } catch (error) {
            setMessage(error.response?.data || "Invalid username or password");
        }
    };
    

    return (
        <div className="login-container">
            <div className="login-header">
                <img src={logo} alt="Logo" className={`login-logo ${fadeIn ? "visible" : ""}`} />
                <h1 className={`fade-in-text ${fadeIn ? "visible" : ""}`}>Chào Mừng Trở Lại!</h1>
                <p className={`static-text ${fadeIn ? "visible" : ""}`}>Đăng nhập để khám phá thế giới truyện và đóng góp câu chuyện của bạn.</p>
            </div>

            <form className="login-form" onSubmit={handleLogin}>
                <label htmlFor="email">Email</label>
                <input
                    type="text"
                    id="email"
                    placeholder="Nhập email của bạn"
                    required
                    className="input-field"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                <label htmlFor="password">Mật khẩu</label>
                <input
                    type="password"
                    id="password"
                    placeholder="Nhập mật khẩu của bạn"
                    required
                    className="input-field"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                {/* Show message */}
                {message && <p className="login-message">{message}</p>}

                <button type="submit" className="login-button">Đăng Nhập</button>

                <button type="button" className="register-button">
                    <span className="desktop-text">Bạn chưa có tài khoản? Đăng ký ngay!</span>
                    <span className="mobile-text">Đăng ký</span>
                </button>
            </form>
        </div>
    );
};

export default LoginPage;
