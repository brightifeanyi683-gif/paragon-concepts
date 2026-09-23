import React, { useEffect, useState } from "react";
import {
  LayoutDashboard,
  BriefcaseBusiness,
  ClipboardList,
  LogOut,
  Menu,
  X,
  ArrowUpRight,
  Plus,
  Clock3,
  CheckCircle2,
  Users,
  Settings,
  ChevronRight,
  RefreshCw,
} from "lucide-react";

import "./admin.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activePage, setActivePage] = useState("dashboard");

  const [stats, setStats] = useState({
    totalRequests: 0,
    totalServices: 0,
    newRequests: 0,
  });

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // ==========================================
  // GET ADMIN TOKEN
  // ==========================================

  const token = localStorage.getItem("paragon_admin_token");

  // ==========================================
  // CHECK LOGIN
  // ==========================================

  useEffect(() => {
    if (!token) {
      window.location.href = "/admin";
    }
  }, [token]);

  // ==========================================
  // FETCH DASHBOARD DATA
  // ==========================================

  const fetchDashboardData = async () => {
    try {
      setRefreshing(true);

      const [statsResponse, requestsResponse] = await Promise.all([
        fetch(`${API_URL}/api/admin/stats`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),

        fetch(`${API_URL}/api/requests`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      ]);

      if (statsResponse.status === 401 || statsResponse.status === 403) {
        handleLogout();
        return;
      }

      const statsData = await statsResponse.json();
      const requestsData = await requestsResponse.json();

      if (statsData.success) {
        setStats(statsData.stats);
      }

      if (requestsData.success) {
        setRequests(requestsData.requests);
      }
    } catch (error) {
      console.error("Dashboard error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchDashboardData();
    }
  }, []);

  // ==========================================
  // LOGOUT
  // ==========================================

  const handleLogout = () => {
    localStorage.removeItem("paragon_admin_token");
    localStorage.removeItem("paragon_admin");

    window.location.href = "/admin";
  };

  // ==========================================
  // NAVIGATION
  // ==========================================

  const handleNavigation = (page) => {
    setActivePage(page);
    setSidebarOpen(false);

    if (page === "services") {
      window.location.href = "/admin/services";
    }

    if (page === "requests") {
      window.location.href = "/admin/requests";
    }

    if (page === "dashboard") {
      window.location.href = "/admin/dashboard";
    }
  };

  // ==========================================
  // FORMAT DATE
  // ==========================================

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString("en-NG", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // ==========================================
  // STATUS CLASS
  // ==========================================

  const getStatusClass = (status) => {
    switch (status) {
      case "new":
        return "status-new";

      case "contacted":
        return "status-contacted";

      case "completed":
        return "status-completed";

      case "cancelled":
        return "status-cancelled";

      default:
        return "status-new";
    }
  };

  // ==========================================
  // ADMIN USER
  // ==========================================

  let adminUser = null;

  try {
    adminUser = JSON.parse(
      localStorage.getItem("paragon_admin")
    );
  } catch {
    adminUser = null;
  }

  const username = adminUser?.username || "Admin";

  // ==========================================
  // RECENT REQUESTS
  // ==========================================

  const recentRequests = requests.slice(0, 5);

  return (
    <div className="admin-layout">

      {/* ======================================
          MOBILE OVERLAY
      ====================================== */}

      {sidebarOpen && (
        <div
          className="admin-sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ======================================
          SIDEBAR
      ====================================== */}

      <aside
        className={`admin-sidebar ${
          sidebarOpen ? "admin-sidebar-open" : ""
        }`}
      >
        <div className="admin-sidebar-top">

          {/* BRAND */}

          <div className="admin-brand">
            <div className="admin-brand-logo">
              P
            </div>

            <div>
              <strong>Paragon</strong>
              <span>Concepts</span>
            </div>
          </div>

          {/* MOBILE CLOSE */}

          <button
            className="admin-mobile-close"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
          >
            <X size={22} />
          </button>
        </div>

        {/* NAVIGATION */}

        <nav className="admin-nav">

          <button
            className={`admin-nav-item ${
              activePage === "dashboard"
                ? "active"
                : ""
            }`}
            onClick={() => handleNavigation("dashboard")}
          >
            <LayoutDashboard size={19} />

            <span>Dashboard</span>
          </button>

          <button
            className={`admin-nav-item ${
              activePage === "services"
                ? "active"
                : ""
            }`}
            onClick={() => handleNavigation("services")}
          >
            <BriefcaseBusiness size={19} />

            <span>Services</span>
          </button>

          <button
            className={`admin-nav-item ${
              activePage === "requests"
                ? "active"
                : ""
            }`}
            onClick={() => handleNavigation("requests")}
          >
            <ClipboardList size={19} />

            <span>Customer Requests</span>

            {stats.newRequests > 0 && (
              <span className="admin-nav-badge">
                {stats.newRequests}
              </span>
            )}
          </button>

        </nav>

        {/* SIDEBAR BOTTOM */}

        <div className="admin-sidebar-bottom">

          <div className="admin-sidebar-account">

            <div className="admin-account-avatar">
              {username.charAt(0).toUpperCase()}
            </div>

            <div className="admin-account-info">
              <strong>{username}</strong>
              <span>Administrator</span>
            </div>

          </div>

          <button
            className="admin-logout-btn"
            onClick={handleLogout}
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>

        </div>
      </aside>

      {/* ======================================
          MAIN CONTENT
      ====================================== */}

      <main className="admin-main">

        {/* ====================================
            TOP HEADER
        ==================================== */}

        <header className="admin-header">

          <div className="admin-header-left">

            <button
              className="admin-mobile-menu"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={23} />
            </button>

            <div>
              <p className="admin-header-label">
                Admin Panel
              </p>

              <h1>Dashboard</h1>
            </div>

          </div>

          <div className="admin-header-right">

            <button
              className="admin-refresh-btn"
              onClick={fetchDashboardData}
              disabled={refreshing}
              title="Refresh dashboard"
            >
              <RefreshCw
                size={18}
                className={
                  refreshing
                    ? "admin-spin"
                    : ""
                }
              />
            </button>

            <div className="admin-header-user">

              <div className="admin-header-avatar">
                {username.charAt(0).toUpperCase()}
              </div>

              <div>
                <strong>{username}</strong>
                <span>Administrator</span>
              </div>

            </div>

          </div>

        </header>

        {/* ====================================
            DASHBOARD CONTENT
        ==================================== */}

        <div className="admin-content">

          {/* WELCOME */}

          <section className="admin-welcome">

            <div>
              <p className="admin-eyebrow">
                Welcome back
              </p>

              <h2>
                Hello, {username} 👋
              </h2>

              <p>
                Here's what's happening with
                Paragon Concepts today.
              </p>
            </div>

            <button
              className="admin-primary-btn"
              onClick={() =>
                handleNavigation("services")
              }
            >
              <Plus size={18} />
              Add Service
            </button>

          </section>

          {/* ==================================
              STATISTICS
          ================================== */}

          <section className="admin-stats-grid">

            {/* TOTAL SERVICES */}

            <div className="admin-stat-card">

              <div className="admin-stat-icon blue">
                <BriefcaseBusiness size={21} />
              </div>

              <div className="admin-stat-content">

                <span>Total Services</span>

                <strong>
                  {loading
                    ? "..."
                    : stats.totalServices}
                </strong>

                <small>
                  Services available
                </small>

              </div>

              <button
                className="admin-stat-arrow"
                onClick={() =>
                  handleNavigation("services")
                }
              >
                <ArrowUpRight size={18} />
              </button>

            </div>

            {/* TOTAL REQUESTS */}

            <div className="admin-stat-card">

              <div className="admin-stat-icon purple">
                <ClipboardList size={21} />
              </div>

              <div className="admin-stat-content">

                <span>Total Requests</span>

                <strong>
                  {loading
                    ? "..."
                    : stats.totalRequests}
                </strong>

                <small>
                  Customer requests
                </small>

              </div>

              <button
                className="admin-stat-arrow"
                onClick={() =>
                  handleNavigation("requests")
                }
              >
                <ArrowUpRight size={18} />
              </button>

            </div>

            {/* NEW REQUESTS */}

            <div className="admin-stat-card">

              <div className="admin-stat-icon orange">
                <Clock3 size={21} />
              </div>

              <div className="admin-stat-content">

                <span>New Requests</span>

                <strong>
                  {loading
                    ? "..."
                    : stats.newRequests}
                </strong>

                <small>
                  Awaiting attention
                </small>

              </div>

              <button
                className="admin-stat-arrow"
                onClick={() =>
                  handleNavigation("requests")
                }
              >
                <ArrowUpRight size={18} />
              </button>

            </div>

            {/* COMPLETED */}

            <div className="admin-stat-card">

              <div className="admin-stat-icon green">
                <CheckCircle2 size={21} />
              </div>

              <div className="admin-stat-content">

                <span>Completed</span>

                <strong>
                  {
                    requests.filter(
                      (request) =>
                        request.status ===
                        "completed"
                    ).length
                  }
                </strong>

                <small>
                  Completed requests
                </small>

              </div>

            </div>

          </section>

          {/* ==================================
              LOWER GRID
          ================================== */}

          <section className="admin-dashboard-grid">

            {/* RECENT REQUESTS */}

            <div className="admin-panel admin-recent-panel">

              <div className="admin-panel-header">

                <div>
                  <p className="admin-panel-eyebrow">
                    Customer activity
                  </p>

                  <h3>
                    Recent Requests
                  </h3>
                </div>

                <button
                  className="admin-view-all"
                  onClick={() =>
                    handleNavigation("requests")
                  }
                >
                  View all
                  <ChevronRight size={16} />
                </button>

              </div>

              {loading ? (
                <div className="admin-empty-state">
                  <div className="admin-loading-spinner" />
                  <p>Loading requests...</p>
                </div>
              ) : recentRequests.length === 0 ? (
                <div className="admin-empty-state">

                  <div className="admin-empty-icon">
                    <ClipboardList size={24} />
                  </div>

                  <h4>
                    No requests yet
                  </h4>

                  <p>
                    Customer requests will appear
                    here when someone contacts
                    Paragon Concepts.
                  </p>

                </div>
              ) : (
                <div className="admin-request-list">

                  {recentRequests.map(
                    (request) => (
                      <div
                        className="admin-request-row"
                        key={request.id}
                      >

                        <div className="admin-request-avatar">
                          {request.name
                            ?.charAt(0)
                            .toUpperCase() || "C"}
                        </div>

                        <div className="admin-request-info">

                          <strong>
                            {request.name}
                          </strong>

                          <span>
                            {request.service ||
                              "General inquiry"}
                          </span>

                        </div>

                        <div className="admin-request-meta">

                          <span
                            className={`admin-status ${getStatusClass(
                              request.status
                            )}`}
                          >
                            {request.status}
                          </span>

                          <small>
                            {formatDate(
                              request.created_at
                            )}
                          </small>

                        </div>

                      </div>
                    )
                  )}

                </div>
              )}

            </div>

            {/* QUICK ACTIONS */}

            <div className="admin-panel admin-actions-panel">

              <div className="admin-panel-header">

                <div>
                  <p className="admin-panel-eyebrow">
                    Manage website
                  </p>

                  <h3>
                    Quick Actions
                  </h3>
                </div>

              </div>

              <div className="admin-quick-actions">

                <button
                  className="admin-quick-action"
                  onClick={() =>
                    handleNavigation("services")
                  }
                >
                  <div className="admin-quick-icon blue">
                    <BriefcaseBusiness size={20} />
                  </div>

                  <div>
                    <strong>
                      Manage Services
                    </strong>

                    <span>
                      Add, edit or remove services
                    </span>
                  </div>

                  <ChevronRight size={18} />
                </button>

                <button
                  className="admin-quick-action"
                  onClick={() =>
                    handleNavigation("requests")
                  }
                >
                  <div className="admin-quick-icon purple">
                    <ClipboardList size={20} />
                  </div>

                  <div>
                    <strong>
                      Customer Requests
                    </strong>

                    <span>
                      View and manage requests
                    </span>
                  </div>

                  <ChevronRight size={18} />
                </button>

                <button
                  className="admin-quick-action"
                  onClick={() =>
                    window.open("/", "_blank")
                  }
                >
                  <div className="admin-quick-icon green">
                    <ArrowUpRight size={20} />
                  </div>

                  <div>
                    <strong>
                      View Website
                    </strong>

                    <span>
                      Open the public website
                    </span>
                  </div>

                  <ChevronRight size={18} />
                </button>

                <button
                  className="admin-quick-action"
                  onClick={fetchDashboardData}
                >
                  <div className="admin-quick-icon orange">
                    <RefreshCw size={20} />
                  </div>

                  <div>
                    <strong>
                      Refresh Data
                    </strong>

                    <span>
                      Get the latest information
                    </span>
                  </div>

                  <ChevronRight size={18} />
                </button>

              </div>

            </div>

          </section>

          {/* ==================================
              SYSTEM INFORMATION
          ================================== */}

          <section className="admin-system-card">

            <div className="admin-system-icon">
              <Settings size={21} />
            </div>

            <div className="admin-system-content">

              <strong>
                Paragon Concepts Admin System
              </strong>

              <span>
                Your dashboard is connected to the
                local Paragon Concepts API.
              </span>

            </div>

            <div className="admin-system-status">

              <span className="admin-online-dot" />

              <span>
                API Connected
              </span>

            </div>

          </section>

        </div>

      </main>
    </div>
  );
}

export default AdminDashboard;