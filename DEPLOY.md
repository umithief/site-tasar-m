# MotoVibe Deployment Guide

## Overview
Your application handles both **Frontend (React)** and **Backend (Node.js/Express)**.
It is configured to run as a **Monolith** (Single Server) or **Split** (Frontend on Vercel, Backend on Render).

## Database
Your application is already connected to a remote MongoDB Atlas database:
`mongodb+srv://umithief:14531453@motovibe.mslnxhq.mongodb.net/?appName=motovibe`
This means your data is preserved regardless of where you deploy.

## Option 1: Single Server Deployment (VPS, DigitalOcean, Hetzner) - Recommended
This method runs both the API and the React App on the same server/port.

1.  **Build the Frontend:**
    Run this command locally or on the server:
    ```bash
    npm install
    npm run build
    ```
    This creates a `dist` folder.

2.  **Start the Server:**
    Set `NODE_ENV=production` and start the backend.
    ```bash
    export NODE_ENV=production
    node backend/server.js
    ```
    *Windows PowerShell:*
    ```powershell
    $env:NODE_ENV="production"
    node backend/server.js
    ```

3.  **Access:**
    Go to `http://your-server-ip:5000`. You will see the React App. The API defaults to `/api`.

## Option 2: Cloud Platform (Render.com / Heroku)
1.  Push your code to GitHub.
2.  Create a new **Web Service** on Render.
3.  Connect your GitHub repo.
4.  **Build Command:** `npm install && npm run build`
5.  **Start Command:** `node backend/server.js`
6.  **Environment Variables:**
    -   `NODE_ENV`: `production`
    -   `MONGO_URI`: (Copy from .env.example)

Your app will be live at `https://your-service-name.onrender.com`.

## Option 3: Split Deployment (Vercel + Render)
1.  **Backend:** Deploy just the backend to Render (Start Command: `node backend/server.js`).
2.  **Frontend:** Deploy to Vercel.
    -   Add Environment Variable in Vercel: `VITE_API_URL` = `https://your-backend-url.onrender.com/api`

## Notes
-   The `services/config.ts` file automatically detects if it should use `localhost` or the production URL.
-   We fixed `showcaseService.ts` which had a hardcoded localhost URL.
