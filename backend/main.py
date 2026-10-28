"""
RADIX SkillSync — AI Career Intelligence Platform Backend
Built with FastAPI for RADIX Talent Match Hackathon
Provides:
  1. GET  /api/health
  2. POST /api/extract/jd
  3. POST /api/extract/resume
  4. POST /api/talent-check
  5. POST /api/skill-match
"""

import json
import os
import re
import xml.etree.ElementTree as ET
import zipfile
from io import BytesIO
from typing import Any, Dict, List, Optional

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pypdf

app = FastAPI(
    title="RADIX SkillSync AI Engine",
    description="Backend API service for JD analytics, resume extraction, company talent check, and job matching.",
    version="1.0.0",
)

# Enable CORS for frontend Vite dev server and production origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 12 RADIX Competency Categories
RADIX_CATEGORIES = {
    "COD": {"name": "Coding", "keywords": ["python", "java", "c++", "c#", "coding", "syntax", "array", "string", "oop", "clean code", "programming"]},
    "DSA": {"name": "Data Structures & Algorithms", "keywords": ["dsa", "algorithms", "data structures", "trees", "graphs", "dynamic programming", "hash map", "sorting", "searching", "complexity", "big o"]},
    "OOD": {"name": "Object-Oriented Design", "keywords": ["ood", "oop", "object-oriented", "design patterns", "solid principles", "inheritance", "polymorphism", "abstraction"]},
    "APTI": {"name": "Aptitude", "keywords": ["aptitude", "quantitative", "logical reasoning", "probability", "statistics", "problem solving", "analytical"]},
    "COMM": {"name": "Communication", "keywords": ["communication", "presentation", "stakeholder", "written", "verbal", "teamwork", "collaboration", "client"]},
    "AI": {"name": "AI & Machine Learning", "keywords": ["machine learning", "deep learning", "ai", "neural network", "regression", "classification", "nlp", "llm", "tensorflow", "pytorch", "scikit-learn"]},
    "CLOUD": {"name": "Cloud & DevOps", "keywords": ["cloud", "aws", "azure", "gcp", "docker", "kubernetes", "ci/cd", "devops", "microservices", "terraform"]},
    "SQL": {"name": "SQL & Databases", "keywords": ["sql", "mysql", "postgresql", "oracle", "database", "query", "indexing", "relational", "nosql", "mongodb", "schema"]},
    "SWE": {"name": "Software Engineering", "keywords": ["software engineering", "sdlc", "agile", "scrum", "unit testing", "code review", "git", "ci/cd", "technical debt"]},
    "SYSD": {"name": "System Design", "keywords": ["system design", "distributed systems", "scalability", "caching", "load balancing", "high availability", "sharding", "fault tolerance"]},
    "NETW": {"name": "Networking", "keywords": ["networking", "tcp/ip", "udp", "http", "https", "dns", "rest api", "socket", "latency", "protocol"]},
    "OS": {"name": "Operating Systems", "keywords": ["operating system", "linux", "unix", "concurrency", "threads", "processes", "memory management", "virtual memory", "bash", "shell"]},
}

# Load company expectations dataset
BENCHMARKS_FILE = os.path.join(os.path.dirname(__file__), "..", "talent_check_company_skillsets.json")

def load_company_benchmarks() -> Dict[str, Any]:
    if os.path.exists(BENCHMARKS_FILE):
        try:
            with open(BENCHMARKS_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass
    # Default fallback benchmarks
    return {
        "Google LLC": {
            "skillset_expectations": [
                {"category_code": "DSA", "required_level": 9, "weight": 1.2, "importance": "critical"},
                {"category_code": "COD", "required_level": 9, "weight": 1.2, "importance": "critical"},
                {"category_code": "SYSD", "required_level": 8, "weight": 1.1, "importance": "high"},
                {"category_code": "SWE", "required_level": 8, "weight": 1.0, "importance": "high"},
                {"category_code": "AI", "required_level": 8, "weight": 1.0, "importance": "high"},
                {"category_code": "CLOUD", "required_level": 8, "weight": 0.9, "importance": "medium"},
                {"category_code": "OOD", "required_level": 8, "weight": 0.9, "importance": "medium"},
                {"category_code": "OS", "required_level": 7, "weight": 0.9, "importance": "medium"},
                {"category_code": "NETW", "required_level": 7, "weight": 0.8, "importance": "medium"},
                {"category_code": "SQL", "required_level": 7, "weight": 0.8, "importance": "medium"},
                {"category_code": "COMM", "required_level": 8, "weight": 1.0, "importance": "high"},
                {"category_code": "APTI", "required_level": 8, "weight": 0.8, "importance": "medium"},
            ]
        },
        "Microsoft Corporation": {
            "skillset_expectations": [
                {"category_code": "SWE", "required_level": 9, "weight": 1.2, "importance": "critical"},
                {"category_code": "COD", "required_level": 8, "weight": 1.1, "importance": "critical"},
                {"category_code": "CLOUD", "required_level": 9, "weight": 1.2, "importance": "critical"},
                {"category_code": "SYSD", "required_level": 8, "weight": 1.0, "importance": "high"},
                {"category_code": "DSA", "required_level": 8, "weight": 1.0, "importance": "high"},
                {"category_code": "SQL", "required_level": 8, "weight": 1.0, "importance": "high"},
                {"category_code": "OOD", "required_level": 8, "weight": 0.9, "importance": "high"},
                {"category_code": "AI", "required_level": 8, "weight": 0.9, "importance": "medium"},
                {"category_code": "COMM", "required_level": 8, "weight": 1.0, "importance": "high"},
                {"category_code": "OS", "required_level": 7, "weight": 0.8, "importance": "medium"},
                {"category_code": "NETW", "required_level": 7, "weight": 0.8, "importance": "medium"},
                {"category_code": "APTI", "required_level": 7, "weight": 0.7, "importance": "medium"},
            ]
        },
        "Oracle Financial Services Software": {
            "skillset_expectations": [
                {"category_code": "SQL", "required_level": 9, "weight": 1.3, "importance": "critical"},
                {"category_code": "SWE", "required_level": 8, "weight": 1.1, "importance": "high"},
                {"category_code": "COD", "required_level": 7, "weight": 1.0, "importance": "high"},
                {"category_code": "OS", "required_level": 8, "weight": 1.1, "importance": "high"},
                {"category_code": "NETW", "required_level": 7, "weight": 1.0, "importance": "medium"},
                {"category_code": "COMM", "required_level": 8, "weight": 1.1, "importance": "high"},
                {"category_code": "APTI", "required_level": 8, "weight": 1.0, "importance": "high"},
                {"category_code": "OOD", "required_level": 7, "weight": 0.8, "importance": "medium"},
                {"category_code": "DSA", "required_level": 7, "weight": 0.8, "importance": "medium"},
                {"category_code": "CLOUD", "required_level": 6, "weight": 0.7, "importance": "medium"},
                {"category_code": "SYSD", "required_level": 6, "weight": 0.7, "importance": "medium"},
                {"category_code": "AI", "required_level": 5, "weight": 0.5, "importance": "low"},
            ]
        }
    }


def extract_text_from_pdf(content: bytes) -> str:
    reader = pypdf.PdfReader(BytesIO(content))
    text_parts = []
    for page in reader.pages:
        txt = page.extract_text()
        if txt:
            text_parts.append(txt)
    return "\n".join(text_parts)


def extract_text_from_docx(content: bytes) -> str:
    try:
        with zipfile.ZipFile(BytesIO(content)) as docx:
            xml_content = docx.read("word/document.xml")
            tree = ET.fromstring(xml_content)
            # Find all paragraph and text nodes
            namespaces = {"w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main"}
            paragraphs = []
            for p in tree.iterfind(".//w:p", namespaces):
                texts = [node.text for node in p.iterfind(".//w:t", namespaces) if node.text]
                if texts:
                    paragraphs.append("".join(texts))
            return "\n".join(paragraphs)
    except Exception as e:
        return f"DOCX parsing fallback: {str(e)}"


# Pydantic Request Models
class JDTextRequest(BaseModel):
    text: str

class TalentCheckRequest(BaseModel):
    profile: Dict[str, Any]
    company: str

class SkillMatchRequest(BaseModel):
    profile: Dict[str, Any]
    job: Dict[str, Any]


@app.get("/api/health")
def health_check():
    return {
        "status": "online",
        "service": "RADIX SkillSync AI Backend",
        "version": "1.0.0",
        "engine": "FastAPI + Pydantic + PyPDF",
        "modules_supported": [
            "JD Analytics (Module 1)",
            "Resume Parsing (Module 2)",
            "Talent Check (Module 4)",
            "Skill Matching (Module 5)"
        ]
    }


@app.post("/api/extract/jd")
async def extract_job_description(
    file: Optional[UploadFile] = File(None),
    payload: Optional[JDTextRequest] = None,
):
    raw_text = ""
    file_name = "pasted_text.txt"

    if file:
        file_name = file.filename
        content = await file.read()
        if file_name.lower().endswith(".pdf"):
            raw_text = extract_text_from_pdf(content)
        elif file_name.lower().endswith(".docx") or file_name.lower().endswith(".doc"):
            raw_text = extract_text_from_docx(content)
        else:
            raw_text = content.decode("utf-8", errors="ignore")
    elif payload and payload.text:
        raw_text = payload.text
    else:
        raise HTTPException(status_code=400, detail="Provide either a file or text payload.")

    # Rule-based extraction & categorization across 12 RADIX categories
    lower_text = raw_text.lower()

    detected_skills = []
    for cat_code, cat_meta in RADIX_CATEGORIES.items():
        for kw in cat_meta["keywords"]:
            if re.search(r"\b" + re.escape(kw) + r"\b", lower_text):
                # Find matching context sentence
                sentences = [s.strip() for s in re.split(r"[.\n]", raw_text) if kw in s.lower()]
                evidence = sentences[0] if sentences else f"Mentions requirement for {kw}"
                detected_skills.append({
                    "skill_name": kw.title() if len(kw) > 3 else kw.upper(),
                    "category_code": cat_code,
                    "evidence": evidence[:160],
                    "confidence": "high" if len(sentences) > 1 else "medium",
                })
                break

    # Determine company/role heuristics
    company = "Company"
    role = "Software Role"
    if "google" in lower_text:
        company = "Google LLC"
    elif "microsoft" in lower_text:
        company = "Microsoft Corporation"
    elif "oracle" in lower_text:
        company = "Oracle Financial Services Software"

    if "data scientist" in lower_text:
        role = "Data Scientist"
    elif "data analyst" in lower_text:
        role = "Data Analyst"
    elif "support" in lower_text:
        role = "Application Support Analyst"
    elif "software engineer" in lower_text or "swe" in lower_text or "sde" in lower_text:
        role = "Software Engineer"

    # Responsibilities & Requirements heuristics
    lines = [line.strip("-•* ") for line in raw_text.splitlines() if len(line.strip()) > 20]
    responsibilities = lines[1:5] if len(lines) >= 5 else lines[:3]
    requirements = lines[5:10] if len(lines) >= 10 else lines[3:7]

    return {
        "status": "success",
        "company": company,
        "role": role,
        "location": "Bengaluru / Hyderabad / Remote",
        "source_file": file_name,
        "skills": detected_skills,
        "responsibilities": responsibilities,
        "requirements": requirements,
        "raw_text_length": len(raw_text),
    }


@app.post("/api/extract/resume")
async def extract_resume(file: UploadFile = File(...)):
    file_name = file.filename
    content = await file.read()
    raw_text = ""

    if file_name.lower().endswith(".pdf"):
        raw_text = extract_text_from_pdf(content)
    elif file_name.lower().endswith(".docx") or file_name.lower().endswith(".doc"):
        raw_text = extract_text_from_docx(content)
    else:
        raw_text = content.decode("utf-8", errors="ignore")

    lower = raw_text.lower()

    # Heuristic identity extraction
    lines = [l.strip() for l in raw_text.splitlines() if l.strip()]
    candidate_name = lines[0] if lines else "Extracted Candidate"
    # Basic email regex
    email_match = re.search(r"[\w\.-]+@[\w\.-]+\.\w+", raw_text)
    email = email_match.group(0) if email_match else "candidate@example.com"

    # Identify candidate skills against 12 categories
    extracted_skills = []
    category_levels = {code: 5 for code in RADIX_CATEGORIES.keys()}

    for cat_code, cat_meta in RADIX_CATEGORIES.items():
        cat_matches = []
        for kw in cat_meta["keywords"]:
            if re.search(r"\b" + re.escape(kw) + r"\b", lower):
                cat_matches.append(kw)
        if cat_matches:
            # Calibrate level based on occurrences and keyword depth
            level = min(10, 5 + len(cat_matches))
            category_levels[cat_code] = level
            # Create extracted skill item
            sentences = [s.strip() for s in re.split(r"[.\n]", raw_text) if cat_matches[0] in s.lower()]
            extracted_skills.append({
                "skill_name": cat_matches[0].title() if len(cat_matches[0]) > 3 else cat_matches[0].upper(),
                "category_code": cat_code,
                "level": level,
                "evidence": sentences[0][:150] if sentences else f"Demonstrated proficiency in {', '.join(cat_matches[:3])}",
                "confidence": "high" if len(cat_matches) >= 2 else "medium",
            })

    return {
        "status": "success",
        "name": candidate_name,
        "email": email,
        "education": "B.Tech Computer Science & Engineering",
        "fileName": file_name,
        "skills": extracted_skills,
        "categories": category_levels,
    }


@app.post("/api/talent-check")
def run_talent_check(req: TalentCheckRequest):
    benchmarks_data = load_company_benchmarks()
    company_data = benchmarks_data.get(req.company)

    if not company_data:
        # Fuzzy fallback match
        requested_company = req.company.strip().lower()

        for comp_name, data in benchmarks_data.items():
            if (
                requested_company in comp_name.lower()
                or comp_name.lower() in requested_company
            ):
                company_data = data
                break

    if not company_data:
        raise HTTPException(
            status_code=404,
            detail=f"Company '{req.company}' not found in benchmark expectations."
        )

    expectations = company_data.get("skillset_expectations", [])
    candidate_profile = req.profile
    candidate_categories = candidate_profile.get("categories", {})

    total_weighted_ratio = 0.0
    total_weights = 0.0

    category_scores = []
    strengths = []
    gaps = []
    skillset_gap = []

    for exp in expectations:
        code = exp["category_code"]
        name = exp.get(
            "category_name",
            RADIX_CATEGORIES.get(code, {}).get("name", code)
        )
        required = exp["required_level"]
        weight = exp.get("weight", 1.0)
        importance = exp.get("importance", "medium")

        candidate_level = candidate_categories.get(code, 6)

        # Keep levels inside the agreed 1-10 range.
        candidate_level = max(1, min(10, float(candidate_level)))
        required = max(1, min(10, float(required)))

        ratio = min(1.0, candidate_level / required)

        total_weighted_ratio += ratio * weight
        total_weights += weight

        diff = candidate_level - required
        meets_expectation = diff >= 0

        cat_info = {
            "code": code,
            "name": name,
            "candidate_level": candidate_level,
            "required_level": required,
            "importance": importance,
            "weight": weight,
            "diff": diff,
            "meets_expectation": meets_expectation,
        }

        category_scores.append(cat_info)

        if meets_expectation:
            strengths.append(cat_info)
        else:
            gaps.append(cat_info)

        # Role 4 contract:
        # gap is true when the candidate is below the required level.
        skillset_gap.append({
            "category_code": code,
            "required_level": required,
            "candidate_level": candidate_level,
            "gap": not meets_expectation,
        })

    # Prioritize the largest weighted shortfalls first.
    gaps.sort(
        key=lambda item: item["weight"] * abs(item["diff"]),
        reverse=True
    )

    readiness_score = (
        round((total_weighted_ratio / total_weights) * 100)
        if total_weights > 0
        else 0
    )

    return {
        # Agreed Role 4 contract
        "company": company_data.get("company_name", req.company),
        "skillset_gap": skillset_gap,
        "readiness_score": readiness_score,

        # Legacy fields retained to reduce frontend breakage
        "status": "success",
        "score": readiness_score,
        "candidate_name": candidate_profile.get("name", "Candidate"),
        "category_scores": category_scores,
        "strengths": strengths,
        "gaps": gaps,
        "prioritized_actions": [
            (
                f"Close top gap in {item['name']} "
                f"(Current: {item['candidate_level']}/10 "
                f"vs Required: {item['required_level']}/10)"
            )
            for item in gaps[:3]
        ],
    }

@app.post("/api/skill-match")
def run_skill_match(req: SkillMatchRequest):
    profile = req.profile
    job = req.job

    profile_skills = profile.get("skills", [])
    profile_categories = profile.get("categories", {})
    job_skills = job.get("skills", [])

    matched_skills = []
    partial_skills = []
    missing_skills = []

    # Map profile skill names lowercase
    profile_skills_map = {s.get("skill_name", "").lower(): s for s in profile_skills}

    for req_skill in job_skills:
        req_name = req_skill.get("skill_name", "")
        req_code = req_skill.get("category_code", "")
        req_lower = req_name.lower()

        # Check for direct match
        direct = None
        for p_name, p_skill in profile_skills_map.items():
            if p_name in req_lower or req_lower in p_name:
                direct = p_skill
                break

        if direct:
            matched_skills.append({
                "name": req_name,
                "category": req_code,
                "importance": "critical" if req_skill.get("confidence") == "high" else "high",
                "evidence": direct.get("evidence", "Verified in candidate profile projects and experience."),
                "candidate_level": direct.get("level", 8),
            })
        else:
            # Check for partial category transfer
            cat_level = profile_categories.get(req_code, 5)
            if cat_level >= 7:
                partial_skills.append({
                    "name": req_name,
                    "category": req_code,
                    "foundation": f"Proficient in category {req_code} (Level {cat_level}/10); transferable with minor syntax ramp-up.",
                    "effort": "2-3 weeks",
                })
            else:
                missing_skills.append({
                    "name": req_name,
                    "category": req_code,
                    "recommendation": f"Prioritize fundamental coursework and project application for {req_name}.",
                    "priority": "High Priority",
                })

    total_reqs = len(job_skills)
    match_score = round(((len(matched_skills) * 1.0 + len(partial_skills) * 0.55) / max(1, total_reqs)) * 100)
    match_score = min(100, max(0, match_score))

    return {
        "status": "success",
        "score": match_score,
        "matched_skills": matched_skills,
        "partial_skills": partial_skills,
        "missing_skills": missing_skills,
        "total_requirements": total_reqs,
        "gap_summary": f"{len(missing_skills)} critical skill gaps identified across {job.get('role', 'Role')} requirements.",
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
