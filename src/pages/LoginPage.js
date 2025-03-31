import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import styles from "../styles/LoginPage.module.css";
import logo from "../assets/images/logo_hiu.png";
import {
  FaEye,
  FaEyeSlash,
  FaSpinner,
  FaQuestionCircle,
  FaGoogle,
  FaFacebook
} from "react-icons/fa";
import { motion } from "framer-motion";

const LoginPage = () => {
  const [fadeIn, setFadeIn] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotMessage, setForgotMessage] = useState("");
  const [errors, setErrors] = useState({ email: false, password: false });
  const [typedText, setTypedText] = useState("");
  const fullText = "Chào Đến Với HIU Book!";

  useEffect(() => {
    setFadeIn(true);
    let index = 0;
    const typingInterval = setInterval(() => {
      if (index < fullText.length) {
        setTypedText(fullText.slice(0, index + 1));
        index++;
      } else {
        clearInterval(typingInterval);
      }
    }, 100);

    return () => clearInterval(typingInterval);
  }, []);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  // Hàm validate đơn giản hơn, chỉ kiểm tra có nhập gì không
  const validateForm = () => {
    const newErrors = { email: false, password: false };
    if (!formData.email.trim()) {
      // Chỉ cần có nội dung là được
      newErrors.email = true;
    }
    if (!formData.password) {
      newErrors.password = true;
    }
    setErrors(newErrors);
    return !newErrors.email && !newErrors.password;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      setMessage("Vui lòng nhập thông tin đăng nhập!");
      return;
    }
    setIsLoading(true);
    setMessage("");

    try {
      const response = await axios.post(
        "http://localhost:10000/api/users/auth/login",
        { username: formData.email, password: formData.password } // Giữ nguyên username để hỗ trợ cả email và username
      );

      if (response.status === 200) {
        const userData = response.data;
        localStorage.setItem("user", JSON.stringify(userData));
        setMessage("Đăng nhập thành công! Chào mừng bạn!");
        setTimeout(() => {
          // Không kiểm tra role admin nữa, chuyển thẳng về trang chủ
          window.location.href = "/";
        }, 1500);
      }
    } catch (error) {
      const status = error.response?.status;
      if (status === 401) {
        setMessage("Tên đăng nhập hoặc mật khẩu không đúng!");
      } else if (status === 403) {
        setMessage("Tài khoản bị khóa, vui lòng liên hệ quản trị viên!");
      } else {
        setMessage("Có lỗi xảy ra, vui lòng thử lại sau!");
      }
      setErrors({ email: true, password: true });
      setTimeout(() => setErrors({ email: false, password: false }), 1000);
    } finally {
      setIsLoading(false);
    }
  };

  // Giữ nguyên các hàm khác
  const handleFormClick = (e) => {
    const form = e.currentTarget;
    const rect = form.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    form.style.setProperty("--ripple-x", `${x}px`);
    form.style.setProperty("--ripple-y", `${y}px`);
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!forgotEmail || !/\S+@\S+\.\S+/.test(forgotEmail)) {
      setForgotMessage("Vui lòng nhập email hợp lệ!");
      return;
    }
    setIsLoading(true);
    setForgotMessage("");
    try {
      const response = await axios.post(
        "http://localhost:10000/api/users/auth/forgot-password",
        { email: forgotEmail }
      );
      if (response.status === 200) {
        setForgotMessage(
          "Yêu cầu đã được gửi! Vui lòng kiểm tra email của bạn."
        );
        setTimeout(() => setShowForgotModal(false), 2000);
      }
    } catch (error) {
      setForgotMessage("Có lỗi xảy ra, vui lòng thử lại sau!");
    } finally {
      setIsLoading(false);
    }
  };

  // Phần return giữ nguyên giao diện, chỉ đổi placeholder để rõ ràng hơn
  return (
    <motion.div
      className={styles.loginContainer}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <header
        className={`${styles.loginHeader} ${fadeIn ? styles.fadeIn : ""}`}
      >
        <h1 className={styles.headerTitle}>
          {typedText}
          <span className={styles.cursor}>|</span>
        </h1>
        <p className={styles.headerSubtitle}>
          Đăng nhập để khám phá thế giới truyện
        </p>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <img src={logo} alt="Logo HIU Book" className={styles.loginLogo} />
        </motion.div>
      </header>

      <form
        className={`${styles.loginForm} ${fadeIn ? styles.formVisible : ""}`}
        onSubmit={handleLogin}
        onClick={handleFormClick}
        aria-label="Form đăng nhập"
      >
        <div className={styles.formGroup}>
          <div className={styles.inputWrapper}>
            <input
              type="text" // Đổi từ email sang text để chấp nhận username
              id="email"
              name="email"
              placeholder="Nhập username hoặc email"
              required
              className={`${styles.inputField} ${
                errors.email ? styles.error : ""
              }`}
              value={formData.email}
              onChange={handleInputChange}
              disabled={isLoading}
            />
          </div>
        </div>

        <div className={styles.formGroup}>
          <div className={styles.inputWrapper}>
            <div className={styles.passwordContainer}>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                placeholder="Nhập mật khẩu"
                required
                className={`${styles.inputField} ${
                  errors.password ? styles.error : ""
                }`}
                value={formData.password}
                onChange={handleInputChange}
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={styles.togglePassword}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
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
          className={styles.loginButton}
          disabled={isLoading}
        >
          {isLoading ? (
            <span className={styles.loadingSpinner}>
              <FaSpinner className={styles.spinnerIcon} /> Đang xử lý...
            </span>
          ) : (
            "Đăng nhập"
          )}
        </button>

        <div className={styles.extraButtons}>
          <button
            type="button"
            className={styles.forgotButton}
            onClick={() => setShowForgotModal(true)}
            disabled={isLoading}
          >
            <FaQuestionCircle /> Quên mật khẩu?
          </button>

          <button
            type="button"
            className={styles.registerButton}
            onClick={() => (window.location.href = "/register")}
            disabled={isLoading}
          >
            <span className={styles.desktopText}>
              Chưa có tài khoản? Đăng ký ngay
            </span>
            <span className={styles.mobileText}>Đăng ký</span>
          </button>
        </div>

        <div className={styles.socialLogin}>
          <button type="button" className={styles.googleButton}>
            <FaGoogle /> Google
          </button>
          <button type="button" className={styles.facebookButton}>
            <FaFacebook /> Facebook
          </button>
        </div>
      </form>

      {showForgotModal && (
        <motion.div
          className={styles.modal}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className={styles.modalContent}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            <h2 className={styles.modalTitle}>Quên mật khẩu?</h2>
            <p className={styles.modalSubtitle}>
              Nhập email để lấy lại mật khẩu
            </p>
            <form onSubmit={handleForgotPassword}>
              <div className={styles.formGroup}>
                <input
                  type="email"
                  placeholder="Nhập email của bạn"
                  className={styles.modalInput}
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  disabled={isLoading}
                  required
                  aria-label="Email để lấy lại mật khẩu"
                />
              </div>
              {forgotMessage && (
                <p
                  className={`${styles.message} ${
                    forgotMessage.includes("thành công") ||
                    forgotMessage.includes("đã được gửi")
                      ? styles.success
                      : styles.error
                  }`}
                >
                  {forgotMessage}
                </p>
              )}
              <div className={styles.modalButtonGroup}>
                <button
                  type="submit"
                  className={styles.modalSubmitButton}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className={styles.loadingSpinner}>
                      <FaSpinner className={styles.spinnerIcon} /> Đang xử lý...
                    </span>
                  ) : (
                    "Gửi yêu cầu"
                  )}
                </button>
                <button
                  type="button"
                  className={styles.modalCloseButton}
                  onClick={() => setShowForgotModal(false)}
                  disabled={isLoading}
                >
                  Đóng
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}

      {isLoading && (
        <div className={styles.loadingOverlay}>
          <FaSpinner className={styles.overlaySpinner} />
        </div>
      )}
    </motion.div>
  );
};

export default LoginPage;
