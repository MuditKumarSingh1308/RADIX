// Centralized API client for RADIX SkillSync
// Connects to Python FastAPI backend with graceful fallback to client-side demo mode.

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

class ApiClient {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
    this.isBackendAvailable = false;
    this.lastChecked = null;
  }

  async checkHealth() {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      const res = await fetch(`${this.baseUrl}/api/health`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        this.isBackendAvailable = true;
        this.lastChecked = new Date();
        return { isOnline: true, url: this.baseUrl };
      }
      this.isBackendAvailable = false;
      return { isOnline: false, url: this.baseUrl, error: `Status ${res.status}` };
    } catch (err) {
      this.isBackendAvailable = false;
      return { isOnline: false, url: this.baseUrl, error: err.message };
    }
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

    // Backend not reachable - return clear demo mode signal
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

  async runSkillMatch(candidateProfile, jobDescription) {
    const health = await this.checkHealth();
    if (health.isOnline) {
      const res = await fetch(`${this.baseUrl}/api/skill-match`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile: candidateProfile, job: jobDescription }),
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
