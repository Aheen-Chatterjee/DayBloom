# Feature Shock #3 — Proof of Work
**Status:** Draft
**Date:** 2026-03-13
**Author:** Claude (brainstorming session)

---

## 1. Overview

Users lie. The checkbox is a lie machine. Feature Shock #3 ("Proof of Work") abolishes the boolean habit checkbox and replaces it with computer-vision-verified photographic proof. Every habit completion must be backed by a photo that GPT-4o Vision evaluates against the habit's context. Approved proofs record the streak. Rejected proofs earn a sarcastic AI verdict and a "Try Again" button.

**Goal:** Replace `POST /completions` (free checkbox) with `POST /completions/verify` (photo-gated, AI-judged).

**Lifecycle of old endpoints:**
- `POST /completions` — **deprecated and removed**. No bypass path survives.
- `DELETE /completions/{id}` — **kept as-is**. Users can still un-complete a habit (e.g., submitted wrong photo by mistake). Un-completing does not require proof; it just removes the record.
- `GET /completions` — **unchanged**.

**Note on status codes:** FastAPI automatically returns `422 Unprocessable Entity` for request validation errors (missing fields, wrong types). To avoid collision, the AI-rejection response uses `400 Bad Request` instead of `422`. Frontend code that handles `400` for AI rejection must not confuse it with FastAPI's `422` for malformed requests — these are distinct status codes with distinct body shapes.

---

## 2. User Flow

```
Dashboard (daily checklist)
  └── Habit row shows camera icon (not checkbox) when incomplete
      └── User clicks camera icon
          └── ProofUploadModal opens (backdrop click DISABLED during uploading/verifying)
              ├── User drags/drops image OR selects file OR uses camera (mobile)
              └── User taps "Submit Proof"
                  └── [uploading → verifying]
                      ├── APPROVED
                      │   └── Green verdict + confetti → modal auto-closes → habit marked complete
                      ├── REJECTED
                      │   └── Dark red sarcastic verdict + "Try Again" → modal stays open
                      └── VISION API ERROR (500)
                          └── Auto-approved with neutral verdict "Verified (AI unavailable)"
                              → treated identically to APPROVED path
```

**Key rules:**
- A habit already completed today shows a green check (read-only, no re-upload).
- Rejected proofs do not create any DB record. No partial state.
- Users may retry rejected proofs unlimited times.
- Image is uploaded to Supabase Storage before calling the vision model. If rejected, the image is immediately deleted from Storage. If the delete fails, the orphaned file at `{user_id}/{habit_id}/{date}.jpg` will be silently overwritten on the next retry (same path). This is acceptable.
- The modal is NOT closeable (backdrop click suppressed) while state is `uploading` or `verifying`. It can be closed in `idle`, `approved`, and `rejected` states.

---

## 3. Architecture

### 3.1 New Backend: `proof_service.py`

Single responsibility: call GPT-4o Vision and return a typed result. Receives raw image bytes (from the in-memory `UploadFile` object) — **not** re-fetched from Storage. The bytes are base64-encoded locally before passing to the Vision API, avoiding any extra round-trip.

```python
@dataclass
class ProofResult:
    approved: bool
    verdict: str  # AI-generated one-liner (approval or sarcastic rejection)

async def verify_habit_proof(
    habit_name: str,
    habit_description: str,
    image_bytes: bytes,   # raw bytes from UploadFile, encoded to base64 inside this function
    image_media_type: str # e.g. "image/jpeg"
) -> ProofResult:
    ...
```

**Vision prompt:**
```
System:
You are a strict but sarcastic habit verification AI. You evaluate photographic proof that
a user has completed their daily habit. Be harsh but fair. If the proof is clearly valid,
approve it. If it's ambiguous, reject it with maximum sass.

User:
Habit: "{name}"
Description: "{description}"

Does this image provide credible evidence that this habit was completed today?
Respond ONLY with valid JSON: {"approved": boolean, "verdict": "string"}
- If approved: verdict is a single dry sentence of acknowledgment.
- If rejected: verdict is 1-2 sentences of maximum sarcasm, calling out specifically why
  the photo doesn't count.
```

- Model: `gpt-4o` (vision is built-in, same model already in use)
- Temperature: `0.8` (creative sarcasm on rejections)
- Max tokens: `150`
- On any exception from the OpenAI client: return `ProofResult(approved=True, verdict="Verified (AI unavailable)")` — never block the user due to an API outage.

### 3.2 New Backend Endpoint: `POST /completions/verify`

**Location:** `backend/routers/completions.py` (new route in existing file)

**Request:** `multipart/form-data`
```
habit_id: UUID (form field)
image:    File (jpg/png/webp — validated server-side before any processing, max 10MB)
date:     string (YYYY-MM-DD, optional, defaults to today's UTC date)
```

**Server-side file validation** happens first, before Storage upload or Vision API call:
- Reject if `content_type` not in `{"image/jpeg", "image/png", "image/webp"}` → `400`
- Reject if `file.size > 10_485_760` (10MB) → `400`

**Flow:**
1. Authenticate user (`get_current_user` dependency).
2. Validate `habit_id` belongs to the authenticated user and is not archived → `404` if not found.
3. Check for existing completion on `date` → `409 Conflict` if already completed.
4. **Validate file** (type + size) → `400` if invalid.
5. Read raw bytes from `UploadFile` into memory.
6. Upload bytes to Supabase Storage at `{user_id}/{habit_id}/{date}.jpg` (bucket: `habit-proof`).
7. Call `proof_service.verify_habit_proof(habit_name, habit_description, image_bytes, media_type)`.
8. **If approved:**
   - `INSERT` into `habit_completions` with `proof_image_url` (Storage public URL) and `proof_verdict`.
   - Return `201` with the full `CompletionResponse` (which includes `proof_verdict`).
9. **If rejected:**
   - Delete image from Supabase Storage (best-effort; failure is non-fatal — see path-overwrite note in §3.4).
   - Return `400 Bad Request` (not `422` — FastAPI reserves `422` for its own request validation errors; see §1 note):
     ```json
     { "verdict": "...sarcastic message..." }
     ```

**201 response shape** — the standard `CompletionResponse` Pydantic model, extended with the new fields:
```json
{
  "id": "uuid",
  "habit_id": "uuid",
  "user_id": "uuid",
  "completion_date": "2026-03-13",
  "completed_at": "2026-03-13T10:30:00Z",
  "note": null,
  "proof_image_url": "https://...supabase.co/storage/v1/object/...",
  "proof_verdict": "Fine, that's a salad. Barely."
}
```

The frontend reads `proof_verdict` from the completion record. There is no separate top-level `verdict` field in the 201 response.

**Error responses:**
| Status | Meaning | Body |
|--------|---------|------|
| 400 | Invalid file type / size **OR** AI rejected the proof | File errors: FastAPI default `{"detail": "..."}`. AI rejection: `{"verdict": "...sarcastic..."}`. Frontend distinguishes by checking whether `body.verdict` exists. |
| 404 | Habit not found or not owned by user | FastAPI default |
| 409 | Already completed today | FastAPI default |
| 422 | Malformed request (missing fields, wrong types) — FastAPI native, never used by application code | FastAPI default `{"detail": [...]}` |

### 3.3 DB Schema Changes

New migration: `supabase/migrations/20260313000002_add_proof_fields.sql`

```sql
ALTER TABLE habit_completions
  ADD COLUMN proof_image_url TEXT,
  ADD COLUMN proof_verdict   TEXT;
```

Both columns are nullable — existing completions (created before this feature) remain valid without them.

### 3.4 Supabase Storage

**Bucket and RLS must be created via migration** (not the dashboard). Add to the same migration file `20260313000002_add_proof_fields.sql`:

```sql
-- Create private Storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('habit-proof', 'habit-proof', false)
ON CONFLICT (id) DO NOTHING;

-- RLS: authenticated users can manage only their own files
CREATE POLICY "Users own their proof files"
ON storage.objects FOR ALL
TO authenticated
USING (
  bucket_id = 'habit-proof'
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'habit-proof'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
```

- **Path format:** `{user_id}/{habit_id}/{YYYY-MM-DD}.jpg`
- **Visibility:** Private. Backend accesses via service role key.
- **Retry overwrite:** If a rejection's Storage delete fails, the next retry for the same habit + date overwrites the orphaned file at the same path. This is acceptable and expected.

### 3.5 Frontend: New Hook `useProofSubmission.ts`

```typescript
// frontend/src/hooks/useProofSubmission.ts
type ProofState = 'idle' | 'uploading' | 'verifying' | 'approved' | 'rejected'

function useProofSubmission(onSuccess: (completion: HabitCompletion) => void): {
  state: ProofState
  verdict: string | null
  submit: (habitId: string, file: File) => Promise<void>
  reset: () => void
}
```

- **Does NOT use `apiFetch`** for this call. Uses `fetch` directly with `FormData` and omits the `Content-Type` header so the browser sets `multipart/form-data` with the correct boundary automatically. The `Authorization: Bearer {token}` header is still set manually.
- On `201`: parses `CompletionResponse`, calls `onSuccess(completion)` (parent passes an `addCompletion` setter from `useCompletions`), sets state → `approved`, stores `completion.proof_verdict` as `verdict`.
- On `400` with `body.verdict` present: sets state → `rejected`, stores `body.verdict` (AI rejection). On `400` without `body.verdict`: sets state → `idle`, shows error toast (file validation error).
- On network/other error: sets state → `idle`, shows error toast.
- `reset()` → sets state back to `idle`, clears `verdict`.

**Integration with `useCompletions`:**
`useCompletions` exposes (or will expose) an `addCompletion(c: HabitCompletion) => void` setter that appends to the local completions array. `DailyChecklist` creates one `useProofSubmission` instance per session (or passes `addCompletion` down), so the checklist updates optimistically after an approval without a full refetch.

### 3.6 Frontend: New Component `ProofUploadModal.tsx`

**Location:** `frontend/src/components/checklist/ProofUploadModal.tsx`

**Props:**
```typescript
interface Props {
  habit: Habit
  onClose: () => void
  onSuccess: (completion: HabitCompletion) => void
}
```

**State machine:**

| State | UI | Backdrop closeable? |
|-------|----|---------------------|
| `idle` | Drop zone (dashed border, upload icon), thumbnail preview after file selected, "Submit Proof" button (disabled until file selected) | Yes |
| `uploading` | Spinner, "Uploading..." | No |
| `verifying` | Animated pulse, "Analysing your proof..." | No |
| `approved` | Forest-green flash, habit emoticon large, `proof_verdict` text, confetti fires, auto-closes after 1.5s | Yes |
| `rejected` | Dark-red gradient (RoastBanner aesthetic), big ✗, sarcastic verdict in `#F5D0D0`, "Try Again" button | Yes |

**Design rules:**
- Uses existing `Modal` UI component (`rounded-2xl`, dark backdrop).
- Drop zone: dashed `border-[#E2DBD0]`, hover → `border-[#C9A96E]` (gold), `rounded-xl`.
- Approved: `bg-[#1E3D2F]` flash, white text.
- Rejected: `background: linear-gradient(135deg, #0D0404, #1A0606)`, `border: 1px solid #6B1A1A` (matches RoastBanner).
- Verdict text: `font-['Cormorant_Garamond'] text-xl italic` for drama.
- File input: `accept="image/*"` only (no `capture` attribute — avoids suppressing gallery picker on mobile; user's OS presents both camera and gallery options naturally).
- Show image thumbnail after selection, before submission.
- Backdrop click calls `onClose()` only when state is `idle`, `approved`, or `rejected`. Suppressed during `uploading`/`verifying`.

### 3.7 Frontend: Modified `ChecklistItem.tsx`

Replace the checkbox `onClick` toggle with a camera-icon trigger:
- **Incomplete:** Lucide `Camera` icon button, gold on hover (`text-[#C9A96E]`).
- **Complete:** green checkmark (existing style), non-interactive. Clicking does nothing.
- Clicking incomplete habit calls `onProofRequest(habitId)` prop (new) instead of `onToggle`.

`DailyChecklist` manages `proofModalHabitId: string | null` state and renders `<ProofUploadModal>` when set.

### 3.8 Frontend: API Client

`verifyHabitCompletion` lives in `frontend/src/lib/api/completions.ts` (alongside the existing `completionsApi` object — it is added as a standalone export, not inside the `completionsApi` object). It bypasses the shared `apiFetch` wrapper (which hardcodes `Content-Type: application/json`, incompatible with `FormData`) and uses raw `fetch` directly.

The existing `completionsApi.create()` function in `completions.ts` is **removed** in the same edit, since `POST /completions` is removed from the backend.

```typescript
// frontend/src/lib/api/completions.ts

export async function verifyHabitCompletion(
  habitId: string,
  imageFile: File,
  date?: string
): Promise<HabitCompletion>
// Throws ProofRejectedError (with .verdict: string) on AI rejection (400 + body.verdict).
// Throws Error on other failures.
```

The function:
1. Builds a `FormData` with `habit_id`, `image`, and optionally `date`.
2. Calls `fetch(url, { method: 'POST', headers: { Authorization: \`Bearer ${token}\` }, body: formData })` — **no `Content-Type` header** so the browser sets `multipart/form-data` with the correct boundary automatically.
3. On `201`: returns parsed `HabitCompletion`.
4. On `400` where `body.verdict` exists: throws `ProofRejectedError` with `.verdict` string (AI rejection).
5. On `400` without `body.verdict`: throws generic `Error` (file validation failure).
6. On other 4xx/5xx: throws generic `Error`.

---

## 4. Component Hierarchy

```
DailyChecklist  (manages proofModalHabitId state, addCompletion from useCompletions)
  └── ChecklistItem (modified: camera icon → calls onProofRequest)
  └── ProofUploadModal (new, rendered when proofModalHabitId is set)
        └── useProofSubmission (new hook, uses raw fetch with FormData)
              └── verifyHabitCompletion() (in completions.ts, bypasses apiFetch)
                    └── POST /completions/verify (new endpoint)
                          ├── File validation (type + size)
                          ├── Supabase Storage upload
                          └── proof_service.verify_habit_proof()
                                └── GPT-4o Vision (base64 from in-memory bytes)
```

---

## 5. Proof Verification Examples

| Habit | Good proof | Bad proof (rejection) |
|-------|------------|----------------------|
| "Read 20 pages" | Photo of open book with visible text | Photo of closed book, TV remote, or a random room |
| "Eat healthy" | Photo of a salad, fruits, or grilled food | Photo of a donut, pizza, or an empty plate |
| "Exercise" | Photo at gym, running shoes, sweaty selfie | Photo of couch, bed, or Netflix screen |
| "Meditate" | Photo of meditation setup (cushion, candles) | Photo of phone in hand, or literally anything else |

---

## 6. Out of Scope

- Per-habit "proof required" toggle (Feature Shock #3 applies to ALL habits).
- Retry limits (unlimited retries allowed).
- Image content moderation / NSFW filtering.
- Video proof.
- Viewing proof images in the history/calendar page (URL is stored in DB; a future feature).
- Streak protection / grace periods for Vision API downtime (fallback is auto-approve).

---

## 7. Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| GPT-4o Vision outage blocks all completions | Auto-approve with `"Verified (AI unavailable)"` on any OpenAI exception |
| Large image uploads slow on mobile | Client-side resize to max 1024px using `canvas.toBlob()` before upload |
| Server memory pressure on Fly.io from large uploads | File size validation (400) happens before bytes are read into memory; client resize keeps uploads small in practice |
| Supabase Storage RLS misconfiguration | RLS policy created in migration SQL (not manual dashboard step); path-scoped to `user_id` prefix |
| Users submitting stock photos | Out of scope — the sarcasm is the deterrent |
| Storage orphan files on failed delete after rejection | Retry overwrites same path; non-destructive and self-healing |

---

## 8. File Manifest

### New files
| File | Purpose |
|------|---------|
| `backend/services/proof_service.py` | GPT-4o Vision verification logic (`ProofResult` dataclass + `verify_habit_proof` async function) |
| `frontend/src/components/checklist/ProofUploadModal.tsx` | Upload + verdict modal |
| `frontend/src/hooks/useProofSubmission.ts` | Proof submission state machine |
| `supabase/migrations/20260313000002_add_proof_fields.sql` | DB columns + Storage bucket creation + RLS policy |

### Modified files
| File | Change |
|------|--------|
| `backend/routers/completions.py` | Add `POST /completions/verify`; remove `POST /completions` |
| `backend/schemas/completions.py` | Add `proof_image_url: str \| None` and `proof_verdict: str \| None` to `CompletionResponse` |
| `frontend/src/components/checklist/ChecklistItem.tsx` | Replace checkbox toggle with camera button + `onProofRequest` prop |
| `frontend/src/components/checklist/DailyChecklist.tsx` | Manage `proofModalHabitId` state; render `ProofUploadModal`; expose `addCompletion` from `useCompletions` |
| `frontend/src/hooks/useCompletions.ts` | Remove `toggle()` (old checkbox path); add `addCompletion(c: HabitCompletion)` setter |
| `frontend/src/lib/api/completions.ts` | Remove `completionsApi.create()` (old `POST /completions`); add standalone `verifyHabitCompletion()` using raw `fetch` (not `apiFetch`) and `ProofRejectedError` class |
| `frontend/src/types/completions.ts` | Add `proof_image_url?: string` and `proof_verdict?: string` to `HabitCompletion` type |
