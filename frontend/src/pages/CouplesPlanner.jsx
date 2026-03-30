import { useState, useEffect, useRef } from 'react';
import FormCard, { FormField } from '../components/FormCard';
import MetricRow from '../components/MetricRow';
import AIResponseBox from '../components/AIResponseBox';
import CTAFooter from '../components/CTAFooter';
import { analyzeCouples, getMockCouplesResult } from '../utils/aiService';
import './CouplesPlanner.css';

export default function CouplesPlanner() {
  const [form, setForm] = useState({
    income1: '',
    income2: '',
    name1: '',
    name2: '',
    rent: '',
    groceries: '',
    savings1: '',
    savings2: '',
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  const update = (key) => (val) => setForm((f) => ({ ...f, [key]: val }));

  const handleSubmit = async () => {
    setLoading(true);
    setResult(null);

    // Try backend API first
    const apiResult = await analyzeCouples(form);
    if (apiResult) {
      setResult(apiResult);
      setLoading(false);
      return;
    }

    // Fallback to mock
    await new Promise((r) => setTimeout(r, 1800));
    setResult(getMockCouplesResult(form));
    setLoading(false);
  };

  // Render Chart.js when result is available
  useEffect(() => {
    if (!result?.chartData || !chartRef.current) return;
    if (chartInstance.current) { chartInstance.current.destroy(); }

    const Chart = window.Chart;
    if (!Chart) return;

    chartInstance.current = new Chart(chartRef.current, {
      type: 'bar',
      data: {
        labels: result.chartData.labels,
        datasets: [
          {
            label: form.name1 || 'Partner 1',
            data: result.chartData.partner1,
            backgroundColor: 'rgba(79, 124, 255, 0.7)',
            borderColor: '#4f7cff',
            borderWidth: 1,
            borderRadius: 6,
          },
          {
            label: form.name2 || 'Partner 2',
            data: result.chartData.partner2,
            backgroundColor: 'rgba(0, 212, 170, 0.7)',
            borderColor: '#00d4aa',
            borderWidth: 1,
            borderRadius: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: { color: '#8b9dc3', font: { family: 'Sora', size: 12 } },
          },
          tooltip: {
            backgroundColor: '#1a2235',
            titleFont: { family: 'Sora' },
            bodyFont: { family: 'Sora' },
            borderColor: 'rgba(79, 124, 255, 0.2)',
            borderWidth: 1,
            callbacks: {
              label: (ctx) => `${ctx.dataset.label}: ${ctx.raw}%`,
            },
          },
        },
        scales: {
          x: {
            ticks: { color: '#8b9dc3', font: { family: 'Sora', size: 11 } },
            grid: { color: 'rgba(79, 124, 255, 0.05)' },
          },
          y: {
            ticks: { color: '#8b9dc3', font: { family: 'Sora', size: 11 }, callback: (v) => v + '%' },
            grid: { color: 'rgba(79, 124, 255, 0.05)' },
          },
        },
      },
    });

    return () => {
      if (chartInstance.current) { chartInstance.current.destroy(); }
    };
  }, [result, form.name1, form.name2]);

  return (
    <div className="page-wrapper" id="couples-planner-page">
      <div className="page-header">
        <div className="container">
          <span className="page-tag">💑 COUPLES PLANNER</span>
          <h1 className="page-title">Joint Finance <span className="text-gradient">Optimizer</span></h1>
          <p className="page-subtitle">Find the perfect expense split, maximize combined tax savings, and plan shared goals together.</p>
        </div>
      </div>

      <div className="container page-body">
        {!result ? (
        <FormCard
          title="Couple's Financial Profile"
          subtitle="Enter both partners' details for a joint analysis and smart splitting recommendations."
          onSubmit={handleSubmit}
          submitText="💑 Optimize Our Finances"
          loading={loading}
        >
          <FormField label="Partner 1 Name" id="name1" placeholder="e.g. Rahul" value={form.name1} onChange={update('name1')} />
          <FormField label="Partner 2 Name" id="name2" placeholder="e.g. Priya" value={form.name2} onChange={update('name2')} />
          <FormField label="Partner 1 Annual Income" id="income1" type="number" placeholder="e.g. 1200000" value={form.income1} onChange={update('income1')} prefix="₹" required />
          <FormField label="Partner 2 Annual Income" id="income2" type="number" placeholder="e.g. 900000" value={form.income2} onChange={update('income2')} prefix="₹" required />
          <FormField label="Monthly Rent/EMI" id="rent" type="number" placeholder="e.g. 25000" value={form.rent} onChange={update('rent')} prefix="₹" />
          <FormField label="Monthly Groceries" id="groceries" type="number" placeholder="e.g. 8000" value={form.groceries} onChange={update('groceries')} prefix="₹" />
          <FormField label="Partner 1 Monthly Savings" id="savings1" type="number" placeholder="e.g. 20000" value={form.savings1} onChange={update('savings1')} prefix="₹" />
          <FormField label="Partner 2 Monthly Savings" id="savings2" type="number" placeholder="e.g. 15000" value={form.savings2} onChange={update('savings2')} prefix="₹" />
        </FormCard>
        ) : (
          <div className="wizard-results animate-fadeInUp">
            <MetricRow metrics={result.metrics} />

            <div className="chart-section card animate-fadeInUp">
              <h3 className="chart-title">Expense Distribution Comparison</h3>
              <div className="chart-wrapper">
                <canvas ref={chartRef} id="couples-chart"></canvas>
              </div>
            </div>

            <AIResponseBox response={result.response} />
            
            <div className="retake-section">
              <button className="btn-secondary" onClick={() => setResult(null)}>
                🔄 Recalculate
              </button>
            </div>
          </div>
        )}
      </div>

      <CTAFooter />
    </div>
  );
}
