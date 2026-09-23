import React, { useEffect, useState } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  ArrowLeft,
  BriefcaseBusiness,
  Image as ImageIcon,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";

import "./admin.css";

const API_URL = "http://localhost:5000";

function AdminServices() {
  const [services, setServices] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");

  const [showModal, setShowModal] = useState(false);

  const [editingService, setEditingService] = useState(null);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image: "",
  });

  // =====================================================
  // AUTH TOKEN
  // =====================================================

  const token = localStorage.getItem(
    "paragon_admin_token"
  );

  // =====================================================
  // CHECK AUTH
  // =====================================================

  useEffect(() => {
    if (!token) {
      window.location.href = "/admin";
    }
  }, [token]);

  // =====================================================
  // FETCH SERVICES
  // =====================================================

  const fetchServices = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/api/services`
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to fetch services."
        );
      }

      setServices(data.services || []);
    } catch (err) {
      console.error("Fetch services error:", err);

      setError(
        err.message ||
          "Unable to load services."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchServices();
    }
  }, [token]);

  // =====================================================
  // OPEN ADD MODAL
  // =====================================================

  const openAddModal = () => {
    setEditingService(null);

    setFormData({
      title: "",
      description: "",
      image: "",
    });

    setMessage("");
    setError("");

    setShowModal(true);
  };

  // =====================================================
  // OPEN EDIT MODAL
  // =====================================================

  const openEditModal = (service) => {
    setEditingService(service);

    setFormData({
      title: service.title || "",
      description: service.description || "",
      image: service.image || "",
    });

    setMessage("");
    setError("");

    setShowModal(true);
  };

  // =====================================================
  // CLOSE MODAL
  // =====================================================

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    setEditingService(null);

    setFormData({
      title: "",
      description: "",
      image: "",
    });

    setMessage("");
    setError("");
  };

  // =====================================================
  // FORM INPUT
  // =====================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // =====================================================
  // SAVE SERVICE
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!formData.title.trim()) {
      setError("Please enter a service title.");
      return;
    }

    if (!formData.description.trim()) {
      setError(
        "Please enter a service description."
      );
      return;
    }

    try {
      setSaving(true);

      const isEditing = Boolean(editingService);

      const url = isEditing
        ? `${API_URL}/api/services/${editingService.id}`
        : `${API_URL}/api/services`;

      const method = isEditing
        ? "PUT"
        : "POST";

      const response = await fetch(url, {
        method,

        headers: {
          "Content-Type": "application/json",

          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify({
          title: formData.title.trim(),

          description:
            formData.description.trim(),

          image: formData.image.trim(),
        }),
      });

      const data = await response.json();

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

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Failed to save service."
        );
      }

      setMessage(
        isEditing
          ? "Service updated successfully."
          : "Service added successfully."
      );

      await fetchServices();

      setTimeout(() => {
        closeModal();
      }, 700);
    } catch (err) {
      console.error("Save service error:", err);

      setError(
        err.message ||
          "Something went wrong while saving."
      );
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // DELETE SERVICE
  // =====================================================

  const handleDelete = async (service) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${service.title}"?`
    );

    if (!confirmed) return;

    try {
      setDeleting(service.id);
      setError("");
      setMessage("");

      const response = await fetch(
        `${API_URL}/api/services/${service.id}`,
        {
          method: "DELETE",

          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

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

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Failed to delete service."
        );
      }

      setServices((previous) =>
        previous.filter(
          (item) => item.id !== service.id
        )
      );

      setMessage(
        "Service deleted successfully."
      );
    } catch (err) {
      console.error(
        "Delete service error:",
        err
      );

      setError(
        err.message ||
          "Unable to delete service."
      );
    } finally {
      setDeleting(null);
    }
  };

  // =====================================================
  // FILTER SERVICES
  // =====================================================

  const filteredServices = services.filter(
    (service) => {
      const search = searchTerm
        .toLowerCase()
        .trim();

      if (!search) return true;

      return (
        service.title
          ?.toLowerCase()
          .includes(search) ||
        service.description
          ?.toLowerCase()
          .includes(search)
      );
    }
  );

  // =====================================================
  // BACK TO DASHBOARD
  // =====================================================

  const goToDashboard = () => {
    window.location.href =
      "/admin/dashboard";
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
  // FORMAT DATE
  // =====================================================

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString(
      "en-NG",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
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
  // RENDER
  // =====================================================

  return (
    <div className="admin-services-page">

      {/* =============================================
          SIDEBAR
      ============================================== */}

      <aside className="admin-services-sidebar">

        <div className="admin-services-brand">

          <div className="admin-services-brand-logo">
            P
          </div>

          <div>
            <strong>Paragon</strong>
            <span>Concepts</span>
          </div>

        </div>


        <nav className="admin-services-nav">

          <button
            onClick={goToDashboard}
          >
            <BriefcaseBusiness size={18} />
            Dashboard
          </button>

          <button className="active">
            <BriefcaseBusiness size={18} />
            Services
          </button>

          <button
            onClick={() =>
              (window.location.href =
                "/admin/requests")
            }
          >
            <BriefcaseBusiness size={18} />
            Customer Requests
          </button>

        </nav>


        <div className="admin-services-sidebar-bottom">

          <div className="admin-services-user">

            <div className="admin-services-avatar">
              {username
                .charAt(0)
                .toUpperCase()}
            </div>

            <div>
              <strong>{username}</strong>
              <span>Administrator</span>
            </div>

          </div>

          <button
            className="admin-services-logout"
            onClick={handleLogout}
          >
            Logout
          </button>

        </div>

      </aside>


      {/* =============================================
          MAIN
      ============================================== */}

      <main className="admin-services-main">

        {/* HEADER */}

        <header className="admin-services-header">

          <div className="admin-services-header-left">

            <button
              className="admin-services-back"
              onClick={goToDashboard}
            >
              <ArrowLeft size={18} />
            </button>

            <div>

              <span>
                ADMIN PANEL
              </span>

              <h1>
                Services
              </h1>

            </div>

          </div>


          <div className="admin-services-header-user">

            <div className="admin-services-header-avatar">
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

        <div className="admin-services-content">

          {/* PAGE INTRO */}

          <section className="admin-services-intro">

            <div>

              <span className="admin-services-eyebrow">
                BUSINESS SERVICES
              </span>

              <h2>
                Manage your services
              </h2>

              <p>
                Add, edit and remove the
                services displayed on your
                Paragon Concepts website.
              </p>

            </div>

            <button
              className="admin-services-add-btn"
              onClick={openAddModal}
            >
              <Plus size={18} />
              Add Service
            </button>

          </section>


          {/* ALERTS */}

          {message && (
            <div className="admin-services-alert success">
              <CheckCircle2 size={18} />
              <span>{message}</span>

              <button
                onClick={() =>
                  setMessage("")
                }
              >
                <X size={16} />
              </button>
            </div>
          )}


          {error && !showModal && (
            <div className="admin-services-alert error">
              <AlertCircle size={18} />
              <span>{error}</span>

              <button
                onClick={() =>
                  setError("")
                }
              >
                <X size={16} />
              </button>
            </div>
          )}


          {/* TOOLBAR */}

          <section className="admin-services-toolbar">

            <div className="admin-services-count">

              <strong>
                {services.length}
              </strong>

              <span>
                {services.length === 1
                  ? "service"
                  : "services"}{" "}
                available
              </span>

            </div>


            <div className="admin-services-search">

              <Search size={17} />

              <input
                type="text"
                placeholder="Search services..."
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

          </section>


          {/* SERVICES */}

          <section className="admin-services-grid">

            {loading ? (

              <div className="admin-services-loading">

                <Loader2
                  size={30}
                  className="admin-services-spinner"
                />

                <p>
                  Loading services...
                </p>

              </div>

            ) : filteredServices.length === 0 ? (

              <div className="admin-services-empty">

                <div className="admin-services-empty-icon">
                  <BriefcaseBusiness
                    size={26}
                  />
                </div>

                {searchTerm ? (
                  <>
                    <h3>
                      No services found
                    </h3>

                    <p>
                      No service matches
                      "{searchTerm}".
                    </p>

                    <button
                      onClick={() =>
                        setSearchTerm("")
                      }
                    >
                      Clear Search
                    </button>
                  </>
                ) : (
                  <>
                    <h3>
                      No services yet
                    </h3>

                    <p>
                      Add your first service
                      to start building your
                      services section.
                    </p>

                    <button
                      onClick={
                        openAddModal
                      }
                    >
                      <Plus size={17} />
                      Add Your First Service
                    </button>
                  </>
                )}

              </div>

            ) : (

              filteredServices.map(
                (service) => (

                  <article
                    className="admin-service-card"
                    key={service.id}
                  >

                    {/* IMAGE */}

                    <div className="admin-service-image">

                      {service.image ? (

                        <img
                          src={service.image}
                          alt={service.title}
                          onError={(e) => {
                            e.currentTarget.style.display =
                              "none";

                            e.currentTarget.nextElementSibling.style.display =
                              "flex";
                          }}
                        />

                      ) : null}

                      <div
                        className="admin-service-image-fallback"
                        style={{
                          display:
                            service.image
                              ? "none"
                              : "flex",
                        }}
                      >
                        <ImageIcon
                          size={28}
                        />

                        <span>
                          No image
                        </span>
                      </div>

                      <div className="admin-service-number">
                        #{service.id}
                      </div>

                    </div>


                    {/* CONTENT */}

                    <div className="admin-service-card-content">

                      <div>

                        <h3>
                          {service.title}
                        </h3>

                        <p>
                          {service.description ||
                            "No description added."}
                        </p>

                      </div>

                      <div className="admin-service-card-footer">

                        <span>
                          Added{" "}
                          {formatDate(
                            service.created_at
                          )}
                        </span>

                        <div className="admin-service-actions">

                          {service.image && (
                            <button
                              className="admin-service-icon-btn"
                              title="Open image"
                              onClick={() =>
                                window.open(
                                  service.image,
                                  "_blank"
                                )
                              }
                            >
                              <ExternalLink
                                size={15}
                              />
                            </button>
                          )}

                          <button
                            className="admin-service-edit"
                            onClick={() =>
                              openEditModal(
                                service
                              )
                            }
                          >
                            <Pencil size={15} />
                            Edit
                          </button>

                          <button
                            className="admin-service-delete"
                            onClick={() =>
                              handleDelete(
                                service
                              )
                            }
                            disabled={
                              deleting ===
                              service.id
                            }
                          >
                            {deleting ===
                            service.id ? (
                              <Loader2
                                size={15}
                                className="admin-services-spinner"
                              />
                            ) : (
                              <Trash2
                                size={15}
                              />
                            )}

                            Delete
                          </button>

                        </div>

                      </div>

                    </div>

                  </article>

                )
              )

            )}

          </section>

        </div>

      </main>


      {/* =============================================
          ADD / EDIT MODAL
      ============================================== */}

      {showModal && (

        <div
          className="admin-service-modal-overlay"
          onMouseDown={(e) => {
            if (
              e.target ===
              e.currentTarget
            ) {
              closeModal();
            }
          }}
        >

          <div className="admin-service-modal">

            {/* MODAL HEADER */}

            <div className="admin-service-modal-header">

              <div>

                <span>
                  {editingService
                    ? "EDIT SERVICE"
                    : "NEW SERVICE"}
                </span>

                <h2>
                  {editingService
                    ? "Edit service"
                    : "Add a service"}
                </h2>

              </div>

              <button
                onClick={closeModal}
                disabled={saving}
              >
                <X size={20} />
              </button>

            </div>


            {/* FORM */}

            <form
              className="admin-service-form"
              onSubmit={handleSubmit}
            >

              {/* TITLE */}

              <div className="admin-service-form-group">

                <label htmlFor="service-title">
                  Service name
                </label>

                <input
                  id="service-title"
                  name="title"
                  type="text"
                  placeholder="e.g. Graphics Design"
                  value={formData.title}
                  onChange={handleChange}
                  maxLength={100}
                  required
                />

                <small>
                  Give your service a clear,
                  professional name.
                </small>

              </div>


              {/* DESCRIPTION */}

              <div className="admin-service-form-group">

                <label htmlFor="service-description">
                  Description
                </label>

                <textarea
                  id="service-description"
                  name="description"
                  placeholder="Describe what this service offers..."
                  value={
                    formData.description
                  }
                  onChange={handleChange}
                  rows={5}
                  maxLength={500}
                  required
                />

                <small>
                  {formData.description.length}
                  /500 characters
                </small>

              </div>


              {/* IMAGE */}

              <div className="admin-service-form-group">

                <label htmlFor="service-image">
                  Service image URL
                </label>

                <div className="admin-service-image-input">

                  <ImageIcon size={17} />

                  <input
                    id="service-image"
                    name="image"
                    type="url"
                    placeholder="https://example.com/image.jpg"
                    value={formData.image}
                    onChange={handleChange}
                  />

                </div>

                <small>
                  Use a direct image URL.
                  Leave empty if you don't
                  want an image.
                </small>

              </div>


              {/* PREVIEW */}

              {formData.image && (
                <div className="admin-service-preview">

                  <span>
                    IMAGE PREVIEW
                  </span>

                  <img
                    src={formData.image}
                    alt="Service preview"
                    onError={(e) => {
                      e.currentTarget.style.display =
                        "none";

                      e.currentTarget.parentElement.classList.add(
                        "preview-error"
                      );
                    }}
                  />

                </div>
              )}


              {/* MODAL ERROR */}

              {error && (
                <div className="admin-service-form-error">

                  <AlertCircle
                    size={16}
                  />

                  <span>
                    {error}
                  </span>

                </div>
              )}


              {/* SUCCESS */}

              {message && (
                <div className="admin-service-form-success">

                  <CheckCircle2
                    size={16}
                  />

                  <span>
                    {message}
                  </span>

                </div>
              )}


              {/* ACTIONS */}

              <div className="admin-service-modal-actions">

                <button
                  type="button"
                  className="admin-service-cancel"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="admin-service-save"
                  disabled={saving}
                >

                  {saving ? (
                    <>
                      <Loader2
                        size={17}
                        className="admin-services-spinner"
                      />

                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={17} />

                      {editingService
                        ? "Save Changes"
                        : "Add Service"}
                    </>
                  )}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}

export default AdminServices;