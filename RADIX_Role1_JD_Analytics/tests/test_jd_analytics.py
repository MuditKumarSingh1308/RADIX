import json
import os
import sys
from pathlib import Path

from fastapi.testclient import TestClient

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import main

client = TestClient(main.app)


def sample_result():
    return json.dumps({
        "source_type": "jd",
        "source_file": "Example.pdf",
        "company": "Example Company",
        "role": "Software Engineer",
        "skills": [{
            "skill_name": "Python",
            "category_code": "COD",
            "evidence": "Python experience required.",
            "confidence": "high",
        }],
        "responsibilities": ["Build software."],
        "requirements": ["Python experience."],
        "location": "Remote",
    })


def test_llm_result_validates_contract():
    result = main._parse_and_validate_llm_json(sample_result(), "uploaded.pdf")
    assert result["source_type"] == "jd"
    assert result["source_file"] == "uploaded.pdf"
    assert result["skills"][0]["category_code"] == "COD"


def test_invalid_category_is_rejected():
    payload = json.loads(sample_result())
    payload["skills"][0]["category_code"] = "WRONG"
    try:
        main._parse_and_validate_llm_json(json.dumps(payload), "uploaded.pdf")
    except ValueError as exc:
        assert "invalid category code" in str(exc)
    else:
        raise AssertionError("Invalid category should be rejected")


def test_text_endpoint_without_keys_uses_fallback(monkeypatch):
    monkeypatch.delenv("GEMINI_API_KEY", raising=False)
    monkeypatch.delenv("OPENROUTER_API_KEY", raising=False)
    monkeypatch.delenv("OPENAI_API_KEY", raising=False)
    response = client.post(
        "/api/extract/jd",
        json={"text": "Google LLC is hiring a Software Engineer. Python and data structures are required."},
    )
    assert response.status_code == 200, response.text
    result = response.json()
    assert result["source_type"] == "jd"
    assert result["source_file"] == "pasted_text.txt"
    assert result["status"] == "success"
    assert result["skills"]


def test_unsupported_file_type_is_rejected():
    response = client.post(
        "/api/extract/jd",
        files={"file": ("job.txt", b"Python required", "text/plain")},
    )
    assert response.status_code == 415
