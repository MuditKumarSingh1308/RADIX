// Centralized API client for RADIX SkillSync
// Connects to Python FastAPI backend (Role 5 Skill Matching, JD Analytics, Resume Parser)

const API_BASE_URL = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) || 'http://127.0.0.1:8000';

class ApiClient {
  constructor(baseUrl) {
    this.baseUrl = baseUrl.replace(/\/+$/, '');
    this.isBackendAvailable = false;
    this.lastChecked = null;
  }

  async checkHealth() {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      const res = await fetch(`${this.baseUrl}/docs`, {
        method: 'HEAD',
        signal: controller.signal,
      }).catch(() => fetch(`${this.baseUrl}/api/health`, { signal: controller.signal }));
      clearTimeout(timeoutId);

      if (res && (res.ok || res.status === 404)) {
        this.isBackendAvailable = true;
        this.lastChecked = new Date();
        return { isOnline: true, url: this.baseUrl };
      }
      this.isBackendAvailable = false;
      return { isOnline: false, url: this.baseUrl, error: `Status ${res?.status || 'Unknown'}` };
    } catch (err) {
      this.isBackendAvailable = false;
      return { isOnline: false, url: this.baseUrl, error: err.message };
    }
  }

  formatSkill(skill) {
    if (!skill) return null;
    if (typeof skill === 'string') {
      const trimmed = skill.trim();
      return trimmed
        ? { skill_name: trimmed, category_code: 'OTHER', evidence: null, confidence: null }
        : null;
    }
    const name = String(skill.skill_name || skill.name || '').trim();
    if (!name) return null;

    return {
      skill_name: name,
      category_code: String(skill.category_code || skill.category || 'OTHER').trim(),
      evidence: skill.evidence ? String(skill.evidence).trim() : null,
      confidence: skill.confidence ? String(skill.confidence).trim() : null,
    };
  }

  /**
   * Constructs a strict MatchRequest matching Pydantic contract in role5_skill_matching/main.py:
   * class Skill(BaseModel):
   *     skill_name: str
   *     category_code: str
   *     evidence: Optional[str] = None
   *     confidence: Optional[str] = None
   * class ExtractedJD(BaseModel):
   *     source_type: str
   *     source_file: str
   *     company: str
   *     role: str
   *     skills: List[Skill]
   * class CandidateProfile(BaseModel):
   *     name: str
   *     email: str
   *     skills: List[Skill]
   */
  buildMatchRequest(candidateProfile, jobDescription) {
    const jdSkills = (jobDescription?.skills || [])
      .map((s) => this.formatSkill(s))
      .filter(Boolean);

    const candSkills = (candidateProfile?.skills || [])
      .map((s) => this.formatSkill(s))
      .filter(Boolean);

    return {
      jd: {
        source_type: String(jobDescription?.source_type || jobDescription?.fileType || 'PDF / DOCX'),
        source_file: String(
          jobDescription?.source_file ||
          jobDescription?.sourceFile ||
          `${jobDescription?.company || 'Target'} - ${jobDescription?.role || 'Job'}.docx`
        ),
        company: String(jobDescription?.company || 'Company'),
        role: String(jobDescription?.role || 'Role'),
        skills: jdSkills,
      },
      candidate: {
        name: String(candidateProfile?.name || 'Candidate'),
        email: String(candidateProfile?.email || 'candidate@example.com'),
        skills: candSkills,
      },
    };
  }

  /**
   * Calls POST /api/match on role5_skill_matching FastAPI backend
   * Returns: { jd_source_file, match_score, matched_skills, missing_skills }
   */
  async matchSkills(candidateProfile, jobDescription) {
    const payload = this.buildMatchRequest(candidateProfile, jobDescription);

    let res;
    try {
      res = await fetch(`${this.baseUrl}/api/match`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
      });
    } catch (err) {
      throw new Error(
        `Unable to connect to Skill Matching backend at ${this.baseUrl}/api/match (${err.message}). ` +
        `Please ensure the FastAPI service is running: "uvicorn role5_skill_matching.main:app --reload --port 8000".`,
        { cause: err }
      );
    }

    if (!res.ok) {
      let detail = `Status ${res.status}: ${res.statusText}`;
      try {
        const errorJson = await res.json();
        if (errorJson?.detail) {
          detail = typeof errorJson.detail === 'string'
            ? errorJson.detail
            : JSON.stringify(errorJson.detail);
        }
      } catch {
        const text = await res.text().catch(() => '');
        if (text) detail = text;
      }
      throw new Error(`Skill Matching API rejected request (${detail})`);
    }

    const data = await res.json();
    return {
      data,
      payload,
    };
  }

  async runSkillMatch(candidateProfile, jobDescription) {
    return this.matchSkills(candidateProfile, jobDescription);
  }

  async extractJobDescription(fileOrText, isFile = false) {
    const health = await this.checkHealth();
    if (health.isOnline) {
      if (isFile) {
        const formData = new FormData();
        formData.append('file', fileOrText);
        const res = await fetch(`${this.baseUrl}/api/extract/jd`, {
          method: 'POST',
          body: formData,
        });
        if (!res.ok) throw new Error(`Backend error: ${res.statusText}`);
        return { source: 'live_backend', data: await res.json() };
      } else {
        const res = await fetch(`${this.baseUrl}/api/extract/jd`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: fileOrText }),
        });
        if (!res.ok) throw new Error(`Backend error: ${res.statusText}`);
        return { source: 'live_backend', data: await res.json() };
      }
    }

    return {
      source: 'demo_mode',
      isDemo: true,
      data: null,
      message: 'Backend is offline. Using RADIX client-side demo analyzer.'
    };
  }

  async extractResume(file) {
    const health = await this.checkHealth();
    if (health.isOnline) {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch(`${this.baseUrl}/api/extract/resume`, {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error(`Backend error: ${res.statusText}`);
      return { source: 'live_backend', data: await res.json() };
    }

    return {
      source: 'demo_mode',
      isDemo: true,
      data: null,
      message: 'Backend is offline. Using RADIX client-side demo parser.'
    };
  }

  async runTalentCheck(candidateProfile, companyName) {
    const health = await this.checkHealth();
    if (health.isOnline) {
      const res = await fetch(`${this.baseUrl}/api/talent-check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile: candidateProfile, company: companyName }),
      });
      if (!res.ok) throw new Error(`Backend error: ${res.statusText}`);
      return { source: 'live_backend', data: await res.json() };
    }

    return {
      source: 'demo_mode',
      isDemo: true,
      data: null
    };
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
