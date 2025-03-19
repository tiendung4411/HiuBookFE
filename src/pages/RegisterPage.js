import React, { useState } from 'react';
import styles from '../styles/RegisterPage.module.css';
import kidsImage from '../assets/images/kids-playing.png'; // Use an image like kids playing

const RegisterPage = () => {
    const [showAdditionalFields, setShowAdditionalFields] = useState(false);
    const [registerData, setRegisterData] = useState({
        username: '',
        password: '',
        email: '',
        fullName: '',
        phoneNumber: '',
        role: 'kid', // Default to "kid"
    });

    const handleRegisterChange = (e) => {
        setRegisterData({ ...registerData, [e.target.name]: e.target.value });
    };

    const handleRoleChange = (role) => {
        setRegisterData({ ...registerData, role });
        if (role === 'contributor') {
            setShowAdditionalFields(true);
        } else {
            setShowAdditionalFields(false);
        }
    };

    const handleRegisterSubmit = (e) => {
        e.preventDefault();
        console.log('Register data:', registerData);
        // Implement actual registration logic here
    };

    return (
        <div className={styles.registerContainer}>
            <div className={styles.registerHeader}>
                <img src={kidsImage} alt="Trẻ em chơi đùa" className={styles.registerLogo} />

                <p className={styles.registerSubtitle}>Tạo tài khoản mới để khám phá!</p>
            </div>

            {/* Register Form */}
            <form className={styles.registerForm} onSubmit={handleRegisterSubmit}>
                {/* Role Selector with Label */}
                <div className={styles.roleContainer}>
                    <label>Bạn là:</label>
                    <div className={styles.roleSelector}>
                        <button
                            className={`${styles.roleButton} ${registerData.role === 'kid' ? styles.activeRole : ''}`}
                            onClick={() => handleRoleChange('kid')}
                        >
                            Trẻ em
                        </button>
                        <button
                            className={`${styles.roleButton} ${registerData.role === 'contributor' ? styles.activeRole : ''}`}
                            onClick={() => handleRoleChange('contributor')}
                        >
                            Đóng góp
                        </button>
                    </div>
                </div>

                <div className={styles.inputGroup}>
                    <div className={styles.inputFieldContainer}>
                        <label>Tên người dùng:</label>
                        <input
                            type="text"
                            name="username"
                            value={registerData.username}
                            onChange={handleRegisterChange}
                            placeholder="Nhập tên người dùng"
                            className="input-field"
                        />
                    </div>

                    <div className={styles.inputFieldContainer}>
                        <label>Địa chỉ email:</label>
                        <input
                            type="email"
                            name="email"
                            value={registerData.email}
                            onChange={handleRegisterChange}
                            placeholder="Nhập email của bạn"
                            className="input-field"
                        />
                    </div>
                </div>

                <div className={styles.inputGroup}>
                    <div className={styles.inputFieldContainer}>
                        <label>Mật khẩu:</label>
                        <input
                            type="password"
                            name="password"
                            value={registerData.password}
                            onChange={handleRegisterChange}
                            placeholder="Nhập mật khẩu của bạn"
                            className="input-field"
                        />
                    </div>

                    <div className={styles.inputFieldContainer}>
                        <label>Họ và tên:</label>
                        <input
                            type="text"
                            name="fullName"
                            value={registerData.fullName}
                            onChange={handleRegisterChange}
                            placeholder="Nhập họ và tên đầy đủ"
                            className="input-field"
                        />
                    </div>
                </div>

                {showAdditionalFields && (
                    <div className={styles.inputGroup}>
                        <div className={styles.inputFieldContainer}>
                            <label>Số điện thoại:</label>
                            <input
                                type="text"
                                name="phoneNumber"
                                value={registerData.phoneNumber}
                                onChange={handleRegisterChange}
                                placeholder="Nhập số điện thoại của bạn"
                                className="input-field"
                            />
                        </div>
                    </div>
                )}
            </form>

            {/* Submit Button */}
            <button type="submit" className={styles.registerButton}>
                Đăng ký
            </button>
        </div>
    );
};

export default RegisterPage;
