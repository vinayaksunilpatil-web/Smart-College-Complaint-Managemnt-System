# Smart College Complaint Management System — Database Design

## 1. Relational Schema & Entity-Relationship Model

The system utilizes 6 normalized relational tables in 3NF (Third Normal Form) stored inside `college_parallel_db`.

```
  +------------------+         +------------------+
  |    DEPARTMENT    |         |     CATEGORY     |
  +------------------+         +------------------+
  | PK  dept_id      |<-------\| PK  category_id  |
  |     dept_name    |         |     category_name|
  |     location     |         | FK  dept_id      |
  +------------------+         |     sla_hours    |
        ^     ^                +------------------+
        |     |                         ^
        |     |                         |
        |     +------------\            |
        |                  |            |
  +-----+------------+     |            |
  |      STAFF       |     |            |
  +------------------+     |            |
  | PK  staff_id     |     |            |
  |     name         |     |            |
  |     email (UQ)   |     |            |
  |     password_hash|     |            |
  | FK  dept_id      |     |            |
  |     role         |     |            |
  +------------------+     |            |
        ^                  |            |
        |                  |            |
        |        +---------+------------+----+
        |        |         COMPLAINT         |
        |        +---------------------------+
        |        | PK  complaint_id          |
        |        | FK  student_id            |----+
        \--------| FK  staff_id              |    |
                 | FK  dept_id               |    |
                 | FK  category_id           |    |
                 |     title                 |    |
                 |     description           |    |
                 |     status                |    |
                 |     priority              |    |
                 |     created_at            |    |
                 |     updated_at            |    |
                 +---------------------------+    |
                               ^                  |
                               | (1:N)            |
                     +---------+--------+         |
                     |    STATUS_LOG    |         |
                     +------------------+         |
                     | PK  log_id       |         |
                     | FK  complaint_id |         |
                     |     old_status   |         |
                     |     new_status   |         |
                     |     updated_by   |         |
                     |     remarks      |         |
                     |     updated_at   |         |
                     +------------------+         |
                                                  |
                     +------------------+         |
                     |     STUDENT      |         |
                     +------------------+         |
                     | PK  student_id   |<--------+
                     |     name         |
                     |     email (UQ)   |
                     |     password_hash|
                     |     roll_no      |
                     |     phone        |
                     +------------------+
```

---

## 2. Table Specifications

### 1. `department`
- `dept_id INT PRIMARY KEY`
- `dept_name VARCHAR(50) NOT NULL` (e.g. Computer, Information Technology, Civil, E&TC)
- `location VARCHAR(100)`

### 2. `category`
- `category_id INT PRIMARY KEY AUTO_INCREMENT`
- `category_name VARCHAR(50) NOT NULL`
- `dept_id INT NOT NULL` (FK -> `department.dept_id`)
- `sla_hours INT DEFAULT 24`

### 3. `student`
- `student_id INT PRIMARY KEY AUTO_INCREMENT`
- `name VARCHAR(100) NOT NULL`
- `email VARCHAR(100) UNIQUE NOT NULL`
- `password_hash VARCHAR(255) NOT NULL`
- `roll_no VARCHAR(50) NOT NULL`
- `phone VARCHAR(20)`

### 4. `staff`
- `staff_id INT PRIMARY KEY AUTO_INCREMENT`
- `name VARCHAR(100) NOT NULL`
- `email VARCHAR(100) UNIQUE NOT NULL`
- `password_hash VARCHAR(255) NOT NULL`
- `dept_id INT NOT NULL` (FK -> `department.dept_id`)
- `role VARCHAR(50) DEFAULT 'Staff'` ('Staff' or 'Admin')

### 5. `complaint`
- `complaint_id INT PRIMARY KEY AUTO_INCREMENT`
- `student_id INT NOT NULL` (FK -> `student.student_id`)
- `dept_id INT NOT NULL` (FK -> `department.dept_id`)
- `category_id INT NOT NULL` (FK -> `category.category_id`)
- `staff_id INT NULL` (FK -> `staff.staff_id`)
- `title VARCHAR(150) NOT NULL`
- `description TEXT NOT NULL`
- `status VARCHAR(20) DEFAULT 'Open'` ('Open', 'In Progress', 'Resolved', 'Closed')
- `priority VARCHAR(20) DEFAULT 'Medium'` ('Low', 'Medium', 'High', 'Critical')
- `created_at DATETIME DEFAULT CURRENT_TIMESTAMP`
- `updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`

### 6. `status_log`
- `log_id INT PRIMARY KEY AUTO_INCREMENT`
- `complaint_id INT NOT NULL` (FK -> `complaint.complaint_id`)
- `old_status VARCHAR(20)`
- `new_status VARCHAR(20) NOT NULL`
- `updated_by INT NULL`
- `remarks TEXT`
- `updated_at DATETIME DEFAULT CURRENT_TIMESTAMP`

---

## 3. Partitioning Schemes (ADBMS)

### A. HASH Partitioning
```sql
ALTER TABLE complaint
PARTITION BY HASH (complaint_id)
PARTITIONS 4;
```
- Distributes rows evenly into partitions `p0, p1, p2, p3` by evaluating `complaint_id MOD 4`.
- Minimizes I/O contention during peak registration times.

### B. RANGE Partitioning & Partition Pruning
```sql
ALTER TABLE complaint
DROP PRIMARY KEY,
ADD PRIMARY KEY (complaint_id, created_at);

ALTER TABLE complaint
PARTITION BY RANGE (YEAR(created_at)) (
    PARTITION p2025 VALUES LESS THAN (2026),
    PARTITION p2026 VALUES LESS THAN (2027),
    PARTITION p2027 VALUES LESS THAN (2028),
    PARTITION pmax VALUES LESS THAN MAXVALUE
);
```
- Partition Pruning Query:
```sql
EXPLAIN
SELECT COUNT(*) FROM complaint
WHERE created_at >= '2026-01-01' AND created_at < '2027-01-01';
```
The MySQL Query Optimizer isolates partition `p2026` and skips `p2025`, `p2027`, and `pmax`.
