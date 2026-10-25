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
    matched_skills = []
    missing_skills = []
    
    candidate_skill_names = [s.skill_name.lower() for s in candidate_skills]

    for req_skill in jd_skills:
        req_name = req_skill.skill_name.lower()
        is_matched = False
        
        for cand_name in candidate_skill_names:
            similarity = fuzz.partial_ratio(req_name, cand_name)
            
            if similarity >= threshold:
                matched_skills.append({
                    "jd_skill": req_skill.skill_name,
                    "candidate_skill": cand_name.title(),
                    "category": req_skill.category_code,
                    "match_confidence": similarity
                })
                is_matched = True
                break
                
        if not is_matched:
            missing_skills.append({
                "skill_name": req_skill.skill_name,
                "category": req_skill.category_code
            })

    total_required = len(jd_skills)
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