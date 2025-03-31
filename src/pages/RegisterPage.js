import React, { useState, useCallback } from "react";
import styles from "../styles/RegisterPage.module.css";
import kidsImage from "../assets/images/kids-playing.png";
import { FaEye, FaEyeSlash, FaSpinner } from "react-icons/fa";
import { registerUser } from "../api/users";

const RegisterPage = () => {
  const [registerData, setRegisterData] = useState({
    username: "",
    password: "",
    email: "",
    fullName: "",
    role: "CHILD",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleRegisterChange = useCallback((e) => {
    const { name, value } = e.target;
    setRegisterData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  }, []);

  const validateForm = () => {
    const newErrors = {};
    if (!registerData.username || registerData.username.length < 3) {
      newErrors.username = "Tên người dùng phải có ít nhất 3 ký tự";
    }
    if (!registerData.email || !/\S+@\S+\.\S+/.test(registerData.email)) {
      newErrors.email = "Email không hợp lệ";
    }
    if (!registerData.password || registerData.password.length < 6) {
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
    }
    if (!registerData.fullName) {
      newErrors.fullName = "Vui lòng nhập họ và tên";
    }
    return newErrors;
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    const formErrors = validateForm();
    setErrors(formErrors);

    if (Object.keys(formErrors).length > 0) {
      setMessage("Vui lòng kiểm tra thông tin đã nhập!");
      console.log("Validation errors:", formErrors); // Debug: Log validation errors
      return;
    }

    setIsLoading(true);
    setMessage("");

    try {
      console.log("Sending registration data:", registerData); // Debug: Log data being sent
      const response = await registerUser(registerData);
      console.log("Registration response:", response); // Debug: Log full response

      if (response.status === 201) {
        setMessage("Đăng ký thành công! Đang chuyển hướng...");
        setTimeout(() => {
          window.location.href = "/login";
        }, 1500);
      }
    } catch (error) {
      console.error("Registration error:", error); // Debug: Log full error object
      const status = error.response?.status;
      const errorData = error.response?.data;
      console.log("Error status:", status); // Debug: Log status code
      console.log("Error response data:", errorData); // Debug: Log server response data

      if (status === 409) {
        setMessage("Email hoặc tên người dùng đã tồn tại!");
      } else if (status === 500) {
        setMessage("Lỗi máy chủ! Vui lòng thử lại sau.");
      } else {
        setMessage("Có lỗi xảy ra, vui lòng thử lại!");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.registerContainer}>
      <div className={styles.registerHeader}>
        <img
          src={kidsImage}
          alt="Trẻ em chơi đùa"
          className={styles.registerLogo}
        />
        <h1 className={styles.registerTitle}>Đăng Ký</h1>
        <p className={styles.registerSubtitle}>
          Tạo tài khoản để bắt đầu khám phá!
        </p>
      </div>

      <form className={styles.registerForm} onSubmit={handleRegisterSubmit}>
        <div className={styles.inputGroup}>
          <div className={styles.inputFieldContainer}>
            <label>Tên người dùng:</label>
            <input
              type="text"
              name="username"
              value={registerData.username}
              onChange={handleRegisterChange}
              placeholder="Nhập tên người dùng"
              className={`${styles.inputField} ${
                errors.username ? styles.error : ""
              }`}
              disabled={isLoading}
            />
            {errors.username && (
              <span className={styles.errorText}>{errors.username}</span>
            )}
          </div>

          <div className={styles.inputFieldContainer}>
            <label>Địa chỉ email:</label>
            <input
              type="email"
              name="email"
              value={registerData.email}
              onChange={handleRegisterChange}
              placeholder="Nhập email của bạn"
              className={`${styles.inputField} ${
                errors.email ? styles.error : ""
              }`}
              disabled={isLoading}
            />
            {errors.email && (
              <span className={styles.errorText}>{errors.email}</span>
            )}
          </div>
        </div>

        <div className={styles.inputGroup}>
          <div className={styles.inputFieldContainer}>
            <label>Mật khẩu:</label>
            <div className={styles.passwordContainer}>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={registerData.password}
                onChange={handleRegisterChange}
                placeholder="Nhập mật khẩu của bạn"
                className={`${styles.inputField} ${
                  errors.password ? styles.error : ""
                }`}
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={styles.togglePassword}
                disabled={isLoading}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {errors.password && (
              <span className={styles.errorText}>{errors.password}</span>
            )}
          </div>

          <div className={styles.inputFieldContainer}>
            <label>Họ và tên:</label>
            <input
              type="text"
              name="fullName"
              value={registerData.fullName}
              onChange={handleRegisterChange}
              placeholder="Nhập họ và tên đầy đủ"
              className={`${styles.inputField} ${
                errors.fullName ? styles.error : ""
              }`}
              disabled={isLoading}
            />
            {errors.fullName && (
              <span className={styles.errorText}>{errors.fullName}</span>
            )}
          </div>
        </div>

        {message && (
          <p
            className={`${styles.message} ${
              message.includes("thành công") ? styles.success : styles.error
            }`}
          >
            {message}
          </p>
        )}

        <button
          type="submit"
          className={styles.registerButton}
          disabled={isLoading}
        >
          {isLoading ? (
            <span className={styles.loadingSpinner}>
              <FaSpinner className={styles.spinnerIcon} /> Đang xử lý...
            </span>
          ) : (
            "Đăng ký"
          )}
        </button>

        <div className={styles.loginLink}>
          <p>
            Đã có tài khoản? <a href="/login">Đăng nhập ngay</a>
          </p>
        </div>
      </form>

      {isLoading && (
        <div className={styles.loadingOverlay}>
          <FaSpinner className={styles.overlaySpinner} />
        </div>
      )}
    </div>
  );
};

export default RegisterPage;