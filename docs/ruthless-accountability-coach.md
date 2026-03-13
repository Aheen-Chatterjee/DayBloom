# Ruthless Accountability Coach

An autonomous dual-agent feature that detects broken habit streaks and fires a brutally personalised in-app roast, pulling ammo directly from the user's own journal entries.

--- THE ROAST MY TASTE FEATURE

## How It Works (Overview)

```
User opens app / every 2 minutes
        ↓
Frontend calls GET /api/v1/accountability/roast
        ↓
  ┌─────────────────────────────────────────────┐
  │           LangGraph Pipeline                │
  │                                             │
  │  [Auditor] → broken streaks? ──No──→ END   │
  │                    │                        │
  │                   Yes                       │
  │                    ↓                        │
  │  [Journal] fetch recent entries             │
  │                    ↓                        │
  │  [Enforcer] GPT-4o writes roast             │
  │                    ↓                        │
  │               END                           │
  └─────────────────────────────────────────────┘
        ↓
  Return { roast: "...", broken_habits: [...] }
        ↓
  Dark red flame toast — stays 15 seconds
```

---

## The Two Agents

### Agent A — The Auditor (`auditor_node`)

Runs first. Has no LLM — pure logic.

1. Fetches all active (non-archived) habits for the authenticated user
2. For each habit, loads completion dates from the last 60 days
3. Runs them through the existing `compute_streak()` function (in `streak_service.py`)
4. **Flags a habit as broken** if:
   - `current_streak == 0` (they've missed both today and yesterday), AND
   - `last_completed_date` exists (they've used this habit before), AND
   - `days_missed >= 2` (at least 2 full days without a check-off)
5. Returns a list of broken habits with name, description, emoticon, days missed, and last completion date

If zero habits are broken → the graph short-circuits straight to `END`. No LLM is called, no cost incurred.

### Agent B — The Enforcer (`enforcer_node`)

Runs last. Has access to the user's journal context assembled by the intermediate Journal node.

- Model: `gpt-4o`, `temperature=1.0` (creative, unpredictable)
- Max tokens: `120` (keeps it punchy — 1-2 sentences)
- The system prompt instructs it to:
  - Reference specific things the user wrote (goals, fears, their own words)
  - Use "you" directly, never "the user"
  - Never open with "Hey" or "Hello"
  - Vary tone between cold/surgical, disbelieving, and darkly amused

**Example output:**
> *"You missed your workout for 4 days. Funny — three entries ago you wrote about wanting to run that marathon. Guess that was just a mood."*

---

## The Journal Node (between Auditor and Enforcer)

Not an agent — a data-fetch step. Pulls the user's last 6 journal entries and packages:
- Entry date
- `one_line_summary` (from existing AI analysis)
- `key_themes`
- `primary_sentiment`
- First 350 characters of the raw body

This context is handed to the Enforcer so the roast is personal, not generic.

---

## The LangGraph Graph

**File:** `backend/services/accountability_agent.py`

```
State: AccountabilityState
  - user_id: str
  - broken_habits: list[dict]
  - journal_context: str
  - roast_message: str | None

Nodes:   auditor → journal → enforcer
Edges:   auditor --[broken?]--> journal
         auditor --[none]-----> END
         journal -------------> enforcer
         enforcer ------------> END
```

Graph is compiled once per request via `build_accountability_graph()`.

---

## The API Endpoint

**File:** `backend/routers/accountability.py`

```
GET /api/v1/accountability/roast
Authorization: Bearer <supabase_access_token>
```

Response (broken streak found):
```json
{
  "roast": "You said running was your therapy. Four days of silence disagrees.",
  "broken_habits": [
    {
      "name": "Morning Run",
      "emoticon": "🏃",
      "days_missed": 4,
      "last_completed": "2026-03-09"
    }
  ]
}
```

Response (no broken streak):
```json
{
  "roast": null,
  "broken_habits": []
}
```

The graph runs in a thread pool via `asyncio.to_thread` so the async FastAPI handler is never blocked.

---

## The Frontend

### Polling (`AccountabilityPoller.tsx`)

A renderless React component mounted in `(app)/layout.tsx` — meaning it runs on every authenticated page.

- Fires **immediately on mount** (app open)
- Fires **every 2 minutes** via `setInterval`
- An `inFlight` ref prevents overlapping calls if GPT is slow
- Silent on error — the coach takes a day off, the app doesn't crash

### The Roast Toast

A new `'roast'` type was added to the existing `ToastContext` and `ToastContainer`.

| Property | Normal toast | Roast toast |
|---|---|---|
| Timeout | 4 seconds | **15 seconds** |
| Background | White | `#1A0A0A` (near-black red) |
| Border | Subtle green/red | `#8B2020` (dark red) |
| Icon | CheckCircle / AlertCircle | 🔥 Flame |
| Shadow | Soft green | **Red glow** |
| Max width | Default | `max-w-sm` (wider for longer text) |

---

## File Map

```
backend/
  services/
    accountability_agent.py     ← LangGraph graph (new)
  routers/
    accountability.py           ← FastAPI endpoint (new)
  main.py                       ← +1 line: registers router

frontend/src/
  lib/api/
    accountability.ts           ← fetchRoast() (new)
  components/accountability/
    AccountabilityPoller.tsx    ← polling + toast trigger (new)
  context/
    ToastContext.tsx            ← added 'roast' type + 15s timeout
  components/ui/
    Toast.tsx                   ← added dark red roast styling + Flame icon
  app/(app)/
    layout.tsx                  ← mounts <AccountabilityPoller />
```

---

## Setup Requirements

The feature reuses the existing `OPENAI_API` key already in `backend/.env`.
No new environment variables are needed.

Install the new Python dependencies (already added to `requirements.txt`):

```bash
cd backend
pip install -r requirements.txt
```

The feature silently no-ops if `OPENAI_API` is not set — the endpoint returns `{ roast: null }` and nothing shows in the UI.

---

## Do You Need To Do Anything?

No. Just run the app normally:

```bash
# Backend
cd backend && uvicorn main:app --reload

# Frontend
cd frontend && npm run dev
```

The poller starts automatically when a logged-in user opens the app. If they have any habit with 2+ missed days, they will be roasted within seconds of loading the page.
