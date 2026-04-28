---
title: Patel-And-Co-Knowledge-Center
sdk: docker
emoji: 📚
---
# Patel & Co. Knowledge Center

**Welcome to Patel & Co. Knowledge Center – your trusted destination for managing, accessing, and exploring knowledge with ease.**

Patel & Co. Limited proudly presents a complete digital library service designed for modern learning and efficient knowledge management. It is a smart and efficient platform built to organize, track, and provide knowledge resources in a professional and user-friendly environment.

*Patel & Co. Limited – delivering reliable and intelligent library solutions for institutions, students, and professionals.*

---

### Overview

This project is a full-stack web application for managing the library, built with React.js, Node.js (Express.js), and MongoDB.

## Features

*   **Authentication & Authorization:** JWT-based auth with Role-Based Access Control (RBAC) for Admin, Librarian, and Student/User.
*   **AI Knowledge Center:**
    *   **Book Recommendations:** Smart suggestions based on reading history and preferences.
    *   **Semantic Search:** Advanced text-based search for discovering knowledge resources.
    *   **AI Chat Assistant:** Interactive bot for book queries and platform guidance.
*   **Digital Library:** Integrated PDF viewer for reading books directly within the platform.
*   **Issue & Return System:** Automated circulation workflows with due date tracking and fine calculation.
*   **User Engagement:** Reviews and ratings system for community feedback.
*   **Admin Dashboard:** Comprehensive analytics with charts, book management, and user tracking.
*   **Responsive UI:** Clean, modern, and dark-themed interface built with Next.js/React and Tailwind CSS.

## Tech Stack

*   **Frontend:** React.js, React Router, Axios, React Toastify, (Optional: Tailwind CSS/Material-UI for styling)
*   **Backend:** Node.js, Express.js, Mongoose, JWT, Bcrypt.js, Dotenv, Express-async-handler, CORS, Morgan
*   **Database:** MongoDB

## Project Structure

```
Libary-Management/
├── backend/
│   ├── config/             # Database connection
│   ├── controllers/        # Business logic for routes
│   ├── middleware/         # Auth, error handling
│   ├── models/             # Mongoose schemas
│   ├── routes/             # API endpoints
│   ├── utils/              # Utility functions (e.g., error handler)
│   ├── .env.example        # Environment variables example
│   ├── package.json        # Backend dependencies
│   └── server.js           # Main backend server file
├── frontend/
│   ├── public/             # Public assets
│   ├── src/
│   │   ├── api/            # Axios instance
│   │   ├── components/     # Reusable UI components
│   │   ├── contexts/       # React Context for global state (e.g., Auth)
│   │   ├── hooks/          # Custom React hooks
│   │   ├── pages/          # Page-level components
│   │   ├── App.js          # Main React app, routing
│   │   ├── index.js        # React entry point
│   │   └── styles/         # Global styles
│   ├── .env.example        # Environment variables example
│   ├── package.json        # Frontend dependencies
│   └── README.md           # Frontend specific README
└── README.md               # Overall project README
```

## Setup Instructions

### 1. Clone the repository

```bash
git clone <repository-url>
cd Libary-Management
```

### 2. Backend Setup

Navigate to the `backend` directory:

```bash
cd backend
```

Install dependencies:

```bash
npm install
# or
yarn install
```

Create a `.env` file in the `backend` directory based on `.env.example` and fill in your details:

```
PORT=5000
MONGO_URI=mongodb://localhost:27017/library_management
JWT_SECRET=REPLACE_ME_WITH_A_STRONG_UNIQUE_JWT_SECRET_AT_LEAST_32_CHARS
JWT_EXPIRES_IN=1d
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=REPLACE_ME_WITH_A_STRONG_UNIQUE_PASSWORD
NODE_ENV=development # or production
```

**Note:** Use strong, unique passwords and secrets for `ADMIN_PASSWORD` and `JWT_SECRET`. Do not reuse these defaults in any environment.

Start the backend server:

```bash
npm run dev
# or
yarn dev
```
The backend server should now be running on `http://localhost:5000`.

### 3. Frontend Setup

Open a new terminal and navigate to the `frontend` directory:

```bash
cd ../frontend
```

Install dependencies:

```bash
npm install
# or
yarn install
```

Create a `.env` file in the `frontend` directory based on `.env.example`:

```
VITE_BACKEND_URL=http://localhost:5000/api
```

Start the frontend development server:

```bash
npm run dev
# or
yarn dev
```
The frontend application should now be running on `http://localhost:5173` (or another available port).

## API Endpoints (Sample)

### Authentication

*   `POST /api/auth/register` - Register a new user
*   `POST /api/auth/login` - Login a user
*   `GET /api/auth/profile` - Get user profile (Protected)

### Books

*   `GET /api/books` - Get all books (Public, supports pagination/search)
*   `GET /api/books/:id` - Get a single book by ID (Public)
*   `POST /api/books` - Add a new book (Admin only)
*   `PUT /api/books/:id` - Update a book (Admin only)
*   `DELETE /api/books/:id` - Delete a book (Admin only)

### Transactions

*   `POST /api/transactions/issue` - Issue a book (User only)
*   `PUT /api/transactions/return/:id` - Return an issued book (User only)
*   `GET /api/transactions/my-books` - Get user's issued books (User only)
*   `GET /api/transactions` - Get all transactions (Admin only)

### Users

*   `GET /api/users` - Get all users (Admin only)
*   `GET /api/users/:id` - Get user by ID (Admin only)
*   `PUT /api/users/:id` - Update user details (Admin only)
*   `DELETE /api/users/:id` - Delete a user (Admin only)

## Development Notes

*   **Modern UI:** Consider using a UI framework like Tailwind CSS, Material-UI, or Ant Design for a modern and responsive look.
*   **Validation:** Implement robust input validation on both frontend and backend.
*   **Error Handling:** Centralized error handling on the backend and user-friendly error messages on the frontend.
*   **Loading States:** Show loading indicators for API calls.
*   **Notifications:** Use `react-toastify` or similar for success/error messages.
*   **Pagination & Filtering:** Implement these features in `bookController` and integrate them into the frontend `BookListPage`.
*   **Late Fines:** The `transactionController` has basic fine calculation. This can be made configurable and more robust.
*   **Admin User Creation:** For initial setup, you might manually create an admin user in MongoDB or add a script to create one if `ADMIN_EMAIL` and `ADMIN_PASSWORD` are set in `.env`.

```