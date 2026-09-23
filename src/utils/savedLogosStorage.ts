import { SavedLogo } from '../types/qr';

const SAVED_LOGOS_KEY = 'vortex_saved_logos_v1';

// Starter logos stored in local storage if none exist yet
const INITIAL_SAVED_LOGOS: SavedLogo[] = [
  {
    id: 'starter-stripe',
    name: 'Stripe',
    sourceType: 'url',
    url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/stripe/stripe-original.svg',
    dataUrl: 'data:image/svg+xml;utf8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><rect width="120" height="120" rx="26" fill="#635BFF"/><path fill="#ffffff" d="M54.5 45.4c0-3.3 2.7-4.6 7.1-4.6 6.4 0 14.5 2 20.8 5.4v-16c-7.1-2.8-14.2-3.8-21.2-3.8-17.5 0-28.7 9.1-28.7 24.3 0 23.7 32.5 19.9 32.5 30.1 0 3.9-3.4 5.2-8.2 5.2-7.1 0-16.4-3-23.4-6.9v16.4c7.9 3.4 15.8 4.8 23.4 4.8 17.9 0 29.3-8.8 29.3-24.5-.1-25.5-32.6-21.2-32.6-30.4z"/></svg>`),
    createdAt: Date.now() - 86400000
  },
  {
    id: 'starter-shopify',
    name: 'Shopify',
    sourceType: 'url',
    url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/shopify/shopify-original.svg',
    dataUrl: 'data:image/svg+xml;utf8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><rect width="120" height="120" rx="26" fill="#95BF47"/><path fill="#ffffff" d="M78.6 30.2s-1.8.6-4.9 1.5c-.7-2.6-2.8-5.2-6.5-5.2-4.5 0-6.7 3.3-7.7 6.7-4.7 1.4-8 2.4-8 2.4s-1.9.6-2.2 2.2c-.3 1.6-9.1 70.3-9.1 70.3l57.7 10.9 28.1-7.1S78.9 31 78.6 30.2zm-12.7 3.8c1.3-4.1 4.7-4.6 6.3-4.4.5 2.1-.5 5.8-2.6 7.8-1.5 1.5-3.3 2-3.7 2.1v-5.5z"/></svg>`),
    createdAt: Date.now() - 43200000
  }
];

export function getSavedLogos(): SavedLogo[] {
  try {
    const raw = localStorage.getItem(SAVED_LOGOS_KEY);
    if (!raw) {
      // Initialize with starters so user has sample saved logos to test
      localStorage.setItem(SAVED_LOGOS_KEY, JSON.stringify(INITIAL_SAVED_LOGOS));
      return INITIAL_SAVED_LOGOS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.warn('Failed to load saved logos from localStorage:', e);
    return [];
  }
}

export function saveLogoToStorage(
  name: string,
  dataUrl: string,
  originalUrl?: string,
  sourceType: 'url' | 'upload' = 'url',
  dimensions?: { width?: number; height?: number }
): { logos: SavedLogo[]; newLogo: SavedLogo } {
  const current = getSavedLogos();
  const cleanName = name.trim() || (sourceType === 'url' ? 'Custom URL Logo' : 'Uploaded Logo');

  const newLogo: SavedLogo = {
    id: `logo-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    name: cleanName,
    sourceType,
    url: originalUrl,
    dataUrl,
    width: dimensions?.width,
    height: dimensions?.height,
    createdAt: Date.now()
  };

  const updated = [newLogo, ...current];
  try {
    localStorage.setItem(SAVED_LOGOS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('Failed to persist saved logo to localStorage:', e);
  }
  return { logos: updated, newLogo };
}

export function deleteSavedLogo(id: string): SavedLogo[] {
  const current = getSavedLogos();
  const updated = current.filter(item => item.id !== id);
  try {
    localStorage.setItem(SAVED_LOGOS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('Failed to delete saved logo from localStorage:', e);
  }
  return updated;
}

export function renameSavedLogo(id: string, newName: string): SavedLogo[] {
  const current = getSavedLogos();
  const updated = current.map(item => {
    if (item.id === id) {
      return { ...item, name: newName.trim() || item.name };
    }
    return item;
  });
  try {
    localStorage.setItem(SAVED_LOGOS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('Failed to rename saved logo in localStorage:', e);
  }
  return updated;
}

/**
 * Attempts to convert an external image URL into a base64 DataURL.
 * This guarantees:
 * 1) Local storage persistence without network dependency
 * 2) HTML5 Canvas export without tainted canvas CORS errors
 * 3) SVG vector embedding as standard data URI
 */
export async function convertImageUrlToDataUrl(
  url: string
): Promise<{ dataUrl: string; width: number; height: number }> {
  const trimmed = url.trim();

  // If already a data URL, return image dimensions
  if (trimmed.startsWith('data:')) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve({ dataUrl: trimmed, width: img.naturalWidth || 100, height: img.naturalHeight || 100 });
      img.onerror = () => resolve({ dataUrl: trimmed, width: 100, height: 100 });
      img.src = trimmed;
    });
  }

  // Attempt 1: Fetch as blob (cleanest for SVG & WebP & PNG)
  try {
    const res = await fetch(trimmed, { mode: 'cors' });
    if (res.ok) {
      const blob = await res.blob();
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve({ dataUrl, width: img.naturalWidth, height: img.naturalHeight });
        img.onerror = () => resolve({ dataUrl, width: 100, height: 100 });
        img.src = dataUrl;
      });
    }
  } catch {
    // CORS or network error on direct fetch, proceed to Image + Canvas attempt
  }

  // Attempt 2: Load via HTML Image element with crossOrigin
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || 200;
        canvas.height = img.naturalHeight || 200;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const dataUrl = canvas.toDataURL('image/png');
          resolve({ dataUrl, width: img.naturalWidth, height: img.naturalHeight });
          return;
        }
      } catch {
        // Tainted canvas fallback
      }
      // If canvas export blocked by CORS, return original URL as fallback
      resolve({ dataUrl: trimmed, width: img.naturalWidth || 100, height: img.naturalHeight || 100 });
    };

    img.onerror = () => {
      // Attempt 3 without crossOrigin to see if it renders at all
      const fallbackImg = new Image();
      fallbackImg.onload = () => {
        resolve({ dataUrl: trimmed, width: fallbackImg.naturalWidth || 100, height: fallbackImg.naturalHeight || 100 });
      };
      fallbackImg.onerror = () => {
        reject(new Error('Unable to load image from URL. Please check the link or try another image.'));
      };
      fallbackImg.src = trimmed;
    };

    img.src = trimmed;
  });
}
