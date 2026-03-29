import { useState } from 'react';
import FormCard, { FormField } from '../components/FormCard';
import ScoreGauge from '../components/ScoreGauge';
import DimensionBar from '../components/DimensionBar';
import AIResponseBox from '../components/AIResponseBox';
import CTAFooter from '../components/CTAFooter';
import { analyzeHealth, getMockHealthScore } from '../utils/aiService';
import './HealthScore.css';

const questions = [
  { id: 'emergency', label: 'Emergency Fund (months of expenses)', type: 'select', options: ['0', '1-2', '3-4', '5-6', '6+'] },
  { id: 'debt', label: 'Monthly Debt Payments (% of income)', type: 'select', options: ['0%', '1-10%', '11-20%', '21-30%', '30%+'] },
  { id: 'insurance', label: 'Insurance Coverage', type: 'select', options: ['None', 'Health Only', 'Health + Term Life', 'Comprehensive'] },
  { id: 'investments', label: 'Investment Types', type: 'select', options: ['None', 'FD/RD Only', 'FD + Mutual Funds', 'Diversified Portfolio'] },
  { id: 'savings', label: 'Monthly Savings Rate', type: 'select', options: ['< 10%', '10-20%', '20-30%', '30-40%', '40%+'] },
  { id: 'retirement', label: 'Retirement Planning Status', type: 'select', options: ['Not Started', 'Thinking About It', 'Started SIPs', 'Active Portfolio'] },
  { id: 'income', label: 'Monthly Income', type: 'number', placeholder: 'e.g. 80000' },
  { id: 'age', label: 'Age', type: 'number', placeholder: 'e.g. 28' },
];

export default function HealthScore() {
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const update = (key) => (val) => setForm((f) => ({ ...f, [key]: val }));

  const handleSubmit = async () => {
    setLoading(true);
    setResult(null);

    // Try backend API first
    const apiResult = await analyzeHealth(form);
    if (apiResult) {
      setResult(apiResult);
      setLoading(false);
      return;
    }

    // Fallback to mock
    await new Promise((r) => setTimeout(r, 2000));
    setResult(getMockHealthScore());
    setLoading(false);
  };

  return (
    <div className="page-wrapper" id="health-score-page">
      <div className="page-header">
        <div className="container">
          <span className="page-tag">❤️‍🩹 HEALTH SCORE</span>
          <h1 className="page-title">Money <span className="text-gradient">Health Check</span></h1>
          <p className="page-subtitle">Answer a few questions to get your personalized financial health score and actionable insights.</p>
        </div>
      </div>

      <div className="container page-body">
        {!result ? (
          <FormCard
            title="Financial Health Quiz"
            subtitle="Rate your current financial habits. Be honest — it helps!"
            onSubmit={handleSubmit}
            submitText="🏥 Check My Score"
            loading={loading}
          >
            {questions.map((q) => (
              <FormField
                key={q.id}
                label={q.label}
                id={q.id}
                type={q.type}
                placeholder={q.placeholder}
                value={form[q.id] || ''}
                onChange={update(q.id)}
                options={q.options}
              />
            ))}
          </FormCard>
        ) : (
          <div className="health-results animate-fadeInUp">
            <div className="score-section card">
              <ScoreGauge score={result.score} />
            </div>

            <div className="dimensions-section card">
              <h3 className="dimensions-title">Financial Dimensions</h3>
              {result.dimensions.map((d, i) => (
                <DimensionBar key={d.label} {...d} delay={i} />
              ))}
            </div>

            <AIResponseBox response={result.response} />

            <div className="retake-section">
              <button className="btn-secondary" onClick={() => { setResult(null); setForm({}); }}>
                🔄 Retake Quiz
              </button>
            </div>
          </div>
        )}
      </div>

      <CTAFooter />
    </div>
  );
}
