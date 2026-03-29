import { useState } from 'react';
import FormCard, { FormField } from '../components/FormCard';
import MetricRow from '../components/MetricRow';
import RoadmapTimeline from '../components/RoadmapTimeline';
import AIResponseBox from '../components/AIResponseBox';
import CTAFooter from '../components/CTAFooter';
import { analyzeFire, getMockFirePlan } from '../utils/aiService';
import './FirePlanner.css';

export default function FirePlanner() {
  const [form, setForm] = useState({
    age: '',
    retireAge: '',
    monthlyExpense: '',
    monthlyIncome: '',
    currentSavings: '',
    existingInvestments: '',
    riskTolerance: 'moderate',
    city: 'metro',
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const update = (key) => (val) => setForm((f) => ({ ...f, [key]: val }));

  const handleSubmit = async () => {
    setLoading(true);
    setResult(null);

    // Try backend API first
    const apiResult = await analyzeFire(form);
    if (apiResult) {
      setResult(apiResult);
      setLoading(false);
      return;
    }

    // Fallback to mock
    await new Promise((r) => setTimeout(r, 2000));
    setResult(getMockFirePlan(form));
    setLoading(false);
  };

  return (
    <div className="page-wrapper" id="fire-planner-page">
      <div className="page-header">
        <div className="container">
          <span className="page-tag">🔥 FIRE PLANNER</span>
          <h1 className="page-title">Early Retirement <span className="text-gradient">Calculator</span></h1>
          <p className="page-subtitle">Plan your path to Financial Independence. Get a personalized roadmap to retire early.</p>
        </div>
      </div>

      <div className="container page-body">
        <FormCard
          title="Your FIRE Profile"
          subtitle="Tell us about your finances to calculate your FIRE number and roadmap."
          onSubmit={handleSubmit}
          submitText="🔥 Calculate FIRE Plan"
          loading={loading}
        >
          <FormField label="Current Age" id="age" type="number" placeholder="e.g. 28" value={form.age} onChange={update('age')} required />
          <FormField label="Target Retirement Age" id="retire-age" type="number" placeholder="e.g. 45" value={form.retireAge} onChange={update('retireAge')} required />
          <FormField label="Monthly Expenses" id="monthly-expense" type="number" placeholder="e.g. 50000" value={form.monthlyExpense} onChange={update('monthlyExpense')} prefix="₹" required />
          <FormField label="Monthly Income" id="monthly-income" type="number" placeholder="e.g. 120000" value={form.monthlyIncome} onChange={update('monthlyIncome')} prefix="₹" />
          <FormField label="Current Savings" id="current-savings" type="number" placeholder="e.g. 500000" value={form.currentSavings} onChange={update('currentSavings')} prefix="₹" />
          <FormField label="Existing Investments" id="existing-investments" type="number" placeholder="e.g. 1000000" value={form.existingInvestments} onChange={update('existingInvestments')} prefix="₹" />
          <FormField label="Risk Tolerance" id="risk-tolerance" type="select" value={form.riskTolerance} onChange={update('riskTolerance')} options={[{ value: 'conservative', label: 'Conservative' }, { value: 'moderate', label: 'Moderate' }, { value: 'aggressive', label: 'Aggressive' }]} />
          <FormField label="City Type" id="fire-city" type="select" value={form.city} onChange={update('city')} options={[{ value: 'metro', label: 'Metro City' }, { value: 'tier2', label: 'Tier 2 City' }, { value: 'rural', label: 'Rural / Small Town' }]} />
        </FormCard>

        {result && (
          <>
            <MetricRow metrics={result.metrics} />
            <RoadmapTimeline milestones={result.milestones} />
            <AIResponseBox response={result.response} />
          </>
        )}
      </div>

      <CTAFooter />
    </div>
  );
}
