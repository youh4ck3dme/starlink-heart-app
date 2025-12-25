/**
 * Consent Service - Parent consent management for kids compliance
 * 
 * Manages parent consent state for COPPA/GDPR compliance.
 * Must be checked before any AI interaction.
 * 
 * @see /docs/ai/safety-rules.md
 */

const CONSENT_KEY = 'parentConsent';
const CONSENT_TIMESTAMP_KEY = 'parentConsentTimestamp';

/**
 * Check if parent has given consent
 */
export function hasParentConsent(): boolean {
  return localStorage.getItem(CONSENT_KEY) === 'true';
}

/**
 * Save parent consent
 */
export function setParentConsent(consented: boolean): void {
  if (consented) {
    localStorage.setItem(CONSENT_KEY, 'true');
    localStorage.setItem(CONSENT_TIMESTAMP_KEY, new Date().toISOString());
  } else {
    localStorage.removeItem(CONSENT_KEY);
    localStorage.removeItem(CONSENT_TIMESTAMP_KEY);
  }
}

/**
 * Get consent timestamp (for audit purposes)
 */
export function getConsentTimestamp(): string | null {
  return localStorage.getItem(CONSENT_TIMESTAMP_KEY);
}

/**
 * Clear consent (for data deletion)
 */
export function clearConsent(): void {
  localStorage.removeItem(CONSENT_KEY);
  localStorage.removeItem(CONSENT_TIMESTAMP_KEY);
}

/**
 * Clear all app data (GDPR right to erasure)
 */
export function clearAllAppData(): void {
  // Keys used by the app
  const appKeys = [
    'parentConsent',
    'parentConsentTimestamp',
    'starlink_hearts_db',
    'starryAvatar',
    'starryBackground',
    'starryGems',
    'custom_api_key'
  ];
  
  appKeys.forEach(key => localStorage.removeItem(key));
  
  // Dispatch event for real-time updates
  window.dispatchEvent(new Event('app-data-cleared'));
}
