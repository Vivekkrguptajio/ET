import { Router } from 'express';
import { analyzeWithGroq } from '../services/groq.js';
import { verifyToken } from '../middleware/auth.js';

const router = Router();

const FIRE_SYSTEM_PROMPT = `You are a FIRE (Financial Independence, Retire Early) planning AI for the ET Finance app. Based on the user's financial profile, provide:

1. **FIRE Number**: Required corpus using the 25x annual expenses rule
2. **Monthly SIP Required**: Investment needed at 12% CAGR equity returns
3. **Success Probability**: Based on assumptions (conservative/moderate/aggressive)
4. **Asset Allocation**: Recommended split (equity, debt, gold, REITs)
5. **Milestone Roadmap**: 4-5 key milestones from now to FIRE target

Format with markdown. Use ₹ for amounts. Be specific with numbers.
IMPORTANT: Start with a JSON block in \`\`\`json ... \`\`\` containing structured data:

\`\`\`json
{
  "fireNumber": 18000000,
  "monthlySIP": 45000,
  "successRate": "78%",
  "yearsLeft": 17,
  "milestones": [
    { "month": "Month 1-3", "title": "Build Foundation", "description": "...", "target": "Save ₹3L" },
    { "month": "Year 1-3", "title": "Grow Portfolio", "description": "...", "target": "Reach ₹50L" }
  ]
}
\`\`\`

Then provide detailed markdown analysis.`;

/**
 * POST /api/fire/analyze
 */
router.post('/analyze', verifyToken, async (req, res) => {
  try {
    const { age, retireAge, monthlyExpense, monthlyIncome, currentSavings, existingInvestments, riskTolerance, city } = req.body;

    if (!age || !retireAge || !monthlyExpense) {
      return res.status(400).json({ success: false, error: 'Age, retirement age, and monthly expenses are required.' });
    }

    const userMessage = `Plan my FIRE journey:
- Current Age: ${age}
- Target Retirement Age: ${retireAge}
- Monthly Expenses: ₹${monthlyExpense}
- Monthly Income: ₹${monthlyIncome || 'Not specified'}
- Current Savings: ₹${currentSavings || 0}
- Existing Investments: ₹${existingInvestments || 0}
- Risk Tolerance: ${riskTolerance || 'moderate'}
- City: ${city || 'metro'}

Calculate my FIRE number, required SIPs, and create a milestone roadmap.`;

    const aiResponse = await analyzeWithGroq(FIRE_SYSTEM_PROMPT, userMessage);

    // Extract structured JSON
    let data = null;
    const jsonMatch = aiResponse.match(/```json\s*([\s\S]*?)```/);
    if (jsonMatch) {
      try { data = JSON.parse(jsonMatch[1]); } catch { /* fallback */ }
    }

    const cleanResponse = aiResponse.replace(/```json[\s\S]*?```\s*/, '').trim();

    // Fallback calculations
    if (!data) {
      const yearsLeft = parseInt(retireAge) - parseInt(age);
      const annualExpense = parseFloat(monthlyExpense) * 12;
      const fireNumber = annualExpense * 25;
      const monthlySIP = Math.round(fireNumber / (yearsLeft * 12 * 2.5));

      data = {
        fireNumber,
        monthlySIP,
        successRate: '72%',
        yearsLeft,
        milestones: [
          { month: 'Month 1-3', title: 'Build Foundation', description: 'Set up emergency fund and investment accounts.', target: `Save ₹${(parseFloat(monthlyExpense) * 6).toLocaleString('en-IN')}` },
          { month: 'Month 4-12', title: 'Start SIPs', description: `Begin ₹${monthlySIP.toLocaleString('en-IN')}/month SIP.`, target: 'Automate investments' },
          { month: 'Year 2-5', title: 'Grow & Diversify', description: 'Increase SIP 10% annually. Add index funds.', target: 'Reach ₹50L portfolio' },
          { month: `Year ${yearsLeft}`, title: '🎉 FIRE!', description: `Retire at ${retireAge} with passive income.`, target: `₹${(annualExpense / 12).toLocaleString('en-IN')}/month passive` },
        ],
      };
    }

    // Assign colors to milestones
    const colors = ['var(--color-accent-blue)', 'var(--color-accent-green)', 'var(--color-accent-gold)', 'var(--color-accent-blue)', 'var(--color-accent-green)'];
    data.milestones = (data.milestones || []).map((m, i) => ({ ...m, color: colors[i % colors.length] }));

    res.json({
      success: true,
      metrics: [
        { label: 'FIRE Number', value: `₹${(data.fireNumber / 10000000).toFixed(1)}Cr`, color: 'var(--color-accent-gold)', sublabel: 'Target corpus' },
        { label: 'Years Left', value: data.yearsLeft, color: 'var(--color-accent-blue)', sublabel: `Retire at ${retireAge}` },
        { label: 'Monthly SIP', value: `₹${data.monthlySIP?.toLocaleString('en-IN')}`, color: 'var(--color-accent-green)', sublabel: 'Required investment' },
        { label: 'Success Rate', value: data.successRate, color: 'var(--color-accent-green)', sublabel: 'Based on projections' },
      ],
      milestones: data.milestones,
      response: cleanResponse,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
