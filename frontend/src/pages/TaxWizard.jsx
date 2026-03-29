import { useState } from 'react';
import FormCard, { FormField } from '../components/FormCard';
import MetricRow from '../components/MetricRow';
import AIResponseBox from '../components/AIResponseBox';
import CTAFooter from '../components/CTAFooter';
import { analyzeTax, getMockTaxResponse } from '../utils/aiService';
import './TaxWizard.css';

export default function TaxWizard() {
  const [form, setForm] = useState({
    income: '',
    hra: '',
    regime: 'new',
    filingStatus: 'individual',
    investments80c: '',
    homeLoan: '',
    age: '',
    city: 'metro',
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const update = (key) => (val) => setForm((f) => ({ ...f, [key]: val }));

  const handleSubmit = async () => {
    setLoading(true);
    setResult(null);

    // Try backend API first
    const apiResult = await analyzeTax(form);
    if (apiResult) {
      setResult(apiResult);
      setLoading(false);
      return;
    }

    // Fallback to mock
    await new Promise((r) => setTimeout(r, 1500));
    const income = parseFloat(form.income) || 1000000;
    const oldTax = Math.round(income * 0.22);
    const newTax = Math.round(income * 0.18);
    const response = getMockTaxResponse(form);
    setResult({
      metrics: [
        { label: 'Old Regime Tax', value: `₹${oldTax.toLocaleString('en-IN')}`, color: 'var(--color-danger)' },
        { label: 'New Regime Tax', value: `₹${newTax.toLocaleString('en-IN')}`, color: 'var(--color-accent-green)' },
        { label: 'You Save', value: `₹${(oldTax - newTax).toLocaleString('en-IN')}`, color: 'var(--color-accent-gold)', sublabel: 'With New Regime' },
        { label: 'Effective Rate', value: `${((newTax / income) * 100).toFixed(1)}%`, color: 'var(--color-accent-blue)', sublabel: 'After deductions' },
      ],
      response,
    });
    setLoading(false);
  };

  return (
    <div className="page-wrapper" id="tax-wizard-page">
      <div className="page-header">
        <div className="container">
          <span className="page-tag">🧮 TAX WIZARD</span>
          <h1 className="page-title">AI Tax <span className="text-gradient">Analysis</span></h1>
          <p className="page-subtitle">Enter your financial details and let AI find the best tax regime and deductions for you.</p>
        </div>
      </div>

      <div className="container page-body">
        <FormCard
          title="Your Financial Details"
          subtitle="Fill in your income and investment details for a personalized tax analysis."
          onSubmit={handleSubmit}
          submitText="🔍 Analyze My Taxes"
          loading={loading}
        >
          <FormField label="Annual Income" id="income" type="number" placeholder="e.g. 1200000" value={form.income} onChange={update('income')} prefix="₹" required />
          <FormField label="HRA Received (Annual)" id="hra" type="number" placeholder="e.g. 240000" value={form.hra} onChange={update('hra')} prefix="₹" />
          <FormField label="Tax Regime" id="regime" type="select" value={form.regime} onChange={update('regime')} options={[{ value: 'new', label: 'New Regime (2026)' }, { value: 'old', label: 'Old Regime' }]} />
          <FormField label="Filing Status" id="filing-status" type="select" value={form.filingStatus} onChange={update('filingStatus')} options={[{ value: 'individual', label: 'Individual' }, { value: 'huf', label: 'HUF' }, { value: 'senior', label: 'Senior Citizen' }]} />
          <FormField label="Section 80C Investments" id="investments-80c" type="number" placeholder="e.g. 150000" value={form.investments80c} onChange={update('investments80c')} prefix="₹" />
          <FormField label="Home Loan Interest" id="home-loan" type="number" placeholder="e.g. 200000" value={form.homeLoan} onChange={update('homeLoan')} prefix="₹" />
          <FormField label="Age" id="age" type="number" placeholder="e.g. 28" value={form.age} onChange={update('age')} />
          <FormField label="City Type" id="city" type="select" value={form.city} onChange={update('city')} options={[{ value: 'metro', label: 'Metro (Delhi, Mumbai, etc.)' }, { value: 'non-metro', label: 'Non-Metro' }]} />
        </FormCard>

        {result && (
          <>
            <MetricRow metrics={result.metrics} />
            <AIResponseBox response={result.response} loading={loading} />
          </>
        )}
      </div>

      <CTAFooter />
    </div>
  );
}
