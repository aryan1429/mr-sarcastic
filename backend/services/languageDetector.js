/**
 * Language detection utility for Mr. Sarcastic.
 * Detects user input language from 14 supported languages.
 * Uses a combination of Unicode script detection, keyword matching, and heuristics.
 *
 * Key design decisions:
 * - English is scored alongside other languages (not just a fallback)
 * - Whole-word matching prevents substring false positives
 * - Short messages require stronger evidence to switch away from English
 * - Higher confidence thresholds for Latin-script languages
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

  // 1. Script-based detection (highest priority — non-Latin scripts are definitive)
  for (const [langCode, hints] of Object.entries(LANGUAGE_DETECTION_HINTS)) {
    scores[langCode] = 0;

    if (hints.scripts && hints.scripts.length > 0) {
      for (const scriptRegex of hints.scripts) {
        const matches = cleanText.match(new RegExp(scriptRegex.source, 'g'));
        if (matches && matches.length > 0) {
          const nonSpaceChars = cleanText.replace(/\s/g, '').length;
          const scriptRatio = matches.length / nonSpaceChars;
          // Heavy weight for script matches — native script is definitive
          scores[langCode] += scriptRatio * 100;
        }
      }
    }
  }

  // 2. Keyword matching with whole-word boundary checks
  for (const [langCode, hints] of Object.entries(LANGUAGE_DETECTION_HINTS)) {
    if (!hints.keywords) continue;

    let keywordMatches = 0;
    for (const keyword of hints.keywords) {
      // Use word-boundary matching for single words, includes for multi-word phrases
      if (keyword.includes(' ')) {
        // Multi-word phrase: check with includes
        if (lowerText.includes(keyword.toLowerCase())) {
          keywordMatches++;
        }
      } else {
        // Single word: require whole-word match to prevent substring false positives
        const wordRegex = new RegExp(`\\b${escapeRegex(keyword.toLowerCase())}\\b`);
        if (wordRegex.test(lowerText)) {
          keywordMatches++;
        }
      }
    }

    if (keywordMatches > 0) {
      // Score based on proportion of matching keywords relative to message length
      // Use a gentler formula that doesn't over-inflate short messages
      const keywordScore = (keywordMatches / Math.max(totalWords, 3)) * 40;
      scores[langCode] = (scores[langCode] || 0) + keywordScore;
    }
  }

  // 3. Pattern matching (regex patterns)
  for (const [langCode, hints] of Object.entries(LANGUAGE_DETECTION_HINTS)) {
    if (!hints.patterns) continue;

    for (const pattern of hints.patterns) {
      if (pattern.test(lowerText)) {
        scores[langCode] = (scores[langCode] || 0) + 8;
      }
    }
  }

  // 4. Short message guard — for messages under 5 words using Latin script,
  //    require at least 2 keyword matches for non-English Latin-script languages
  const hasNonLatinScript = Object.entries(scores).some(([langCode, score]) => {
    const hints = LANGUAGE_DETECTION_HINTS[langCode];
    return hints && hints.scripts && hints.scripts.length > 0 && score >= 30;
  });

  if (totalWords < 5 && !hasNonLatinScript) {
    // For short Latin-script messages, boost English score to prevent false detections
    const latinScriptLangs = ['es', 'fr', 'de', 'pt', 'it', 'tl'];
    for (const lang of latinScriptLangs) {
      if (scores[lang] && scores[lang] < 25) {
        // Weak matches in short messages — suppress them
        scores[lang] = scores[lang] * 0.3;
      }
    }
  }

  // 5. Determine the best match
  let bestLang = DEFAULT_LANGUAGE;
  let bestScore = 0;
  let secondBestScore = 0;

  for (const [langCode, score] of Object.entries(scores)) {
    if (score > bestScore) {
      secondBestScore = bestScore;
      bestScore = score;
      bestLang = langCode;
    } else if (score > secondBestScore) {
      secondBestScore = score;
    }
  }

  // 6. Calculate confidence based on score magnitude and margin
  let confidence = 0;
  const margin = bestScore - secondBestScore;

  if (bestScore >= 50) {
    confidence = 0.95; // Very confident (script-based detection)
  } else if (bestScore >= 30 && margin >= 10) {
    confidence = 0.85; // Strong keyword evidence with clear margin
  } else if (bestScore >= 20 && margin >= 8) {
    confidence = 0.7; // Fairly confident
  } else if (bestScore >= 15 && margin >= 5) {
    confidence = 0.55; // Moderate confidence
  } else if (bestScore > 0) {
    confidence = 0.3; // Low confidence
  }

  // 7. If best language is English with decent score, return English with high confidence
  if (bestLang === 'en' && bestScore > 0) {
    return { language: DEFAULT_LANGUAGE, confidence: 1.0 };
  }

  // 8. If no non-English language detected with reasonable confidence, default to English
  if (confidence < 0.5) {
    return { language: DEFAULT_LANGUAGE, confidence: 1.0 };
  }

  console.log(`🌐 Language detection: best=${bestLang} (score=${bestScore.toFixed(1)}), ` +
    `second=${secondBestScore.toFixed(1)}, margin=${margin.toFixed(1)}, confidence=${confidence}`);

  return { language: bestLang, confidence };
}

/**
 * Escape special regex characters in a string.
 * @param {string} str
 * @returns {string}
 */
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
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

  const hasNative = hasNativeScript(text, langCode);
  if (hasNative) return false;

  const lowerText = text.toLowerCase();
  let matches = 0;
  for (const keyword of hints.keywords) {
    const wordRegex = new RegExp(`\\b${escapeRegex(keyword.toLowerCase())}\\b`);
    if (wordRegex.test(lowerText)) {
      matches++;
    }
  }

  return matches >= 2;
}

export default { detectLanguage, hasNativeScript, isRomanized };
