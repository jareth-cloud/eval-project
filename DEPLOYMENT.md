# Deployment Guide — Project Evaluation System

## Architecture Overview

```
[Form App]          [Dashboard App]
  Netlify              Netlify
  (public)             (private — password protected)
      |                     |
      └──────────┬───────────┘
                 ↓
           [Backend API]
             Render.com
          (Express + SQLite)
```

---

## Step 1 — Deploy the Backend on Render

The backend stores all evaluation data. It runs 24/7 and both apps connect to it.

### 1.1 Create a GitHub repo for the backend

```bash
cd eval-project/backend
git init
git add .
git commit -m "initial backend"
# Create a new repo on github.com, then:
git remote add origin https://github.com/YOUR_USERNAME/eval-backend.git
git push -u origin main
```

### 1.2 Deploy on Render (free tier)

1. Go to **https://render.com** and sign up / log in
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repo (`eval-backend`)
4. Configure:
   - **Name:** `eval-backend`
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
5. Under **Environment Variables**, add:
   - `DASHBOARD_SECRET` = `your-strong-password-here`
6. Click **"Create Web Service"**
7. Wait ~2 min for deployment. Copy your URL:
   → `https://eval-backend.onrender.com`

> ⚠️ Free tier spins down after 15 min inactivity. Upgrade to Starter ($7/mo) for always-on.

---

## Step 2 — Deploy the Form App on Netlify

### 2.1 Create .env file

In the `form-app` folder, create a `.env` file:
```
VITE_API_URL=https://eval-backend.onrender.com
```

### 2.2 Build and deploy

```bash
cd eval-project/form-app
npm install
npm run build
```

Then deploy via Netlify:

**Option A — Netlify CLI (fastest):**
```bash
npm install -g netlify-cli
netlify deploy --dir=dist --prod
```
Follow the prompts to create a new site.

**Option B — Drag & Drop:**
1. Go to **https://app.netlify.com**
2. Drag the `form-app/dist` folder onto the dashboard
3. Your form is live instantly!

### 2.3 Set environment variable in Netlify

1. In your Netlify site → **Site Settings** → **Environment Variables**
2. Add: `VITE_API_URL` = `https://eval-backend.onrender.com`
3. Redeploy (Deploys → Trigger deploy)

Your form URL: `https://your-form-name.netlify.app`

---

## Step 3 — Deploy the Dashboard App on Netlify

### 3.1 Create .env file

In the `dashboard-app` folder, create a `.env` file:
```
VITE_API_URL=https://eval-backend.onrender.com
VITE_DASHBOARD_SECRET=your-strong-password-here
```
> ⚠️ Must match `DASHBOARD_SECRET` in your backend .env

### 3.2 Build and deploy

```bash
cd eval-project/dashboard-app
npm install
npm run build
```

Then deploy (same options as above — create a **separate** Netlify site):
```bash
netlify deploy --dir=dist --prod
```

### 3.3 Set environment variables in Netlify

Add both:
- `VITE_API_URL` = `https://eval-backend.onrender.com`
- `VITE_DASHBOARD_SECRET` = `your-strong-password-here`

Your dashboard URL: `https://your-dashboard-name.netlify.app`

---

## Step 4 — Rename your sites (optional but recommended)

In Netlify → Site Settings → General → Site Name:
- Form: `digital-dept-evaluation`  → `digital-dept-evaluation.netlify.app`
- Dashboard: `digital-dept-dashboard` → `digital-dept-dashboard.netlify.app`

---

## Final URLs

| Purpose | URL | Access |
|---------|-----|--------|
| Submit evaluations | `https://digital-dept-evaluation.netlify.app` | Public — share with your team |
| View dashboard | `https://digital-dept-dashboard.netlify.app` | Password protected — keep private |
| Backend API | `https://eval-backend.onrender.com` | Not shared |

---

## Changing the Dashboard Password

1. Update `DASHBOARD_SECRET` in Render environment variables
2. Update `VITE_DASHBOARD_SECRET` in Netlify dashboard-app environment variables
3. Redeploy both

---

## Local Development

Run all three simultaneously:
```bash
# Terminal 1 — Backend
cd eval-project/backend && npm install && node server.js

# Terminal 2 — Form
cd eval-project/form-app && npm install && npm run dev

# Terminal 3 — Dashboard
cd eval-project/dashboard-app && npm install && npm run dev
```

Visit:
- Form: http://localhost:5173
- Dashboard: http://localhost:5174
- Backend: http://localhost:3001
