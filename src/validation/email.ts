import { matches, Rule } from "./rules";
import { EMAIL_PATTERN } from "./patterns";

// Single source of email normalization and validation for registration and profile changes.
export function normalizeEmail(raw: string): string {
  return raw.trim().toLowerCase();
}

export const EMAIL_RULES: Rule[] = [matches(EMAIL_PATTERN, "must be a valid email")];
