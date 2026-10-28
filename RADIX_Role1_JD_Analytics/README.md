# RADIX Role 1 — JD Analytics (standalone)

This folder contains only the Role 1 job-description analytics service, separated from the other RADIX roles so it can be shared and integrated independently.

## What it does
- Accepts a PDF or DOCX job description, or pasted text.
- Extracts selectable PDF/DOCX text.
- Uses Gemini first, then OpenRouter, then direct OpenAI if configured.
- Uses a clearly labelled keyword fallback only when no provider key is configured.
- Validates skill objects against the RADIX category codes and the shared contract.
- Exposes `POST /api/extract/jd` and `GET /api/health`.

## Role 1 output contract
The shared fields expected by Role 5 are:
- `source_type`
- `source_file`
- `company`
- `role`
- `skills[]`, each with `skill_name`, `category_code`, `evidence`, `confidence`

For compatibility with the current working demo, the endpoint also returns `responsibilities`, `requirements`, `location`, `analysis_engine`, `status`, and `raw_text_length`. Role 5 can consume the `skills` list and required JD metadata.

## Run on Windows PowerShell
1. Open PowerShell in this folder.
2. Create and activate a virtual environment:

   ```powershell
   python -m venv .venv
   .\.venv\Scripts\Activate.ps1
   ```

3. Install dependencies:

   ```powershell
   python -m pip install -r requirements.txt
   ```

4. Copy `.env.example` to `.env`, then add your own API keys:

   ```powershell
   Copy-Item .env.example .env
   ```

   Open `.env` and fill in your keys. Do not send the `.env` file to teammates or commit it.

5. Start the server:

   ```powershell
   python -m uvicorn main:app --reload --port 8000
   ```

6. Open `http://127.0.0.1:8000/docs` and test `POST /api/extract/jd`.

## API
- Upload PDF/DOCX: `POST /api/extract/jd` with multipart form field named `file`.
- Paste text: `POST /api/extract/jd` with JSON body `{"text":"...job description text..."}`.
- Health check: `GET /api/health`.

## Important notes
- Do not share `.env` or API keys.
- Scanned image-only PDFs need OCR; OCR is not included.
- `GEMINI_MODEL` and `OPENROUTER_MODEL` must match models available to your API accounts.
- This folder is independent and does not modify the team's original repository.
