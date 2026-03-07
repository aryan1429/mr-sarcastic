/**
 * Language detection utility for Mr. Sarcastic.
 * Detects user input language from 14 supported languages.
 * Uses a combination of Unicode script detection, keyword matching, and heuristics.
 */

import {
  LANGUAGE_DETECTION_HINTS,
  DEFAULT_LANGUAGE,
  SUPPORTED_LANGUAGES,
} from '../config/languages.js';

/**
 * Detect the language of a given text message.
 * Returns a language code and a confidence score.
 *
 * @param {string} text - The user's message text
 * @returns {{ language: string, confidence: number }}
 */
export function detectLanguage(text) {
  if (!text || text.trim().length === 0) {
    return { language: DEFAULT_LANGUAGE, confidence: 1.0 };
  }

  const scores = {};
  const cleanText = text.trim();
  const lowerText = cleanText.toLowerCase();
  const words = lowerText.split(/\s+/);
  const totalWords = words.length;

  // 1. Script-based detection (highest priority for Telugu and Hindi)
  for (const [langCode, hints] of Object.entries(LANGUAGE_DETECTION_HINTS)) {
    scores[langCode] = 0;

    // Check Unicode script ranges
    if (hints.scripts && hints.scripts.length > 0) {
      for (const scriptRegex of hints.scripts) {
        const matches = cleanText.match(new RegExp(scriptRegex.source, 'g'));
        if (matches && matches.length > 0) {
          // Strong signal: native script characters found
          const scriptRatio = matches.length / cleanText.replace(/\s/g, '').length;
          scores[langCode] += scriptRatio * 100; // Heavy weight for script matches
        }
      }
    }
  }

  // 2. Keyword matching
  for (const [langCode, hints] of Object.entries(LANGUAGE_DETECTION_HINTS)) {
    if (!hints.keywords) continue;

    let keywordMatches = 0;
    for (const keyword of hints.keywords) {
      // Check if the keyword appears in the message
      if (lowerText.includes(keyword.toLowerCase())) {
        keywordMatches++;
      }
    }

    if (keywordMatches > 0) {
      // Score based on proportion of matching keywords relative to message length
      const keywordScore = (keywordMatches / Math.max(totalWords, 1)) * 50;
      scores[langCode] = (scores[langCode] || 0) + keywordScore;
    }
  }

  // 3. Pattern matching (regex patterns)
  for (const [langCode, hints] of Object.entries(LANGUAGE_DETECTION_HINTS)) {
    if (!hints.patterns) continue;

    for (const pattern of hints.patterns) {
      if (pattern.test(lowerText)) {
        scores[langCode] = (scores[langCode] || 0) + 10;
      }
    }
  }

  // 4. Determine the best match
  let bestLang = DEFAULT_LANGUAGE;
  let bestScore = 0;

  for (const [langCode, score] of Object.entries(scores)) {
    if (score > bestScore) {
      bestScore = score;
      bestLang = langCode;
    }
  }

  // Calculate confidence
  let confidence = 0;
  if (bestScore >= 50) {
    confidence = 0.95; // Very confident (script-based or many keyword matches)
  } else if (bestScore >= 20) {
    confidence = 0.8; // Fairly confident
  } else if (bestScore >= 10) {
    confidence = 0.6; // Somewhat confident
  } else if (bestScore > 0) {
    confidence = 0.4; // Low confidence
  }

  // If no non-English language detected with reasonable confidence, default to English
  if (confidence < 0.4) {
    return { language: DEFAULT_LANGUAGE, confidence: 1.0 };
  }

  return { language: bestLang, confidence };
}

/**
 * Check if text contains characters from a specific script.
 * @param {string} text
 * @param {string} langCode
 * @returns {boolean}
 */
export function hasNativeScript(text, langCode) {
  const hints = LANGUAGE_DETECTION_HINTS[langCode];
  if (!hints || !hints.scripts || hints.scripts.length === 0) return false;

  return hints.scripts.some((scriptRegex) => scriptRegex.test(text));
}

/**
 * Determine if the user is writing in romanized form of a language.
 * E.g., "kya haal hai" is romanized Hindi.
 * @param {string} text
 * @param {string} langCode
 * @returns {boolean}
 */
export function isRomanized(text, langCode) {
  const hints = LANGUAGE_DETECTION_HINTS[langCode];
  if (!hints) return false;

  // Check if the text has no native script characters but matches keywords
  const hasNative = hasNativeScript(text, langCode);
  if (hasNative) return false;

  // Check keyword matches
  const lowerText = text.toLowerCase();
  let matches = 0;
  for (const keyword of hints.keywords) {
    if (lowerText.includes(keyword.toLowerCase())) {
      matches++;
    }
  }

  return matches >= 2; // At least 2 keyword matches to consider it romanized
}

export default { detectLanguage, hasNativeScript, isRomanized };
