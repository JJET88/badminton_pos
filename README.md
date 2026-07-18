# TawBayin Badminton Point of Sale (POS)

TawBayin Badminton POS is a full-stack, responsive Point of Sale and eCommerce inventory catalog system built with **Next.js (App Router)**, **Tailwind CSS v4**, and **MySQL**.

For detailed system design, tech stack info, component references, API documentation, and database schemas, please check out the [Technical Documentation Guide](file:///c:/Users/ASUS/Desktop/Badminton_POS/DOCUMENTATION.md).

---

## Key Features

- **🛒 Interactive POS Catalog**: Responsive layout featuring product cards, paging, categories, search, and inventory checks.
- **🔐 User Roles & Auth**: Custom JWT cookies secure routes for Admins and Cashiers.
- **🏷️ Discount Vouchers**: Fixed-rate or percentage discount code creation, minimum-total requirements, and expiration validation.
- **📈 Admin Dashboard**: Total revenue tracker, low stock alert flags, and interactive sales charts via `recharts` (filterable by Day, Week, Month, or Year).
- **🔄 Database Integrity**: All checkout transactions verify and adjust inventory stock using SQL transactions with full rollback support.
- **🤖 n8n AI Chatbot**: Built-in widget linked to n8n backend for responding to catalog and sales inquiries.

---

## Quick Start Guide

### 1. Database Setup
Ensure you have a MySQL server running, create a database named `badminton_pos`, and initialize the tables using the SQL script located in [DOCUMENTATION.md](file:///c:/Users/ASUS/Desktop/Badminton_POS/DOCUMENTATION.md#database-schema-mysql).

### 2. Environment Setup
Create a `.env.local` file in the root of the project with the following configuration details:

```ini
DB_HOST=localhost
DB_USER=root
DB_PASS=your_password
DB_NAME=badminton_pos
DB_PORT=3306

JWT_SECRET=your_jwt_signing_secret_here
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_here
```

### 3. Run Locally

Install the project dependencies:
```bash
npm install
```

Launch the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

---

## Detailed Docs
- 📖 [Technical System Documentation (DOCUMENTATION.md)](file:///c:/Users/ASUS/Desktop/Badminton_POS/DOCUMENTATION.md)