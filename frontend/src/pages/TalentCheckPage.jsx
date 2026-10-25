import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  Building,
  ArrowRight,
  Bookmark,
  Info,
  Target
} from 'lucide-react';
import { useApp } from '../hooks/useApp';
import { talentCheckService } from '../services/talentCheckService';
import { matchService } from '../services/matchService';
import Card from '../components/ui/Card';
import ScoreRing from '../components/ui/ScoreRing';
import RadarChart from '../components/ui/RadarChart';
import CategoryBar from '../components/ui/CategoryBar';
import Modal from '../components/ui/Modal';

export default function TalentCheckPage() {
  const navigate = useNavigate();
  const { activeCandidate, selectedCompany, setSelectedCompany, addToast } = useApp();

  const [company, setCompany] = useState(selectedCompany || 'Google LLC');
  const [activeTab, setActiveTab] = useState('all');
  const [showFormulaModal, setShowFormulaModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const companies = talentCheckService.getCompanies();
  const evaluation = talentCheckService.calculateReadiness(activeCandidate, company);

  if (!evaluation || !activeCandidate) {
    return (
      <div style={{ padding: '60px', textAlign: 'center' }}>
        <p>Calculating company readiness intelligence...</p>
      </div>
    );
  }

  const filteredCategories = evaluation.breakdown.filter((cat) => {
    if (activeTab === 'gaps') return cat.gap;
    if (activeTab === 'met') return !cat.gap;
    return true;
  });

  const benchmarkScores = {};
  evaluation.breakdown.forEach((b) => {
    benchmarkScores[b.category_code] = b.required_level;
  });

  const handleSaveReport = async () => {
    setIsSaving(true);
    try {
      await matchService.saveReport({
        type: 'talent_check',
        title: `Talent Check — ${company} Readiness`,
        candidateId: activeCandidate.id,
        candidateName: activeCandidate.name,
        company,
        readinessScore: evaluation.readinessScore,
        readinessTier: evaluation.readinessTier,
        summary: `${activeCandidate.name} achieved ${evaluation.readinessScore}/100 readiness against ${company}'s 12-competency hiring bar. ${evaluation.categoriesMeeting} categories meet expectations; ${evaluation.categoriesGap} categories require targeted preparation.`,
        breakdown: evaluation.breakdown,
      });
      addToast(`Evaluation saved to Saved Reports!`, 'success');
    } catch (err) {
      addToast(`Error saving report: ${err.message}`, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-primary)' }}>
            Talent Check (Module 4)
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Evaluate candidate readiness against verified hiring expectations across all 12 RADIX competencies.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => setShowFormulaModal(true)}
            className="btn btn-outline"
          >
            <Info size={16} />
            <span>How Score is Calculated</span>
          </button>
          <button
            onClick={handleSaveReport}
            disabled={isSaving}
            className="btn btn-secondary"
          >
            <Bookmark size={16} />
            <span>{isSaving ? 'Saving...' : 'Save Evaluation'}</span>
          </button>
        </div>
      </div>

      {/* Company Selector Ribbon */}
      <div
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-xl)',
          padding: '8px',
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '8px',
        }}
      >
        {companies.map((compName) => {
          const isSelected = company === compName;
          const details = talentCheckService.getCompanyDetails(compName);
          return (
            <div
              key={compName}
              onClick={() => {
                setCompany(compName);
                setSelectedCompany(compName);
              }}
              style={{
                padding: '16px 20px',
                borderRadius: 'var(--radius-lg)',
                background: isSelected ? 'var(--bg-surface-elevated)' : 'transparent',
                border: isSelected ? '1px solid var(--accent-cyan)' : '1px solid transparent',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    background: isSelected ? 'linear-gradient(135deg, #45D6FF 0%, #8B7CFF 100%)' : 'rgba(255, 255, 255, 0.05)',
                    color: isSelected ? '#0B1020' : 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '800',
                    fontSize: '13px',
                  }}
                >
                  <Building size={18} />
                </div>
                <div>
                  <div style={{ fontWeight: '700', fontSize: '14px', color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                    {compName}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-subtle)' }}>
                    {details.badge}
                  </div>
                </div>
              </div>
              {isSelected && <span className="badge badge-primary">Selected Bar</span>}
            </div>
          );
        })}
      </div>

      {/* Main Readiness Gauge & Overview Card */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '20px' }}>
        <Card
          title="Overall Company Readiness"
          subtitle={`Evaluated against ${evaluation.companyName}'s tier-1 hiring bar`}
        >
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px 0 20px', textAlign: 'center' }}>
            <ScoreRing
              score={evaluation.readinessScore}
              size={170}
              strokeWidth={14}
              sublabel={`/ 100`}
              color={evaluation.readinessScore >= 80 ? '#35D49A' : evaluation.readinessScore >= 65 ? '#45D6FF' : '#F4BE5E'}
              gradientId="talent-ring-grad"
            />

            <div style={{ marginTop: '16px' }}>
              <span className={`badge ${evaluation.readinessBadgeClass}`} style={{ fontSize: '12px', padding: '6px 14px' }}>
                {evaluation.readinessTier}
              </span>
            </div>

            <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginTop: '12px', maxWidth: '340px' }}>
              Candidate {activeCandidate.name} satisfies the expected level in{' '}
              <strong style={{ color: '#35D49A' }}>{evaluation.categoriesMeeting}</strong> of{' '}
              {evaluation.totalCategories} competency categories.
            </p>

            <div style={{ display: 'flex', gap: '16px', marginTop: '20px', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px', width: '100%', justifyContent: 'space-around' }}>
              <div>
                <div style={{ fontSize: '18px', fontWeight: '800', color: '#35D49A' }}>
                  {evaluation.categoriesMeeting}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Meets / Exceeds</div>
              </div>
              <div style={{ width: '1px', background: 'var(--border-subtle)' }} />
              <div>
                <div style={{ fontSize: '18px', fontWeight: '800', color: '#F4BE5E' }}>
                  {evaluation.categoriesGap}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Skill Gaps</div>
              </div>
              <div style={{ width: '1px', background: 'var(--border-subtle)' }} />
              <div>
                <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--accent-cyan)' }}>
                  {activeCandidate.skills?.length || 0}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Total Skills</div>
              </div>
            </div>
          </div>
        </Card>

        <Card
          title="Candidate Level vs Company Expected Bar"
          subtitle="Dual polygon comparison across all 12 RADIX categories"
        >
          <div style={{ padding: '8px 0', textAlign: 'center' }}>
            <RadarChart
              candidateScores={activeCandidate.categoryScores}
              benchmarkScores={benchmarkScores}
              size={360}
            />
            <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginTop: '12px', fontSize: '12px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#45D6FF' }}>
                <span style={{ width: '12px', height: '12px', background: '#45D6FF', borderRadius: '3px' }} />
                {activeCandidate.name} (Verified Profile)
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#8B7CFF' }}>
                <span style={{ width: '14px', height: '2px', borderTop: '2px dashed #8B7CFF' }} />
                {evaluation.companyName} Bar
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Category-by-Category Comparisons */}
      <Card
        title="Category-by-Category Evaluation (12 RADIX Standards)"
        subtitle="Candidate verified proficiency versus expected company baseline (Levels 1 to 10)"
        actions={
          <div style={{ display: 'flex', gap: '6px' }}>
            {[
              { id: 'all', label: `All (12)` },
              { id: 'gaps', label: `Gaps (${evaluation.categoriesGap})` },
              { id: 'met', label: `Meets Bar (${evaluation.categoriesMeeting})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  background: activeTab === tab.id ? 'var(--bg-surface-elevated)' : 'transparent',
                  border: activeTab === tab.id ? '1px solid var(--border-accent)' : '1px solid var(--border-subtle)',
                  color: activeTab === tab.id ? 'var(--accent-cyan)' : 'var(--text-muted)',
                  borderRadius: 'var(--radius-md)',
                  padding: '5px 12px',
                  fontSize: '11.5px',
                  fontWeight: activeTab === tab.id ? '600' : '500',
                  cursor: 'pointer',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        }
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px 28px' }}>
          {filteredCategories.map((cat) => (
            <CategoryBar
              key={cat.category_code}
              categoryCode={cat.category_code}
              categoryName={cat.category_name}
              candidateLevel={cat.candidate_level}
              requiredLevel={cat.required_level}
              importance={cat.importance}
              description={cat.description}
            />
          ))}
        </div>
      </Card>

      {/* Prioritized Improvement Roadmap */}
      <Card
        title="Prioritized Improvement Roadmap"
        subtitle="Ranked by gap severity and company weighting to maximize hiring readiness"
        icon={Target}
      >
        {evaluation.skillGaps.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', color: '#35D49A' }}>
            <CheckCircle2 size={32} style={{ margin: '0 auto 8px' }} />
            <h4 style={{ fontSize: '16px', color: '#FFFFFF' }}>Candidate Meets All Expected Thresholds!</h4>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              No critical gaps identified for {evaluation.companyName}. Proceed directly to Skill Matching.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {evaluation.skillGaps.map((item, idx) => (
              <div
                key={item.category_code}
                style={{
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '16px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: '16px',
                }}
              >
                <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: idx === 0 ? 'rgba(255, 107, 129, 0.2)' : 'rgba(244, 190, 94, 0.2)',
                      color: idx === 0 ? '#FF6B81' : '#F4BE5E',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: '800',
                      fontSize: '12px',
                      flexShrink: 0,
                    }}
                  >
                    #{idx + 1}
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: '700', fontSize: '14px', color: 'var(--text-primary)' }}>
                        {item.category_name} ({item.category_code})
                      </span>
                      <span
                        className="badge"
                        style={{
                          background: item.importance === 'critical' ? 'rgba(255, 107, 129, 0.15)' : 'rgba(244, 190, 94, 0.15)',
                          color: item.importance === 'critical' ? '#FF6B81' : '#F4BE5E',
                          fontSize: '9.5px',
                        }}
                      >
                        {item.importance} Priority
                      </span>
                    </div>

                    <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      {item.description}
                    </p>

                    <div style={{ display: 'flex', gap: '12px', marginTop: '8px', fontSize: '11px', color: 'var(--text-muted)' }}>
                      <span>Current Level: <strong style={{ color: 'var(--text-primary)' }}>{item.candidate_level}/10</strong></span>
                      <span>·</span>
                      <span>Company Target: <strong style={{ color: '#8B7CFF' }}>{item.required_level}/10</strong></span>
                      <span>·</span>
                      <span>Gap: <strong style={{ color: '#FF6B81' }}>-{Math.abs(item.delta)} Levels</strong></span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => navigate('/skill-matching')}
                  className="btn btn-outline btn-sm"
                  style={{ whiteSpace: 'nowrap' }}
                >
                  <span>Practice Role Match</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Formula Modal */}
      <Modal
        isOpen={showFormulaModal}
        onClose={() => setShowFormulaModal(false)}
        title="Talent Check Scoring Methodology"
        subtitle="Formal mathematical formula evaluated across 12 RADIX competencies"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '13px', color: 'var(--text-secondary)' }}>
          <p>
            The RADIX Talent Check evaluates a candidate's verified proficiency across all 12 competency categories against a target company's benchmark bar ($r_i$).
          </p>

          <div
            style={{
              background: 'var(--bg-surface-elevated)',
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-medium)',
              fontFamily: 'var(--font-mono)',
              fontSize: '12px',
              color: 'var(--accent-cyan)',
              lineHeight: 1.6,
            }}
          >
            Readiness Score = ( ∑ [ w_i × min(1.0, c_i / r_i) ] / ∑ w_i ) × 100
          </div>

          <div>
            <h4 style={{ color: 'var(--text-primary)', marginBottom: '6px' }}>Variables:</h4>
            <ul style={{ paddingLeft: '20px', lineHeight: 1.6 }}>
              <li><strong>$c_i$:</strong> Candidate verified level (1-10) in category $i$.</li>
              <li><strong>$r_i$:</strong> Target company required benchmark level (1-10).</li>
              <li><strong>$w_i$:</strong> Company category importance weight (1.3 for critical, 1.1 for high, 0.9 for medium, 0.7 for baseline).</li>
              <li><strong>$\min(1.0, c_i / r_i)$:</strong> Prevents over-indexing beyond 100% in any single category, requiring comprehensive readiness across all 12 domains.</li>
            </ul>
          </div>

          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '12px', fontSize: '12px', color: 'var(--text-muted)' }}>
            This formula guarantees that candidates cannot pass tier-1 engineering bars (such as Google or Microsoft) by simply being strong in one area while holding critical gaps in algorithms, system design, or testing.
          </div>
        </div>
      </Modal>
    </div>
  );
}
