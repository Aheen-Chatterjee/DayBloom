"""GPT-4o Vision service for habit proof photo verification."""
import base64
import json
import logging
from dataclasses import dataclass
from openai import OpenAI
from config import settings

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = (
    "You are a strict but sarcastic habit verification AI. You evaluate photographic proof "
    "that a user has completed their daily habit. Be harsh but fair. If the proof is clearly "
    "valid, approve it. If it's ambiguous, reject it with maximum sass."
)

USER_TEMPLATE = (
    'Habit: "{name}"\n'
    'Description: "{description}"\n\n'
    "Does this image provide credible evidence that this habit was completed today?\n"
    'Respond ONLY with valid JSON: {{"approved": boolean, "verdict": "string"}}\n'
    "- If approved: verdict is a single dry sentence of acknowledgment.\n"
    "- If rejected: verdict is 1-2 sentences of maximum sarcasm, calling out specifically "
    "why the photo doesn't count."
)


@dataclass
class ProofResult:
    approved: bool
    verdict: str


FALLBACK_RESULT = ProofResult(approved=True, verdict="Verified (AI unavailable)")


async def verify_habit_proof(
    habit_name: str,
    habit_description: str,
    image_bytes: bytes,
    image_media_type: str,
) -> ProofResult:
    """Verify habit proof image using GPT-4o Vision.

    Returns FALLBACK_RESULT (auto-approve) if OpenAI is unavailable or returns
    unparseable output. Never raises — the app must not block completions due to
    an AI outage.
    """
    if not settings.openai_api:
        logger.warning("OPENAI_API not set — auto-approving proof")
        return FALLBACK_RESULT

    client = OpenAI(api_key=settings.openai_api)

    try:
        b64 = base64.standard_b64encode(image_bytes).decode("utf-8")
        description = habit_description or "No description provided"

        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": USER_TEMPLATE.format(
                                name=habit_name,
                                description=description,
                            ),
                        },
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:{image_media_type};base64,{b64}",
                                "detail": "low",
                            },
                        },
                    ],
                },
            ],
            temperature=0.8,
            max_tokens=150,
        )

        raw = response.choices[0].message.content.strip()
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]

        data = json.loads(raw)
        return ProofResult(
            approved=bool(data.get("approved", False)),
            verdict=str(data.get("verdict", "Verification complete.")),
        )
    except Exception as exc:
        logger.error("Proof verification failed: %s", exc)
        return FALLBACK_RESULT
