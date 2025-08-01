# Digital Wallet Management System API Documentation

**Base URL:** `https://digital-wallet-management-system-delta.vercel.app/api/v1`

A secure, role-based digital wallet API built with **Express.js (TypeScript)** and **MongoDB (Mongoose)**. The system supports three roles: **Users**, **Agents**, and **Admins**. Users can manage their wallets (top-up, send, withdraw), agents can perform cash-in/out transactions (with commission), and admins have full control over users, agents, wallets, and transaction records. The API enables features like user registration/login, wallet management, transaction history, agent verification, and account blocking. All endpoints enforce authentication (JWT) and role-based authorization.

## ⚡ Technologies Used

- **Node.js & Express.js (TypeScript):** Backend framework for building RESTful APIs.
- **MongoDB (Mongoose):** NoSQL database for storing users, wallets, transactions.
- **Authentication:** JSON Web Tokens (JWT) for stateless auth; passwords hashed with **bcrypt**.
- **Validation:** **express-validator** to check request payloads.
- **Email & Media:** **Nodemailer** for sending emails (e.g. password reset links); **Cloudinary** for optional media (image) storage.
- **Configuration:** **dotenv** for environment variables.
- **Admin Credentials:** Environment-configured admin account (email/phone/password) for initial setup.

# Admin Credentials(For Testing)

```code
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=supersecurepassword
```

# User Credentials( Active For Testing)

```code
USER_EMAIL=yaxelop525@devdigs.com
ADMIN_PASSWORD=StrongP@ssw0rd
```

# Agent Credentials( Active For Testing)

```code
USER_EMAIL=caditir829@coursora.com
ADMIN_PASSWORD=StrongP@ssw0rd
```

## 🔒 Authentication

### Register User/Agent

`POST /api/v1/auth/register`

_Request Body (form data):_

```json
{
  "name": "Jaheda Sultana",
  "email": "jahida@example.com",
  "phone": "01712345678",
  "password": "secret123",
  "identifier": "NID", 
  "identifier_image": "", 
  "profile_picture": "", 
  "role": "USER" 
}
```

- Creates a new **User** or **Agent** account. Agents are marked **pending** until approved by an admin.

### Login

`POST /api/v1/auth/login`

_Request Body (JSON):_

```json
{
  "email": "jane@example.com",
  "password": "strongPassword"
}
```

_Response (JSON):_

```json
{
  "accessToken": "<JWT access token>",
  "refreshToken": "<JWT refresh token>"
}
```

- Validates credentials and returns an **access token** (short-lived) and **refresh token** (long-lived) for authenticated requests.
- Automatically set into the cookies. No need to set manual Authorization Headers.

### Refresh Token

`POST /api/v1/auth/refresh-token`

- Accepts a valid refresh token (from cookies or request body).
- Returns a new access token and refresh token for continued authentication.
- Use this endpoint to maintain user sessions without requiring re-login.
- Requires the refresh token to be valid and not expired.
- No body required.

_Request.cookies (JSON):_

```json
{
  "refreshToken": "<JWT refresh token>"
}
```

_Response (JSON):_

```json
{
  "accessToken": "<new JWT access token>",
  "refreshToken": "<new JWT refresh token>"
}
```

### Logout

`POST /api/v1/auth/logout`

- Invalidates the user's refresh token and clears authentication cookies, effectively logging the user out.
- Requires a valid refresh token in the request cookies or body.
- Recommended for secure session termination.

### (Optional) Forgot/Reset Password

`POST /api/v1/auth/forgot-password`

- **Forgot Password:** Agents or users who forget their password can use `POST /api/v1/auth/forgot-password` with their email to receive a reset link via email.
  _Request Body (JSON):_

```json
{
  "email": "yaxelop525@devdigs.com"
}
```

_Response (JSON):_

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Email Sent Successfully",
  "data": null
}
```

- **Reset Password:** A separate endpoint (e.g. `POST /api/v1/auth/reset-password`) would accept a token and new password. (Implementation depends on front-end flow and is supported by the `sendEmail` utility.)
  _Request Body (JSON):_

```json
{
  "newPassword": "StrongP@ssw0rd"
}
```

_Response (JSON):_

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Password Changed Successfully",
  "data": null
}
```

## 🔑 Middleware

- `checkAuth(...roles)`: Verifies JWT and enforces that the authenticated user’s role matches one of the allowed roles.
- `isAuthenticated`: Checks for a valid JWT in the request (for any logged-in user).

These middleware functions protect all routes so that only properly authenticated users (and/or specific roles) can access them.

## 👥 User & Agent Management (Admin Only)

All of the following endpoints require an **admin** role.

- **Get All Users & Agents:**
  `GET /api/v1/user`

  - Returns a list of all user and agent accounts (excluding sensitive fields like passwords).

- **Approve Agent or User:**
  `PATCH /api/v1/user/:id/approve`

  - Marks an agent or user as **verified/approved** (depending on role).
  - Use this to activate pending agents or verify new user accounts.

- **Suspend Agent or User:**
  `PATCH /api/v1/user/:id/suspend`

  - Suspends an agent or user (sets status to suspended, preventing login or transactions).

- **Block/Unblock Wallet:**
  `PATCH /api/v1/user/:id/block` – Block user’s wallet (freeze transactions).
  `PATCH /api/v1/user/:id/unblock` – Unblock user’s wallet (re-enable transactions).

These actions allow the admin to control who can transact. For example, blocking an account disables its wallet entirely.

## 💰 Wallet API

Authenticated **Users** (and agents, where applicable) can manage their wallets. Admins can list all wallets.

- **Get Own Wallet:**
  `GET /api/v1/wallet/me`

  - Returns the authenticated user’s wallet details (balance, status, etc.).

- **Top-up Wallet:**
  `PATCH /api/v1/wallet/top-up`
  _Body_: `{ "amount": 500 }`

  - Adds the specified amount to the user’s wallet balance. (E.g. a user deposits money into their account.)

- **Withdraw from Wallet:**
  `PATCH /api/v1/wallet/withdraw`
  _Body_: `{ "amount": 200 }`

  - Subtracts the specified amount from the wallet (if sufficient balance). This could represent transferring money to a bank or external account.

- **Send Money:**
  `PATCH /api/v1/wallet/send`
  _Body_:

  ```json
  {
    "receiverPhone": "01812345678",
    "amount": 100
  }
  ```

  - Transfers the specified amount from the sender’s wallet to another user’s wallet (identified by phone number).

- **Admin: Get All Wallets:**
  `GET /api/v1/wallet`

  - Admin endpoint that returns all wallets in the system. Useful for monitoring and audits.

## 💳 Transaction API

This tracks all wallet transactions. Roles:

- **User/Agent (self) Transaction History:**
  `GET /api/v1/transaction/me`

  - Returns all transactions (cash-in, cash-out, sends, etc.) related to the authenticated user or agent. Agents see transactions they facilitated; users see their own history.

- **Admin: Get All Transactions:**
  `GET /api/v1/transaction`

  - Returns every transaction in the system (across all users and agents).

- **Cash-in (Agent):**
  `POST /api/v1/transaction/cash-in`
  _Body_:

  ```json
  {
    "userPhone": "01712345678",
    "amount": 300
  }
  ```

  - Agent deposits cash into a user’s wallet. The agent’s own wallet balance **decreases** (by amount + commission), and the user’s balance increases by the amount. A small commission is deducted.

- **Cash-out (Agent):**
  `POST /api/v1/transaction/cash-out`
  _Body_:

  ```json
  {
    "userPhone": "01712345678",
    "amount": 200
  }
  ```

  - Agent withdraws cash from a user’s wallet. The user’s balance decreases by the amount, and the agent’s balance increases by (amount – commission).

## ✉️ Validations & Rules

- **Blocked Accounts:** No operations (top-up, send, withdraw, cash-in/out) can be performed if the user’s wallet is **blocked**.
- **Sufficient Funds:** You cannot withdraw or send more than the current balance.
- **Positive Amounts:** Zero or negative transaction amounts are not allowed (must be positive).
- **Agent Commission:** Every cash-in/out transaction by an agent applies a commission (e.g. a percentage fee). The commission is deducted appropriately.

## 📊 Test Cases

| Endpoint                | Method |    Role    | Expected Status | Description                        |
| ----------------------- | :----: | :--------: | :-------------: | ---------------------------------- |
| `/auth/register`        |  POST  |     –      |       201       | Register a new user or agent       |
| `/auth/login`           |  POST  |     –      |       200       | Login and return JWT tokens        |
| `/auth/forgot-password` |  POST  |     –      |       200       | Send password reset email          |
| `/wallet/me`            |  GET   |    user    |       200       | View own wallet details            |
| `/wallet/top-up`        | PATCH  |    user    |       200       | Add funds to own wallet            |
| `/wallet/withdraw`      | PATCH  |    user    |       200       | Withdraw funds from own wallet     |
| `/wallet/send`          | PATCH  |    user    |       200       | Send funds to another user         |
| `/wallet`               |  GET   |   admin    |       200       | List all wallets (admin only)      |
| `/user`                 |  GET   |   admin    |       200       | List all users and agents          |
| `/user/:id/block`       | PATCH  |   admin    |       200       | Block a user’s wallet              |
| `/user/:id/unblock`     | PATCH  |   admin    |       200       | Unblock a user’s wallet            |
| `/user/:id/approve`     | PATCH  |   admin    |       200       | Approve a pending agent or user    |
| `/user/:id/suspend`     | PATCH  |   admin    |       200       | Suspend an agent or user           |
| `/transaction/me`       |  GET   | user/agent |       200       | View own transaction history       |
| `/transaction`          |  GET   |   admin    |       200       | List all transactions (admin only) |
| `/transaction/cash-in`  |  POST  |   agent    |       200       | Agent deposits cash into user      |
| `/transaction/cash-out` |  POST  |   agent    |       200       | Agent withdraws cash for user      |

Each test case assumes valid authentication (JWT) and, where applicable, the correct role. For example, only admins can call `/users` or `/wallets` (all users), and only agents can call `/transaction/cash-in` or `/cash-out`.

## 📄 Environment Variables

Create a `.env` file (or use `.env.example`) with the following keys. Replace placeholder values as needed:

```
PORT=5000
DB_URL=<your-mongodb-connection-string>
NODE_ENV=development

# Optional: Frontend URL (for CORS or email links)
FRONTEND_URL=http://localhost:3000

# Cloudinary (if used for media uploads)
CLOUDINARY_CLOUD_NAME=<your-cloudinary-cloud-name>
CLOUDINARY_API_KEY=<your-cloudinary-api-key>
CLOUDINARY_API_SECRET=<your-cloudinary-api-secret>

# JWT Settings
JWT_ACCESS_SECRET=<your-jwt-access-token-secret>
JWT_REFRESH_SECRET=<your-jwt-refresh-token-secret>
JWT_ACCESS_EXPIRES=1d
JWT_REFRESH_EXPIRES=30d

# Bcrypt (password hashing)
BCRYPT_SALT_ROUND=10

# Admin Credentials (example)
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=supersecurepassword
ADMIN_PHONE=01800000000

# Email (SMTP) Configuration for sending emails
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASS=your-email-password-or-app-password
SMTP_FROM=your-email@example.com
```

These settings configure the server port, database connection, authentication secrets, and email/Cloudinary services.

## 📂 Folder Structure

```
sarwarhridoy4-digital_wallet_management_system/
    ├── README.md
    ├── Digital Wallet Management.postman_collection.json
    ├── eslint.config.mjs
    ├── package.json
    ├── Project_plan.md
    ├── tsconfig.json
    ├── vercel.json
    ├── .env.example
    └── src/
        ├── app.ts
        ├── constants.ts
        ├── server.ts
        └── app/
            ├── config/
            │   ├── cloudinary.config.ts
            │   ├── db.ts
            │   ├── env.ts
            │   └── multer.config.ts
            ├── errorHelpers/
            │   └── AppError.ts
            ├── helpers/
            │   ├── handleCastError.ts
            │   ├── handleDuplicateError.ts
            │   ├── handlerValidationError.ts
            │   └── handlerZodError.ts
            ├── interfaces/
            │   ├── error.types.ts
            │   └── index.d.ts
            ├── middlewares/
            │   ├── authCheck.ts
            │   ├── globalErrorHandler.ts
            │   ├── notFound.ts
            │   └── validateRequest.ts
            ├── modules/
            │   ├── auth/
            │   │   ├── auth.controller.ts
            │   │   ├── auth.routes.ts
            │   │   └── auth.service.ts
            │   ├── transaction/
            │   │   ├── transaction.constant.ts
            │   │   ├── transaction.controller.ts
            │   │   ├── transaction.interface.ts
            │   │   ├── transaction.model.ts
            │   │   ├── transaction.routes.ts
            │   │   ├── transaction.service.ts
            │   │   └── transaction.validation.ts
            │   ├── user/
            │   │   ├── user.constant.ts
            │   │   ├── user.controller.ts
            │   │   ├── user.interface.ts
            │   │   ├── user.model.ts
            │   │   ├── user.routes.ts
            │   │   ├── user.service.ts
            │   │   └── user.validation.ts
            │   └── wallet/
            │       ├── wallet.constant.ts
            │       ├── wallet.controller.ts
            │       ├── wallet.interface.ts
            │       ├── wallet.model.ts
            │       ├── wallet.routes.ts
            │       └── wallet.service.ts
            ├── routes/
            │   └── index.ts
            ├── types/
            │   └── index.ts
            └── utils/
                ├── catchAsync.ts
                ├── jwt.ts
                ├── QueryBuilders.ts
                ├── seedAdmin.ts
                ├── sendMail.ts
                ├── sendResponse.ts
                ├── setCookie.ts
                ├── userToken.ts
                └── templates/
                    └── forgotPassword.ejs

This modular layout separates each feature (auth, user, wallet, transaction) into its own directory.

## 🎥 **Demo Video Outline – Digital Wallet API (Total: \~40 min)**

### 1. **🎬 Introduction (1 min)**

- Briefly introduce the project
- Technologies used (Express.js, MongoDB, TypeScript, etc.)
- Purpose and key features of the system

### 2. **📁 Folder Structure Overview (3 min)**

- Show the overall file and folder layout
- Explain the `modules/`, `middlewares/`, `utils/`, and `config/` folders
- Highlight separation of concerns and scalability approach

### 3. **🔐 Authentication Flow (4 min)**

- Walk through user registration and login
- Explain JWT token generation and middleware for route protection
- Role-based access control (User, Agent, Admin)

### 4. **👤 User Features (5 min)**

- View profile and update basic info
- Wallet balance view and transaction history
- Send money (if implemented)

### 5. **🧑‍💼 Agent Features (5 min)**

- Perform **Cash-In** to user
- Perform **Cash-Out** from user
- View own transaction history

### 6. **🛠️ Admin Features (5 min)**

- View all users, agents, and wallets
- Approve/reject KYC documents
- Block/unblock users or agents
- View/filter all transactions

### 7. **🧪 Postman Live Test Run (15 min)**

- Hit all major API endpoints (User, Agent, Admin)
- Demonstrate request/response and error handling
- Show JWT protected route handling
- Include edge case tests (invalid token, unauthorized access, etc.)

### 8. **📦 Optional: Deployment Highlights (1–2 min)**

- Show live deployment (Vercel, Render, etc.)
- MongoDB Atlas and environment setup tips (optional)

### 9. **✅ Wrap-Up (1 min)**

- Recap major features demonstrated
- Share any limitations or upcoming features
- Thank the viewer and invite feedback

* Postman collection given
* Import it into your postman to test

**Project Brief**: https://drive.google.com/drive/folders/10CFDoUGXCilPGk2QSthCdndW2tjztmpS?usp=sharing

**Live Deployed**: https://digital-wallet-management-system-kappa.vercel.app
