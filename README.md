# Smart College Complaint Management System

**"Report. Track. Resolve."**

An enterprise-grade, full-stack grievance redressal platform engineered for modern tertiary institutions, featuring intelligent automatic department routing, multi-tier role-based workflows, and real MySQL 8.x **ADBMS** parallel database partitioning (**HASH** and **RANGE**) with partition pruning demonstrations.

---

## 📌 Technology Stack

- **Frontend**: React 18, Vite, JavaScript, Tailwind CSS, Recharts, Lucide Icons, Axios, React Router DOM v6
- **Backend**: Node.js, Express.js, REST API, `mysql2/promise`, JWT, `bcryptjs`, CORS, Dotenv
- **Database**: MySQL 8.x Community Server / MySQL Workbench
- **Architecture**: 3-Tier Client-Server Relational Architecture

---

## 📂 Project Structure

```
Smart_Complaint/
│
├── frontend/
│   ├── src/
│   │   ├── components/       # Common reusable UI components (Badges, StatCard, Timeline, Modal, Navbar, Sidebar)
│   │   ├── pages/            # Role-scoped pages (Public, Student, Staff, Admin, ADBMS Demo)
│   │   ├── layouts/          # Dashboard and Public layouts
│   │   ├── services/         # Axios API service clients
│   │   ├── context/          # AuthContext (JWT session management)
│   │   ├── routes/           # ProtectedRoute and AppRoutes
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── backend/
│   ├── config/
│   │   └── db.js             # mysql2 connection pool
│   ├── controllers/         # Auth, Complaint, Analytics, Demo, and Meta controllers
│   ├── middleware/          # JWT authentication and role authorization
│   ├── routes/              # Auth, Complaint, Staff, Admin, Demo, Meta routes
│   ├── app.js               # Express application configuration
│   ├── server.js            # Server entrypoint
│   ├── package.json
│   ├── .env.example
│   └── .env
│
├── database/
│   ├── 00_reset_database.sql    # Clean database reset script
│   ├── 01_create_database.sql   # Database initialization (college_parallel_db)
│   ├── 02_schema.sql            # 6 normalized 3NF tables and indexes
│   ├── 03_seed_data.sql         # Seed records covering 2025, 2026, 2027
│   ├── 04_basic_queries.sql     # SELECT, JOIN, AGGREGATION, UPDATE queries
│   ├── 05_hash_partition.sql    # Real MySQL HASH(complaint_id) PARTITIONS 4
│   ├── 06_range_partition.sql   # Real MySQL RANGE(YEAR(created_at)) (p2025, p2026, p2027, pmax)
│   ├── 07_partition_pruning.sql # EXPLAIN and pruned range queries
│   └── 08_analytics.sql         # Institutional analytical queries
│
├── docs/
│   ├── architecture.md          # 3-tier architecture and parallel DB documentation
│   └── database-design.md       # ER diagrams, 3NF schema, index & partitioning details
│
├── README.md
└── .gitignore
```

---

## 🚀 Quick Setup Guide

### 1. Database Setup (MySQL 8.x)

Open **MySQL Workbench** or your MySQL command line client and execute the SQL scripts in numerical order:

```sql
-- In MySQL Workbench: Open and run each file:
1. database/00_reset_database.sql
2. database/01_create_database.sql
3. database/02_schema.sql
4. database/03_seed_data.sql
5. database/04_basic_queries.sql
```

*(Alternatively, run scripts 05, 06, or 07 to test specific partitioning schemes directly).*

---

### 2. Backend Setup

1. Open a terminal and navigate to `backend/`:
   ```bash
   cd backend
   npm install
   ```

2. Configure environment variables in `backend/.env`:
   ```env
   PORT=5000
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=college_parallel_db
   JWT_SECRET=super_secret_jwt_key_for_smart_complaint_portal_2026
   ```

3. Start the backend server:
   ```bash
   npm start
   # Server will run on http://localhost:5000
   ```

---

### 3. Frontend Setup

1. Open another terminal and navigate to `frontend/`:
   ```bash
   cd frontend
   npm install
   ```

2. Start Vite development server:
   ```bash
   npm run dev
   # Application opens at http://localhost:5173
   ```

---

## 🔑 Demo Login Credentials

All demo accounts use password: **`password123`** (pre-configured with 1-click login on the Sign In page):

| Role | Name | Email | Associated Department |
| :--- | :--- | :--- | :--- |
| **Student** | Vinayak Patil | `vinayak.patil@college.edu` | Student (PRN 24510100) |
| **Student** | Yash Raut | `yash.raut@college.edu` | Student (PRN 24510107) |
| **Staff** | Mrs. Supriya More | `supriya.more@college.edu` | Computer Department |
| **Staff** | Prof. Rajesh Kulkarni | `rajesh.kulkarni@college.edu` | Information Technology |
| **Staff** | Prof. Anita Verma | `anita.verma@college.edu` | Civil Department |
| **Staff** | Prof. Manoj Patil | `manoj.patil@college.edu` | E&TC Department |
| **Admin** | System Administrator | `admin@college.edu` | Full ADBMS Demo & Global Admin |

---

## 🧪 ADBMS Database Demonstrations

The application contains an interactive **ADBMS Database Demo Lab** (accessible via Admin portal):

1. **Selection Operation**: Filter complaints by indexed status column.
2. **Multi-Table JOIN**: Relational join between `complaint` and `department` tables.
3. **Parallel Aggregation**: `GROUP BY dept_name` with `COUNT` and `SUM(status = 'Resolved')`.
4. **Query Optimization (`EXPLAIN`)**: Visualizes real MySQL execution plans, scan types (`ref`, `eq_ref`), and estimated rows.
5. **HASH Partitioning**: Partitions rows via `PARTITION BY HASH(complaint_id) PARTITIONS 4` and inspects distribution in `INFORMATION_SCHEMA.PARTITIONS`.
6. **RANGE Partitioning**: Partitions complaints across academic years `p2025` (<2026), `p2026` (<2027), `p2027` (<2028), and `pmax`.
7. **Partition Pruning**: Uses `EXPLAIN` on date ranges to prove that MySQL scans only the relevant partition (e.g. `p2026`) and eliminates irrelevant partitions.
8. **Live Partition Switcher**: Dynamically switch MySQL InnoDB between HASH, RANGE, and Non-partitioned modes.
