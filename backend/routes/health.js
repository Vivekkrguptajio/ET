import { Router } from 'express';
import { analyzeWithGroq } from '../services/groq.js';
import { verifyToken } from '../middleware/auth.js';

const router = Router();

const HEALTH_SYSTEM_PROMPT = `You are a financial health assessment AI for the ET Finance app. Based on the user's answers to a money health quiz, provide:

1. **Overall Score**: A score from 0-100 with letter grade (A+, A, B+, B, C, D)
2. **6 Dimension Scores** (each 0-100):
   - Emergency Fund
   - Debt Management
   - Insurance Coverage
   - Investment Diversity
   - Savings Rate
   - Retirement Readiness
3. **Strengths** (🟢): What the user is doing well
4. **Needs Attention** (🟡): Areas that need improvement
5. **Critical** (🔴): Urgent issues to address
6. **Top 3 Actions**: Specific, actionable steps for this month

Format with markdown. Use ₹ for amounts. Be encouraging but honest. Target: young Indian professionals.
IMPORTANT: Start your response with a JSON block wrapped in \`\`\`json ... \`\`\` containing the score and dimensions, then follow with the detailed markdown analysis.

Example JSON format:
\`\`\`json
{
  "score": 72,
  "dimensions": [
    { "label": "Emergency Fund", "score": 85 },
    { "label": "Debt Management", "score": 60 },
    { "label": "Insurance Coverage", "score": 45 },
    { "label": "Investment Diversity", "score": 78 },
    { "label": "Savings Rate", "score": 65 },
    { "label": "Retirement Readiness", "score": 55 }
  ]
}
\`\`\``;

/**
 * POST /api/health/analyze
 */
router.post('/analyze', verifyToken, async (req, res) => {
  try {
    const { emergency, debt, insurance, investments, savings, retirement, income, age } = req.body;

    const userMessage = `Here are my financial health quiz answers:
- Emergency Fund: ${emergency || 'Not specified'}
- Monthly Debt Payments: ${debt || 'Not specified'}
- Insurance Coverage: ${insurance || 'Not specified'}
- Investment Types: ${investments || 'Not specified'}
- Monthly Savings Rate: ${savings || 'Not specified'}
- Retirement Planning: ${retirement || 'Not specified'}
- Monthly Income: ₹${income || 'Not specified'}
- Age: ${age || 'Not specified'}

Please analyze my financial health and provide scores and recommendations.`;

    const aiResponse = await analyzeWithGroq(HEALTH_SYSTEM_PROMPT, userMessage);

    // Try to extract JSON scores from AI response
    let scores = null;
    const jsonMatch = aiResponse.match(/```json\s*([\s\S]*?)```/);
    if (jsonMatch) {
      try {
        scores = JSON.parse(jsonMatch[1]);
      } catch { /* fallback to null */ }
    }

    // Clean response (remove JSON block for display)
    const cleanResponse = aiResponse.replace(/```json[\s\S]*?```\s*/, '').trim();

    // Fallback scores if AI didn't return structured data
    if (!scores) {
      scores = {
        score: 65,
        dimensions: [
          { label: 'Emergency Fund', score: 70 },
          { label: 'Debt Management', score: 60 },
          { label: 'Insurance Coverage', score: 50 },
          { label: 'Investment Diversity', score: 65 },
          { label: 'Savings Rate', score: 60 },
          { label: 'Retirement Readiness', score: 55 },
        ],
      };
    }

    // Assign colors to dimensions
    const coloredDimensions = scores.dimensions.map((d) => ({
      ...d,
      color: d.score >= 75 ? 'var(--color-accent-green)'
        : d.score >= 55 ? 'var(--color-accent-blue)'
        : d.score >= 40 ? 'var(--color-accent-gold)'
        : 'var(--color-danger)',
    }));

    res.json({
      success: true,
      score: scores.score,
      dimensions: coloredDimensions,
      response: cleanResponse,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
