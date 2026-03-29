import pdf from 'pdf-parse/lib/pdf-parse.js';

/**
 * Parse Form 16 PDF and extract key financial data
 * @param {Buffer} fileBuffer - PDF file buffer
 * @returns {Promise<Object>} Extracted financial data
 */
export async function parseForm16(fileBuffer) {
  try {
    const data = await pdf(fileBuffer);
    const text = data.text;

    // Extract fields using regex patterns common in Form 16
    const extracted = {
      rawText: text.substring(0, 3000), // First 3000 chars for AI context
      pan: extractField(text, /PAN\s*[:\-]?\s*([A-Z]{5}\d{4}[A-Z])/i),
      employerName: extractField(text, /(?:employer|company)\s*(?:name)?\s*[:\-]?\s*([^\n]+)/i),
      grossSalary: extractAmount(text, /gross\s*(?:total)?\s*(?:salary|income)\s*[:\-]?\s*₹?\s*([\d,]+)/i),
      totalIncome: extractAmount(text, /(?:total|net)\s*(?:taxable)?\s*income\s*[:\-]?\s*₹?\s*([\d,]+)/i),
      tdsDeducted: extractAmount(text, /(?:tds|tax)\s*(?:deducted|paid)\s*[:\-]?\s*₹?\s*([\d,]+)/i),
      section80C: extractAmount(text, /(?:80c|80 c)\s*[:\-]?\s*₹?\s*([\d,]+)/i),
      section80D: extractAmount(text, /(?:80d|80 d)\s*[:\-]?\s*₹?\s*([\d,]+)/i),
      hra: extractAmount(text, /(?:hra|house rent)\s*[:\-]?\s*₹?\s*([\d,]+)/i),
      assessmentYear: extractField(text, /(?:assessment|a\.?\s*y\.?)\s*(?:year)?\s*[:\-]?\s*(20\d{2}\s*[-–]\s*\d{2,4})/i),
      financialYear: extractField(text, /(?:financial|f\.?\s*y\.?)\s*(?:year)?\s*[:\-]?\s*(20\d{2}\s*[-–]\s*\d{2,4})/i),
    };

    return {
      success: true,
      data: extracted,
      pageCount: data.numpages,
    };
  } catch (error) {
    console.error('[PDF Parse Error]', error.message);
    return {
      success: false,
      error: 'Failed to parse PDF. Please ensure it is a valid Form 16 document.',
    };
  }
}

function extractField(text, regex) {
  const match = text.match(regex);
  return match ? match[1].trim() : null;
}

function extractAmount(text, regex) {
  const match = text.match(regex);
  if (!match) return null;
  const num = match[1].replace(/,/g, '');
  return parseInt(num, 10) || null;
}
