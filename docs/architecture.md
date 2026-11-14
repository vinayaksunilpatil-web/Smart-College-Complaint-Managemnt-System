# Smart College Complaint Management System — Architecture

## 1. System Overview

The **Smart College Complaint Management System** is a 3-tier enterprise web application engineered for college grievance registration, department-specific routing, and live resolution tracking. It demonstrates advanced database management system (**ADBMS**) principles including relational normalization (3NF), relational joins, parallel aggregation, query execution plans (`EXPLAIN`), MySQL table partitioning (**HASH** & **RANGE**), and partition pruning.

```
                         USERS
                           │
             ┌─────────────┼─────────────┐
             │             │             │
          STUDENT        STAFF         ADMIN
             │             │             │
             └─────────────┼─────────────┘
                           │
                           ▼
                  PRESENTATION LAYER
                  ──────────────────
                 React 18 + Vite + Tailwind
                           │
                         Axios
                           │
                        REST API
                           │
                           ▼
                  APPLICATION LAYER
                  ─────────────────
                  Node.js + Express
                           │
              ┌────────────┼────────────┐
              │            │            │
          Authentication  Complaint   Analytics &
             (JWT/Bcrypt) Management  ADBMS Demo
              │            │            │
              └────────────┼────────────┘
                           │
                           ▼
                     DATA LAYER
                     ──────────
                     MySQL 8.x InnoDB
                           │
          ┌────────────────┼────────────────┐
          │                │                │
       student         department       complaint
       category           staff         status_log
```

---

## 2. Three-Tier Architectural Layers

### A. Presentation Layer (React + Vite)
- **Framework**: React 18 with Vite build tooling for fast HMR.
- **Styling**: Tailwind CSS with custom responsive design system.
- **State & Routing**: React Router v6, React Context API for JWT token management and role-based route guards (`<ProtectedRoute>`).
- **Data Visualization**: Recharts for interactive bar charts, donut charts, and time-series area charts.

### B. Application / Business Logic Layer (Node.js + Express)
- **RESTful Endpoints**: Modular controllers for authentication, complaint workflows, staff actions, institutional analytics, and ADBMS demo.
- **Security**: JWT authentication with 7-day expiration, `bcryptjs` password hashing (salt rounds = 10), and strict role authorization middleware (`student`, `staff`, `admin`).
- **Automated Routing**: Server-side category-to-department lookup ensuring incoming complaints are assigned to the correct academic or facility department.

### C. Data Layer (MySQL 8.x)
- **Database Name**: `college_parallel_db`
- **Engine**: MySQL InnoDB with connection pooling via `mysql2/promise`.
- **Normalization**: Normalized 3NF schema eliminating redundancy across 6 core tables.
- **Partitioning**: Native table partitioning on the `complaint` table demonstrating HASH and RANGE distribution.

---

## 3. Parallel & Distributed Database Concept vs. MySQL Implementation

In ADBMS theory, parallel and distributed databases distribute data and query processing across multiple processing units or storage nodes.

```
                    APPLICATION
                         │
              ┌──────────┴──────────┐
              │          │          │
           Student     Staff      Admin
              │          │          │
              └──────────┬──────────┘
                         │
                    React Frontend
                         │
                    Express API
                         │
                      MySQL
                         │
                    Complaint
                         │
             ┌───────────┴───────────┐
             │                       │
           HASH                    RANGE
       (Load Balancing)       (Time Series)
             │                       │
        p0 p1 p2 p3        p2025 p2026 p2027 pmax
```

> [!NOTE]
> **Implementation Note**: HASH and RANGE partitioning are alternative partitioning configurations in MySQL. They are applied to the `complaint` table independently to demonstrate:
> 1. **HASH Partitioning**: Even load balancing (`complaint_id MOD 4`) to eliminate single-partition hotspots during massive complaint registration periods.
> 2. **RANGE Partitioning**: Time-based partitioning (`YEAR(created_at)`) enabling partition pruning during academic year report generation.
