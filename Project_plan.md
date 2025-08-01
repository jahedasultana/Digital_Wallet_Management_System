
# ✅ Phase-Wise Plan for Digital Wallet API

### 🚀 Deadline: **July 31, 2025**

- Target Completion **July 30, 2025**
- Buffer 1 day **(July 31)** for documentation, video, and review

---

## 🧩 Phase 1: **System Design & Database Modeling** (July 28–29)

### ✅ Entities Overview

#### 🔸 User

- `name`, `email`, `phone`, `password`, `role` (`user`, `agent`, `admin`), `status`, `createdAt`

#### 🔸 Wallet

- `userId`, `balance`, `isBlocked`, `createdAt`

#### 🔸 Transaction

- `type`: `add`, `withdraw`, `send`, `cash-in`, `cash-out`
- `senderId`, `receiverId`, `amount`, `fee`, `commission`, `status`, `timestamp`, `notes`

#### 🔸 (Optional) Commission

- `agentId`, `transactionId`, `amount`, `createdAt`

---

## 🛠️ Phase 2: **Setup & Config** (July 29 Morning)

### 📦 Initialize Project

- `express`, `mongoose`, `dotenv`, `jsonwebtoken`, `bcrypt`, `express-validator`, `cors`
- `tsconfig.json` if using TypeScript

### 🔧 Basic Setup

- `app.ts` with routes + middleware
- `db.ts` for MongoDB connection
- `.env` file for secrets

---

## 🔐 Phase 3: **Auth & Roles** (July 29 Afternoon)

### 🔸 Register/Login (JWT + bcrypt)

- `POST /api/auth/register` – role: `user` or `agent`
- `POST /api/auth/login`

### 🔒 Middleware

- `authMiddleware` (verify JWT)
- `roleMiddleware("admin")`, etc.

### ✅ On Registration:

- Create wallet automatically (৳50 balance)
- Agents are created in `pending` status unless approved

---

## 👤 Phase 4: **User & Agent Management** (July 29 Night)

### 🧑‍💼 Admin Routes

| Endpoint                 | Method | Description             |
| ------------------------ | ------ | ----------------------- |
| `/api/users`             | GET    | List all users + agents |
| `/api/users/:id/block`   | PATCH  | Block wallet            |
| `/api/users/:id/unblock` | PATCH  | Unblock wallet          |
| `/api/users/:id/approve` | PATCH  | Approve agent           |
| `/api/users/:id/suspend` | PATCH  | Suspend agent           |

---

## 💰 Phase 5: **Wallet Logic** (July 30 Morning)

### 🔁 Operations

| Operation        | Endpoint                | Method | Role       |
| ---------------- | ----------------------- | ------ | ---------- |
| View Wallet      | `/api/wallets/me`       | GET    | User/Agent |
| Add Money        | `/api/wallets/top-up`   | PATCH  | User       |
| Withdraw         | `/api/wallets/withdraw` | PATCH  | User       |
| Send Money       | `/api/wallets/send`     | PATCH  | User       |
| View All Wallets | `/api/wallets`          | GET    | Admin      |

### ✅ Validations

- Cannot operate if wallet is blocked
- Must check sufficient balance
- No negative or 0-value transactions

---

## 🔁 Phase 6: **Transactions** (July 30 Afternoon)

### ✨ Required Fields

- `type`, `amount`, `senderId`, `receiverId`, `status`, `fee`, `commission`, `timestamp`

### 🔄 Routes

| Operation       | Endpoint                     | Method | Role       |
| --------------- | ---------------------------- | ------ | ---------- |
| View My History | `/api/transactions/me`       | GET    | User/Agent |
| View All Txns   | `/api/transactions`          | GET    | Admin      |
| Cash-in         | `/api/transactions/cash-in`  | POST   | Agent      |
| Cash-out        | `/api/transactions/cash-out` | POST   | Agent      |

### 💡 Extra Logic

- Agent commissions calculated & saved
- Admin can filter transactions by user/agent

---

## 🔐 Phase 7: **Role-Based Access Control (RBAC)** (July 30 Evening)

### Middlewares:

- `isAuthenticated`
- `hasRole("admin")`, `hasRole("agent")`, etc.

Enforce on every sensitive route.

---

## 📄 Phase 8: **Documentation & Testing** (July 31)

### ✅ README Contents

- Overview + Features
- How to Run
- Environment Variables
- API Table (routes)
- Technologies used

### 🧪 Postman Collection

- All endpoints with:

  - Headers
  - Body examples
  - Roles tested

---

## 🎥 Final Phase: **Demo Video Recording** (July 31)

### 🔻 Outline (Max 10 mins)

1. **Intro** – Project + your name (30s)
2. **Folder Structure** (1 min)
3. **Auth Flow (JWT)** – Register/login/roles (1 min)
4. **User Features** (1 min)
5. **Agent Features** (1 min)
6. **Admin Features** (1 min)
7. **Postman Test Run** (3-4 mins)
8. **Close & Thank You** (30s)

---

# ✅ Final Checklist

| Item                              | Status |
| --------------------------------- | ------ |
| JWT Auth + bcrypt                 | ⬜     |
| Role Middleware                   | ⬜     |
| User/Agent/Admin + Wallet Schema  | ⬜     |
| Transactions: add, withdraw, send | ⬜     |
| Agent: cash-in/out                | ⬜     |
| Admin: block, approve, view       | ⬜     |
| Error handling                    | ⬜     |
| Postman + README.md               | ⬜     |
| Demo video                        | ⬜     |

---
