import { useState, useRef } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Bookmark,
  Sparkles,
  Printer,
  Target
} from 'lucide-react';
import { useApp } from '../hooks/useApp';
import { matchService } from '../services/matchService';
import Card from '../components/ui/Card';
import ScoreRing from '../components/ui/ScoreRing';
import { RADIX_CATEGORIES } from '../lib/radixData';

export default function SkillMatchingPage() {
  const { activeCandidate, candidates, switchActiveCandidate, jobs, selectedJob, setSelectedJob, addToast } = useApp();

  const [activeTab, setActiveTab] = useState('all');
  const [isSaving, setIsSaving] = useState(false);
  const prioritiesRef = useRef(null);

  const currentJob = selectedJob || jobs[0];
  const matchResult = (activeCandidate && currentJob)
    ? matchService.calculateMatch(activeCandidate, currentJob)
    : null;

  if (!matchResult || !activeCandidate) {
    return (
      <div style={{ padding: '60px', textAlign: 'center' }}>
        <p>Loading skill match report...</p>
      </div>
    );
  }

  const handleSaveReport = async () => {
    setIsSaving(true);
    try {
      await matchService.saveReport({
        type: 'skill_match',
        title: `Skill Match — ${matchResult.jobTitle} at ${matchResult.company}`,
        ...matchResult,
      });
      addToast('Skill match report saved to Saved Reports!', 'success');
    } catch (err) {
      addToast(`Error saving report: ${err.message}`, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleScrollToPriorities = () => {
    prioritiesRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-primary)' }}>
            Skill Matching Report (Module 5)
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Compare candidate capabilities against specific job requirements with evidence-backed gap analysis.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={handlePrint} className="btn btn-outline">
            <Printer size={15} />
            <span>Print Report</span>
          </button>
          <button onClick={handleScrollToPriorities} className="btn btn-secondary">
            <Target size={15} />
            <span>View Priorities</span>
          </button>
          <button onClick={handleSaveReport} disabled={isSaving} className="btn btn-primary">
            <Bookmark size={15} />
            <span>{isSaving ? 'Saving...' : 'Save Report'}</span>
          </button>
        </div>
      </div>

      {/* Selectors Bar: Candidate & Target Job */}
      <div
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: '16px 20px',
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '20px',
        }}
      >
        <div>
          <label className="form-label">Active Candidate</label>
          <select
            className="form-select"
            value={activeCandidate.id}
            onChange={(e) => switchActiveCandidate(e.target.value)}
          >
            {candidates.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} — {c.fitSummary}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="form-label">Target Job Description (Hackathon Sample)</label>
          <select
            className="form-select"
            value={currentJob.id}
            onChange={(e) => {
              const found = jobs.find((j) => j.id === e.target.value);
              if (found) setSelectedJob(found);
            }}
          >
            {jobs.map((j) => (
              <option key={j.id} value={j.id}>
                {j.company} — {j.role} ({j.ctc})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Hero Match Score Summary Card */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(21, 31, 51, 0.95) 0%, rgba(27, 38, 64, 0.9) 100%)',
          border: '1px solid var(--border-medium)',
          borderRadius: 'var(--radius-xl)',
          padding: '28px 36px',
          display: 'grid',
          gridTemplateColumns: '220px 1fr',
          gap: '32px',
          alignItems: 'center',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <ScoreRing
            score={matchResult.matchScore}
            size={160}
            strokeWidth={14}
            sublabel="/ 100 Match"
            color={matchResult.ratingColor}
            gradientId="match-score-grad"
          />
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span className="badge badge-primary">{matchResult.company}</span>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{matchResult.location} · {matchResult.ctc}</span>
          </div>

          <h2 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '8px' }}>
            {matchResult.jobTitle}
          </h2>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: 'var(--radius-full)', background: `${matchResult.ratingColor}15`, border: `1px solid ${matchResult.ratingColor}40`, color: matchResult.ratingColor, fontSize: '12px', fontWeight: '700', marginBottom: '12px' }}>
            <Sparkles size={13} />
            <span>{matchResult.fitRating}</span>
          </div>

          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '16px' }}>
            {matchResult.summary}
          </p>

          <div style={{ display: 'flex', gap: '20px', fontSize: '12px', borderTop: '1px solid var(--border-subtle)', paddingTop: '12px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#35D49A', fontWeight: '600' }}>
              <CheckCircle2 size={15} />
              {matchResult.matchedCount} Matched Skills
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#45D6FF', fontWeight: '600' }}>
              <HelpCircle size={15} />
              {matchResult.partialCount} Related Foundations
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#F4BE5E', fontWeight: '600' }}>
              <AlertCircle size={15} />
              {matchResult.missingCount} Missing Competencies
            </span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border-subtle)', gap: '12px' }}>
        {[
          { id: 'all', label: `All Requirements (${matchResult.totalCount})` },
          { id: 'matched', label: `Verified Matched (${matchResult.matchedCount})` },
          { id: 'partial', label: `Related Foundations (${matchResult.partialCount})` },
          { id: 'missing', label: `Skill Gaps (${matchResult.missingCount})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === tab.id ? '2px solid var(--accent-cyan)' : '2px solid transparent',
              color: activeTab === tab.id ? 'var(--text-primary)' : 'var(--text-muted)',
              fontWeight: activeTab === tab.id ? '600' : '500',
              padding: '10px 14px',
              fontSize: '13px',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 1. VERIFIED MATCHED SKILLS */}
      {(activeTab === 'all' || activeTab === 'matched') && matchResult.matchedSkills.length > 0 && (
        <Card title={`Verified Matched Skills (${matchResult.matchedSkills.length})`} icon={CheckCircle2}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {matchResult.matchedSkills.map((item, idx) => {
              const cat = RADIX_CATEGORIES[item.category_code] || RADIX_CATEGORIES['OTHER'];
              return (
                <div
                  key={idx}
                  style={{
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-subtle)',
                    borderLeft: '3px solid #35D49A',
                    borderRadius: 'var(--radius-md)',
                    padding: '14px 18px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '10px',
                          fontWeight: '700',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          background: cat.bgColor,
                          color: cat.color,
                        }}
                      >
                        {item.category_code}
                      </span>
                      <span style={{ fontWeight: '700', fontSize: '14px', color: 'var(--text-primary)' }}>
                        {item.skill_name}
                      </span>
                    </div>

                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                      <strong style={{ color: 'var(--text-muted)' }}>Verified Evidence: </strong>
                      "{item.evidence}"
                    </p>
                  </div>

                  <span className="badge badge-success" style={{ fontSize: '10px' }}>
                    {item.confidence} confidence
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* 2. RELATED / PARTIALLY MATCHED SKILLS */}
      {(activeTab === 'all' || activeTab === 'partial') && matchResult.partialSkills.length > 0 && (
        <Card title={`Related / Partially Matched Skills (${matchResult.partialSkills.length})`} icon={HelpCircle}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {matchResult.partialSkills.map((item, idx) => {
              const cat = RADIX_CATEGORIES[item.category_code] || RADIX_CATEGORIES['OTHER'];
              return (
                <div
                  key={idx}
                  style={{
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-subtle)',
                    borderLeft: '3px solid var(--accent-cyan)',
                    borderRadius: 'var(--radius-md)',
                    padding: '14px 18px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '10px',
                          fontWeight: '700',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          background: cat.bgColor,
                          color: cat.color,
                        }}
                      >
                        {item.category_code}
                      </span>
                      <span style={{ fontWeight: '700', fontSize: '14px', color: 'var(--text-primary)' }}>
                        {item.skill_name}
                      </span>
                    </div>
                    <span className="badge badge-primary">Partial Transfer</span>
                  </div>

                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    Candidate holds foundational competency in <strong>{item.candidate_foundation}</strong>: "{item.candidate_evidence}"
                  </div>

                  <p style={{ fontSize: '12px', color: 'var(--accent-cyan)', fontStyle: 'italic', marginTop: '2px' }}>
                    Recommendation: {item.recommendation}
                  </p>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* 3. MISSING SKILLS & GAPS */}
      {(activeTab === 'all' || activeTab === 'missing') && matchResult.missingSkills.length > 0 && (
        <Card title={`Missing Job Requirements (${matchResult.missingSkills.length})`} icon={AlertCircle}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {matchResult.missingSkills.map((item, idx) => {
              const cat = RADIX_CATEGORIES[item.category_code] || RADIX_CATEGORIES['OTHER'];
              return (
                <div
                  key={idx}
                  style={{
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-subtle)',
                    borderLeft: '3px solid #F4BE5E',
                    borderRadius: 'var(--radius-md)',
                    padding: '14px 18px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '10px',
                          fontWeight: '700',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          background: cat.bgColor,
                          color: cat.color,
                        }}
                      >
                        {item.category_code}
                      </span>
                      <span style={{ fontWeight: '700', fontSize: '14px', color: 'var(--text-primary)' }}>
                        {item.skill_name}
                      </span>
                    </div>
                    <span className="badge badge-warning">{item.importance}</span>
                  </div>

                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    <strong style={{ color: 'var(--text-muted)' }}>Job Specification: </strong>
                    "{item.job_requirement}"
                  </p>

                  <p style={{ fontSize: '12px', color: '#F4BE5E', marginTop: '2px' }}>
                    <strong>Action Step: </strong> {item.recommendation}
                  </p>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Improvement Priorities Section */}
      <div ref={prioritiesRef}>
        <Card title="Candidate Improvement Priorities" icon={Target} subtitle="Actionable preparation steps before technical interview rounds">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {matchResult.missingSkills.length === 0 ? (
              <p style={{ color: '#35D49A', fontSize: '13px' }}>
                Outstanding! No missing skill gaps detected for this role.
              </p>
            ) : (
              matchResult.missingSkills.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    background: 'var(--bg-surface-elevated)',
                    borderRadius: 'var(--radius-md)',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '13px', color: 'var(--text-primary)' }}>
                      Focus #{idx + 1}: {item.skill_name} ({item.category_name})
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {item.recommendation}
                    </div>
                  </div>
                  <span className="badge badge-warning" style={{ fontSize: '10px' }}>
                    {item.importance}
                  </span>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
