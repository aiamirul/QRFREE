import { QRState } from '../types/qr';
import { PRESET_LOGOS } from './presets';

export interface ApiRequestParams {
  isApiMode: boolean;
  rawUrl?: string;
  normalizedUrl: string;
  centerLogoName?: string;
  presetId?: string;
  customLogoUrl?: string;
  format: 'view' | 'svg' | 'png' | 'json';
  errorCorrection: 'L' | 'M' | 'Q' | 'H';
  primaryColor: string;
  backgroundColor: string;
  size: number;
  autoDownload: boolean;
}

/**
 * Resolves a logo string (like "website", "apple", "whatsapp", or "https://...") to a preset ID or custom URL.
 */
export function resolveApiCenterLogo(logoParam?: string | null): {
  presetId?: string;
  customUrl?: string;
  sourceType: 'preset' | 'url' | 'none';
  displayName: string;
} {
  if (!logoParam || logoParam.trim() === '' || logoParam === 'none' || logoParam === 'false') {
    return { sourceType: 'none', displayName: 'None' };
  }

  const clean = logoParam.trim();

  // If it's a URL
  if (clean.startsWith('http://') || clean.startsWith('https://') || clean.startsWith('data:')) {
    return {
      sourceType: 'url',
      customUrl: clean,
      displayName: 'Custom URL Logo'
    };
  }

  const lower = clean.toLowerCase();

  // Map known aliases
  const aliasMap: Record<string, string> = {
    website: 'globe',
    web: 'globe',
    site: 'globe',
    globe: 'globe',
    internet: 'globe',
    apple: 'apple',
    appstore: 'apple',
    'apple-store': 'apple',
    ios: 'apple',
    'apple-brand': 'apple-brand',
    whatsapp: 'whatsapp',
    wa: 'whatsapp',
    instagram: 'instagram',
    insta: 'instagram',
    ig: 'instagram',
    'google-play': 'google-play',
    googleplay: 'google-play',
    playstore: 'google-play',
    play: 'google-play',
    android: 'google-play',
    x: 'x',
    twitter: 'x',
    youtube: 'youtube',
    yt: 'youtube',
    linkedin: 'linkedin',
    tiktok: 'tiktok',
    facebook: 'facebook',
    fb: 'facebook',
    github: 'github',
    telegram: 'telegram',
    tg: 'telegram',
    spotify: 'spotify',
    wifi: 'wifi',
    wi_fi: 'wifi'
  };

  const mappedPresetId = aliasMap[lower];
  if (mappedPresetId) {
    const found = PRESET_LOGOS.find(p => p.id === mappedPresetId);
    return {
      sourceType: 'preset',
      presetId: mappedPresetId,
      displayName: found?.name || mappedPresetId
    };
  }

  // Fallback: check if exact preset ID matches
  const directMatch = PRESET_LOGOS.find(p => p.id.toLowerCase() === lower || p.name.toLowerCase() === lower);
  if (directMatch) {
    return {
      sourceType: 'preset',
      presetId: directMatch.id,
      displayName: directMatch.name
    };
  }

  // Default to website/globe if unrecognized word resembling web
  return {
    sourceType: 'preset',
    presetId: 'globe',
    displayName: 'Website / Web'
  };
}

/**
 * Normalizes input URL so mystery.com becomes https://mystery.com
 */
export function normalizeTargetUrl(inputUrl?: string | null): string {
  if (!inputUrl || inputUrl.trim() === '') {
    return 'https://mystery.com';
  }
  const trimmed = inputUrl.trim();
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmed)) {
    return trimmed; // already has scheme (http, https, mailto, tel, etc.)
  }
  return `https://${trimmed}`;
}

/**
 * Parses URL search parameters for API mode
 */
export function parseApiQueryParams(searchString: string = window.location.search): ApiRequestParams {
  const params = new URLSearchParams(searchString);

  const mode = params.get('mode');
  const isApiMode = mode === 'api' || params.has('api') || params.get('output') === 'api';

  const rawUrlParam = params.get('url') || params.get('text') || params.get('data') || params.get('target') || '';
  const normalizedUrl = normalizeTargetUrl(rawUrlParam || (isApiMode ? 'mystery.com' : ''));

  const centerLogoParam = params.get('centerlogo') || params.get('logo') || params.get('center_logo') || params.get('badge');

  const rawFormat = (params.get('format') || params.get('type') || 'view').toLowerCase();
  let format: 'view' | 'svg' | 'png' | 'json' = 'view';
  if (rawFormat === 'svg') format = 'svg';
  else if (rawFormat === 'png' || rawFormat === 'image') format = 'png';
  else if (rawFormat === 'json') format = 'json';

  const ecParam = (params.get('ec') || params.get('errorCorrection') || 'H').toUpperCase();
  const errorCorrection: 'L' | 'M' | 'Q' | 'H' = ['L', 'M', 'Q', 'H'].includes(ecParam) ? (ecParam as any) : 'H';

  const primaryColor = params.get('color') || params.get('fg') || '#0f172a';
  const backgroundColor = params.get('bg') || '#ffffff';
  const size = parseInt(params.get('size') || '512', 10) || 512;
  const autoDownload = params.get('download') === 'true' || params.get('download') === '1';

  return {
    isApiMode,
    rawUrl: rawUrlParam || undefined,
    normalizedUrl,
    centerLogoName: centerLogoParam || (isApiMode ? 'website' : undefined),
    format,
    errorCorrection,
    primaryColor: primaryColor.startsWith('#') ? primaryColor : `#${primaryColor}`,
    backgroundColor: backgroundColor === 'transparent' ? 'transparent' : (backgroundColor.startsWith('#') ? backgroundColor : `#${backgroundColor}`),
    size,
    autoDownload
  };
}

/**
 * Builds a QRState representation configured from API parameters
 */
export function buildQRStateFromApi(params: ApiRequestParams): QRState {
  const logoResolution = resolveApiCenterLogo(params.centerLogoName);

  const hasLogo = logoResolution.sourceType !== 'none';

  return {
    contentType: 'url',
    rawText: params.normalizedUrl,
    url: params.normalizedUrl,
    whatsapp: {
      countryCode: '+1',
      phone: '5550192834',
      message: 'Hello'
    },
    appStore: {
      platform: 'apple',
      appId: '1234567890',
      customUrl: params.normalizedUrl
    },
    social: {
      platform: 'instagram',
      username: 'kanika'
    },
    wifi: {
      ssid: 'WiFi_Guest',
      password: '',
      encryption: 'WPA',
      hidden: false
    },
    vcard: {
      firstName: '',
      lastName: '',
      organization: '',
      title: '',
      phone: '',
      email: '',
      website: params.normalizedUrl
    },
    text: {
      content: params.normalizedUrl
    },
    email: {
      address: '',
      subject: '',
      body: ''
    },
    errorCorrection: params.errorCorrection,
    dotStyle: 'rounded',
    eyeFrameStyle: 'rounded',
    eyePupilStyle: 'rounded',
    margin: 2,
    colors: {
      type: 'solid',
      primary: params.primaryColor,
      secondary: params.primaryColor,
      gradientAngle: 45,
      background: params.backgroundColor === 'transparent' ? '#ffffff' : params.backgroundColor,
      transparentBackground: params.backgroundColor === 'transparent',
      customEyeColors: false
    },
    logo: {
      sourceType: logoResolution.sourceType,
      presetId: logoResolution.presetId,
      url: logoResolution.customUrl,
      sizeRatio: 0.23,
      bgShape: 'circle',
      bgColor: '#ffffff',
      bgPadding: 6,
      borderWidth: 2,
      borderColor: '#e2e8f0',
      removeModulesBehind: true,
      offsetX: 0,
      offsetY: 0
    },
    frame: {
      style: 'none',
      text: 'SCAN ME',
      textColor: '#ffffff',
      frameColor: params.primaryColor
    }
  };
}

/**
 * Builds the full API URL for client preview & developer sharing
 */
export function constructApiUrl(options: {
  url?: string;
  centerlogo?: string;
  format?: string;
  ec?: string;
}): string {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://kanika-qr.example';
  const params = new URLSearchParams();
  params.set('mode', 'api');
  if (options.url) params.set('url', options.url);
  if (options.centerlogo) params.set('centerlogo', options.centerlogo);
  if (options.format && options.format !== 'view') params.set('format', options.format);
  if (options.ec && options.ec !== 'H') params.set('ec', options.ec);

  return `${origin}/?${params.toString()}`;
}
