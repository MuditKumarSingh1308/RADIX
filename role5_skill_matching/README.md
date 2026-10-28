# ⚙️ Role 5: Skill Matching Engine (FastAPI)

This directory contains the core Skill Matching microservice for the RADIX platform. It acts as the algorithmic bridge between Role 1 (JD Analytics) and Role 2 (Resume Parsing), utilizing highly optimized fuzzy matching to calculate candidate fit scores and output rich JSON data for the React frontend.

## 🚀 Key Features
* **Advanced Fuzzy Matching:** Implements `thefuzz` using `token_sort_ratio` to accurately map candidate skills to JD requirements, avoiding partial substring traps (e.g., accidentally matching "C" with "CSS").
* **Input Deduplication:** Safely strips duplicate skills from both the JD and Resume payloads to prevent artificial score deflation or inflation.
* **Strict Data Contracts:** Uses `Pydantic` to enforce precise nested JSON validation between the frontend payload and backend processing.
* **Rich Data Output:** Returns comprehensive skill objects (including category codes, matched counterparts, and confidence scores) to populate the frontend UI's dynamic badges and gap recommendations.

## 🛠️ Tech Stack
* **Python 3**
* **FastAPI** (Web Framework)
* **Uvicorn** (ASGI Server)
* **Pydantic** (Data Validation)
* **thefuzz** (String Matching)

## 💻 Local Setup & Execution

### 1. Install Dependencies
Ensure you have Python installed, then install the required packages:
```bash
pip install fastapi uvicorn pydantic thefuzz