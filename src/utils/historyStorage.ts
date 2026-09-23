import { QRState, HistoryItem } from '../types/qr';

const HISTORY_STORAGE_KEY = 'vortex_qr_history_v1';
const MAX_HISTORY_ITEMS = 30;

export function deriveHistoryTitle(state: QRState): string {
  switch (state.contentType) {
    case 'whatsapp': {
      const phone = `${state.whatsapp.countryCode}${state.whatsapp.phone}`.trim();
      return phone ? `WhatsApp (+${phone})` : 'WhatsApp Chat';
    }
    case 'appstore': {
      const name = state.appStore.appId.trim();
      const platform = state.appStore.platform === 'apple' ? 'Apple App Store' : 'Google Play';
      return name ? `${platform} (${name})` : platform;
    }
    case 'social': {
      const user = state.social.username.trim();
      const platformName = state.social.platform.charAt(0).toUpperCase() + state.social.platform.slice(1);
      return user ? `${platformName}: @${user}` : platformName;
    }
    case 'wifi': {
      const ssid = state.wifi.ssid.trim();
      return ssid ? `Wi-Fi (${ssid})` : 'Wi-Fi Network';
    }
    case 'vcard': {
      const name = `${state.vcard.firstName} ${state.vcard.lastName}`.trim();
      return name ? `Contact: ${name}` : 'vCard Contact';
    }
    case 'email': {
      const email = state.email.address.trim();
      return email ? `Email: ${email}` : 'Email Message';
    }
    case 'url': {
      const url = state.url.trim() || state.rawText.trim();
      try {
        const parsed = new URL(url.startsWith('http') ? url : `https://${url}`);
        return parsed.hostname + (parsed.pathname !== '/' ? parsed.pathname : '');
      } catch {
        return url.length > 32 ? url.substring(0, 32) + '...' : url;
      }
    }
    default: {
      const txt = state.rawText.trim();
      return txt.length > 32 ? txt.substring(0, 32) + '...' : txt || 'QR Code';
    }
  }
}

export function getStoredHistory(): HistoryItem[] {
  try {
    const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (!raw) return [];
    const items = JSON.parse(raw);
    return Array.isArray(items) ? items : [];
  } catch (e) {
    console.warn('Failed to load history from localStorage:', e);
    return [];
  }
}

export function saveItemToHistory(state: QRState): HistoryItem[] {
  const text = state.rawText?.trim();
  if (!text || text === 'https://example.com' || text.length === 0) {
    return getStoredHistory();
  }

  try {
    const current = getStoredHistory();
    const title = deriveHistoryTitle(state);
    const existingIndex = current.findIndex(item => item.rawText === text);

    const newItem: HistoryItem = {
      id: existingIndex >= 0 ? current[existingIndex].id : `qr-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      timestamp: Date.now(),
      contentType: state.contentType,
      title,
      rawText: text,
      state: JSON.parse(JSON.stringify(state)) // deep copy
    };

    let updated: HistoryItem[];
    if (existingIndex >= 0) {
      // Move to top and update state & timestamp
      updated = [newItem, ...current.filter((_, idx) => idx !== existingIndex)];
    } else {
      updated = [newItem, ...current];
    }

    if (updated.length > MAX_HISTORY_ITEMS) {
      updated = updated.slice(0, MAX_HISTORY_ITEMS);
    }

    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.warn('Failed to save history to localStorage:', e);
    return getStoredHistory();
  }
}

export function removeItemFromHistory(id: string): HistoryItem[] {
  try {
    const current = getStoredHistory();
    const updated = current.filter(item => item.id !== id);
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.warn('Failed to remove item from history:', e);
    return getStoredHistory();
  }
}

export function clearStoredHistory(): void {
  try {
    localStorage.removeItem(HISTORY_STORAGE_KEY);
  } catch (e) {
    console.warn('Failed to clear history:', e);
  }
}
