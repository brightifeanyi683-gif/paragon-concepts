import React, { useState } from "react";
import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  ShieldCheck,
  UserRound,
  CheckCircle2,
} from "lucide-react";

import "./admin.css";

const API_URL = "http://localhost:5000";

function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!username.trim() || !password.trim()) {
      setError("Please enter your username and password.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/api/admin/login`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            username,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Invalid username or password."
        );
      }

      localStorage.setItem(
        "paragon_admin_token",
        data.token
      );

      localStorage.setItem(
        "paragon_admin",
        JSON.stringify(data.admin)
      );

      window.location.href = "/admin/dashboard";
    } catch (err) {
      setError(
        err.message ||
          "Unable to connect to the server."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">

      {/* =========================================
          LEFT SIDE
      ========================================== */}

      <section className="admin-login-brand-panel">

        <div className="admin-login-brand">

          <div className="admin-login-brand-logo">
            P
          </div>

          <p className="admin-login-brand-name">
            PARAGON CONCEPTS
          </p>

          <h1>
            Manage your digital
            <br />
            services.
          </h1>

          <p className="admin-login-brand-description">
            Welcome to the Paragon Concepts
            administration portal. Manage services,
            customer requests and your digital
            business operations from one place.
          </p>

        </div>

        <div className="admin-login-features">

          <div className="admin-login-feature">

            <div className="admin-login-feature-icon">
              <ShieldCheck size={19} />
            </div>

            <div>
              <strong>
                Secure administration
              </strong>

              <span>
                Authorized access only
              </span>
            </div>

          </div>

          <div className="admin-login-feature">

            <div className="admin-login-feature-icon">
              <CheckCircle2 size={19} />
            </div>

            <div>
              <strong>
                Business management
              </strong>

              <span>
                Manage your services and requests
              </span>
            </div>

          </div>

          <div className="admin-login-feature">

            <div className="admin-login-feature-icon">
              <LockKeyhole size={19} />
            </div>

            <div>
              <strong>
                Protected dashboard
              </strong>

              <span>
                Your administration area is secured
              </span>
            </div>

          </div>

        </div>

      </section>


      {/* =========================================
          RIGHT SIDE
      ========================================== */}

      <section className="admin-login-content">

        <div className="admin-login-card">

          <div className="admin-security-badge">
            <ShieldCheck size={15} />
            Secure administrator access
          </div>

          <div className="admin-login-heading">

            <span className="admin-login-mini-label">
              ADMIN PORTAL
            </span>

            <h2>
              Welcome back
            </h2>

            <p className="admin-login-card-description">
              Sign in to manage Paragon Concepts.
            </p>

          </div>


          <form
            className="admin-login-form"
            onSubmit={handleSubmit}
          >

            {/* USERNAME */}

            <div className="admin-form-group">

              <label htmlFor="admin-username">
                Username
              </label>

              <div className="admin-input-wrapper">

                <UserRound
                  className="admin-input-icon"
                  size={17}
                />

                <input
                  id="admin-username"
                  className="admin-input"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) =>
                    setUsername(e.target.value)
                  }
                  autoComplete="username"
                />

              </div>

            </div>


            {/* PASSWORD */}

            <div className="admin-form-group">

              <label htmlFor="admin-password">
                Password
              </label>

              <div className="admin-input-wrapper">

                <LockKeyhole
                  className="admin-input-icon"
                  size={17}
                />

                <input
                  id="admin-password"
                  className="admin-input admin-password-input"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  autoComplete="current-password"
                />

                <button
                  type="button"
                  className="admin-password-toggle"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showPassword ? (
                    <EyeOff size={17} />
                  ) : (
                    <Eye size={17} />
                  )}
                </button>

              </div>

            </div>


            {/* ERROR */}

            {error && (
              <div className="admin-login-error">
                {error}
              </div>
            )}


            {/* BUTTON */}

            <button
              type="submit"
              className="admin-login-button"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="admin-button-spinner" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign in to dashboard
                  <ArrowRight size={17} />
                </>
              )}
            </button>

          </form>


          <div className="admin-login-footer">
            <LockKeyhole size={12} />
            Protected administrator access
          </div>

        </div>

      </section>


      {/* =========================================
          COPYRIGHT
      ========================================== */}

      <div className="admin-login-copyright">
        © {new Date().getFullYear()} Paragon Concepts.
        All rights reserved.
      </div>

    </div>
  );
}

export default AdminLogin;