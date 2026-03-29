import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

/**
 * Analyze user data with Groq AI (llama-3.3-70b-versatile)
 * @param {string} systemPrompt - System prompt with role/instructions
 * @param {string} userMessage - User data/query
 * @returns {Promise<string>} AI response text
 */
export async function analyzeWithGroq(systemPrompt, userMessage) {
  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.7,
      max_tokens: 2048,
      top_p: 0.9,
    });

    return completion.choices[0]?.message?.content || 'No response generated.';
  } catch (error) {
    console.error('[Groq Error]', error.message);

    if (error.status === 401) {
      throw new Error('Invalid Groq API key. Please check your .env file.');
    }
    if (error.status === 429) {
      throw new Error('Rate limit exceeded. Please try again in a moment.');
    }

    throw new Error('AI analysis temporarily unavailable. Please try again.');
  }
}
