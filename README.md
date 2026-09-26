# LostLink 🔗
### An Intelligent Lost-and-Found Item Matching & Recovery Platform

LostLink is a production-ready, full-stack web application designed to connect people who have lost personal belongings with people who have found them, utilizing multi-factor weighted matching algorithms and secure ownership verification.

---

## 🚀 Quick Start Guide (Local Development)

### 1. MongoDB Atlas Configuration
Your MongoDB Atlas connection URI has already been configured in `server/.env`:
```env
MONGODB_URI="mongodb+srv://amaralingeswara2489_db_user:V0J1ADS3bMzEANRq@cluster0.kybt7h2.mongodb.net/lostlink?retryWrites=true&w=majority"
```

> **Important MongoDB Atlas Requirement:**
> Ensure your IP address is whitelisted in MongoDB Atlas:
> 1. Log into [MongoDB Atlas](https://cloud.mongodb.com).
> 2. Navigate to **Security** → **Network Access**.
> 3. Click **Add IP Address** → choose **Allow Access From Anywhere** (`0.0.0.0/0`) or add your current IP address.

---

### 2. Running the Backend Server

Open a terminal window and execute:
```bash
cd server
npm install
npm run seed     # (Optional) Populates sample users, items, and intelligent matches
npm run dev      # Starts the Express API server on http://localhost:5000
```

---

### 3. Running the Frontend Client

Open a second terminal window and execute:
```bash
cd client
npm install
npm run dev      # Starts the Vite development server on http://localhost:5173
```

Now open [http://localhost:5173](http://localhost:5173) in your browser.

---

## ☁️ Production Deployment Guide

### 🌐 Backend Deployment (e.g., Render / Railway / Heroku)

1. **Root Directory**: Select `/server`
2. **Build Command**: `npm install`
3. **Start Command**: `npm start` (or `node server.js`)
4. **Environment Variables**:
   | Variable | Value / Description |
   | :--- | :--- |
   | `NODE_ENV` | `production` |
   | `PORT` | `5000` (or host assigned `$PORT`) |
   | `MONGODB_URI` | `mongodb+srv://amaralingeswara2489_db_user:V0J1ADS3bMzEANRq@cluster0.kybt7h2.mongodb.net/lostlink?retryWrites=true&w=majority` |
   | `JWT_SECRET` | `your_secure_production_secret_key` |
   | `JWT_EXPIRES_IN` | `7d` |
   | `CLIENT_URL` | `https://your-frontend-app.vercel.app` (Your deployed frontend URL for CORS) |
   | `MATCH_THRESHOLD`| `40` |

---

### 💻 Frontend Deployment (e.g., Vercel / Netlify / Cloudflare Pages)

1. **Root Directory**: Select `/client`
2. **Build Command**: `npm run build`
3. **Output Directory**: `dist`
4. **Environment Variables**:
   | Variable | Value / Description |
   | :--- | :--- |
   | `VITE_API_BASE_URL` | `https://your-backend-app.onrender.com/api` (URL of your deployed backend API) |

---

## 👥 Demo Test Credentials (After running `npm run seed`)

| Role | Email | Password | Access |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@lostlink.com` | `Password123!` | Full Admin Portal (`/admin`), Moderation, Analytics |
| **User (Sarah)** | `sarah@example.com` | `Password123!` | Dashboard, Lost & Found Reports, Matching, Chat |
| **User (Marcus)** | `marcus@example.com` | `Password123!` | Dashboard, Lost & Found Reports, Matching, Chat |

---

## 🌟 Key Features

1. **Intelligent Weighted Matching Algorithm**:
   - Compares Category (30%), Location Proximity (25%), Temporal Range (20%), Keywords/Features (15%), and Brand/Color (10%).
   - Generates confidence scores and match breakdown explanations.

2. **Secure Multi-Stage Recovery Workflow**:
   - Private ownership questions with hidden answers (e.g., serial number, hidden markings).
   - Claim requests with image proof and status tracking (`Active` → `Potential Match` → `Recovery Requested` → `Recovered`).

3. **In-App Direct Messaging**:
   - Secure communication between item reporter and claimant without exposing sensitive contact details.

4. **Rich Admin Dashboard & Moderation**:
   - User management (role assignment, ban/unban).
   - Content moderation queue for spam or suspicious reports.
   - Platform analytics with interactive chart visualizations.

5. **Tailored Modern Dark UI**:
   - Clean dark-mode palette (slate, emerald, amber, violet) avoiding default blue styling.
