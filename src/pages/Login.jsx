// ==================== LOGIN PAGE ====================
// File: src/pages/Login.jsx

import React, { useState } from "react";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  ShieldCheck,
  Crown,
  User,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import AuthLayout from "../components/auth/AuthLayout";
import { authService } from "../services/authService";
import "../styles/auth.css";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [selectedRole, setSelectedRole] = useState("admin");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError(""); // Clear error saat user mengetik
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Validasi
      if (!formData.email || !formData.password) {
        throw new Error("Email dan password harus diisi");
      }

      // Call API
      const result = await authService.login(formData.email, formData.password);

      // Enforce role comparison
      const actualRole = result.user?.role?.toLowerCase() || "admin";
      let isRoleMatch = false;

      if (selectedRole === "admin" && (actualRole === "admin" || actualRole === "staf")) isRoleMatch = true;
      if (selectedRole === "pimpinan" && actualRole === "pimpinan") isRoleMatch = true;
      if (selectedRole === "karyawan" && (actualRole === "dosen" || actualRole === "karyawan")) isRoleMatch = true;

      if (!isRoleMatch) {
        authService.logout();
        throw new Error(
          `Akses Ditolak: Akun Anda terdaftar sebagai ${actualRole.toUpperCase()}. Silakan pilih menu masuk yang sesuai.`,
        );
      }

      // Redirect ke dashboard
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Login gagal. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Login ke Akun Anda">
      <form onSubmit={handleSubmit} style={{ marginTop: "24px" }}>
        {/* Role Selector */}
        <div style={{ marginBottom: "20px" }}>
          <label
            style={{
              display: "block",
              fontSize: "14px",
              fontWeight: "600",
              color: "#374151",
              marginBottom: "8px",
            }}
          >
            Login sebagai
          </label>
          <div className="role-selector-group">
            {/* Card Admin/Staf */}
            <button
              type="button"
              onClick={() => setSelectedRole("admin")}
              className={`role-btn ${selectedRole === "admin" ? "active" : "inactive"}`}
            >
              <ShieldCheck
                size={16}
                color={selectedRole === "admin" ? "#2563eb" : "#4b5563"}
                className="role-icon"
              />
              <div className="role-info">
                <span className="role-name">Admin / Staf</span>
                <span className="role-desc">Akses penuh kesemua fitur</span>
              </div>
            </button>

            {/* Card Pimpinan */}
            <button
              type="button"
              onClick={() => setSelectedRole("pimpinan")}
              className={`role-btn ${selectedRole === "pimpinan" ? "active" : "inactive"}`}
            >
              <Crown
                size={16}
                color={selectedRole === "pimpinan" ? "#2563eb" : "#4b5563"}
                className="role-icon"
              />
              <div className="role-info">
                <span className="role-name">Pimpinan</span>
                <span className="role-desc">Akses laporan</span>
              </div>
            </button>

            {/* Card Dosen/Karyawan */}
            <button
              type="button"
              onClick={() => setSelectedRole("karyawan")}
              className={`role-btn ${selectedRole === "karyawan" ? "active" : "inactive"}`}
            >
              <User
                size={16}
                color={selectedRole === "karyawan" ? "#2563eb" : "#4b5563"}
                className="role-icon"
              />
              <div className="role-info">
                <span className="role-name">Dosen/Karyawan</span>
                <span className="role-desc">Dasbor personal</span>
              </div>
            </button>
          </div>
        </div>
        {/* Error Message */}
        {error && (
          <div
            style={{
              backgroundColor: "#fee2e2",
              border: "1px solid #fecaca",
              borderRadius: "8px",
              padding: "12px",
              marginBottom: "16px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <AlertCircle size={20} style={{ color: "#dc2626" }} />
            <p style={{ color: "#dc2626", fontSize: "14px", margin: 0 }}>
              {error}
            </p>
          </div>
        )}

        {/* Email Input */}
        <div style={{ marginBottom: "16px" }}>
          <label
            style={{
              display: "block",
              fontSize: "14px",
              fontWeight: "500",
              color: "#374151",
              marginBottom: "8px",
            }}
          >
            Email
          </label>
          <div style={{ position: "relative" }}>
            <Mail
              size={20}
              style={{
                position: "absolute",
                left: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "#9ca3af",
              }}
            />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="nama@email.com"
              style={{
                width: "100%",
                padding: "10px 12px 10px 44px",
                border: "1px solid #d1d5db",
                borderRadius: "8px",
                fontSize: "14px",
              }}
              required
            />
          </div>
        </div>

        {/* Password Input */}
        <div style={{ marginBottom: "24px" }}>
          <label
            style={{
              display: "block",
              fontSize: "14px",
              fontWeight: "500",
              color: "#374151",
              marginBottom: "8px",
            }}
          >
            Password
          </label>
          <div style={{ position: "relative" }}>
            <Lock
              size={20}
              style={{
                position: "absolute",
                left: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "#9ca3af",
              }}
            />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Masukkan password"
              style={{
                width: "100%",
                padding: "10px 44px 10px 44px",
                border: "1px solid #d1d5db",
                borderRadius: "8px",
                fontSize: "14px",
              }}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: "absolute",
                right: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#9ca3af",
              }}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            backgroundColor: loading ? "#9ca3af" : "#2563eb",
            color: "white",
            padding: "12px",
            borderRadius: "8px",
            border: "none",
            fontSize: "16px",
            fontWeight: "600",
            cursor: loading ? "not-allowed" : "pointer",
            transition: "background-color 0.2s",
          }}
        >
          {loading ? "Loading..." : "Login"}
        </button>
      </form>
    </AuthLayout>
  );
};

export default Login;
