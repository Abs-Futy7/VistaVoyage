# 🌍 VoyageVista — Full Stack Travel Agency Web App

Welcome to the official codebase of **VoyageVista**, a scalable full-stack travel agency platform built with **Next.js (App Router)**, **FastAPI**, and **PostgreSQL**.

This guide will help you set up the project locally for development and contribution.

---

## 🧱 Tech Stack

| Layer      | Technology                 |
|------------|----------------------------|
| Frontend   | Next.js (App Router), TypeScript, Tailwind CSS, ShadCN UI |
| Backend    | FastAPI, SQLAlchemy, JWT Auth |
| Database   | PostgreSQL                 |
| Auth       | JWT (Backend-issued)       |
| UI Assets  | Lucide Icons, React Icons  |

---

## 📁 Project Structure

```
/
├── backend/      # FastAPI + PostgreSQL
├── frontend/     # Next.js App Router + TS
├── .env          # Environment variables (example provided)
└── README.md
```

---

## 🚀 Getting Started

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/your-org/voyagevista.git
cd voyagevista
```

### 2️⃣ Set Up Environment Variables

🔑 Create `.env` files in both folders:

**→ /backend/.env**
```
DATABASE_URL=postgresql://postgres:password@localhost:5432/voyagevista
JWT_SECRET_KEY=your-secret
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

**→ /frontend/.env.local**
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api
```

### 3️⃣ Backend Setup (FastAPI)

**▶️ Prerequisites:**
- Python 3.10+
- PostgreSQL installed locally

**📦 Install Dependencies:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

**⚙️ Create the database:**
```sql
-- Inside PostgreSQL shell or client
CREATE DATABASE voyagevista;
```

**📂 Run migrations (if using Alembic):**
```bash
alembic upgrade head
```

**🚀 Start FastAPI Server:**
```bash
uvicorn app.main:app --reload
```

### 4️⃣ Frontend Setup (Next.js)

```bash
cd frontend
npm install
npm run dev
```
App will be running at [http://localhost:3000](http://localhost:3000)

---

## 🧪 API Testing

- **Base URL:** http://localhost:8000/api
- Use tools like Postman or ThunderClient
- Auth routes return JWT tokens to be passed in `Authorization: Bearer <token>`

---

## 👥 User Roles

- **admin:** Manages content, users, analytics
- **user:** Can book trips, leave reviews, manage profile/wishlist

---

## 📦 Features Overview

- Browse & filter travel packages
- Blog system
- Auth (login, register, forgot password)
- Booking system
- Wishlist
- Offers & promo codes
- Admin dashboard
- Analytics panel

---

## 🛠️ Contributing

1. Fork this repo
2. Create your branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -am 'add feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a pull request

---

## 📄 License

This project is licensed under the MIT License.

---

## 🙋 Need Help?

Contact the project maintainer or create an issue.

---

Let me know if you want:

- A `.env.example` file auto-generated
- A `Makefile` or `start.sh` script
- Docker setup included for zero-config dev environment

This `README.md` ensures any dev can start contributing within minutes.