/**
 * Centralized configuration access for Cloud Functions
 *
 * Firebase Functions v2 uses process.env for environment variables.
 * Environment variables are set via:
 * - Local: functions/.env file (gitignored)
 * - Production: Firebase Console or `firebase functions:secrets:set`
 */

/**
 * Get the API key for Alexa/iOS Shortcut authentication
 *
 * Called inside handler functions (not at module level) to ensure
 * environment variables are loaded at runtime.
 *
 * @throws Error if ALEXA_API_KEY environment variable is not set
 */
export function getApiKey(): string {
  const apiKey = process.env.ALEXA_API_KEY;
  if (!apiKey) {
    throw new Error(
      "ALEXA_API_KEY environment variable is not set. " +
        "Set it in functions/.env for local dev or via Firebase Console for production."
    );
  }
  return apiKey;
}
