
import { useEffect, useState } from "react";
import {
  ArrowRight,
  Check,
  ChevronRight,
  MessageCircle,
  MapPin,
  Menu,
  Phone,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";

import "./index.css";
import brotherImage from "./assets/brother.jpg";

// =====================================================
// CONFIGURATION
// =====================================================

const WHATSAPP_NUMBER = "2348061917807";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

// =====================================================
// PROCESS STEPS
// =====================================================

const processSteps = [
  {
    number: "01",
    title: "Tell us what you need",
    description:
      "Choose a service or send us a message explaining what you need help with.",
  },
  {
    number: "02",
    title: "We review your request",
    description:
      "Our team reviews the details and lets you know the next steps.",
  },
  {
    number: "03",
    title: "Get it done",
    description:
      "We assist with your request and keep the process as simple as possible.",
  },
];

// =====================================================
// APP
// =====================================================

function App() {
  const [menuOpen, setMenuOpen] = useState(false);

  const [services, setServices] = useState([]);

  const [servicesLoading, setServicesLoading] =
    useState(true);

  const [selectedService, setSelectedService] =
    useState("");

  const [formStatus, setFormStatus] =
    useState("");

  // ===================================================
  // FETCH SERVICES FROM DATABASE
  // ===================================================

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setServicesLoading(true);

        const response = await fetch(
          `${API_URL}/api/services`
        );

        if (!response.ok) {
          throw new Error(
            "Failed to load services."
          );
        }

        const data = await response.json();

        const serviceList = Array.isArray(data)
          ? data
          : Array.isArray(data.services)
          ? data.services
          : [];

        setServices(serviceList);
      } catch (error) {
        console.error(
          "Failed to load services:",
          error
        );

        setServices([]);
      } finally {
        setServicesLoading(false);
      }
    };

    fetchServices();
  }, []);

  // ===================================================
  // SCROLL
  // ===================================================

  const scrollToSection = (id) => {
    setMenuOpen(false);

    const element =
      document.getElementById(id);

    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  // ===================================================
  // SERVICE REQUEST
  // ===================================================

  const handleServiceRequest = (
    serviceName
  ) => {
    setSelectedService(serviceName);

    setTimeout(() => {
      scrollToSection("contact");
    }, 50);
  };

  // ===================================================
  // WHATSAPP
  // ===================================================

  const handleWhatsApp = (message) => {
    const url =
      `https://wa.me/${WHATSAPP_NUMBER}` +
      `?text=${encodeURIComponent(message)}`;

    window.open(
      url,
      "_blank",
      "noopener,noreferrer"
    );
  };

  // ===================================================
  // CONTACT FORM
  // ===================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    const form =
      event.currentTarget;

    const formData =
      new FormData(form);

    const name =
      formData
        .get("name")
        ?.toString()
        .trim();

    const phone =
      formData
        .get("phone")
        ?.toString()
        .trim();

    const email =
      formData
        .get("email")
        ?.toString()
        .trim();

    const service =
      formData
        .get("service")
        ?.toString()
        .trim();

    const message =
      formData
        .get("message")
        ?.toString()
        .trim();

    if (
      !name ||
      !phone ||
      !service
    ) {
      setFormStatus(
        "Please fill in all required fields."
      );

      return;
    }

    setFormStatus(
      "Submitting your request..."
    );

    try {
      // Save request to backend
      const response = await fetch(
        `${API_URL}/api/requests`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            name,
            phone,
            email: email || "",
            service,
            message: message || "",
          }),
        }
      );

      let data = {};

      try {
        data =
          await response.json();
      } catch {
        data = {};
      }

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to save your request."
        );
      }

      // Prepare WhatsApp message
      const whatsappMessage = `
Hello Paragon Concepts,

I would like to make a service request.

Name: ${name}
Phone: ${phone}
Email: ${email || "Not provided"}
Service: ${service}

Message:
${message || "No additional message."}
      `.trim();

      setFormStatus(
        "Request submitted successfully. Opening WhatsApp..."
      );

      // Open WhatsApp
      handleWhatsApp(
        whatsappMessage
      );

      // Reset form
      form.reset();

      setSelectedService("");

      // Clear status
      setTimeout(() => {
        setFormStatus("");
      }, 5000);
    } catch (error) {
      console.error(
        "Request submission error:",
        error
      );

      setFormStatus(
        "Unable to submit your request. Please try again or contact us on WhatsApp."
      );
    }
  };

  return (
    <div className="app">

      {/* =================================================
          NAVIGATION
      ================================================= */}

      <header className="site-header">

        <div className="container nav-container">

          <button
            className="brand"
            onClick={() =>
              scrollToSection("home")
            }
            aria-label="Paragon Concepts home"
          >

            <span className="brand-mark">
              P
            </span>

            <span className="brand-text">
              <strong>
                PARAGON
              </strong>

              <small>
                CONCEPTS
              </small>
            </span>

          </button>


          <nav
            className={`main-nav ${
              menuOpen
                ? "nav-open"
                : ""
            }`}
          >

            <button
              onClick={() =>
                scrollToSection("home")
              }
            >
              Home
            </button>

            <button
              onClick={() =>
                scrollToSection(
                  "services"
                )
              }
            >
              Services
            </button>

            <button
              onClick={() =>
                scrollToSection("about")
              }
            >
              About
            </button>

            <button
              onClick={() =>
                scrollToSection(
                  "process"
                )
              }
            >
              How It Works
            </button>

            <button
              onClick={() =>
                scrollToSection(
                  "contact"
                )
              }
            >
              Contact
            </button>

            <button
              className="nav-whatsapp"
              onClick={() =>
                handleWhatsApp(
                  "Hello Paragon Concepts, I would like to make an enquiry about your services."
                )
              }
            >
              <MessageCircle
                size={17}
              />

              WhatsApp
            </button>

          </nav>


          <button
            className="mobile-menu-button"
            onClick={() =>
              setMenuOpen(
                !menuOpen
              )
            }
            aria-label="Toggle navigation"
            aria-expanded={
              menuOpen
            }
          >

            {menuOpen ? (
              <X size={25} />
            ) : (
              <Menu size={25} />
            )}

          </button>

        </div>

      </header>


      <main>

        {/* =================================================
            HERO
        ================================================= */}

        <section
          className="hero-section"
          id="home"
        >

          <div className="hero-background"></div>

          <div className="container hero-container">

            <div className="hero-content">

              <div className="hero-eyebrow">

                <span className="hero-eyebrow-dot"></span>

                DIGITAL SERVICES & SOLUTIONS

              </div>


              <h1>
                Digital services
                <span>
                  {" "}
                  made simple.
                </span>
              </h1>


              <p className="hero-description">
                From online registrations
                and documentation to
                graphics, printing,
                research and web
                development — Paragon
                Concepts helps you handle
                important digital tasks
                with ease.
              </p>


              <div className="hero-actions">

                <button
                  className="primary-button"
                  onClick={() =>
                    scrollToSection(
                      "services"
                    )
                  }
                >
                  Explore Services

                  <ArrowRight
                    size={19}
                  />

                </button>


                <button
                  className="secondary-button"
                  onClick={() =>
                    handleWhatsApp(
                      "Hello Paragon Concepts, I would like to make an enquiry about your services."
                    )
                  }
                >

                  <MessageCircle
                    size={18}
                  />

                  Chat on WhatsApp

                </button>

              </div>


              <div className="hero-trust">

                <div className="trust-item">
                  <Check size={16} />
                  <span>
                    Professional service
                  </span>
                </div>

                <div className="trust-item">
                  <Check size={16} />
                  <span>
                    Digital assistance
                  </span>
                </div>

                <div className="trust-item">
                  <Check size={16} />
                  <span>
                    Easy communication
                  </span>
                </div>

              </div>

            </div>


            {/* HERO IMAGE */}

            <div className="hero-visual">

              <div className="hero-image-wrapper">

                <img
                  src={brotherImage}
                  alt="Paragon Concepts representative"
                  className="hero-person-image"
                />

                <div className="hero-image-overlay"></div>


                <div className="hero-person-info">

                  <span className="hero-person-status">

                    <span></span>

                    AVAILABLE FOR REQUESTS

                  </span>


                  <h3>
                    Paragon Concepts
                  </h3>

                  <p>
                    Digital services &
                    assistance
                  </p>

                </div>

              </div>


              <div className="floating-card floating-card-top">

                <div className="floating-icon">

                  <ShieldCheck
                    size={19}
                  />

                </div>

                <div>

                  <strong>
                    Professional
                  </strong>

                  <span>
                    Digital assistance
                  </span>

                </div>

              </div>


              <button
                className="floating-card floating-card-bottom"
                onClick={() =>
                  handleWhatsApp(
                    "Hello Paragon Concepts, I would like to make an enquiry."
                  )
                }
              >

                <div className="floating-icon whatsapp-icon">

                  <MessageCircle
                    size={19}
                  />

                </div>

                <div>

                  <strong>
                    Chat with us
                  </strong>

                  <span>
                    WhatsApp
                  </span>

                </div>

              </button>

            </div>

          </div>

        </section>


        {/* =================================================
            SERVICES
        ================================================= */}

        <section
          className="services-section"
          id="services"
        >

          <div className="container">

            <div className="section-heading">

              <div>

                <span className="section-label">
                  OUR SERVICES
                </span>

                <h2>
                  Digital solutions built
                  <span>
                    {" "}
                    around your needs.
                  </span>
                </h2>

              </div>


              <p>
                From registrations and
                documentation to design,
                development, printing and
                digital assistance, Paragon
                Concepts helps you get
                important tasks done.
              </p>

            </div>


            <div className="services-list">

              {servicesLoading ? (

                <div className="services-loading">
                  Loading services...
                </div>

              ) : services.length === 0 ? (

                <div className="services-loading">
                  No services available
                  at the moment.
                </div>

              ) : (

                services.map(
                  (
                    service,
                    index
                  ) => (

                    <article
                      className="service-card"
                      key={
                        service.id ||
                        service.title
                      }
                    >

                      <div className="service-card-image">

                        <img
                          src={
                            service.image
                          }
                          alt={
                            service.title
                          }
                          loading="lazy"
                        />

                        <div className="service-number">

                          {String(
                            index + 1
                          ).padStart(
                            2,
                            "0"
                          )}

                        </div>

                      </div>


                      <div className="service-card-content">

                        <div className="service-top">

                          <span className="service-category">
                            DIGITAL SERVICE
                          </span>

                          <span className="service-arrow">

                            <ArrowRight
                              size={20}
                            />

                          </span>

                        </div>


                        <h3>
                          {
                            service.title
                          }
                        </h3>


                        <p>
                          {
                            service.description
                          }
                        </p>


                        <button
                          className="service-request"
                          onClick={() =>
                            handleServiceRequest(
                              service.title
                            )
                          }
                        >

                          Request Service

                          <ArrowRight
                            size={18}
                          />

                        </button>

                      </div>

                    </article>

                  )
                )

              )}

            </div>


            <div className="services-bottom">

              <div className="services-bottom-text">

                <ShieldCheck
                  size={22}
                />

                <span>
                  Need help with
                  something not listed?
                  Contact us and tell us
                  what you need.
                </span>

              </div>


              <button
                className="services-whatsapp"
                onClick={() =>
                  handleWhatsApp(
                    "Hello Paragon Concepts, I need help with a digital service that is not listed on your website."
                  )
                }
              >

                <MessageCircle
                  size={19}
                />

                Chat on WhatsApp

              </button>

            </div>

          </div>

        </section>


        {/* =================================================
            ABOUT
        ================================================= */}

        <section
          className="about-section"
          id="about"
        >

          <div className="container about-container">

            <div className="about-content">

              <span className="section-label">
                ABOUT PARAGON CONCEPTS
              </span>


              <h2>
                Your digital tasks.
                <span>
                  {" "}
                  Made easier.
                </span>
              </h2>


              <p>
                Paragon Concepts Digital
                Services provides a range
                of computer, documentation
                and digital services designed
                to make everyday digital tasks
                easier.
              </p>


              <p>
                Whether you need help with
                an online registration,
                document preparation,
                graphics design, printing,
                research or website
                development, you can contact
                us and explain what you need.
              </p>


              <div className="about-features">

                <div className="about-feature">

                  <div className="feature-icon">
                    <Check size={18} />
                  </div>

                  <div>

                    <strong>
                      Wide range of services
                    </strong>

                    <span>
                      Multiple digital and
                      documentation solutions
                      in one place.
                    </span>

                  </div>

                </div>


                <div className="about-feature">

                  <div className="feature-icon">
                    <Check size={18} />
                  </div>

                  <div>

                    <strong>
                      Simple communication
                    </strong>

                    <span>
                      Contact us directly and
                      explain what you need.
                    </span>

                  </div>

                </div>


                <div className="about-feature">

                  <div className="feature-icon">
                    <Check size={18} />
                  </div>

                  <div>

                    <strong>
                      Digital convenience
                    </strong>

                    <span>
                      Get assistance with
                      everyday digital tasks.
                    </span>

                  </div>

                </div>

              </div>


              <button
                className="primary-button about-button"
                onClick={() =>
                  scrollToSection(
                    "contact"
                  )
                }
              >

                Contact Us

                <ArrowRight
                  size={18}
                />

              </button>

            </div>


            <div className="about-visual">

              <div className="about-main-card">

                <div className="about-card-top">

                  <div className="about-card-icon">

                    <Sparkles
                      size={22}
                    />

                  </div>

                  <span>
                    DIGITAL ASSISTANCE
                  </span>

                </div>


                <div className="about-big-text">
                  Simple.
                  <br />
                  Digital.
                  <br />
                  Reliable.
                </div>


                <div className="about-card-bottom">

                  <span>
                    PARAGON CONCEPTS
                  </span>

                  <ArrowRight
                    size={20}
                  />

                </div>

              </div>


              <div className="about-mini-card">

                <ShieldCheck
                  size={20}
                />

                <div>

                  <strong>
                    Need assistance?
                  </strong>

                  <span>
                    We're ready to help.
                  </span>

                </div>

              </div>

            </div>

          </div>

        </section>


        {/* =================================================
            PROCESS
        ================================================= */}

        <section
          className="process-section"
          id="process"
        >

          <div className="container">

            <div className="section-heading process-heading">

              <div>

                <span className="section-label">
                  HOW IT WORKS
                </span>

                <h2>
                  Getting started is
                  <span>
                    {" "}
                    simple.
                  </span>
                </h2>

              </div>


              <p>
                Tell us what you need and
                we will guide you through
                the next steps.
              </p>

            </div>


            <div className="process-grid">

              {processSteps.map(
                (step) => (

                  <div
                    className="process-card"
                    key={
                      step.number
                    }
                  >

                    <div className="process-number">
                      {step.number}
                    </div>

                    <div className="process-line"></div>

                    <h3>
                      {step.title}
                    </h3>

                    <p>
                      {step.description}
                    </p>

                    <ChevronRight
                      className="process-arrow"
                      size={20}
                    />

                  </div>

                )
              )}

            </div>

          </div>

        </section>


        {/* =================================================
            CONTACT
        ================================================= */}

        <section
          className="contact-section"
          id="contact"
        >

          <div className="container contact-container">

            <div className="contact-intro">

              <span className="section-label">
                CONTACT US
              </span>


              <h2>
                Let's get your
                <span>
                  {" "}
                  task started.
                </span>
              </h2>


              <p>
                Tell us what you need and
                we will save your request
                and connect with you through
                WhatsApp to discuss it.
              </p>


              <div className="contact-details">

                <button
                  className="contact-detail"
                  onClick={() =>
                    handleWhatsApp(
                      "Hello Paragon Concepts, I would like to contact you."
                    )
                  }
                >

                  <div className="contact-detail-icon">

                    <MessageCircle
                      size={20}
                    />

                  </div>

                  <div>

                    <span>
                      WhatsApp
                    </span>

                    <strong>
                      0806 191 7807
                    </strong>

                  </div>

                </button>


                <a
                  className="contact-detail"
                  href="tel:08061917807"
                >

                  <div className="contact-detail-icon">

                    <Phone size={20} />

                  </div>

                  <div>

                    <span>
                      Phone
                    </span>

                    <strong>
                      0806 191 7807
                    </strong>

                  </div>

                </a>


                <div className="contact-detail">

                  <div className="contact-detail-icon">

                    <MapPin size={20} />

                  </div>

                  <div>

                    <span>
                      Service Area
                    </span>

                    <strong>
                      Nigeria
                    </strong>

                  </div>

                </div>

              </div>

            </div>


            <div className="contact-form-wrapper">

              <form
                className="contact-form"
                onSubmit={
                  handleSubmit
                }
              >

                <div className="form-header">

                  <span>
                    SERVICE REQUEST
                  </span>

                  <h3>
                    Tell us what you need.
                  </h3>

                </div>


                <div className="form-row">

                  <div className="form-group">

                    <label htmlFor="name">
                      Your Name
                    </label>

                    <input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="Enter your name"
                      required
                    />

                  </div>


                  <div className="form-group">

                    <label htmlFor="phone">
                      Phone Number
                    </label>

                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="0806 191 7807"
                      required
                    />

                  </div>

                </div>


                <div className="form-group">

                  <label htmlFor="email">
                    Email Address
                  </label>

                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email address"
                  />

                </div>


                <div className="form-group">

                  <label htmlFor="service">
                    Select Service
                  </label>

                  <select
                    id="service"
                    name="service"
                    value={
                      selectedService
                    }
                    onChange={(
                      event
                    ) =>
                      setSelectedService(
                        event.target.value
                      )
                    }
                    required
                  >

                    <option value="">
                      Choose a service
                    </option>


                    {services.map(
                      (service) => (

                        <option
                          value={
                            service.title
                          }
                          key={
                            service.id ||
                            service.title
                          }
                        >
                          {
                            service.title
                          }
                        </option>

                      )
                    )}

                  </select>

                </div>


                <div className="form-group">

                  <label htmlFor="message">
                    Message
                  </label>

                  <textarea
                    id="message"
                    name="message"
                    rows="5"
                    placeholder="Tell us what you need..."
                  ></textarea>

                </div>


                <button
                  className="form-submit"
                  type="submit"
                >

                  <MessageCircle
                    size={19}
                  />

                  Send Request on WhatsApp

                  <ArrowRight
                    size={18}
                  />

                </button>


                {formStatus && (

                  <p className="form-status">
                    {formStatus}
                  </p>

                )}


                <p className="form-note">
                  Your request will be
                  saved and WhatsApp will
                  open with your details
                  already prepared.
                </p>

              </form>

            </div>

          </div>

        </section>

      </main>


      {/* =================================================
          FOOTER
      ================================================= */}

      <footer className="site-footer">

        <div className="container">

          <div className="footer-top">

            <div className="footer-brand">

              <button
                className="brand footer-brand-button"
                onClick={() =>
                  scrollToSection(
                    "home"
                  )
                }
              >

                <span className="brand-mark">
                  P
                </span>

                <span className="brand-text">

                  <strong>
                    PARAGON
                  </strong>

                  <small>
                    CONCEPTS
                  </small>

                </span>

              </button>


              <p>
                Digital services,
                documentation, design
                and technology solutions.
              </p>

            </div>


            <div className="footer-column">

              <h4>
                Navigation
              </h4>

              <button
                onClick={() =>
                  scrollToSection(
                    "home"
                  )
                }
              >
                Home
              </button>

              <button
                onClick={() =>
                  scrollToSection(
                    "services"
                  )
                }
              >
                Services
              </button>

              <button
                onClick={() =>
                  scrollToSection(
                    "about"
                  )
                }
              >
                About
              </button>

              <button
                onClick={() =>
                  scrollToSection(
                    "contact"
                  )
                }
              >
                Contact
              </button>

            </div>


            <div className="footer-column">

              <h4>
                Services
              </h4>

              {services
                .slice(0, 4)
                .map(
                  (service) => (

                    <button
                      key={
                        service.id ||
                        service.title
                      }
                      onClick={() =>
                        handleServiceRequest(
                          service.title
                        )
                      }
                    >
                      {
                        service.title
                      }
                    </button>

                  )
                )}

            </div>


            <div className="footer-column footer-contact">

              <h4>
                Get in touch
              </h4>


              <button
                onClick={() =>
                  handleWhatsApp(
                    "Hello Paragon Concepts, I would like to make an enquiry."
                  )
                }
              >

                <MessageCircle
                  size={16}
                />

                WhatsApp

              </button>


              <a href="tel:08061917807">

                <Phone size={16} />

                0806 191 7807

              </a>


              <span>

                <MapPin size={16} />

                Nigeria

              </span>

            </div>

          </div>


          <div className="footer-bottom">

            <span>
              ©{" "}
              {new Date().getFullYear()}{" "}
              Paragon Concepts.
              All rights reserved.
            </span>

            <span>
              Digital services made
              simple.
            </span>

          </div>

        </div>

      </footer>

    </div>
  );
}

export default App;

