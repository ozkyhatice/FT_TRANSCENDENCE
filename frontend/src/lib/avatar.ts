import { UI_CONSTANTS } from './constants';

/**
 * Generate avatar URL for a given username
 */
export function getAvatarUrl(username: string): string {
  return `${UI_CONSTANTS.AVATAR_SERVICE}?seed=${encodeURIComponent(username)}`;
}
