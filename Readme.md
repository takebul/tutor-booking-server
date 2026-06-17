<div align="center">

# 🎓 TutorBook — Server

### REST API backend for the TutorBook tutor-booking platform

Built with Express.js and MongoDB, powering tutor search, booking, and session management.

<br />

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.2-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.2-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/License-ISC-yellow?style=for-the-badge)](LICENSE)

<br />

**[🌐 Live API](https://tutor-booking-server-xi.vercel.app)** &nbsp;·&nbsp;
**[🖥️ Client Repo](https://github.com/takebul/tutor-booking-client)** &nbsp;·&nbsp;
**[🐛 Report Bug](https://github.com/takebul/tutor-booking-server/issues)**

</div>

---

## 📋 Table of Contents

- [About the Project](#-about-the-project)
- [Tech Stack](#-tech-stack)
- [Authentication](#-authentication)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Endpoints](#-api-endpoints)
- [Database Schema](#-database-schema)
- [Author](#-author)
- [License](#-license)

---

## 🚀 About the Project

This is the **backend REST API** for [TutorBook](https://tutor-booking-client.vercel.app) — an online tutor booking platform. It handles all data operations including tutor listings, search & filtering, session bookings, and booking management, backed by MongoDB.

> 🔗 Live API base URL: **[tutor-booking-server-xi.vercel.app](https://tutor-booking-server-xi.vercel.app)**
> 🔗 Frontend client repository: **[tutor-booking-client](https://github.com/takebul/tutor-booking-client)**

### Responsibilities

- Serve tutor data with search and date-range filtering
- Handle tutor CRUD operations (create, read, update, delete)
- Manage session bookings and slot availability
- Handle booked session creation and cancellation
- Verify incoming requests using JWKS-based token verification
- Enable CORS for the Next.js frontend client

---

## 🔐 Authentication

This server does **not** issue its own tokens. Instead, it verifies tokens issued by the **BetterAuth** instance running on the Next.js client, using the [`jose-cjs`](https://www.npmjs.com/package/jose-cjs) library:

1. The client signs the user in via BetterAuth and attaches the session token to each API request as a Bearer token
2. The server fetches the client's public JWKS keys from `${CLIENT_URL}/api/auth/jwks`
3. Every protected route runs through the `verifyToken` middleware, which validates the token signature against those keys
4. Requests with a missing or invalid token receive a `401 Unauthorized` or `403 Forbidden` response

This approach means the server stays **stateless** — it never stores sessions itself, it simply trusts tokens signed by the client's auth provider.

---

## 🛠️ Tech Stack

| Category                    | Technology                                                                      |
| --------------------------- | ------------------------------------------------------------------------------- |
| **Runtime**                 | [Node.js](https://nodejs.org/) `v18+`                                           |
| **Framework**               | [Express.js v5](https://expressjs.com/)                                         |
| **Database**                | [MongoDB v7](https://www.mongodb.com/) (native driver)                          |
| **CORS**                    | [cors](https://www.npmjs.com/package/cors)                                      |
| **Environment Config**      | [dotenv](https://www.npmjs.com/package/dotenv)                                  |
| **JWT / Auth Verification** | [jose-cjs](https://www.npmjs.com/package/jose-cjs)                              |
| **Dev Tooling**             | [nodemon](https://www.npmjs.com/package/nodemon) — auto-restart on file changes |
| **Module System**           | CommonJS                                                                        |

---

## 📁 Project Structure

```
tutor-booking-server/
├── index.js          # Single entry point — server setup, DB connection,
│                      # JWT verification middleware, and all API routes
├── .env               # Environment variables (not committed)
├── .gitignore
├── package.json
├── vercel.json         # Vercel serverless deployment config
└── README.md
```

> This server is intentionally kept as a single `index.js` file for simplicity — all routes, middleware, and the MongoDB connection live in one place.

---

## 🏁 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) `v18+`
- [npm](https://www.npmjs.com/) `v9+`
- A [MongoDB Atlas](https://www.mongodb.com/atlas) cluster (or local MongoDB instance)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/takebul/tutor-booking-server.git

# 2. Move into the project folder
cd tutor-booking-server

# 3. Install dependencies
npm install

# 4. Create your .env file
touch .env
# Fill in the variables (see below)

# 5. Start the development server (auto-restarts on file changes)
npm run dev
```

The server will run on `http://localhost:8541` by default (or your configured `PORT`).

### Available Scripts

| Script        | Description                                             |
| ------------- | ------------------------------------------------------- |
| `npm run dev` | Start the server with nodemon (auto-restart on changes) |
| `npm start`   | Start the server in production mode                     |

---

## 🔑 Environment Variables

Create a `.env` file in the root directory and add the following:

```env
# ── Server Config ────────────────────────────
PORT=8541

# ── MongoDB ──────────────────────────────────
MONGODB_URI=your_mongodb_connection_string

# ── Auth (BetterAuth JWKS verification) ──────
CLIENT_URL=http://localhost:3000
```

> ⚠️ Never commit your `.env` file. Make sure it is listed in `.gitignore`.
>
> 📝 `CLIENT_URL` must point to your Next.js client (e.g. `http://localhost:3000` locally, or your deployed client URL in production) — the server fetches the JWKS public keys from `${CLIENT_URL}/api/auth/jwks` to verify incoming auth tokens issued by BetterAuth.

---

## 🔌 API Endpoints

> Base URL: `https://tutor-booking-server-xi.vercel.app`
>
> 🔒 = requires a valid `Authorization: Bearer <token>` header (verified against the client's BetterAuth JWKS endpoint)

### Tutors

| Method  | Endpoint          | Auth | Description                                                                                                                |
| ------- | ----------------- | ---- | -------------------------------------------------------------------------------------------------------------------------- |
| `GET`   | `/tutorsFeatures` | ❌   | Get 6 featured tutors for the homepage                                                                                     |
| `GET`   | `/tutors`         | ❌   | Get all tutors — supports `?search`, `?startDate`, `?endDate` query params, sorted by newest first                         |
| `GET`   | `/tutors/:id`     | 🔒   | Get a single tutor by ID                                                                                                   |
| `POST`  | `/tutors`         | 🔒   | Create a new tutor listing                                                                                                 |
| `PATCH` | `/tutors/:id`     | 🔒   | Book a session — validates remaining slots and session date, then decrements `remainingSlots` and creates a booking record |

### My Tutors (listings owned by the logged-in user)

| Method   | Endpoint             | Auth | Description                               |
| -------- | -------------------- | ---- | ----------------------------------------- |
| `GET`    | `/myTutors/:tutorId` | 🔒   | Get all tutors created by a specific user |
| `GET`    | `/myTutor/:id`       | 🔒   | Get a single tutor (for the edit form)    |
| `PATCH`  | `/myTutor/:id`       | 🔒   | Update an existing tutor's details        |
| `DELETE` | `/myTutor/:id`       | 🔒   | Delete a tutor permanently                |

### Booked Sessions

| Method  | Endpoint               | Auth | Description                                              |
| ------- | ---------------------- | ---- | -------------------------------------------------------- |
| `GET`   | `/tutorBookedData`     | 🔒   | Get all booked sessions, sorted by newest first          |
| `PATCH` | `/tutorBookedData/:id` | 🔒   | Cancel a booked session — sets `status` to `"Cancelled"` |

### Booking Business Rules

The `PATCH /tutors/:id` endpoint enforces the following before confirming a booking:

1. ❌ Returns `404` if the tutor does not exist
2. ❌ Returns `400` if `remainingSlots` is `0` or less ("fully booked")
3. ❌ Returns `400` if the current date is before the tutor's `sessionStartDate` ("not available yet")
4. ✅ On success: decrements `remainingSlots` by 1, stamps `lastEnrolledAt`, and inserts a new document into `myTutorData` with `status: "pending"`

---

## 🗄️ Database Schema

**Database name:** `TutorBooking`

### `tutorData` Collection

Stores every tutor listing created on the platform.

```json
{
  "_id": "ObjectId",
  "tutorName": "string",
  "tutorImage": "string (URL)",
  "subjectCategory": "string",
  "institution": "string",
  "experience": "string",
  "location": "string",
  "mode": "Online | Offline | Both",
  "availableTimeSlot": "string",
  "hourlyFee": "number",
  "remainingSlots": "number",
  "sessionStartDate": "string (date)",
  "tutorId": "string  — user ID of the person who added this tutor",
  "lastEnrolledAt": "Date  — set automatically on the most recent booking"
}
```

### `myTutorData` Collection

Stores every booking made against a tutor.

```json
{
  "_id": "ObjectId",
  "tutorId": "string",
  "tutorName": "string",
  "studentName": "string",
  "phone": "string",
  "email": "string",
  "status": "pending | Cancelled",
  "enrolledAt": "Date"
}
```

---

## 👨‍💻 Author

<div align="center">

**Takebul Islam**

[![Portfolio](https://img.shields.io/badge/Portfolio-Visit-blue?style=for-the-badge&logo=google-chrome&logoColor=white)](https://yourportfolio.com)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://linkedin.com/in/yourname)
[![GitHub](https://img.shields.io/badge/GitHub-Follow-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/takebul)
[![Email](https://img.shields.io/badge/Email-Contact-D14836?style=for-the-badge&logo=gmail&logoColor=white)](mailto:takebulislam@gmail.com)

</div>

---

## 🤝 Contributing

Contributions, issues and feature requests are welcome!

1. **Fork** the repository
2. Create your feature branch — `git checkout -b feature/AmazingFeature`
3. Commit your changes — `git commit -m 'Add AmazingFeature'`
4. Push to the branch — `git push origin feature/AmazingFeature`
5. Open a **Pull Request**

---

## 📄 License

This project is licensed under the **ISC License**.

---

<div align="center">

Made with ❤️ by **[Takebul Islam](mailto:takebulislam@gmail.com)**

⭐ **If you found this project helpful, please give it a star!**

[![GitHub stars](https://img.shields.io/github/stars/takebul/tutor-booking-server?style=social)](https://github.com/takebul/tutor-booking-server)

</div>
