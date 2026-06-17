import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, User, AlertCircle } from "lucide-react";
import styles from "./auth.module.css";
import axios from "axios";
import { Frontend_Admin_Url, Backend_Root_Url } from "../../config/AdminUrl.js";
import { verifyJWTToken } from "../AdminDashboard/utils/authUtils";
import NebulaDrift from "../NebulaDrift/NebulaDrift";

const dashboardUrl = `/${Frontend_Admin_Url}/dashboard`;

const AuthPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const checkAuth = async () => {
      const { isAuthenticated } = await verifyJWTToken();
      if (isAuthenticated) {
        navigate(dashboardUrl);
      }
    };
    checkAuth();
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errorMessage) {
      setErrorMessage("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await axios.post(
        `${Backend_Root_Url}/auth/${Frontend_Admin_Url}`,
        {
          userName: formData.username,
          password: formData.password,
        },
        {
          withCredentials: true,
        }
      );

      navigate(dashboardUrl);
    } catch (error) {
      if (error.response) {
        const errorMsg =
          error.response.data?.message || "Authentication failed";
        setErrorMessage(errorMsg);
      } else if (error.request) {
        setErrorMessage("Network error. Please check your connection.");
      } else {
        setErrorMessage(
          error.message || "An error occurred during authentication"
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className={styles.authContainer}>
      <NebulaDrift />
      <div className={styles.authCard}>
        <div className={styles.authHeader}>
          <div className={styles.logoContainer}>
            <Lock className={styles.logoIcon} />
          </div>
          <h1 className={styles.title}>Admin Access</h1>
          <p className={styles.subtitle}>Sign in to your dashboard</p>
        </div>

        <form className={styles.authForm} onSubmit={handleSubmit}>
          {errorMessage && (
            <div className={styles.errorMessage}>
              <AlertCircle className={styles.errorIcon} />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className={styles.inputGroup}>
            <label htmlFor="username" className={styles.label}>
              Username
            </label>
            <div className={styles.inputWrapper}>
              <User className={styles.inputIcon} />
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className={styles.input}
                placeholder="Enter your username"
                required
                disabled={isLoading}
                autoComplete="username"
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="password" className={styles.label}>
              Password
            </label>
            <div className={styles.inputWrapper}>
              <Lock className={styles.inputIcon} />
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={styles.input}
                placeholder="Enter your password"
                required
                disabled={isLoading}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className={styles.passwordToggle}
                disabled={isLoading}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className={styles.submitButton}
            disabled={isLoading || !formData.username || !formData.password}
          >
            {isLoading ? (
              <>
                <div className={styles.spinner}></div>
                Signing In...
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <div className={styles.authFooter}>
          <p className={styles.footerText}>
            Secure admin access &bull; Protected by encryption
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
