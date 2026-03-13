# ✿(◕‿◕) DayBloom

DayBloom is a maximalistic, warm-toned personal productivity and reflection platform that unifies **long-form journaling**, **habit tracking**, and **visual progress reporting** into a single delightful daily workflow.

## 🏗️ Architecture Overview

DayBloom follows a three-tier architecture:
- **Frontend**: Next.js 14 (App Router) — A stunning, responsive, maximalistic React application providing the UI, routing, and API calls.
- **Backend**: FastAPI (Python 3.12) — Handles the business logic, streak computation engine, the Ruthless Accountability Coach (LangGraph AI Agent), and REST API.
- **Database & Auth**: PostgreSQL via Supabase — Manages persistent data storage and secure JWT authentication with Row-Level Security (RLS).

## 🚀 Local Setup Guide

### 1. Supabase Setup
You will need a Supabase project. You can run migrations in `supabase/migrations/` to set up the DB schema and RLS policies.

### 2. Environment Variables

**Backend (`backend/.env`):**
```bash
SUPABASE_URL=https://[YOUR_PROJECT_REF].supabase.co
SUPABASE_SERVICE_KEY=[YOUR_SERVICE_ROLE_KEY]
JWT_SECRET=[YOUR_SUPABASE_JWT_SECRET]
ALLOWED_ORIGINS=http://localhost:3000
OPENAI_API=[YOUR_OPENAI_API_KEY] # Required for the Accountability Coach
```

**Frontend (`frontend/.env.local`):**
```bash
NEXT_PUBLIC_SUPABASE_URL=https://[YOUR_PROJECT_REF].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[YOUR_ANON_KEY]
NEXT_PUBLIC_API_URL=http://localhost:8000 # Your FastAPI backend URL
```

### 3. Running the Backend

Make sure you have Python 3.12+ installed.
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Run the FastAPI server
uvicorn main:app --reload
```
The backend will run on `http://127.0.0.1:8000`.

### 4. Running the Frontend

Make sure you have Node 20.x installed.
```bash
cd frontend
npm install

# Run the Next.js development server
npm run dev
```
The app will be accessible at `http://localhost:3000`.

## ✧٩(◕‿◕)۶✧ Demo User Data Seeding

We provide a script to generate a rich 14-day history for a demo user (`Luna Bloom ✿`) to showcase the streak engine, history calendar, and the accountability coach.

To run the seed script:
1. Ensure your backend virtual environment is active.
2. Ensure you have `ANTHROPIC_API_KEY` in your backend `.env` file since it uses Claude to write personalized journal entries.
3. Run:
```bash
pip install -r scripts/requirements_seed.txt
python scripts/seed_demo.py
```
This will set up the demo user with credentials `demo@daybloom.app` and password `DayBloom2025!`.
