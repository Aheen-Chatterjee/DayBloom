"""Tests for proof_service.verify_habit_proof."""
import json
from unittest.mock import MagicMock, patch
import pytest
from services.proof_service import verify_habit_proof, FALLBACK_RESULT


@pytest.mark.asyncio
async def test_returns_fallback_when_no_api_key():
    with patch("services.proof_service.settings") as mock_settings:
        mock_settings.openai_api = ""
        result = await verify_habit_proof("Read", "Read 20 pages", b"fake", "image/jpeg")
    assert result.approved is True
    assert "unavailable" in result.verdict.lower()


@pytest.mark.asyncio
async def test_returns_approved_result_on_success():
    mock_response = MagicMock()
    mock_response.choices[0].message.content = json.dumps({
        "approved": True,
        "verdict": "Fine, that's a book. Barely.",
    })
    with patch("services.proof_service.settings") as mock_settings, \
         patch("services.proof_service.OpenAI") as mock_openai_cls:
        mock_settings.openai_api = "test-key"
        mock_openai_cls.return_value.chat.completions.create.return_value = mock_response
        result = await verify_habit_proof("Read", "Read 20 pages", b"fake", "image/jpeg")
    assert result.approved is True
    assert result.verdict == "Fine, that's a book. Barely."


@pytest.mark.asyncio
async def test_returns_rejected_result():
    mock_response = MagicMock()
    mock_response.choices[0].message.content = json.dumps({
        "approved": False,
        "verdict": "That's a donut, not a salad.",
    })
    with patch("services.proof_service.settings") as mock_settings, \
         patch("services.proof_service.OpenAI") as mock_openai_cls:
        mock_settings.openai_api = "test-key"
        mock_openai_cls.return_value.chat.completions.create.return_value = mock_response
        result = await verify_habit_proof("Eat Healthy", "Eat a salad", b"fake", "image/jpeg")
    assert result.approved is False
    assert result.verdict == "That's a donut, not a salad."


@pytest.mark.asyncio
async def test_returns_fallback_on_openai_exception():
    with patch("services.proof_service.settings") as mock_settings, \
         patch("services.proof_service.OpenAI") as mock_openai_cls:
        mock_settings.openai_api = "test-key"
        mock_openai_cls.return_value.chat.completions.create.side_effect = Exception("API down")
        result = await verify_habit_proof("Exercise", "Go for a run", b"fake", "image/jpeg")
    assert result.approved is True
    assert "unavailable" in result.verdict.lower()


@pytest.mark.asyncio
async def test_returns_fallback_on_invalid_json():
    mock_response = MagicMock()
    mock_response.choices[0].message.content = "not json"
    with patch("services.proof_service.settings") as mock_settings, \
         patch("services.proof_service.OpenAI") as mock_openai_cls:
        mock_settings.openai_api = "test-key"
        mock_openai_cls.return_value.chat.completions.create.return_value = mock_response
        result = await verify_habit_proof("Read", "Read 20 pages", b"fake", "image/jpeg")
    assert result.approved is True
