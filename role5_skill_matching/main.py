from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from thefuzz import fuzz

app = FastAPI(title="RADIX Role 5: Skill Matching")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins (good for local testing)
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods (GET, POST, etc.)
    allow_headers=["*"],  # Allows all headers
)

# 1. THE SHARED DATA CONTRACT
class Skill(BaseModel):
    skill_name: str
    category_code: str  
    evidence: Optional[str] = None
    confidence: Optional[str] = None

class ExtractedJD(BaseModel):
    source_type: str
    source_file: str
    company: str
    role: str
    skills: List[Skill]

class CandidateProfile(BaseModel):
    name: str
    email: str
    skills: List[Skill]

class MatchRequest(BaseModel):
    jd: ExtractedJD
    candidate: CandidateProfile

# 2. THE FUZZY MATCHING LOGIC
def calculate_match(jd_skills: List[Skill], candidate_skills: List[Skill], threshold: int = 80):
    # 1. Deduplicate JD skills while preserving original Skill objects
    seen_jd = set()
    unique_jd_skills = []
    for s in jd_skills:
        norm = s.skill_name.lower().strip()
        if norm and norm not in seen_jd:
            seen_jd.add(norm)
            unique_jd_skills.append(s)

    # 2. Map normalized candidate skill names to original strings
    candidate_skill_map = {}
    for s in candidate_skills:
        norm = s.skill_name.lower().strip()
        if norm and norm not in candidate_skill_map:
            candidate_skill_map[norm] = s.skill_name

    matched_skills = []
    missing_skills = []

    for req_skill in unique_jd_skills:
        req_name = req_skill.skill_name.lower().strip()
        best_cand_name = None
        best_score = 0

        # Evaluate ALL candidate skills to find the BEST score
        for cand_norm, cand_original in candidate_skill_map.items():
            if req_name == cand_norm:
                similarity = 100
            else:
                # Use token_sort_ratio to avoid partial substring traps (e.g. 'c' matching 'css')
                similarity = fuzz.token_sort_ratio(req_name, cand_norm)

            if similarity > best_score:
                best_score = similarity
                best_cand_name = cand_original

        if best_score >= threshold and best_cand_name is not None:
            matched_skills.append({
                "jd_skill": req_skill.skill_name,
                "candidate_skill": best_cand_name,
                "category": req_skill.category_code,
                "match_confidence": best_score
            })
        else:
            missing_skills.append({
                "skill_name": req_skill.skill_name,
                "category": req_skill.category_code
            })

    total_required = len(unique_jd_skills)
    score = (len(matched_skills) / total_required * 100) if total_required > 0 else 0

    return {
        "match_score": round(score, 1),
        "matched_skills": matched_skills,
        "missing_skills": missing_skills
    }

# 3. THE API ENDPOINT
@app.post("/api/match")
async def process_match(request: MatchRequest):
    result = calculate_match(request.jd.skills, request.candidate.skills)
    return {
        "jd_source_file": request.jd.source_file,
        "match_score": result["match_score"],
        "matched_skills": result["matched_skills"],
        "missing_skills": result["missing_skills"]
    }