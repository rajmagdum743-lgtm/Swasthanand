/**
 * Centralized API configuration.
 * 
 * For local development (APK on phone → backend on PC):
 *   Set VITE_API_BASE_URL to your PC's WiFi IP in .env
 *   e.g., VITE_API_BASE_URL=http://192.168.71.166:8081
 * 
 * For production (future):
 *   Set VITE_API_BASE_URL to your domain
 *   e.g., VITE_API_BASE_URL=https://api.swasthanand.com
 */
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
  (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== ''
    ? `http://${window.location.hostname}:8081`
    : 'http://localhost:8081');

export const getImageUrl = (imagePath: string | null | undefined): string => {
  if (!imagePath) return '/images/placeholder.jpg';
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://') || imagePath.startsWith('data:')) {
    return imagePath;
  }
  const base = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
  const path = imagePath.startsWith('/') ? imagePath : '/' + imagePath;
  return `${base}${path}`;
};

