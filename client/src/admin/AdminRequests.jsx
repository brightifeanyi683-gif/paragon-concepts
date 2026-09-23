import React, { useEffect, useState } from "react";
import {
  Search,
  RefreshCw,
  Trash2,
  Eye,
  X,
  ArrowLeft,
  BriefcaseBusiness,
  MessageSquare,
  Clock3,
  CheckCircle2,
  Phone,
  Mail,
  UserRound,
  Loader2,
  AlertCircle,
  ExternalLink,
} from "lucide-react";

import "./admin.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function AdminRequests() {
  const [requests, setRequests] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deleting, setDeleting] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");

  const [statusFilter, setStatusFilter] =
    useState("all");

  const [selectedRequest, setSelectedRequest] =
    useState(null);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const token = localStorage.getItem(
    "paragon_admin_token"
  );

  // =====================================================
  // CHECK LOGIN
  // =====================================================

  useEffect(() => {
    if (!token) {
      window.location.href = "/admin";
    }
  }, [token]);

  // =====================================================
  // FETCH REQUESTS
  // =====================================================

  const fetchRequests = async (
    showRefresh = false
  ) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await fetch(
        `${API_URL}/api/requests`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (
        response.status === 401 ||
        response.status === 403
      ) {
        localStorage.removeItem(
          "paragon_admin_token"
        );

        localStorage.removeItem(
          "paragon_admin"
        );

        window.location.href = "/admin";

        return;
      }

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Unable to load customer requests."
        );
      }

      setRequests(data.requests || []);
    } catch (err) {
      console.error(
        "Fetch requests error:",
        err
      );

      setError(
        err.message ||
          "Unable to load customer requests."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchRequests();
    }
  }, [token]);

  // =====================================================
  // UPDATE STATUS
  // =====================================================

  const updateStatus = async (
    requestId,
    status
  ) => {
    try {
      setError("");
      setMessage("");

      const response = await fetch(
        `${API_URL}/api/requests/${requestId}/status`,
        {
          method: "PATCH",

          headers: {
            "Content-Type":
              "application/json",

            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            status,
          }),
        }
      );

      if (
        response.status === 401 ||
        response.status === 403
      ) {
        localStorage.removeItem(
          "paragon_admin_token"
        );

        localStorage.removeItem(
          "paragon_admin"
        );

        window.location.href = "/admin";

        return;
      }

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Unable to update request status."
        );
      }

      setRequests((previous) =>
        previous.map((request) =>
          request.id === requestId
            ? {
                ...request,
                status,
              }
            : request
        )
      );

      setSelectedRequest((previous) =>
        previous &&
        previous.id === requestId
          ? {
              ...previous,
              status,
            }
          : previous
      );

      setMessage(
        "Request status updated successfully."
      );

      setTimeout(() => {
        setMessage("");
      }, 3000);
    } catch (err) {
      console.error(
        "Update status error:",
        err
      );

      setError(
        err.message ||
          "Unable to update status."
      );
    }
  };

  // =====================================================
  // DELETE REQUEST
  // =====================================================

  const deleteRequest = async (request) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete the request from ${
        request.name || "this customer"
      }?`
    );

    if (!confirmed) return;

    try {
      setDeleting(request.id);

      setError("");
      setMessage("");

      const response = await fetch(
        `${API_URL}/api/requests/${request.id}`,
        {
          method: "DELETE",

          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (
        response.status === 401 ||
        response.status === 403
      ) {
        localStorage.removeItem(
          "paragon_admin_token"
        );

        localStorage.removeItem(
          "paragon_admin"
        );

        window.location.href = "/admin";

        return;
      }

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Unable to delete request."
        );
      }

      setRequests((previous) =>
        previous.filter(
          (item) => item.id !== request.id
        )
      );

      if (
        selectedRequest?.id === request.id
      ) {
        setSelectedRequest(null);
      }

      setMessage(
        "Request deleted successfully."
      );

      setTimeout(() => {
        setMessage("");
      }, 3000);
    } catch (err) {
      console.error(
        "Delete request error:",
        err
      );

      setError(
        err.message ||
          "Unable to delete request."
      );
    } finally {
      setDeleting(null);
    }
  };

  // =====================================================
  // FILTER REQUESTS
  // =====================================================

  const filteredRequests =
    requests.filter((request) => {
      const search =
        searchTerm
          .toLowerCase()
          .trim();

      const matchesSearch =
        !search ||
        request.name
          ?.toLowerCase()
          .includes(search) ||
        request.email
          ?.toLowerCase()
          .includes(search) ||
        request.phone
          ?.toLowerCase()
          .includes(search) ||
        request.service
          ?.toLowerCase()
          .includes(search) ||
        request.message
          ?.toLowerCase()
          .includes(search);

      const matchesStatus =
        statusFilter === "all" ||
        request.status === statusFilter;

      return (
        matchesSearch &&
        matchesStatus
      );
    });

  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate = (date) => {
    if (!date) return "—";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "—";
    }

    return parsedDate.toLocaleDateString(
      "en-NG",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
  };

  const formatTime = (date) => {
    if (!date) return "";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "";
    }

    return parsedDate.toLocaleTimeString(
      "en-NG",
      {
        hour: "numeric",
        minute: "2-digit",
      }
    );
  };

  // =====================================================
  // STATUS LABEL
  // =====================================================

  const getStatusLabel = (status) => {
    switch (status) {
      case "new":
        return "New";

      case "contacted":
        return "Contacted";

      case "completed":
        return "Completed";

      case "cancelled":
        return "Cancelled";

      default:
        return status || "New";
    }
  };

  // =====================================================
  // STATUS CLASS
  // =====================================================

  const getStatusClass = (status) => {
    switch (status) {
      case "new":
        return "new";

      case "contacted":
        return "contacted";

      case "completed":
        return "completed";

      case "cancelled":
        return "cancelled";

      default:
        return "new";
    }
  };

  // =====================================================
  // WHATSAPP
  // =====================================================

  const openWhatsApp = (phone, name) => {
    if (!phone) return;

    let cleanPhone =
      phone.replace(/\D/g, "");

    if (cleanPhone.startsWith("0")) {
      cleanPhone =
        "234" +
        cleanPhone.substring(1);
    }

    const text = encodeURIComponent(
      `Hello ${
        name || "there"
      }, this is Paragon Concepts. We received your request and would like to assist you.`
    );

    window.open(
      `https://wa.me/${cleanPhone}?text=${text}`,
      "_blank"
    );
  };

  // =====================================================
  // DASHBOARD
  // =====================================================

  const goToDashboard = () => {
    window.location.href =
      "/admin/dashboard";
  };

  // =====================================================
  // SERVICES
  // =====================================================

  const goToServices = () => {
    window.location.href =
      "/admin/services";
  };

  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = () => {
    localStorage.removeItem(
      "paragon_admin_token"
    );

    localStorage.removeItem(
      "paragon_admin"
    );

    window.location.href = "/admin";
  };

  // =====================================================
  // ADMIN USER
  // =====================================================

  let adminUser = null;

  try {
    adminUser = JSON.parse(
      localStorage.getItem(
        "paragon_admin"
      )
    );
  } catch {
    adminUser = null;
  }

  const username =
    adminUser?.username || "Admin";

  // =====================================================
  // STATS
  // =====================================================

  const totalRequests =
    requests.length;

  const newRequests =
    requests.filter(
      (item) => item.status === "new"
    ).length;

  const contactedRequests =
    requests.filter(
      (item) =>
        item.status === "contacted"
    ).length;

  const completedRequests =
    requests.filter(
      (item) =>
        item.status === "completed"
    ).length;

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="admin-requests-page">

      {/* =================================================
          SIDEBAR
      ================================================= */}

      <aside className="admin-requests-sidebar">

        <div className="admin-requests-brand">

          <div className="admin-requests-brand-logo">
            P
          </div>

          <div>
            <strong>
              Paragon
            </strong>

            <span>
              Concepts
            </span>
          </div>

        </div>


        <nav className="admin-requests-nav">

          <button
            onClick={goToDashboard}
          >
            <BriefcaseBusiness
              size={18}
            />

            Dashboard
          </button>


          <button
            onClick={goToServices}
          >
            <BriefcaseBusiness
              size={18}
            />

            Services
          </button>


          <button className="active">

            <MessageSquare
              size={18}
            />

            Customer Requests

          </button>

        </nav>


        <div className="admin-requests-sidebar-bottom">

          <div className="admin-requests-user">

            <div className="admin-requests-avatar">
              {username
                .charAt(0)
                .toUpperCase()}
            </div>

            <div>

              <strong>
                {username}
              </strong>

              <span>
                Administrator
              </span>

            </div>

          </div>


          <button
            className="admin-requests-logout"
            onClick={handleLogout}
          >
            Logout
          </button>

        </div>

      </aside>


      {/* =================================================
          MAIN
      ================================================= */}

      <main className="admin-requests-main">

        {/* HEADER */}

        <header className="admin-requests-header">

          <div className="admin-requests-header-left">

            <button
              className="admin-requests-back"
              onClick={goToDashboard}
            >
              <ArrowLeft size={18} />
            </button>

            <div>

              <span>
                ADMIN PANEL
              </span>

              <h1>
                Customer Requests
              </h1>

            </div>

          </div>


          <div className="admin-requests-header-user">

            <div className="admin-requests-header-avatar">
              {username
                .charAt(0)
                .toUpperCase()}
            </div>

            <div>

              <strong>
                {username}
              </strong>

              <span>
                Administrator
              </span>

            </div>

          </div>

        </header>


        {/* CONTENT */}

        <div className="admin-requests-content">

          {/* INTRO */}

          <section className="admin-requests-intro">

            <div>

              <span className="admin-requests-eyebrow">
                CUSTOMER MANAGEMENT
              </span>

              <h2>
                Customer requests
              </h2>

              <p>
                View and manage requests
                submitted through your
                Paragon Concepts website.
              </p>

            </div>


            <button
              className="admin-requests-refresh-btn"
              onClick={() =>
                fetchRequests(true)
              }
              disabled={refreshing}
            >

              <RefreshCw
                size={17}
                className={
                  refreshing
                    ? "admin-requests-spin"
                    : ""
                }
              />

              {refreshing
                ? "Refreshing..."
                : "Refresh"}

            </button>

          </section>


          {/* ALERT */}

          {message && (
            <div className="admin-requests-alert success">

              <CheckCircle2
                size={18}
              />

              <span>
                {message}
              </span>

              <button
                onClick={() =>
                  setMessage("")
                }
              >
                <X size={16} />
              </button>

            </div>
          )}


          {error && (
            <div className="admin-requests-alert error">

              <AlertCircle
                size={18}
              />

              <span>
                {error}
              </span>

              <button
                onClick={() =>
                  setError("")
                }
              >
                <X size={16} />
              </button>

            </div>
          )}


          {/* STATS */}

          <section className="admin-requests-stats">

            <div className="admin-request-stat-card">

              <div className="admin-request-stat-icon blue">
                <MessageSquare
                  size={19}
                />
              </div>

              <div>
                <span>
                  Total Requests
                </span>

                <strong>
                  {totalRequests}
                </strong>
              </div>

            </div>


            <div className="admin-request-stat-card">

              <div className="admin-request-stat-icon orange">
                <Clock3 size={19} />
              </div>

              <div>
                <span>
                  New Requests
                </span>

                <strong>
                  {newRequests}
                </strong>
              </div>

            </div>


            <div className="admin-request-stat-card">

              <div className="admin-request-stat-icon purple">
                <Phone size={19} />
              </div>

              <div>
                <span>
                  Contacted
                </span>

                <strong>
                  {contactedRequests}
                </strong>
              </div>

            </div>


            <div className="admin-request-stat-card">

              <div className="admin-request-stat-icon green">
                <CheckCircle2
                  size={19}
                />
              </div>

              <div>
                <span>
                  Completed
                </span>

                <strong>
                  {completedRequests}
                </strong>
              </div>

            </div>

          </section>


          {/* TOOLBAR */}

          <section className="admin-requests-toolbar">

            <div className="admin-requests-search">

              <Search size={17} />

              <input
                type="text"
                placeholder="Search customers, services..."
                value={searchTerm}
                onChange={(e) =>
                  setSearchTerm(
                    e.target.value
                  )
                }
              />

              {searchTerm && (
                <button
                  onClick={() =>
                    setSearchTerm("")
                  }
                >
                  <X size={15} />
                </button>
              )}

            </div>


            <div className="admin-requests-filter">

              <label>
                Status
              </label>

              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(
                    e.target.value
                  )
                }
              >
                <option value="all">
                  All Requests
                </option>

                <option value="new">
                  New
                </option>

                <option value="contacted">
                  Contacted
                </option>

                <option value="completed">
                  Completed
                </option>

                <option value="cancelled">
                  Cancelled
                </option>

              </select>

            </div>

          </section>


          {/* REQUESTS */}

          <section className="admin-requests-table-card">

            <div className="admin-requests-table-header">

              <div>

                <span>
                  CUSTOMER ACTIVITY
                </span>

                <h3>
                  Recent requests
                </h3>

              </div>

              <strong>
                {filteredRequests.length}{" "}
                {filteredRequests.length === 1
                  ? "request"
                  : "requests"}
              </strong>

            </div>


            {loading ? (

              <div className="admin-requests-loading">

                <Loader2
                  size={30}
                  className="admin-requests-spin"
                />

                <p>
                  Loading customer
                  requests...
                </p>

              </div>

            ) : filteredRequests.length ===
              0 ? (

              <div className="admin-requests-empty">

                <div className="admin-requests-empty-icon">
                  <MessageSquare
                    size={27}
                  />
                </div>

                <h3>
                  {searchTerm ||
                  statusFilter !== "all"
                    ? "No requests found"
                    : "No customer requests yet"}
                </h3>

                <p>
                  {searchTerm ||
                  statusFilter !== "all"
                    ? "Try changing your search or status filter."
                    : "Customer requests submitted through your website will appear here."}
                </p>

              </div>

            ) : (

              <div className="admin-requests-list">

                {filteredRequests.map(
                  (request) => (

                    <article
                      className="admin-request-item"
                      key={request.id}
                    >

                      {/* CUSTOMER */}

                      <div className="admin-request-customer">

                        <div className="admin-request-customer-avatar">
                          {(
                            request.name ||
                            "C"
                          )
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div>

                          <strong>
                            {request.name ||
                              "Unknown Customer"}
                          </strong>

                          <span>
                            {request.email ||
                              "No email provided"}
                          </span>

                        </div>

                      </div>


                      {/* SERVICE */}

                      <div className="admin-request-service">

                        <span>
                          SERVICE
                        </span>

                        <strong>
                          {request.service ||
                            "General enquiry"}
                        </strong>

                      </div>


                      {/* DATE */}

                      <div className="admin-request-date">

                        <span>
                          RECEIVED
                        </span>

                        <strong>
                          {formatDate(
                            request.created_at ||
                              request.createdAt
                          )}
                        </strong>

                        <small>
                          {formatTime(
                            request.created_at ||
                              request.createdAt
                          )}
                        </small>

                      </div>


                      {/* STATUS */}

                      <div className="admin-request-status-wrapper">

                        <span
                          className={`admin-request-status ${getStatusClass(
                            request.status
                          )}`}
                        >
                          {getStatusLabel(
                            request.status
                          )}
                        </span>

                      </div>


                      {/* ACTIONS */}

                      <div className="admin-request-actions">

                        <button
                          className="admin-request-view"
                          title="View request"
                          onClick={() =>
                            setSelectedRequest(
                              request
                            )
                          }
                        >
                          <Eye size={16} />
                        </button>


                        <button
                          className="admin-request-delete"
                          title="Delete request"
                          disabled={
                            deleting ===
                            request.id
                          }
                          onClick={() =>
                            deleteRequest(
                              request
                            )
                          }
                        >

                          {deleting ===
                          request.id ? (
                            <Loader2
                              size={16}
                              className="admin-requests-spin"
                            />
                          ) : (
                            <Trash2
                              size={16}
                            />
                          )}

                        </button>

                      </div>

                    </article>

                  )
                )}

              </div>

            )}

          </section>

        </div>

      </main>


      {/* =================================================
          REQUEST DETAILS MODAL
      ================================================= */}

      {selectedRequest && (

        <div
          className="admin-request-modal-overlay"
          onMouseDown={(e) => {
            if (
              e.target ===
              e.currentTarget
            ) {
              setSelectedRequest(null);
            }
          }}
        >

          <div className="admin-request-modal">

            {/* MODAL HEADER */}

            <div className="admin-request-modal-header">

              <div>

                <span>
                  CUSTOMER REQUEST
                </span>

                <h2>
                  Request details
                </h2>

              </div>


              <button
                onClick={() =>
                  setSelectedRequest(
                    null
                  )
                }
              >
                <X size={20} />
              </button>

            </div>


            {/* CUSTOMER INFO */}

            <div className="admin-request-detail-profile">

              <div className="admin-request-detail-avatar">
                {(
                  selectedRequest.name ||
                  "C"
                )
                  .charAt(0)
                  .toUpperCase()}
              </div>

              <div>

                <h3>
                  {selectedRequest.name ||
                    "Unknown Customer"}
                </h3>

                <span>
                  Customer
                </span>

              </div>

            </div>


            {/* CONTACT */}

            <div className="admin-request-contact-grid">

              <a
                href={
                  selectedRequest.phone
                    ? `tel:${selectedRequest.phone}`
                    : "#"
                }
                className="admin-request-contact-card"
              >

                <Phone size={17} />

                <div>

                  <span>
                    PHONE
                  </span>

                  <strong>
                    {selectedRequest.phone ||
                      "Not provided"}
                  </strong>

                </div>

              </a>


              <a
                href={
                  selectedRequest.email
                    ? `mailto:${selectedRequest.email}`
                    : "#"
                }
                className="admin-request-contact-card"
              >

                <Mail size={17} />

                <div>

                  <span>
                    EMAIL
                  </span>

                  <strong>
                    {selectedRequest.email ||
                      "Not provided"}
                  </strong>

                </div>

              </a>

            </div>


            {/* SERVICE */}

            <div className="admin-request-detail-section">

              <span>
                REQUESTED SERVICE
              </span>

              <strong>
                {selectedRequest.service ||
                  "General enquiry"}
              </strong>

            </div>


            {/* MESSAGE */}

            <div className="admin-request-detail-section">

              <span>
                CUSTOMER MESSAGE
              </span>

              <div className="admin-request-message">

                {selectedRequest.message ||
                  "No message was provided."}

              </div>

            </div>


            {/* DATE */}

            <div className="admin-request-detail-date">

              <Clock3 size={15} />

              Received{" "}
              {formatDate(
                selectedRequest.created_at ||
                  selectedRequest.createdAt
              )}

              {" at "}

              {formatTime(
                selectedRequest.created_at ||
                  selectedRequest.createdAt
              )}

            </div>


            {/* STATUS */}

            <div className="admin-request-detail-section">

              <span>
                UPDATE STATUS
              </span>

              <div className="admin-request-status-buttons">

                <button
                  className={
                    selectedRequest.status ===
                    "new"
                      ? "active new"
                      : ""
                  }
                  onClick={() =>
                    updateStatus(
                      selectedRequest.id,
                      "new"
                    )
                  }
                >
                  New
                </button>

                <button
                  className={
                    selectedRequest.status ===
                    "contacted"
                      ? "active contacted"
                      : ""
                  }
                  onClick={() =>
                    updateStatus(
                      selectedRequest.id,
                      "contacted"
                    )
                  }
                >
                  Contacted
                </button>

                <button
                  className={
                    selectedRequest.status ===
                    "completed"
                      ? "active completed"
                      : ""
                  }
                  onClick={() =>
                    updateStatus(
                      selectedRequest.id,
                      "completed"
                    )
                  }
                >
                  Completed
                </button>

                <button
                  className={
                    selectedRequest.status ===
                    "cancelled"
                      ? "active cancelled"
                      : ""
                  }
                  onClick={() =>
                    updateStatus(
                      selectedRequest.id,
                      "cancelled"
                    )
                  }
                >
                  Cancelled
                </button>

              </div>

            </div>


            {/* ACTIONS */}

            <div className="admin-request-modal-actions">

              {selectedRequest.phone && (
                <button
                  className="admin-request-whatsapp"
                  onClick={() =>
                    openWhatsApp(
                      selectedRequest.phone,
                      selectedRequest.name
                    )
                  }
                >
                  <MessageSquare
                    size={17}
                  />

                  WhatsApp Customer

                  <ExternalLink
                    size={14}
                  />
                </button>
              )}


              <button
                className="admin-request-close"
                onClick={() =>
                  setSelectedRequest(
                    null
                  )
                }
              >
                Close
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

export default AdminRequests;