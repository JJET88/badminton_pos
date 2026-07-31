# TawBayin Badminton Point of Sale (POS) - Technical Documentation

TawBayin Badminton POS is a modern, responsive, and feature-rich Point of Sale and eCommerce catalog system built using **Next.js (App Router)** and **MySQL**. It is designed specifically for managing inventory, transactions, discount vouchers, user roles, and customer loyalty points for a badminton retail store.

---

## Table of Contents
1. [System Architecture](#system-architecture)
2. [Tech Stack](#tech-stack)
3. [Database Schema (MySQL)](#database-schema-mysql)
4. [State Management (Zustand Stores)](#state-management-zustand-stores)
5. [Core Features & UI Components](#core-features--ui-components)
6. [API Reference Directory](#api-reference-directory)
7. [Installation & Developer Setup Guide](#installation--developer-setup-guide)

---

## System Architecture

The application is structured as a full-stack Next.js web application utilizing the **App Router** paradigm:
- **Client Tier**: Highly interactive components built with React and Tailwind CSS v4. State is managed locally using Zustand stores (cart, auth, products).
- **Server Tier / API Routes**: Next.js API route handlers (`/app/api/...`) serve as the backend controller.
- **Database Tier**: Direct connection to a MySQL instance using the `mysql2/promise` client connection pool. All database writes for checkouts are wrapped inside SQL transactions to guarantee consistency and support rollback.
- **Authentication**: JWT-based session management. Upon successful login or registration, a JWT token is generated and stored in a secure, HTTP-only cookie called `token`.
- **AI Chatbot Overlay**: Uses the `@n8n/chat` bundle to inject a live chat widget communicating directly with an n8n webhook workflow.

---

## Tech Stack

- **Framework**: [Next.js 15+](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Database Connection**: [mysql2](https://github.com/sidorares/node-mysql2) (Promise-based connection pool)
- **Authentication**: JWT (`jsonwebtoken`) & password hashing (`bcryptjs`)
- **Data Visualization**: [Recharts](https://recharts.org/) (sales report charts)
- **UI Tooling & Notifications**: [SweetAlert2](https://sweetalert2.github.io/), [react-hot-toast](https://react-hot-toast.com/), [lucide-react](https://lucide.dev/)
- **Integration**: `@n8n/chat` (AI POS Assistant Widget)

---

## Database Schema (MySQL)

Below is the complete database structure. Save this as a SQL file or run it directly in your MySQL shell to initialize the tables.

```sql
CREATE DATABASE IF NOT EXISTS badminton_pos;
USE badminton_pos;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'user', 'cashier') NOT NULL DEFAULT 'user',
  points INT DEFAULT 0,
  image VARCHAR(255) DEFAULT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Kept for compatibility with select endpoints
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Products Table
CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL UNIQUE,
  description TEXT DEFAULT NULL,
  price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  stock INT NOT NULL DEFAULT 0,
  category VARCHAR(100) DEFAULT 'Uncategorized',
  image VARCHAR(255) DEFAULT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Vouchers Table
CREATE TABLE IF NOT EXISTS vouchers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(50) NOT NULL UNIQUE,
  type ENUM('percentage', 'fixed') NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  minTotal DECIMAL(10,2) DEFAULT 0.00,
  expiresAt DATETIME DEFAULT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Sales Table
CREATE TABLE IF NOT EXISTS sales (
  id INT AUTO_INCREMENT PRIMARY KEY,
  total DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  tax DECIMAL(10,2) NOT NULL,
  discount DECIMAL(10,2) DEFAULT 0.00,
  paymentType VARCHAR(50) NOT NULL,
  voucherCode VARCHAR(50) DEFAULT NULL,
  cashierId INT DEFAULT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (cashierId) REFERENCES users(id) ON DELETE SET NULL,
  INDEX (createdAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Sale Items Table
CREATE TABLE IF NOT EXISTS saleitems (
  id INT AUTO_INCREMENT PRIMARY KEY,
  saleId INT NOT NULL,
  productId INT NOT NULL,
  quantity INT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (saleId) REFERENCES sales(id) ON DELETE CASCADE,
  FOREIGN KEY (productId) REFERENCES products(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## State Management (Zustand Stores)

The application uses Zustand stores located in `app/store/` to maintain global client-side state.

### 1. `useAuthStore.js`
- **Purpose**: Manages authenticated cashier/administrator sessions.
- **State**:
  - `user`: Object containing active user details (id, name, email, role, points).
  - `isAuthenticated`: Boolean.
  - `loading`: Boolean state for authentication status checking.
- **Actions**:
  - `login(email, password)`: Sends credentials to `/api/auth/login`, saves JWT HTTP-only cookie, and sets the authenticated user.
  - `logout()`: Clears local state and redirects to login.
  - `checkSession()`: Calls `/api/auth/me` to refresh the session state on page load.

### 2. `useCartStore.js`
- **Purpose**: Manages items selected for transaction checkout.
- **State**:
  - `carts`: Array of selected items containing `{ id, productId, quantity }`.
  - `appliedVoucher`: Active voucher object applied to the current cart.
  - `pointsToRedeem`: Points input by the cashier to redeem for discounts.
- **Actions**:
  - `addCart(item)`: Adds product to cart if not already present.
  - `removeCart(id)`: Removes item by cart item ID.
  - `updateQuantity(id, qty)`: Updates quantity of a cart item.
  - `clearCart()`: Empties the cart.
  - `applyVoucher(voucher)`: Applies a percentage or fixed discount voucher.
  - `setPointsToRedeem(points)`: Controls loyalty point deduction logic.

### 3. `useProductStore.js`
- **Purpose**: Manages client-side product list storage.
- **State**:
  - `products`: Complete list of products fetched from server.
  - `loading`: Boolean fetch state indicator.
- **Actions**:
  - `fetchProducts()`: Loads inventory from `/api/products`.

---

## Core Features & UI Components

The interfaces are organized as reusable files under `/components` and routed in pages under `/app`.

### 1. Catalog & Product Browsing (`ProductList.js`)
- Displays product cards.
- Provides search field (by product title) and category filter buttons.
- Handles pagination controls dynamically based on the total number of items.
- Disables add-to-cart or checkout interactions for items with insufficient stock.

### 2. POS Cart (`Cart.js`, `CartHeader.js`, `CartSection.js`)
- Side panel or dedicated view showing selected products.
- Cashier can adjust item quantity, remove items, or clear the entire cart.
- Automatically calculates subtotal, 7% sales tax, applied voucher code, and loyalty point deduction.

### 3. Sales Checkout (`CheckoutSection.js`)
- Renders payment method selection (Cash, Card, QR Code, Mobile Banking).
- Directs point redemption inputs.
- Validates the transaction parameters on submit and sends a payload to `POST /api/sales`.
- On completion, resets the cart, updates cashier loyalty point credits, and triggers success notifications using SweetAlert2.

### 4. Admin Dashboard Analytics (`DashboardPage.js`)
- High-level metric KPI cards: Total Revenue, Today's Sales, Total Products, and Low Stock Warning Count (< 5 items).
- Time-based sales chart rendered using `ResponsiveContainer` and `LineChart` from Recharts.
- Filter toggle buttons to view metrics by Day, Week, Month, or Year.

### 5. Management Modules
- **Product Management (`ProductManage.js`, `ProductForm.js`, `ProductEditForm.js`)**: Grid listing product stocks with inline filters. Supports product creation, image URL entry, stock count adjustments, category categorization, and deletion. Prevents deleting products tied to historical transaction sales records.
- **User Management (`UserManage.js`, `RegisterPage.js`)**: Lists registered users/cashiers with point totals. Allows admins to register new cashiers, alter roles (`user` or `admin`), modify points, or delete user records.
- **Voucher Settings (`app/dashboard/voucher/page.js`)**: Admin interface to create and manage voucher codes, defining type (percentage vs. fixed), discount value, minimum transaction total, and expiration date.

### 6. AI Assistant Widget (`N8nChatBot.js`)
- Embedded chatbot bubble using `@n8n/chat` dynamically injected on client mount.
- Auto-detects active session credentials via `/api/auth/me` to pre-fill personalization variables.
- Connects to an external n8n workflow webhook to process inventory, sales, and system usage requests.
- Customized using light and dark mode stylesheet configurations.

---

## API Reference Directory

### Authentication `/api/auth/`
- **`POST /api/auth/register`**: Registers a new cashier. Requires `name`, `email`, `password`, and `role`. Returns `201 Created`.
- **`POST /api/auth/login`**: Authenticates user credentials. Returns JWT token cookie `token` (secure, httpOnly, sameSite: lax) and user details.
- **`GET /api/auth/me`**: Reads the `token` cookie and verifies user details. Returns `200 OK` with user payload or `401 Unauthorized`.

### Products `/api/products/`
- **`GET /api/products`**: Returns list of products.
  - *Query parameters*: `category` (Filter category), `search` (Search by title), `lowStock` (Threshold integer for inventory alert).
- **`POST /api/products`**: Creates a product. Requires `title`, `price`, `stock`. Optional: `description`, `category`, `image`.
- **`PUT /api/products`**: Updates details of an existing product. Requires `id`.
- **`DELETE /api/products?id=<id>`**: Permanent deletion of product. Returns `409 Conflict` if product has sales history records.

### Sales `/api/sales/`
- **`GET /api/sales`**: Returns list of sales.
  - *Query parameters*: `cashierId`, `startDate`, `endDate`, `paymentType`, `includeDetails` (Set to `true` to return joined records showing cashier and product items details).
- **`POST /api/sales`**: Generates a sale record. Uses transactions. Deducts items from `products.stock` dynamically. Returns `201 Created` with formatted sale receipt parameters.
- **`DELETE /api/sales?id=<id>&restoreStock=<boolean>`**: Deletes sales record. If `restoreStock=true`, adds item quantities back to product stock logs.

### Users `/api/users/`
- **`GET /api/users`**: List all users. Optional filters: `role`, `search`.
- **`PUT /api/users`**: Updates user fields (name, email, role, password, points). Requires `id`.
- **`DELETE /api/users?id=<id>`**: Permanently deletes user. Prevents deleting the last system administrator or cashiers with registered sales history.

### Vouchers `/api/vouchers/`
- **`GET /api/vouchers`**: Returns list of discount codes. Optional filters: `active` (true/false), `type`, `code`.
- **`POST /api/vouchers`**: Creates a voucher code. Supports type `percentage` (max 100%) or `fixed` discount value.
- **`PUT /api/vouchers`**: Updates discount code values. Requires `id`.
- **`DELETE /api/vouchers?id=<id>`**: Deletes voucher unless it has already been used in historical transactions (throws `409 Conflict` in that scenario).

---

## Installation & Developer Setup Guide

Follow these steps to run the TawBayin Badminton POS locally.

### Prerequisites
- Node.js (v18.x or above recommended)
- MySQL Server (v8.x or above)

### 1. Database Configuration
Start your local MySQL database server and execute the SQL script in the [Database Schema (MySQL)](#database-schema-mysql) section above.

### 2. Environment Variables Configuration
Create a `.env.local` file in the project root directory and define the following variables:

```ini
# Database configuration settings
DB_HOST=localhost
DB_USER=root
DB_PASS=your_mysql_password
DB_NAME=badminton_pos
DB_PORT=3306

# Secret key used for JWT signing (minimum 32 characters)
JWT_SECRET=your_jwt_signing_secret_here

# NextAuth configuration settings
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_here

# Runtime environment
NODE_ENV=development
```

### 3. Install Dependencies
Navigate to the root directory and run:
```bash
npm install
```

### 4. Running the Development Server
Execute the command below to start the dev compiler:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) on your local browser to log in or create a user dashboard account.

### 5. Build for Production
To build the application for deployment or verify build stability, run:
```bash
npm run build
```
Once build succeeds, run the server with:
```bash
npm run start
```

---

## 8. AI Retrieval-Augmented Multi-Agent Framework Architecture (For Academic Research)

This section maps the badminton POS application architecture directly to your research topic: *"Design and Evaluation of a Retrieval-Augmented Multi-Agent AI Customer Support Framework for Retail Point-of-Sale Systems"*.

```
   ┌──────────────────────────────────────────────────────────┐
   │                  React Client Frontend                   │
   │    (Header, Cart, Checkout, Dashboard, N8nChatBot)      │
   └────────────────────────────┬─────────────────────────────┘
                                │ Webhook Request / API Poll
                                ▼
   ┌──────────────────────────────────────────────────────────┐
   │          n8n Multi-Agent AI Orchestration Layer           │
   │     (Retrieves POS context, orchestrates task agents)    │
   └──────┬─────────────────────┬──────────────────────┬──────┘
          │ Query Catalog        │ Query Points         │ Check Sales
          ▼                      ▼                      ▼
   ┌──────────────┐       ┌──────────────┐       ┌──────────────┐
   │  Products    │       │  Users       │       │  Sales       │
   │  API Endpoint│       │  API Endpoint│       │  API Endpoint│
   └──────┬───────┘       └──────┬───────┘       └──────┬───────┘
          │                      │                      │
          ▼                      ▼                      ▼
   ┌──────────────────────────────────────────────────────────┐
   │            Relational Database Storage Layer             │
   │             (MySQL / TiDB Connection Pool)               │
   └──────────────────────────────────────────────────────────┘
```

### Key Framework Components

#### A. Client-Side Chat Agent Mounting (`N8nChatBot.js`)
- **Session-Aware Parameter Initialization**: Rather than exposing static chatbot interfaces, the component fetches active user session context (`name`, `email`, `role`, `points`) dynamically on mount and injects them as custom payload metadata.
- **Fast Refresh DOM Cleanup**: Ensures script elements and event listeners are properly disposed of on React unmount to prevent container duplication or blank widget anomalies during dynamic state changes.
- **Theme Variables Synchronization**: Injects CSS variables directly targeting n8n elements (`--chat-client-primary-color`, background tokens) matching the app's active light/dark state.

#### B. Retrieval-Augmented Generation (RAG) Data Flow
1. **User Prompt Submission**: The cashier or client inputs a natural language inquiry (e.g., *"Do we have carbonex racket rackets in stock?"*).
2. **Context Retrieval**: The n8n Multi-Agent orchestrator processes the input, identifies intent, and queries the respective POS REST endpoints (such as `GET /api/products?search=carbonex`).
3. **Augmentation**: The raw JSON database query response (e.g. category, stock balance, price) is formatted and injected into the LLM context.
4. **Natural Language Generation**: The agent responds with precise, real-time context (e.g., *"Yes, we have 4 Carbonex rackets in stock, priced at ฿1,200 each. Category: Badminton Rackets"*).

#### C. Multi-Agent System Roles & Delegation
In a retail environment, support requests vary between operations:
- **Cashier Assist Agent**: Focuses on operational queries like product lookups, point balance redemptions, and voucher validity checks.
- **Customer Help Agent**: Focuses on product specs, category catalog filters, and membership registration questions.
- **Supervisor Agent (Orchestration Node)**: Classifies the incoming prompt, delegates it to the specialized sub-agent, compiles their retrievals, and verifies output accuracy.

### Framework Evaluation Metrics for POS AI

To evaluate this prototype in your research paper, consider measuring the following benchmarks:
1. **Intent Classification Accuracy**: The percentage of user queries correctly routed to the correct agent (e.g. user details vs product catalog).
2. **Retrieval Latency**: Time elapsed from query submission to retrieval of SQL parameters (target: < 2.5s).
3. **Response Safety & Truthfulness (Hallucination Control)**: The rate at which responses match the exact inventory records stored in the database.
4. **Redemption Task Completion Rate**: Success rate of multi-step cashier assistance tasks (e.g., checking user points and confirming point eligibility).

