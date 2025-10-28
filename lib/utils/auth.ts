import crypto from 'crypto';

/**
 * Hash password using MD5
 * @param password - Plain text password
 * @returns MD5 hashed password
 */
export function hashPassword(password: string): string {
  return crypto.createHash('md5').update(password).digest('hex');
}

/**
 * Verify password against hash
 * @param password - Plain text password
 * @param hash - MD5 hash
 * @returns true if password matches hash
 */
export function verifyPassword(password: string, hash: string): boolean {
  const hashed = hashPassword(password);
  return hashed === hash;
}

/**
 * Check if email is valid
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Generate a secure token for authentication
 */
export function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

