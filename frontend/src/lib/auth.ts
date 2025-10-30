/**
 * Authentication utilities
 * Helps check login status and get user info
 */

export interface UserInfo {
  wallet: string;
  username?: string | null;
}

/**
 * Get current logged-in user wallet address from localStorage
 */
export function getLoggedInWallet(): string | null {
  try {
    return localStorage.getItem('aetheria_token');
  } catch {
    return null;
  }
}

/**
 * Check if user is logged in (wallet or email)
 */
export function isLoggedIn(): boolean {
  const token = getLoggedInWallet();
  if (!token) return false;
  
  // Check if it's a wallet address (starts with 0x) or email token (starts with email:)
  return token.startsWith('0x') || token.startsWith('email:');
}

/**
 * Format wallet address for display
 */
export function formatWallet(address: string | null | undefined): string {
  if (!address || address === '0x') return 'Anonymous';
  if (address.length < 10) return 'Anonymous';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * Get full wallet address or return 'Anonymous'
 */
export function getArtistName(address: string | null | undefined): string {
  if (!address || address === '0x') return 'Anonymous Artist';
  return formatWallet(address);
}

