import type { UserType } from "../_shared/schema.js";

/**
 * Removes sensitive fields from the user object before returning to client.
 */
export function sanitizeUser(user: any): Partial<UserType> {
  if (!user) return user;
  
  // Create a clean copy
  const safeUser = { ...user };
  
  // Remove password hash
  delete safeUser.password;
  
  // Remove active session tokens
  delete safeUser.activeSessionToken;
  
  // In mongoose documents, sometimes _doc contains the raw data
  if (safeUser._doc) {
    delete safeUser._doc.password;
    delete safeUser._doc.activeSessionToken;
  }
  
  return safeUser;
}

/**
 * Extremely basic HTML entity encoder to prevent XSS in strings.
 * For a full solution, DOMPurify isomorphic should be used, but this
 * catches the most common vectors in the meantime.
 */
export function sanitizeText(text: unknown): string {
  if (typeof text !== 'string') return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
