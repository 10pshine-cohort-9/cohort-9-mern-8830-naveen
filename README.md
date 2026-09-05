# Notes App

A full-stack notes-taking application with user authentication, email-based password reset, a rich-text note editor, categories, favourites, archiving, and a trash/soft-delete flow.

Built as a **Cohort 9 MERN assignment**.

**Backend:** Node.js · Express · Sequelize · MySQL
**Frontend:** React · React Router · Tailwind CSS · Tiptap

---

## Features

### Authentication

* User signup and login
* Logout
* JWT authentication using an `httpOnly` cookie
* Forgot-password email flow
* Password reset using an emailed token
* Change password
* Update profile
* Delete account

### Notes

* Create, read, and update notes
* Soft-delete notes to trash
* Favourite notes
* Archive notes
* Search notes by title/content
* Filter notes by:

  * Category
  * Favourite status
  * Archived status
  * Trash status

### Categories

* Users can maintain a personal list of categories
* Categories are stored as part of the user profile
* A standalone Category model/controller is also implemented

### Rich Text Editor

Powered by **Tiptap**, supporting:

* Bold
* Italic
* Underline
* Strike
* Code
* Bullet lists
* Ordered lists
* Blockquotes
* Links
* Inline images

### Security

* JWT stored in an `httpOnly` cookie
* Password hashing with `bcryptjs`
* Per-IP rate limiting on authentication endpoints
* Centralized error handling
* Unexpected errors do not expose internal details
* HTTPS enforced for the frontend in production

### Testing

* Backend tests with **Mocha, Chai, Sinon, Supertest, and NYC**
* Frontend tests with **Jest and React Testing Library**
* Backend tests use an in-memory SQLite database
* Automated test coverage reports

---

## Tech Stack

### Backend

* **Node.js**
* **Express 4**
* **Sequelize ORM**
* **MySQL**
* **SQLite** — in-memory database for tests
* **JWT** — authentication
* **bcryptjs** — password hashing
* **Nodemailer** — password-reset emails
* **Pino / pino-http** — structured logging
* **Mocha**
* **Chai**
* **Sinon**
* **Supertest**
* **NYC / Istanbul** — test coverage

### Frontend

* **React 19**
* **Create React App**
* **React Router v7**
* **Axios**
* **Tailwind CSS**
* **Tiptap**
* **lucide-react**
* **Jest**
* **React Testing Library**

---

## Getting Started

### Prerequisites

Make sure you have the following installed:

* **Node.js 18+**
* **npm**
* **MySQL**

You will need a MySQL database for running the backend outside the test suite.

---

## Installation

Clone the repository:

```bash
git clone <your-repository-url>
cd cohort-9-mern-8830-naveen
```

---

## Backend Setup

Navigate to the backend:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Create your environment file:

```bash
cp .env.example .env
```

Update `.env` with your database and SMTP credentials.

Start the development server:

```bash
npm run dev
```

The backend runs by default at:

```text
http://localhost:5000
```

The backend expects a MySQL database matching `DB_NAME` in your `.env` to already exist. Sequelize will create/synchronize the tables when the server starts.

---

## Frontend Setup


Go to the project root:
```bash
cd ..
```

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the React development server:

```bash
npm start
```

The frontend runs by default at:

```text
http://localhost:3000
```

By default, the frontend communicates with:

```text
http://localhost:5000/api
```

You can override this using `REACT_APP_API_URL`.

---

# Environment Variables

## Backend

Create:

```text
backend/.env
```

| Variable         | Description                              | Example                 |
| ---------------- | ---------------------------------------- | ----------------------- |
| `PORT`           | Port the Express server listens on       | `5000`                  |
| `NODE_ENV`       | Application environment                  | `development`           |
| `DB_HOST`        | MySQL host                               | `localhost`             |
| `DB_PORT`        | MySQL port                               | `3306`                  |
| `DB_USER`        | MySQL username                           | `root`                  |
| `DB_PASSWORD`    | MySQL password                           | `your_password`         |
| `DB_NAME`        | MySQL database name                      | `notes_app`             |
| `JWT_SECRET`     | Secret used to sign JWTs                 | `set-your-own-secret`   |
| `JWT_EXPIRES_IN` | JWT expiry                               | `7d`                    |
| `CLIENT_URL`     | Frontend origin for password-reset links | `http://localhost:3000` |
| `SMTP_HOST`      | SMTP server                              | `smtp.gmail.com`        |
| `SMTP_PORT`      | SMTP port                                | `587`                   |
| `SMTP_USER`      | SMTP account username                    | `your_email@gmail.com`  |
| `SMTP_PASSWORD`  | SMTP password/app password               | `set-your-own-password` |
| `SMTP_SECURE`    | Whether implicit TLS is used             | `false`                 |

> **Important:** Never commit your real `.env` file or secrets to GitHub.

When `NODE_ENV=test`, the backend automatically switches Sequelize to an in-memory SQLite database.

---

## Frontend

Create:

```text
frontend/.env
```

| Variable            | Description               | Default                     |
| ------------------- | ------------------------- | --------------------------- |
| `REACT_APP_API_URL` | Base URL for API requests | `http://localhost:5000/api` |

In production, `REACT_APP_API_URL` must use **HTTPS**.

---

# Available Scripts

## Backend

Run these commands from `backend/`:

| Command       | Description                                           |
| ------------- | ----------------------------------------------------- |
| `npm start`   | Starts the server using Node.js                       |
| `npm run dev` | Starts the server with Nodemon                        |
| `npm test`    | Runs the Mocha/Chai/Supertest suite with NYC coverage |

### Example

```bash
cd backend

npm install
npm run dev
```

---

## Frontend

Run these commands from `frontend/`:

| Command         | Description                               |
| --------------- | ----------------------------------------- |
| `npm start`     | Starts the React development server       |
| `npm run build` | Creates an optimized production build     |
| `npm test`      | Runs the Jest/React Testing Library suite |
| `npm run eject` | Ejects the CRA configuration              |

> **Warning:** `npm run eject` is irreversible.

---

# API Reference

API endpoints are mounted under `/api`, except for the health endpoint, which is available at `/health`.

Protected endpoints require a valid `notes_token` cookie or:

```text
Authorization: Bearer <token>
```
---

## Health

| Method | Path      | Description    |
| ------ | --------- | -------------- |
| `GET`  | `/health` | Liveness check |

---

## Authentication — `/api/auth`

| Method   | Path               | Auth                      | Description                                             |
| -------- | ------------------ | ------------------------- | ------------------------------------------------------- |
| `POST`   | `/signup`          | rate limited              | Creates an account and sets the authentication cookie   |
| `POST`   | `/login`           | rate limited              | Authenticates a user and sets the authentication cookie |
| `POST`   | `/logout`          | —                         | Clears the authentication cookie                        |
| `POST`   | `/forgot-password` | rate limited              | Sends a password-reset link if the account exists       |
| `POST`   | `/reset-password`  | rate limited              | Consumes a reset token and sets a new password          |
| `GET`    | `/me`              | Authentication required   | Returns the current user's profile                      |
| `PATCH`  | `/me`              | Authentication required   | Updates profile fields                                  |
| `PATCH`  | `/change-password` | Authentication required   | Changes the password                                    |
| `DELETE` | `/me`              | Authentication required   | Deletes the account and its notes                       |

---

## Notes — `/api/notes`

All note routes require authentication.

| Method   | Path   | Description                               |
| -------- | ------ | ----------------------------------------- |
| `GET`    | `/`    | Lists notes and supports filtering/search |
| `POST`   | `/`    | Creates a note                            |
| `GET`    | `/:id` | Fetches a single note                     |
| `PATCH`  | `/:id` | Updates a note                            |
| `DELETE` | `/:id` | Soft-deletes a note                       |

### Supported Filters

```text
category
favourite
archived
trashed
search
```

---

# Testing & Coverage

Both the backend and frontend maintain automated test suites with coverage targets around **90%+**.

## Backend

```bash
cd backend
npm test
```

The backend tests:

* Use Mocha, Chai, Sinon, and Supertest
* Run under NYC/Istanbul
* Use an in-memory SQLite database
* Create a fresh database state for tests
* Stub outbound email functionality
* Reset the authentication rate limiter between tests

An HTML coverage report is generated at:

```text
backend/coverage/
```

---

## Frontend

```bash
cd frontend
npm test -- --coverage --watchAll=false
```

This runs the complete Jest/React Testing Library suite once and generates a coverage report.

The HTML coverage report is generated at:

```text
frontend/coverage/
```

---

# Architecture Notes

## Authentication Rate Limiting

The authentication rate limiter is an in-memory, per-process, per-IP limiter.

**Current configuration:**

```text
Maximum attempts: 10
Window: 15 minutes
```

It is shared across:

* Signup
* Login
* Forgot password
* Reset password

Because the limiter is stored in process memory, it resets when the server restarts and does not work across multiple server instances.
For a horizontally scaled production deployment, a shared store such as Redis should be used.

### Error Handling

The centralized error handler distinguishes between operational and non-operational errors.

Errors generated through `AppError` are returned with their appropriate client-facing messages.

Unexpected errors are:

1. Logged on the server
2. Hidden from the client
3. Returned as a generic error message

This prevents internal implementation details from being exposed through API responses.

### Frontend Authentication Handling

The Axios client in:

```text
frontend/src/api/client.js
```

handles authentication errors globally.

When a \`401\` response is received, it dispatches a custom \`auth:unauthorized\` event on the \`window\` object:

\`\`\`javascript
window.dispatchEvent(new Event('auth:unauthorized'));
\`\`\`

The \`AuthContext\` listens for this event and logs the user out automatically when the session expires.

The frontend also enforces HTTPS when running in production.

---

# Security

This project includes several security-related measures:

* Passwords are hashed using `bcryptjs`
* JWTs are stored using an `httpOnly` cookie
* Authentication endpoints are rate-limited
* Unexpected server errors do not expose internal details
* Production API configuration requires HTTPS
* Environment variables are used for secrets and credentials

---

# Author

**Naveen Fatima**
**Cohort 9 — MERN Assignment**