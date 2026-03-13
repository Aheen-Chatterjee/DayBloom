# DayBloom — Damage Report

## The Core Idea & Track
**Track:** Track 2: "DailyRoutine" (Habit Tracker & Journal)

**Core Idea:** DayBloom is a maximalistic, warm-toned personal productivity and reflection platform. We set out to unify long-form journaling, habit tracking, and visual progress reporting (streaks, calendars) into a single cohesive, delightful daily workflow known as the "The Mindful Achiever's" home base.

## ✅ Feature Shocks Successfully Implemented

**1. Ruthless Accountability Coach (Agentic Motion)**  
We successfully shipped a dual-agent LangGraph pipeline (Auditor & Enforcer). When the user opens the app, a renderless poller triggers the backend to run a purely logical "Auditor" node to check for broken habit streaks (zero completitions in the last 2+ days). If it finds a break, it passes execution to the "Enforcer" node (GPT-4o), which fetches the user's last 6 journal entries to craft a brutally personalized roast using their own words/goals. This roast appears as a dark-red flame toast on the frontend. It works flawlessly and feels incredibly personal.

## 💥 Feature Shocks That Absolutely Destroyed Us

**1. Feature Shock #3: Proof of Work (Computer Vision AI Verification)**  
We attempted to replace the boolean habit checkbox with photographic verification. The goal was to make users upload an image that GPT-4o Vision would verify before marking a habit complete.  
- **What we built:** The backend `proof_service.py` is mostly written. The endpoint `POST /completions/verify` successfully uploads bytes to a private Supabase Storage bucket (`habit-proof`) and fires off a call to the Vision API. We also set up the `ProofUploadModal` UI on the frontend.
- **Where we got stuck:** Tying the asynchronous verification flow deeply into the frontend's optimistic UI `DailyChecklist` was a nightmare. When a user uploaded an image on a mobile browser, the upload to Supabase occasionally hung. Furthermore, replacing the core `POST /completions` bypass proved fatal—we couldn't confidently release the strict proof-gate because the Edge/Vision API latency caused the UI to feel jarring and unresponsive compared to the original one-tap satisfaction of the checklist. 
- **The Post-Mortem:** We bit off more than we could chew in modifying our core checklist interaction model. We backed out and left the standard checkbox path available as a fallback. The `POST /completions/verify` exists, but the user experience of forced verifications degraded our core loop. We learned that introducing high-latency, error-prone operations (image uploads + LLM calls) into the hottest path of a daily habit tracker ruins the snappy "dopamine hit" of checking things off.
