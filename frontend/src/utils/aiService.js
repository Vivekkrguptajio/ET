/**
 * ET Finance API Client
 * Calls the Express backend at /api/*
 * Falls back to mock responses when backend is unavailable.
 */

const API_BASE = '/api';

// Store JWT token
let authToken = null;

/** Get or create auth token */
async function getToken() {
  if (authToken) return authToken;
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'demo@et.finance', password: 'demo' }),
    });
    const data = await res.json();
    if (data.token) authToken = data.token;
    return authToken;
  } catch {
    return null;
  }
}

/** Authenticated fetch helper */
async function apiFetch(endpoint, body) {
  const token = await getToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${endpoint}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'API request failed');
  }

  return res.json();
}

/* ───── Tax Analysis ───── */
export async function analyzeTax(formData) {
  try {
    const result = await apiFetch('/tax/analyze', formData);
    return {
      metrics: [
        { label: 'Old Regime Tax', value: `₹${result.metrics.oldRegimeTax.toLocaleString('en-IN')}`, color: 'var(--color-danger)' },
        { label: 'New Regime Tax', value: `₹${result.metrics.newRegimeTax.toLocaleString('en-IN')}`, color: 'var(--color-accent-green)' },
        { label: 'You Save', value: `₹${Math.abs(result.metrics.savings).toLocaleString('en-IN')}`, color: 'var(--color-accent-gold)', sublabel: result.metrics.savings > 0 ? 'With New Regime' : 'With Old Regime' },
        { label: 'Effective Rate', value: `${result.metrics.effectiveRate}%`, color: 'var(--color-accent-blue)', sublabel: 'After deductions' },
      ],
      response: result.response,
    };
  } catch {
    return null; // fallback to mock
  }
}

/* ───── Health Score ───── */
export async function analyzeHealth(formData) {
  try {
    const result = await apiFetch('/health/analyze', formData);
    return {
      score: result.score,
      dimensions: result.dimensions,
      response: result.response,
    };
  } catch {
    return null;
  }
}

/* ───── FIRE Planner ───── */
export async function analyzeFire(formData) {
  try {
    const result = await apiFetch('/fire/analyze', formData);
    return {
      metrics: result.metrics,
      milestones: result.milestones,
      response: result.response,
    };
  } catch {
    return null;
  }
}

/* ───── Couples Planner ───── */
export async function analyzeCouples(formData) {
  try {
    const result = await apiFetch('/couples/analyze', formData);
    return {
      metrics: result.metrics,
      chartData: result.chartData,
      response: result.response,
    };
  } catch {
    return null;
  }
}

/* ───── PDF Upload ───── */
export async function uploadForm16(file) {
  try {
    const token = await getToken();
    const fd = new FormData();
    fd.append('form16', file);

    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}/tax/upload`, {
      method: 'POST',
      headers,
      body: fd,
    });

    if (!res.ok) throw new Error('Upload failed');
    return res.json();
  } catch {
    return null;
  }
}

/* ───── Mock response generators (kept as fallbacks) ───── */

export function getMockTaxResponse(data) {
  const income = parseFloat(data.income) || 1000000;
  const oldTax = Math.round(income * 0.22);
  const newTax = Math.round(income * 0.18);
  const savings = oldTax - newTax;

  return `## 📊 Tax Analysis Report

### Your Income Profile
- **Annual Income**: ₹${income.toLocaleString('en-IN')}
- **Tax Regime**: ${data.regime === 'new' ? 'New Regime (2026)' : 'Old Regime'}
- **Filing Status**: ${data.filingStatus || 'Individual'}

### Tax Calculation
**Under Old Regime**: ₹${oldTax.toLocaleString('en-IN')}
**Under New Regime**: ₹${newTax.toLocaleString('en-IN')}

### 💡 Recommendation
The **${savings > 0 ? 'New' : 'Old'} Regime** saves you **₹${Math.abs(savings).toLocaleString('en-IN')}** this year.

### Deductions to Maximize
- **Section 80C**: Invest ₹1,50,000 in ELSS/PPF for ₹46,800 tax savings
- **Section 80D**: Health insurance premium up to ₹25,000
- **HRA**: ${data.hra ? `Claim ₹${parseInt(data.hra).toLocaleString('en-IN')} HRA exemption` : 'Consider claiming HRA if paying rent'}
- **NPS (80CCD)**: Additional ₹50,000 deduction under Section 80CCD(1B)

### ⚡ Quick Wins
- Start a SIP in ELSS fund (3-year lock-in, best tax-saving mutual fund)
- File ITR before July 31 to avoid late fees
- Keep all rent receipts and investment proofs organized`;
}

export function getMockHealthScore() {
  return {
    score: 72,
    dimensions: [
      { label: 'Emergency Fund', score: 85, color: 'var(--color-accent-green)' },
      { label: 'Debt Management', score: 60, color: 'var(--color-accent-blue)' },
      { label: 'Insurance Coverage', score: 45, color: 'var(--color-accent-gold)' },
      { label: 'Investment Diversity', score: 78, color: 'var(--color-accent-green)' },
      { label: 'Savings Rate', score: 65, color: 'var(--color-accent-blue)' },
      { label: 'Retirement Readiness', score: 55, color: 'var(--color-accent-gold)' },
    ],
    response: `## 💰 Money Health Report

### Overall Assessment
Your financial health score is **72/100** — rated **Good**. You're doing well in some areas but have room for improvement.

### 🟢 Strengths
- **Emergency Fund** (85/100): You have 5+ months of expenses saved. Excellent!
- **Investment Diversity** (78/100): Good mix of equity and debt instruments.

### 🟡 Needs Attention
- **Debt Management** (60/100): High-interest debt detected. Consider consolidating.
- **Savings Rate** (65/100): Aim for 30% of income. Currently at ~22%.

### 🔴 Critical Areas
- **Insurance Coverage** (45/100): You're under-insured. Get term life insurance of 10x annual income.
- **Retirement Readiness** (55/100): Increase SIP contributions by ₹5,000/month.

### 🎯 Top 3 Actions This Month
1. Get a ₹1 Crore term insurance plan (costs ~₹800/month at age 28)
2. Increase SIP by ₹5,000 in a flexi-cap fund
3. Pay off credit card debt before investing more`,
  };
}

export function getMockFirePlan(data) {
  const age = parseInt(data.age) || 28;
  const retireAge = parseInt(data.retireAge) || 45;
  const monthlyExpense = parseFloat(data.monthlyExpense) || 50000;
  const corpus = Math.round(monthlyExpense * 12 * 30);
  const yearsLeft = retireAge - age;
  const monthlySIP = Math.round(corpus / (yearsLeft * 12 * 2.5));

  return {
    metrics: [
      { label: 'FIRE Number', value: `₹${(corpus / 10000000).toFixed(1)}Cr`, color: 'var(--color-accent-gold)', sublabel: 'Target corpus' },
      { label: 'Years Left', value: yearsLeft, color: 'var(--color-accent-blue)', sublabel: `Retire at ${retireAge}` },
      { label: 'Monthly SIP', value: `₹${monthlySIP.toLocaleString('en-IN')}`, color: 'var(--color-accent-green)', sublabel: 'Required investment' },
      { label: 'Success Rate', value: '78%', color: 'var(--color-accent-green)', sublabel: 'Based on projections' },
    ],
    milestones: [
      { month: 'Month 1-3', title: 'Build Foundation', description: 'Set up emergency fund (6 months expenses). Open investment accounts.', target: `Save ₹${(monthlyExpense * 6).toLocaleString('en-IN')}`, color: 'var(--color-accent-blue)' },
      { month: 'Month 4-6', title: 'Start Aggressive SIPs', description: `Begin monthly SIP of ₹${monthlySIP.toLocaleString('en-IN')} across diversified funds.`, target: 'Automate all investments', color: 'var(--color-accent-green)' },
      { month: 'Year 1-3', title: 'Grow & Diversify', description: 'Increase SIP by 10% annually. Add real estate or index funds.', target: 'Reach ₹50L portfolio', color: 'var(--color-accent-gold)' },
      { month: `Year ${Math.floor(yearsLeft / 2)}`, title: 'Midpoint Check', description: 'Review portfolio allocation. Rebalance equity-to-debt ratio.', target: `Reach ₹${(corpus / 20000000).toFixed(1)}Cr`, color: 'var(--color-accent-blue)' },
      { month: `Year ${yearsLeft}`, title: '🎉 FIRE Achieved!', description: `Retire at ${retireAge} with ₹${(corpus / 10000000).toFixed(1)}Cr corpus generating passive income.`, target: '₹' + monthlyExpense.toLocaleString('en-IN') + '/month passive', color: 'var(--color-accent-green)' },
    ],
    response: `## 🔥 FIRE Plan Analysis

### Your FIRE Profile
- **Current Age**: ${age}
- **Target Retirement Age**: ${retireAge}
- **Monthly Expenses**: ₹${monthlyExpense.toLocaleString('en-IN')}
- **Required Corpus (25x Rule)**: ₹${(corpus / 10000000).toFixed(1)} Crore

### Investment Strategy
**Required Monthly SIP**: ₹${monthlySIP.toLocaleString('en-IN')}
Assuming 12% CAGR in equity mutual funds over ${yearsLeft} years.

### Asset Allocation Recommended
- **60% Equity** (Index + Flexi-cap funds)
- **20% Debt** (Government bonds, debt MFs)
- **10% Gold** (Sovereign Gold Bonds)
- **10% REITs/Real Estate**

### 📈 Key Assumptions
- Inflation at 6% per annum
- Post-retirement withdrawal at 4% (safe withdrawal rate)
- Annual SIP step-up of 10%`,
  };
}

export function getMockCouplesResult(data) {
  const income1 = parseFloat(data.income1) || 800000;
  const income2 = parseFloat(data.income2) || 600000;
  const total = income1 + income2;
  const ratio1 = Math.round((income1 / total) * 100);
  const ratio2 = 100 - ratio1;

  return {
    metrics: [
      { label: 'Combined Income', value: `₹${(total / 100000).toFixed(1)}L`, color: 'var(--color-accent-blue)' },
      { label: 'Optimal Split', value: `${ratio1}:${ratio2}`, color: 'var(--color-accent-green)', sublabel: 'Expense ratio' },
      { label: 'Joint Savings', value: `₹${Math.round(total * 0.3 / 12).toLocaleString('en-IN')}`, color: 'var(--color-accent-gold)', sublabel: 'Monthly target' },
      { label: 'Tax Savings', value: `₹${Math.round(total * 0.05).toLocaleString('en-IN')}`, color: 'var(--color-accent-green)', sublabel: 'By optimizing' },
    ],
    chartData: {
      labels: ['Rent/EMI', 'Groceries', 'Utilities', 'Insurance', 'Investments', 'Personal', 'Fun & Travel'],
      partner1: [35, 15, 5, 8, 25, 7, 5],
      partner2: [30, 20, 8, 5, 20, 10, 7],
    },
    response: `## 💑 Couples Finance Report

### Income Overview
- **Partner 1**: ₹${(income1 / 100000).toFixed(1)}L/year
- **Partner 2**: ₹${(income2 / 100000).toFixed(1)}L/year
- **Combined**: ₹${(total / 100000).toFixed(1)}L/year

### Recommended Budget Split (${ratio1}:${ratio2})
Based on income proportions, here's the optimal expense-sharing model:

### 🏠 Joint Expenses (70% of combined)
- **Rent/EMI**: ₹${Math.round(total * 0.25 / 12).toLocaleString('en-IN')}/month (split proportionally)
- **Groceries & Utilities**: ₹${Math.round(total * 0.08 / 12).toLocaleString('en-IN')}/month (split 50:50)
- **Insurance**: Both partners need term + health insurance

### 💰 Savings Strategy
- **Joint Emergency Fund**: Build ₹${Math.round(total * 0.5 / 12).toLocaleString('en-IN')} (6 months combined expenses)
- **Individual SIPs**: Each invest at least 20% of individual income
- **Joint Goal Fund**: ₹${Math.round(total * 0.1 / 12).toLocaleString('en-IN')}/month for house/travel

### 🎯 Tax Optimization
- Leverage both ₹1.5L Section 80C limits = ₹3L deduction
- HRA: Claim in higher-income partner's name
- Health insurance: ₹50,000 combined deduction under 80D`,
  };
}
