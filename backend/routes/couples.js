import { Router } from 'express';
import { analyzeWithGroq } from '../services/groq.js';
import { verifyToken } from '../middleware/auth.js';

const router = Router();

const COUPLES_SYSTEM_PROMPT = `You are a couples finance optimizer AI for the ET Finance app. Analyze both partners' financial profiles and provide:

1. **Income Overview**: Combined income and contribution ratio
2. **Optimal Expense Split**: Proportional or 50:50 recommendation based on incomes
3. **Joint Budget**: Recommended allocation for rent, groceries, utilities, insurance, investments
4. **Tax Optimization**: How to maximize deductions across both tax returns (80C, 80D, HRA)
5. **Joint Savings Strategy**: Emergency fund, SIPs, and shared goals
6. **Expense Distribution Chart Data**: Percentage breakdown by category for each partner

Format with markdown. Use ₹ for amounts.
IMPORTANT: Start with a JSON block in \`\`\`json ... \`\`\` containing:

\`\`\`json
{
  "combinedIncome": 2100000,
  "splitRatio": "57:43",
  "jointSavingsTarget": 52500,
  "taxSavings": 105000,
  "chartData": {
    "labels": ["Rent/EMI", "Groceries", "Utilities", "Insurance", "Investments", "Personal", "Fun & Travel"],
    "partner1": [35, 15, 5, 8, 25, 7, 5],
    "partner2": [30, 20, 8, 5, 20, 10, 7]
  }
}
\`\`\``;

/**
 * POST /api/couples/analyze
 */
router.post('/analyze', verifyToken, async (req, res) => {
  try {
    const { income1, income2, name1, name2, rent, groceries, savings1, savings2 } = req.body;

    if (!income1 || !income2) {
      return res.status(400).json({ success: false, error: 'Both partners\' incomes are required.' });
    }

    const p1 = name1 || 'Partner 1';
    const p2 = name2 || 'Partner 2';

    const userMessage = `Analyze our couple's finances:
- ${p1}'s Annual Income: ₹${income1}
- ${p2}'s Annual Income: ₹${income2}
- Monthly Rent/EMI: ₹${rent || 'Not specified'}
- Monthly Groceries: ₹${groceries || 'Not specified'}
- ${p1}'s Monthly Savings: ₹${savings1 || 'Not specified'}
- ${p2}'s Monthly Savings: ₹${savings2 || 'Not specified'}

Provide optimal expense splitting, joint budget, and tax optimization for us.`;

    const aiResponse = await analyzeWithGroq(COUPLES_SYSTEM_PROMPT, userMessage);

    // Extract JSON
    let data = null;
    const jsonMatch = aiResponse.match(/```json\s*([\s\S]*?)```/);
    if (jsonMatch) {
      try { data = JSON.parse(jsonMatch[1]); } catch { /* fallback */ }
    }

    const cleanResponse = aiResponse.replace(/```json[\s\S]*?```\s*/, '').trim();

    // Fallback calculations
    const inc1 = parseFloat(income1);
    const inc2 = parseFloat(income2);
    const total = inc1 + inc2;
    const ratio1 = Math.round((inc1 / total) * 100);
    const ratio2 = 100 - ratio1;

    if (!data) {
      data = {
        combinedIncome: total,
        splitRatio: `${ratio1}:${ratio2}`,
        jointSavingsTarget: Math.round(total * 0.3 / 12),
        taxSavings: Math.round(total * 0.05),
        chartData: {
          labels: ['Rent/EMI', 'Groceries', 'Utilities', 'Insurance', 'Investments', 'Personal', 'Fun & Travel'],
          partner1: [35, 15, 5, 8, 25, 7, 5],
          partner2: [30, 20, 8, 5, 20, 10, 7],
        },
      };
    }

    res.json({
      success: true,
      metrics: [
        { label: 'Combined Income', value: `₹${(total / 100000).toFixed(1)}L`, color: 'var(--color-accent-blue)' },
        { label: 'Optimal Split', value: data.splitRatio || `${ratio1}:${ratio2}`, color: 'var(--color-accent-green)', sublabel: 'Expense ratio' },
        { label: 'Joint Savings', value: `₹${(data.jointSavingsTarget || Math.round(total * 0.3 / 12)).toLocaleString('en-IN')}`, color: 'var(--color-accent-gold)', sublabel: 'Monthly target' },
        { label: 'Tax Savings', value: `₹${(data.taxSavings || Math.round(total * 0.05)).toLocaleString('en-IN')}`, color: 'var(--color-accent-green)', sublabel: 'By optimizing' },
      ],
      chartData: data.chartData,
      response: cleanResponse,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
