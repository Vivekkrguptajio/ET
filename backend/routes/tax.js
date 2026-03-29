import { Router } from 'express';
import multer from 'multer';
import { analyzeWithGroq } from '../services/groq.js';
import { parseForm16 } from '../services/pdfParser.js';
import { verifyToken } from '../middleware/auth.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

const TAX_SYSTEM_PROMPT = `You are an expert Indian tax advisor AI for the ET Finance app. Analyze the user's financial data and provide:

1. **Tax Comparison**: Calculate tax under both Old and New regime (FY 2025-26 / AY 2026-27)
2. **Optimal Regime**: Recommend which regime saves more tax
3. **Deduction Optimization**: Suggest Section 80C, 80D, 80CCD, HRA, and other applicable deductions
4. **Quick Wins**: 3-5 immediate actionable steps to reduce tax liability
5. **Important Deadlines**: Relevant filing dates and compliance reminders

Format your response with markdown headings (##, ###), bullet points, and highlight amounts with ₹ symbol.
Keep the tone professional yet friendly. Target audience: young Indian professionals (25-40 age group).
Use Indian tax slabs for FY 2025-26.`;

/**
 * POST /api/tax/analyze
 * Analyze tax data with Groq AI
 */
router.post('/analyze', verifyToken, async (req, res) => {
  try {
    const { income, hra, regime, filingStatus, investments80c, homeLoan, age, city } = req.body;

    if (!income) {
      return res.status(400).json({ success: false, error: 'Annual income is required.' });
    }

    const userMessage = `Analyze my tax situation:
- Annual Income: ₹${income}
- HRA Received: ₹${hra || 0}
- Current Regime: ${regime || 'new'}
- Filing Status: ${filingStatus || 'individual'}
- Section 80C Investments: ₹${investments80c || 0}
- Home Loan Interest: ₹${homeLoan || 0}
- Age: ${age || 'Not specified'}
- City: ${city || 'metro'}

Please provide a detailed tax analysis with regime comparison and optimization tips.`;

    const response = await analyzeWithGroq(TAX_SYSTEM_PROMPT, userMessage);

    // Calculate basic metrics
    const incomeNum = parseFloat(income);
    const oldTax = calculateOldRegimeTax(incomeNum, investments80c, homeLoan, hra);
    const newTax = calculateNewRegimeTax(incomeNum);

    res.json({
      success: true,
      response,
      metrics: {
        oldRegimeTax: oldTax,
        newRegimeTax: newTax,
        savings: oldTax - newTax,
        effectiveRate: ((Math.min(oldTax, newTax) / incomeNum) * 100).toFixed(1),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/tax/upload
 * Upload Form 16 PDF, parse it, and analyze with AI
 */
router.post('/upload', verifyToken, upload.single('form16'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No PDF file uploaded.' });
    }

    // Parse PDF
    const parsed = await parseForm16(req.file.buffer);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: parsed.error });
    }

    // Analyze extracted data with AI
    const userMessage = `Analyze this Form 16 data extracted from PDF:
${JSON.stringify(parsed.data, null, 2)}

Raw text excerpt from document:
${parsed.data.rawText}

Please provide a comprehensive tax analysis based on this Form 16.`;

    const response = await analyzeWithGroq(TAX_SYSTEM_PROMPT, userMessage);

    res.json({
      success: true,
      parsedData: parsed.data,
      pageCount: parsed.pageCount,
      response,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ── Tax Calculation Helpers ──────────────────────────────

function calculateNewRegimeTax(income) {
  // FY 2025-26 New Regime slabs
  const slabs = [
    { limit: 400000, rate: 0 },
    { limit: 800000, rate: 0.05 },
    { limit: 1200000, rate: 0.10 },
    { limit: 1600000, rate: 0.15 },
    { limit: 2000000, rate: 0.20 },
    { limit: 2400000, rate: 0.25 },
    { limit: Infinity, rate: 0.30 },
  ];

  let tax = 0;
  let prev = 0;
  for (const slab of slabs) {
    if (income <= prev) break;
    const taxable = Math.min(income, slab.limit) - prev;
    tax += taxable * slab.rate;
    prev = slab.limit;
  }

  // Standard deduction ₹75,000 (new regime FY 2025-26)
  const stdDeduction = Math.min(75000, income);
  const adjustedIncome = Math.max(0, income - stdDeduction);
  tax = 0; prev = 0;
  for (const slab of slabs) {
    if (adjustedIncome <= prev) break;
    const taxable = Math.min(adjustedIncome, slab.limit) - prev;
    tax += taxable * slab.rate;
    prev = slab.limit;
  }

  // Rebate u/s 87A (income up to ₹12L → no tax under new regime)
  if (adjustedIncome <= 1200000) tax = 0;

  // Health & Education cess 4%
  tax += tax * 0.04;
  return Math.round(tax);
}

function calculateOldRegimeTax(income, investments80c = 0, homeLoan = 0, hra = 0) {
  // Old regime deductions
  const deduction80c = Math.min(parseFloat(investments80c) || 0, 150000);
  const deductionHomeLoan = Math.min(parseFloat(homeLoan) || 0, 200000);
  const deductionHRA = parseFloat(hra) || 0;
  const stdDeduction = 50000;

  const taxableIncome = Math.max(0, income - deduction80c - deductionHomeLoan - deductionHRA - stdDeduction);

  // Old regime slabs
  const slabs = [
    { limit: 250000, rate: 0 },
    { limit: 500000, rate: 0.05 },
    { limit: 1000000, rate: 0.20 },
    { limit: Infinity, rate: 0.30 },
  ];

  let tax = 0;
  let prev = 0;
  for (const slab of slabs) {
    if (taxableIncome <= prev) break;
    const taxable = Math.min(taxableIncome, slab.limit) - prev;
    tax += taxable * slab.rate;
    prev = slab.limit;
  }

  // Rebate u/s 87A (income up to ₹5L → no tax)
  if (taxableIncome <= 500000) tax = 0;

  // Health & Education cess 4%
  tax += tax * 0.04;
  return Math.round(tax);
}

export default router;
