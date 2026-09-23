const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

dotenv.config();

const app = express();

// ===============================
// MIDDLEWARE
// ===============================

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ===============================
// DATABASE
// ===============================

const dbPath = process.env.DB_PATH || "./paragon.db";

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Database connection failed:", err.message);
  } else {
    console.log("SQLite database connected successfully");
    console.log("Database path:", dbPath);
  }
});

// ===============================
// CREATE TABLES
// ===============================

db.serialize(() => {
  // ===============================
  // ADMIN TABLE
  // ===============================

  db.run(`
    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // ===============================
  // SERVICES TABLE
  // ===============================

  db.run(`
    CREATE TABLE IF NOT EXISTS services (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      image TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // ===============================
  // REQUESTS TABLE
  // ===============================

  db.run(`
    CREATE TABLE IF NOT EXISTS requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT,
      service TEXT,
      message TEXT,
      status TEXT DEFAULT 'new',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // ======================================================
  // DEFAULT SERVICES
  // ======================================================

  const defaultServices = [
    {
      title: "NIN Services",
      description:
        "Get assistance with NIN-related services, reprinting and other digital documentation needs.",
      image:
        "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1200&q=85",
    },

    {
      title: "NYSC Registration",
      description:
        "Get assistance with NYSC registration and other related online processes.",
      image:
        "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=85",
    },

    {
      title: "Online Registration",
      description:
        "Complete important online registrations and digital applications with professional assistance.",
      image:
        "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=85",
    },

    {
      title: "Graphics Design",
      description:
        "Professional graphics for businesses, events, brands, social media and personal projects.",
      image:
        "https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=1200&q=85",
    },

    {
      title: "Project Writing",
      description:
        "Assistance with academic project preparation, formatting, documentation and presentation.",
      image:
        "https://images.unsplash.com/photo-1456324504439-367cee3b3c32?auto=format&fit=crop&w=1200&q=85",
    },

    {
      title: "Typing & Printing",
      description:
        "Fast and reliable typing, documentation, photocopying and printing services.",
      image:
        "https://images.unsplash.com/photo-1456735190827-d1262f71b8a3?auto=format&fit=crop&w=1200&q=85",
    },

    {
      title: "Color Printing",
      description:
        "High-quality colour printing for documents, flyers, business materials and more.",
      image:
        "https://images.unsplash.com/photo-1586953208448-b95a79798f07?auto=format&fit=crop&w=1200&q=85",
    },

    {
      title: "Newspaper Services",
      description:
        "Assistance with newspaper-related services, publications and documentation.",
      image:
        "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=85",
    },

    {
      title: "Passport Photography",
      description:
        "Professional passport photography suitable for official documentation and applications.",
      image:
        "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=85",
    },

    {
      title: "Web Development",
      description:
        "Modern responsive websites for businesses, organizations, brands and individuals.",
      image:
        "https://images.unsplash.com/photo-1547658719-da2b51169166?auto=format&fit=crop&w=1200&q=85",
    },

    {
      title: "CV / Resume",
      description:
        "Professional CV and resume preparation designed to present your skills and experience clearly.",
      image:
        "https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=1200&q=85",
    },

    {
      title: "Research",
      description:
        "Research assistance, document preparation, formatting and academic support.",
      image:
        "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1200&q=85",
    },

    {
      title: "Document Editing",
      description:
        "Professional editing, formatting and preparation of digital documents.",
      image:
        "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1200&q=85",
    },

    {
      title: "Digital Assistance",
      description:
        "Get help completing digital tasks, forms, applications and other online processes.",
      image:
        "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1200&q=85",
    },

    {
      title: "Digital Services",
      description:
        "A wide range of digital and computer-related services for students, individuals and businesses.",
      image:
        "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=85",
    },
  ];

  // Add default services only when they don't already exist.
  // This prevents duplicates when the server restarts.

  defaultServices.forEach((service) => {
    db.run(
      `
        INSERT INTO services (
          title,
          description,
          image
        )
        SELECT ?, ?, ?
        WHERE NOT EXISTS (
          SELECT 1
          FROM services
          WHERE LOWER(title) = LOWER(?)
        )
      `,
      [
        service.title,
        service.description,
        service.image,
        service.title,
      ],
      (err) => {
        if (err) {
          console.error(
            `Failed to seed service "${service.title}":`,
            err.message
          );
        }
      }
    );
  });

  // ======================================================
  // CREATE DEFAULT ADMIN
  // ======================================================

  const username =
    process.env.ADMIN_USERNAME || "admin";

  const password =
    process.env.ADMIN_PASSWORD || "Paragon@2026";

  db.get(
    "SELECT id FROM admins WHERE username = ?",
    [username],
    async (err, row) => {
      if (err) {
        console.error(
          "Admin check failed:",
          err.message
        );
        return;
      }

      if (!row) {
        const hashedPassword =
          await bcrypt.hash(password, 10);

        db.run(
          `
            INSERT INTO admins (
              username,
              password
            )
            VALUES (?, ?)
          `,
          [username, hashedPassword],
          (insertErr) => {
            if (insertErr) {
              console.error(
                "Failed to create admin:",
                insertErr.message
              );
            } else {
              console.log(
                "Default admin account created."
              );

              console.log(
                `Username: ${username}`
              );
            }
          }
        );
      }
    }
  );
});

// ======================================================
// BASIC ROUTE
// ======================================================

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Paragon Concepts API is running.",
  });
});

// ======================================================
// ADMIN LOGIN
// ======================================================

app.post("/api/admin/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message:
        "Username and password are required.",
    });
  }

  db.get(
    "SELECT * FROM admins WHERE username = ?",
    [username],
    async (err, admin) => {
      if (err) {
        console.error(
          "Login error:",
          err.message
        );

        return res.status(500).json({
          success: false,
          message: "Server error.",
        });
      }

      if (!admin) {
        return res.status(401).json({
          success: false,
          message:
            "Invalid username or password.",
        });
      }

      const passwordMatch =
        await bcrypt.compare(
          password,
          admin.password
        );

      if (!passwordMatch) {
        return res.status(401).json({
          success: false,
          message:
            "Invalid username or password.",
        });
      }

      const token = jwt.sign(
        {
          id: admin.id,
          username: admin.username,
        },
        process.env.JWT_SECRET ||
          "paragon_secret_key",
        {
          expiresIn: "1d",
        }
      );

      res.json({
        success: true,
        message: "Login successful.",
        token,

        admin: {
          id: admin.id,
          username: admin.username,
        },
      });
    }
  );
});

// ======================================================
// AUTHENTICATION MIDDLEWARE
// ======================================================

function authenticateToken(req, res, next) {
  const authHeader =
    req.headers.authorization;

  const token =
    authHeader &&
    authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message:
        "Access denied. No token provided.",
    });
  }

  jwt.verify(
    token,
    process.env.JWT_SECRET ||
      "paragon_secret_key",
    (err, user) => {
      if (err) {
        return res.status(403).json({
          success: false,
          message:
            "Invalid or expired token.",
        });
      }

      req.user = user;

      next();
    }
  );
}

// ======================================================
// SERVICES
// ======================================================

// GET ALL SERVICES

app.get("/api/services", (req, res) => {
  db.all(
    `
      SELECT *
      FROM services
      ORDER BY id DESC
    `,
    [],
    (err, rows) => {
      if (err) {
        console.error(
          "Error fetching services:",
          err.message
        );

        return res.status(500).json({
          success: false,
          message:
            "Failed to fetch services.",
        });
      }

      res.json({
        success: true,
        services: rows,
      });
    }
  );
});

// ======================================================
// GET ONE SERVICE
// ======================================================

app.get("/api/services/:id", (req, res) => {
  const { id } = req.params;

  db.get(
    `
      SELECT *
      FROM services
      WHERE id = ?
    `,
    [id],
    (err, service) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message:
            "Failed to fetch service.",
        });
      }

      if (!service) {
        return res.status(404).json({
          success: false,
          message: "Service not found.",
        });
      }

      res.json({
        success: true,
        service,
      });
    }
  );
});

// ======================================================
// ADD SERVICE
// ======================================================

app.post(
  "/api/services",
  authenticateToken,
  (req, res) => {
    const {
      title,
      description,
      image,
    } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message:
          "Service title is required.",
      });
    }

    db.run(
      `
        INSERT INTO services (
          title,
          description,
          image
        )
        VALUES (?, ?, ?)
      `,
      [
        title,
        description || "",
        image || "",
      ],
      function (err) {
        if (err) {
          console.error(
            "Error creating service:",
            err.message
          );

          return res.status(500).json({
            success: false,
            message:
              "Failed to create service.",
          });
        }

        res.status(201).json({
          success: true,
          message:
            "Service created successfully.",

          service: {
            id: this.lastID,
            title,
            description:
              description || "",
            image: image || "",
          },
        });
      }
    );
  }
);

// ======================================================
// UPDATE SERVICE
// ======================================================

app.put(
  "/api/services/:id",
  authenticateToken,
  (req, res) => {
    const { id } = req.params;

    const {
      title,
      description,
      image,
    } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message:
          "Service title is required.",
      });
    }

    db.run(
      `
        UPDATE services
        SET
          title = ?,
          description = ?,
          image = ?
        WHERE id = ?
      `,
      [
        title,
        description || "",
        image || "",
        id,
      ],
      function (err) {
        if (err) {
          console.error(
            "Error updating service:",
            err.message
          );

          return res.status(500).json({
            success: false,
            message:
              "Failed to update service.",
          });
        }

        if (this.changes === 0) {
          return res.status(404).json({
            success: false,
            message:
              "Service not found.",
          });
        }

        res.json({
          success: true,
          message:
            "Service updated successfully.",
        });
      }
    );
  }
);

// ======================================================
// DELETE SERVICE
// ======================================================

app.delete(
  "/api/services/:id",
  authenticateToken,
  (req, res) => {
    const { id } = req.params;

    db.run(
      `
        DELETE FROM services
        WHERE id = ?
      `,
      [id],
      function (err) {
        if (err) {
          console.error(
            "Error deleting service:",
            err.message
          );

          return res.status(500).json({
            success: false,
            message:
              "Failed to delete service.",
          });
        }

        if (this.changes === 0) {
          return res.status(404).json({
            success: false,
            message:
              "Service not found.",
          });
        }

        res.json({
          success: true,
          message:
            "Service deleted successfully.",
        });
      }
    );
  }
);

// ======================================================
// CUSTOMER REQUESTS
// ======================================================

// CREATE REQUEST

app.post("/api/requests", (req, res) => {
  const {
    name,
    phone,
    email,
    service,
    message,
  } = req.body;

  if (!name || !phone) {
    return res.status(400).json({
      success: false,
      message:
        "Name and phone number are required.",
    });
  }

  db.run(
    `
      INSERT INTO requests (
        name,
        phone,
        email,
        service,
        message
      )
      VALUES (?, ?, ?, ?, ?)
    `,
    [
      name,
      phone,
      email || "",
      service || "",
      message || "",
    ],
    function (err) {
      if (err) {
        console.error(
          "Error creating request:",
          err.message
        );

        return res.status(500).json({
          success: false,
          message:
            "Failed to submit request.",
        });
      }

      res.status(201).json({
        success: true,
        message:
          "Request submitted successfully.",
        requestId: this.lastID,
      });
    }
  );
});

// ======================================================
// GET ALL REQUESTS
// ======================================================

app.get(
  "/api/requests",
  authenticateToken,
  (req, res) => {
    db.all(
      `
        SELECT *
        FROM requests
        ORDER BY id DESC
      `,
      [],
      (err, rows) => {
        if (err) {
          return res.status(500).json({
            success: false,
            message:
              "Failed to fetch requests.",
          });
        }

        res.json({
          success: true,
          requests: rows,
        });
      }
    );
  }
);

// ======================================================
// UPDATE REQUEST STATUS
// ======================================================

app.patch(
  "/api/requests/:id/status",
  authenticateToken,
  (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = [
      "new",
      "contacted",
      "completed",
      "cancelled",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid request status.",
      });
    }

    db.run(
      `
        UPDATE requests
        SET status = ?
        WHERE id = ?
      `,
      [status, id],
      function (err) {
        if (err) {
          return res.status(500).json({
            success: false,
            message:
              "Failed to update request.",
          });
        }

        if (this.changes === 0) {
          return res.status(404).json({
            success: false,
            message:
              "Request not found.",
          });
        }

        res.json({
          success: true,
          message:
            "Request status updated successfully.",
        });
      }
    );
  }
);

// ======================================================
// DELETE REQUEST
// ======================================================

app.delete(
  "/api/requests/:id",
  authenticateToken,
  (req, res) => {
    const { id } = req.params;

    db.run(
      `
        DELETE FROM requests
        WHERE id = ?
      `,
      [id],
      function (err) {
        if (err) {
          return res.status(500).json({
            success: false,
            message:
              "Failed to delete request.",
          });
        }

        if (this.changes === 0) {
          return res.status(404).json({
            success: false,
            message:
              "Request not found.",
          });
        }

        res.json({
          success: true,
          message:
            "Request deleted successfully.",
        });
      }
    );
  }
);

// ======================================================
// ADMIN STATISTICS
// ======================================================

app.get(
  "/api/admin/stats",
  authenticateToken,
  (req, res) => {
    db.get(
      `
        SELECT COUNT(*) AS totalRequests
        FROM requests
      `,
      [],
      (err, requestCount) => {
        if (err) {
          return res.status(500).json({
            success: false,
            message:
              "Failed to fetch statistics.",
          });
        }

        db.get(
          `
            SELECT COUNT(*) AS totalServices
            FROM services
          `,
          [],
          (err, serviceCount) => {
            if (err) {
              return res.status(500).json({
                success: false,
                message:
                  "Failed to fetch statistics.",
              });
            }

            db.get(
              `
                SELECT COUNT(*) AS newRequests
                FROM requests
                WHERE status = 'new'
              `,
              [],
              (err, newCount) => {
                if (err) {
                  return res.status(500).json({
                    success: false,
                    message:
                      "Failed to fetch statistics.",
                  });
                }

                db.get(
                  `
                    SELECT COUNT(*) AS completedRequests
                    FROM requests
                    WHERE status = 'completed'
                  `,
                  [],
                  (err, completedCount) => {
                    if (err) {
                      return res.status(500).json({
                        success: false,
                        message:
                          "Failed to fetch statistics.",
                      });
                    }

                    res.json({
                      success: true,

                      stats: {
                        totalRequests:
                          requestCount.totalRequests,

                        totalServices:
                          serviceCount.totalServices,

                        newRequests:
                          newCount.newRequests,

                        completedRequests:
                          completedCount.completedRequests,
                      },
                    });
                  }
                );
              }
            );
          }
        );
      }
    );
  }
);

// ======================================================
// 404 ROUTE
// ======================================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found.",
  });
});

// ======================================================
// ERROR HANDLER
// ======================================================

app.use(
  (err, req, res, next) => {
    console.error(err.stack);

    res.status(500).json({
      success: false,
      message:
        "Something went wrong on the server.",
    });
  }
);

// ======================================================
// START SERVER
// ======================================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `Server running on http://localhost:${PORT}`
  );
});