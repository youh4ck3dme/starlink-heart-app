/**
 * Safety Filter for Kids Content
 * 
 * Filters user input before sending to AI to:
 * 1. Block profanity (SK/EN)
 * 2. Block PII patterns (email, phone, address)
 * 3. Sanitize potentially harmful content
 * 
 * @see /docs/ai/safety-rules.md
 */

// Slovak and English profanity blocklist (partial, extend as needed)
const PROFANITY_BLOCKLIST = [
  // Slovak
  'kurva', 'piča', 'kokot', 'jebať', 'hovno', 'debil', 'idiot', 'kretén',
  'do piče', 'do riti', 'zasraný', 'zmrd', 'hajzel', 'piča',
  // English
  'fuck', 'shit', 'bitch', 'ass', 'damn', 'crap', 'dick', 'pussy',
  'bastard', 'asshole', 'bullshit', 'wtf', 'stfu'
];

// PII patterns
const PII_PATTERNS = {
  email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi,
  phone: /(\+421|0)[\s.-]?\d{3}[\s.-]?\d{3}[\s.-]?\d{3}/g,
  phoneGeneric: /\b\d{10,}\b/g,
  // Slovak address patterns
  address: /\b(ulica|ul\.|námestie|nám\.)\s+[A-Za-zÀ-ž]+\s+\d+/gi
};

export interface SafetyCheckResult {
  safe: boolean;
  filtered: string;
  blocked: boolean;
  reason?: string;
}

/**
 * Check if input contains blocked content
 */
export function checkInputSafety(input: string): SafetyCheckResult {
  if (!input || !input.trim()) {
    return { safe: true, filtered: input, blocked: false };
  }

  const lowerInput = input.toLowerCase();

  // Check profanity
  for (const word of PROFANITY_BLOCKLIST) {
    if (lowerInput.includes(word)) {
      return {
        safe: false,
        filtered: input,
        blocked: true,
        reason: 'profanity'
      };
    }
  }

  // Check PII and mask it
  let filtered = input;
  let hasPII = false;

  for (const [type, pattern] of Object.entries(PII_PATTERNS)) {
    if (pattern.test(filtered)) {
      hasPII = true;
      filtered = filtered.replace(pattern, `[${type.toUpperCase()}_REMOVED]`);
    }
  }

  if (hasPII) {
    return {
      safe: false,
      filtered: filtered,
      blocked: false, // Not blocked, but filtered
      reason: 'pii_detected'
    };
  }

  return { safe: true, filtered: input, blocked: false };
}

/**
 * Get user-friendly error message for blocked content
 */
export function getSafetyBlockMessage(reason: string): string {
  switch (reason) {
    case 'profanity':
      return '🚫 Hej, poďme radšej používať slušné slová! Skús to napísať inak. 🌟';
    case 'pii_detected':
      return '🔒 Starry si všimol osobné údaje. Pre tvoju bezpečnosť ich radšej nezdieľaj! 🛡️';
    default:
      return '⚠️ Niečo nie je v poriadku s touto správou. Skús to inak!';
  }
}
