import { PresetLogo, QRState } from '../types/qr';

export const PRESET_LOGOS: PresetLogo[] = [
  {
    id: 'apple',
    name: 'Apple App Store',
    category: 'store',
    brandBgColor: '#0071E3',
    defaultForeground: '#0071E3',
    iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 170 170" width="100%" height="100%">
      <defs>
        <linearGradient id="appStoreGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#1A88F8"/>
          <stop offset="100%" stop-color="#0063D3"/>
        </linearGradient>
      </defs>
      <rect width="170" height="170" rx="38" fill="url(#appStoreGrad)"/>
      <g stroke="#ffffff" stroke-width="14" stroke-linecap="round" stroke-linejoin="round" fill="none">
        <!-- Down-right rod (from top-left to bottom-right) -->
        <line x1="74" y1="44" x2="118" y2="126"/>
        <!-- Up-right rod (from bottom-left to top-right, crossing over top apex) -->
        <line x1="52" y1="126" x2="96" y2="44"/>
        <!-- Horizontal rod (crossing over up-right rod on left) -->
        <line x1="38" y1="102" x2="132" y2="102"/>
        <!-- Down-right rod segment (crossing over horizontal rod on right for authentic 3-rod weave) -->
        <line x1="97" y1="87" x2="118" y2="126"/>
      </g>
    </svg>`
  },
  {
    id: 'apple-brand',
    name: 'Apple',
    category: 'store',
    brandBgColor: '#000000',
    defaultForeground: '#000000',
    iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 170 170" width="100%" height="100%">
      <rect width="170" height="170" rx="36" fill="#000000"/>
      <path fill="#ffffff" d="M119.5 98.7c-.3-19.4 15.9-28.7 16.6-29.2-9-13.2-23.1-15-28.1-15.2-12-1.2-23.4 7.1-29.5 7.1-6.1 0-15.5-6.9-25.5-6.7-13.1.2-25.2 7.6-31.9 19.3-13.6 23.6-3.5 58.4 9.7 77.4 6.5 9.3 14.1 19.7 24.2 19.3 9.7-.4 13.4-6.3 25.1-6.3 11.7 0 15 6.3 25.2 6.1 10.4-.2 17-9.4 23.4-18.7 7.4-10.7 10.4-21.1 10.6-21.6-.3-.1-20.4-7.8-20.7-31.2zM103.8 46.1c5.4-6.5 9-15.6 8-24.7-7.7.3-17.1 5.2-22.6 11.6-4.9 5.6-9.1 14.8-8 23.6 8.6.7 17.3-4.4 22.6-10.5z"/>
    </svg>`
  },
  {
    id: 'google-play',
    name: 'Google Play',
    category: 'store',
    brandBgColor: '#01875F',
    defaultForeground: '#01875F',
    iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 170 170" width="100%" height="100%">
      <rect width="170" height="170" rx="38" fill="#ffffff"/>
      <rect width="168" height="168" x="1" y="1" rx="37" fill="none" stroke="#e2e8f0" stroke-width="2"/>
      <g transform="translate(42, 30) scale(3.42)">
        <!-- Bottom Red Sector -->
        <path fill="#EA4335" d="M13.54 15.28.12 29.34a3.66 3.66 0 0 0 5.33 2.16l15.1-8.6Z"/>
        <!-- Right Yellow Sector -->
        <path fill="#FBBC04" d="m27.11 12.89-6.53-3.74-7.35 6.45 7.38 7.28 6.48-3.7a3.54 3.54 0 0 0 1.5-4.79 3.62 3.62 0 0 0-1.5-1.5z"/>
        <!-- Left Blue Sector -->
        <path fill="#4285F4" d="M.12 2.66a3.57 3.57 0 0 0-.12.92v24.84a3.57 3.57 0 0 0 .12.92L14 15.64Z"/>
        <!-- Top Green Sector -->
        <path fill="#34A853" d="m13.64 16 6.94-6.85L5.5.51A3.73 3.73 0 0 0 3.63 0 3.64 3.64 0 0 0 .12 2.65Z"/>
      </g>
    </svg>`
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    category: 'chat',
    brandBgColor: '#25D366',
    defaultForeground: '#075E54',
    iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 170 170" width="100%" height="100%">
      <rect width="170" height="170" rx="36" fill="#25D366"/>
      <path fill="#ffffff" d="M126.7 43.3C115.6 32.2 100.8 26 85 26c-32.5 0-59 26.5-59 59 0 10.4 2.7 20.5 7.9 29.5L25 145l31.2-8.2c8.6 4.7 18.3 7.2 28.8 7.2 32.5 0 59-26.5 59-59 0-15.8-6.1-30.6-17.3-41.7zm-41.7 91.9c-8.8 0-17.5-2.4-25.1-6.9l-1.8-1.1-18.6 4.9 5-18.1-1.2-1.9c-5-7.9-7.6-17.1-7.6-26.7 0-27 22-49 49-49 13.1 0 25.4 5.1 34.6 14.4 9.3 9.2 14.4 21.5 14.4 34.6 0 27-22 49-48.7 49zm26.9-36.8c-1.5-.7-8.7-4.3-10-4.8-1.4-.5-2.4-.7-3.4.7-1 1.5-3.9 4.8-4.7 5.8-.9.9-1.7 1.1-3.2.4-1.5-.7-6.2-2.3-11.8-7.3-4.4-3.9-7.3-8.7-8.2-10.2-.9-1.5-.1-2.3.6-3 .7-.7 1.5-1.7 2.2-2.6.7-.9 1-1.5 1.5-2.4.5-1 .2-1.9-.1-2.6-.4-.7-3.4-8.2-4.7-11.2-1.2-3-2.5-2.5-3.4-2.6-.9 0-1.9-.1-2.9-.1-1 0-2.6.4-4 1.9-1.4 1.5-5.3 5.2-5.3 12.6 0 7.5 5.4 14.7 6.2 15.7.8 1.1 10.7 16.4 26 23 3.6 1.6 6.5 2.5 8.7 3.2 3.7 1.2 7 1 9.6.6 2.9-.4 8.7-3.6 10-7 1.2-3.4 1.2-6.4.9-7-.3-.6-1.3-1-2.8-1.7z"/>
    </svg>`
  },
  {
    id: 'instagram',
    name: 'Instagram',
    category: 'social',
    brandBgColor: '#E1306C',
    defaultForeground: '#833AB4',
    iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 170 170" width="100%" height="100%">
      <defs>
        <radialGradient id="instaGrad" cx="20%" cy="105%" r="130%">
          <stop offset="0%" stop-color="#FFDD55" />
          <stop offset="15%" stop-color="#FF5D3F" />
          <stop offset="50%" stop-color="#FF0069" />
          <stop offset="100%" stop-color="#833AB4" />
        </radialGradient>
      </defs>
      <rect width="170" height="170" rx="36" fill="url(#instaGrad)"/>
      <g fill="#ffffff">
        <path d="M85 55.4c-16.3 0-29.6 13.3-29.6 29.6s13.3 29.6 29.6 29.6 29.6-13.3 29.6-29.6-13.3-29.6-29.6-29.6zm0 48.7c-10.5 0-19.1-8.6-19.1-19.1S74.5 65.9 85 65.9s19.1 8.6 19.1 19.1-8.6 19.1-19.1 19.1z"/>
        <circle cx="116.5" cy="53.5" r="7"/>
        <path d="M125 32H45c-7.2 0-13 5.8-13 13v80c0 7.2 5.8 13 13 13h80c7.2 0 13-5.8 13-13V45c0-7.2-5.8-13-13-13zm2.5 93c0 1.4-1.1 2.5-2.5 2.5H45c-1.4 0-2.5-1.1-2.5-2.5V45c0-1.4 1.1-2.5 2.5-2.5h80c1.4 0 2.5 1.1 2.5 2.5v80z"/>
      </g>
    </svg>`
  },
  {
    id: 'x',
    name: 'X (Twitter)',
    category: 'social',
    brandBgColor: '#000000',
    defaultForeground: '#000000',
    iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 170 170" width="100%" height="100%">
      <rect width="170" height="170" rx="36" fill="#000000"/>
      <path fill="#ffffff" d="M103.5 38h15.7L84.8 77.7 125 131h-31.5L68.8 98.6 40.5 131H24.8l36.7-41.9L23 38h32.3l22.2 29.3L103.5 38zm-5.5 83.6h8.7L50.4 46.9h-9.3l56.9 74.7z"/>
    </svg>`
  },
  {
    id: 'youtube',
    name: 'YouTube',
    category: 'social',
    brandBgColor: '#FF0000',
    defaultForeground: '#CC0000',
    iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 170 170" width="100%" height="100%">
      <rect width="170" height="170" rx="36" fill="#FF0000"/>
      <path fill="#ffffff" d="M135.2 61.3c-1.2-4.6-4.8-8.2-9.4-9.4C117.5 49 85 49 85 49s-32.5 0-40.8 2.9c-4.6 1.2-8.2 4.8-9.4 9.4C32 69.6 32 85 32 85s0 15.4 2.8 23.7c1.2 4.6 4.8 8.2 9.4 9.4 8.3 2.9 40.8 2.9 40.8 2.9s32.5 0 40.8-2.9c4.6-1.2 8.2-4.8 9.4-9.4C138 100.4 138 85 138 85s0-15.4-2.8-23.7zM74 102V68l30 17-30 17z"/>
    </svg>`
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    category: 'social',
    brandBgColor: '#0A66C2',
    defaultForeground: '#0A66C2',
    iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 170 170" width="100%" height="100%">
      <rect width="170" height="170" rx="36" fill="#0A66C2"/>
      <path fill="#ffffff" d="M47.7 63.6h17.9v57.6H47.7V63.6zM56.7 35.8c5.7 0 10.3 4.6 10.3 10.3 0 5.7-4.6 10.3-10.3 10.3-5.7 0-10.3-4.6-10.3-10.3 0-5.7 4.6-10.3 10.3-10.3zM76.8 63.6h17.1v7.9h.2c2.4-4.5 8.2-9.3 16.9-9.3 18.1 0 21.4 11.9 21.4 27.4v31.6h-17.8V93.3c0-6.6-.1-15.2-9.2-15.2-9.3 0-10.7 7.2-10.7 14.7v28.4H76.8V63.6z"/>
    </svg>`
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    category: 'social',
    brandBgColor: '#010101',
    defaultForeground: '#000000',
    iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 170 170" width="100%" height="100%">
      <rect width="170" height="170" rx="36" fill="#010101"/>
      <path fill="#ffffff" d="M125.4 69.2c-7.9-.4-14.7-4.5-18.4-10.6v39.5c0 21.6-17.5 39.1-39.1 39.1-21.6 0-39.1-17.5-39.1-39.1s17.5-39.1 39.1-39.1c2.1 0 4.1.2 6.1.5V79c-2-.3-4-.5-6.1-.5-10.7 0-19.4 8.7-19.4 19.4s8.7 19.4 19.4 19.4 19.4-8.7 19.4-19.4V32.8h19.7c1.3 10.7 9.8 19.2 20.5 20.5v15.9h-2.1z"/>
    </svg>`
  },
  {
    id: 'facebook',
    name: 'Facebook',
    category: 'social',
    brandBgColor: '#1877F2',
    defaultForeground: '#1877F2',
    iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 170 170" width="100%" height="100%">
      <rect width="170" height="170" rx="36" fill="#1877F2"/>
      <path fill="#ffffff" d="M103.4 89.2l3.4-22.1H85.6V52.8c0-6.1 3-12 12.6-12h9.7V21.9s-8.8-1.5-17.3-1.5c-17.6 0-29.1 10.7-29.1 30v16.7H42.1v22.1h19.4v53.6c3.9.6 7.9.9 12.1.9s8.1-.3 12.1-.9V89.2h17.7z"/>
    </svg>`
  },
  {
    id: 'github',
    name: 'GitHub',
    category: 'social',
    brandBgColor: '#24292E',
    defaultForeground: '#24292E',
    iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 170 170" width="100%" height="100%">
      <rect width="170" height="170" rx="36" fill="#24292E"/>
      <path fill="#ffffff" d="M85 30c-30.4 0-55 24.6-55 55 0 24.3 15.8 44.9 37.6 52.2 2.8.5 3.8-1.2 3.8-2.7 0-1.3-.1-5.7-.1-10.4-15.3 3.3-18.5-6.5-18.5-6.5-2.5-6.4-6.1-8.1-6.1-8.1-5-3.4.4-3.4.4-3.4 5.5.4 8.5 5.7 8.5 5.7 4.9 8.4 12.9 6 16.1 4.6.5-3.6 1.9-6 3.5-7.4-12.2-1.4-25.1-6.1-25.1-27.2 0-6 2.1-10.9 5.7-14.8-.6-1.4-2.5-7 1.4-14.6 0 0 4.6-1.5 15.2 5.7 4.4-1.2 9.2-1.8 13.9-1.8s9.5.6 13.9 1.8c10.5-7.2 15.1-5.7 15.1-5.7 3.9 7.6 2 13.2 1.4 14.6 3.6 3.9 5.7 8.8 5.7 14.8 0 21.2-12.9 25.8-25.2 27.1 2 1.7 3.8 5.1 3.8 10.3 0 7.4-.1 13.4-.1 15.2 0 1.5 1 3.2 3.8 2.7 21.9-7.3 37.6-27.9 37.6-52.2 0-30.4-24.6-55-55-55z"/>
    </svg>`
  },
  {
    id: 'telegram',
    name: 'Telegram',
    category: 'chat',
    brandBgColor: '#229ED9',
    defaultForeground: '#229ED9',
    iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 170 170" width="100%" height="100%">
      <rect width="170" height="170" rx="36" fill="#229ED9"/>
      <path fill="#ffffff" d="M129.5 45.4l-16.7 78.8c-1.3 5.6-4.6 7-9.3 4.3l-25.5-18.8-12.3 11.9c-1.4 1.4-2.5 2.5-5.1 2.5l1.8-26 47.4-42.8c2.1-1.8-.4-2.9-3.2-1l-58.6 36.9-25.2-7.9c-5.5-1.7-5.6-5.5 1.1-8.1l98.5-38c4.6-1.7 8.6 1.1 7.1 8.2z"/>
    </svg>`
  },
  {
    id: 'spotify',
    name: 'Spotify',
    category: 'social',
    brandBgColor: '#1DB954',
    defaultForeground: '#1DB954',
    iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 170 170" width="100%" height="100%">
      <rect width="170" height="170" rx="36" fill="#1DB954"/>
      <path fill="#ffffff" d="M121.7 107.5c-1.3 2.1-4 2.8-6.1 1.5-16.8-10.3-38-12.6-62.9-6.9-2.4.6-4.8-.9-5.3-3.3-.6-2.4.9-4.8 3.3-5.3 27.4-6.3 50.8-3.6 69.5 7.8 2.1 1.3 2.8 4 1.5 6.2zm8.5-18.9c-1.6 2.6-5.1 3.4-7.7 1.8-21-12.9-53-16.7-77.9-9.1-3 .9-6.1-.8-7-3.8-.9-3 .8-6.1 3.8-7 28.5-8.6 63.8-4.4 87 9.9 2.6 1.6 3.4 5.1 1.8 8.2zm.9-19.8C106 53.9 64.6 52.6 40.7 59.8c-3.8 1.2-7.8-1-8.9-4.8-1.2-3.8 1-7.8 4.8-8.9 27.4-8.3 73.1-6.8 102.1 10.4 3.4 2 4.5 6.5 2.5 9.9-2 3.4-6.5 4.5-10.1 2.4z"/>
    </svg>`
  },
  {
    id: 'wifi',
    name: 'Wi-Fi Network',
    category: 'utility',
    brandBgColor: '#0284C7',
    defaultForeground: '#0369A1',
    iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 170 170" width="100%" height="100%">
      <rect width="170" height="170" rx="36" fill="#0284C7"/>
      <path fill="#ffffff" d="M85 120a12 12 0 100 24 12 12 0 000-24zm-32.5-22.6c17.9-17.9 47.1-17.9 65 0 2.3 2.3 6.1 2.3 8.5 0 2.3-2.3 2.3-6.1 0-8.5-22.6-22.6-59.4-22.6-82 0-2.3 2.3-2.3 6.1 0 8.5 2.4 2.4 6.1 2.4 8.5 0zm-17-17c27.3-27.3 71.7-27.3 99 0 2.3 2.3 6.1 2.3 8.5 0 2.3-2.3 2.3-6.1 0-8.5-32-32-84-32-116 0-2.3 2.3-2.3 6.1 0 8.5 2.3 2.4 6.1 2.4 8.5 0z"/>
    </svg>`
  },
  {
    id: 'globe',
    name: 'Website / Web',
    category: 'utility',
    brandBgColor: '#4F46E5',
    defaultForeground: '#4338CA',
    iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 170 170" width="100%" height="100%">
      <rect width="170" height="170" rx="36" fill="#4F46E5"/>
      <g fill="none" stroke="#ffffff" stroke-width="8" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="85" cy="85" r="48"/>
        <path d="M37 85h96"/>
        <ellipse cx="85" cy="85" rx="24" ry="48"/>
      </g>
    </svg>`
  }
];

export interface CuratedTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  badge: string;
  state: Partial<QRState>;
}

export const CURATED_TEMPLATES: CuratedTemplate[] = [
  {
    id: 'apple-store-dark',
    name: 'App Store Premium',
    description: 'Minimalist sleek dark theme with official Apple Store center badge and rounded finder eyes.',
    category: 'App Store',
    badge: 'Store',
    state: {
      contentType: 'appstore',
      appStore: { platform: 'apple', appId: '1234567890', customUrl: 'https://apps.apple.com/app/id1234567890' },
      rawText: 'https://apps.apple.com/app/id1234567890',
      errorCorrection: 'H',
      dotStyle: 'rounded',
      eyeFrameStyle: 'rounded',
      eyePupilStyle: 'rounded',
      colors: {
        type: 'solid',
        primary: '#0071E3',
        secondary: '#0058B3',
        gradientAngle: 45,
        background: '#ffffff',
        transparentBackground: false,
        customEyeColors: true,
        eyeFrameColor: '#0071E3',
        eyePupilColor: '#0058B3'
      },
      logo: {
        sourceType: 'preset',
        presetId: 'apple',
        sizeRatio: 0.23,
        bgShape: 'rounded',
        bgColor: '#ffffff',
        bgPadding: 6,
        borderWidth: 2,
        borderColor: '#dbeafe',
        removeModulesBehind: true
      },
      frame: {
        style: 'bottom-banner',
        text: 'GET ON APP STORE',
        textColor: '#ffffff',
        frameColor: '#0071E3'
      }
    }
  },
  {
    id: 'google-play-store',
    name: 'Google Play Official',
    description: 'Vibrant Android Google Play styling with verified center logo, emerald accent, and install banner.',
    category: 'App Store',
    badge: 'Google Play',
    state: {
      contentType: 'appstore',
      appStore: { platform: 'google', appId: 'com.instagram.android', customUrl: 'https://play.google.com/store/apps/details?id=com.instagram.android' },
      rawText: 'https://play.google.com/store/apps/details?id=com.instagram.android',
      errorCorrection: 'H',
      dotStyle: 'rounded',
      eyeFrameStyle: 'rounded',
      eyePupilStyle: 'rounded',
      colors: {
        type: 'solid',
        primary: '#01875F',
        secondary: '#00694a',
        gradientAngle: 45,
        background: '#ffffff',
        transparentBackground: false,
        customEyeColors: true,
        eyeFrameColor: '#01875F',
        eyePupilColor: '#00694a'
      },
      logo: {
        sourceType: 'preset',
        presetId: 'google-play',
        sizeRatio: 0.23,
        bgShape: 'rounded',
        bgColor: '#ffffff',
        bgPadding: 6,
        borderWidth: 2,
        borderColor: '#d1fae5',
        removeModulesBehind: true
      },
      frame: {
        style: 'bottom-banner',
        text: 'GET IT ON GOOGLE PLAY',
        textColor: '#ffffff',
        frameColor: '#01875F'
      }
    }
  },
  {
    id: 'whatsapp-chat',
    name: 'WhatsApp Quick Chat',
    description: 'High-contrast emerald WhatsApp branding designed for customer support & quick orders.',
    category: 'Messaging',
    badge: 'WhatsApp',
    state: {
      contentType: 'whatsapp',
      whatsapp: { countryCode: '+1', phone: '5550192834', message: 'Hello! I would like to inquire about your services.' },
      rawText: 'https://wa.me/15550192834?text=Hello%21%20I%20would%20like%20to%20inquire%20about%20your%20services.',
      errorCorrection: 'H',
      dotStyle: 'dots',
      eyeFrameStyle: 'circle',
      eyePupilStyle: 'circle',
      colors: {
        type: 'solid',
        primary: '#075E54',
        secondary: '#25D366',
        gradientAngle: 90,
        background: '#ffffff',
        transparentBackground: false,
        customEyeColors: true,
        eyeFrameColor: '#128C7E',
        eyePupilColor: '#25D366'
      },
      logo: {
        sourceType: 'preset',
        presetId: 'whatsapp',
        sizeRatio: 0.23,
        bgShape: 'circle',
        bgColor: '#ffffff',
        bgPadding: 6,
        borderWidth: 2,
        borderColor: '#dcfce7',
        removeModulesBehind: true
      },
      frame: {
        style: 'bottom-banner',
        text: 'CHAT ON WHATSAPP',
        textColor: '#ffffff',
        frameColor: '#075E54'
      }
    }
  },
  {
    id: 'instagram-gradient',
    name: 'Instagram Sunset',
    description: 'Vibrant sunset gradient with modern squircle center logo and circular dots.',
    category: 'Social',
    badge: 'Instagram',
    state: {
      contentType: 'social',
      social: { platform: 'instagram', username: 'studio.design' },
      rawText: 'https://instagram.com/studio.design',
      errorCorrection: 'H',
      dotStyle: 'dots',
      eyeFrameStyle: 'rounded',
      eyePupilStyle: 'circle',
      colors: {
        type: 'gradient',
        primary: '#833AB4',
        secondary: '#FD1D1D',
        gradientAngle: 45,
        background: '#ffffff',
        transparentBackground: false,
        customEyeColors: false
      },
      logo: {
        sourceType: 'preset',
        presetId: 'instagram',
        sizeRatio: 0.22,
        bgShape: 'rounded',
        bgColor: '#ffffff',
        bgPadding: 6,
        borderWidth: 2,
        borderColor: '#fce7f3',
        removeModulesBehind: true
      },
      frame: {
        style: 'bottom-banner',
        text: 'FOLLOW ON INSTAGRAM',
        textColor: '#ffffff',
        frameColor: '#C13584'
      }
    }
  },
  {
    id: 'wifi-hospitality',
    name: 'Guest Wi-Fi Sign',
    description: 'Clean indigo card layout for cafes, hotels, and offices with instant scan-to-connect.',
    category: 'Hospitality',
    badge: 'Wi-Fi',
    state: {
      contentType: 'wifi',
      wifi: { ssid: 'Guest_HighSpeed_WiFi', password: 'WelcomeGuest2026', encryption: 'WPA', hidden: false },
      rawText: 'WIFI:T:WPA;S:Guest_HighSpeed_WiFi;P:WelcomeGuest2026;;',
      errorCorrection: 'H',
      dotStyle: 'rounded',
      eyeFrameStyle: 'rounded',
      eyePupilStyle: 'rounded',
      colors: {
        type: 'solid',
        primary: '#0369a1',
        secondary: '#0284c7',
        gradientAngle: 0,
        background: '#ffffff',
        transparentBackground: false,
        customEyeColors: false
      },
      logo: {
        sourceType: 'preset',
        presetId: 'wifi',
        sizeRatio: 0.22,
        bgShape: 'circle',
        bgColor: '#ffffff',
        bgPadding: 6,
        borderWidth: 2,
        borderColor: '#e0f2fe',
        removeModulesBehind: true
      },
      frame: {
        style: 'polaroid',
        text: 'FREE GUEST WI-FI',
        textColor: '#0f172a',
        frameColor: '#f8fafc'
      }
    }
  },
  {
    id: 'modern-tech-brand',
    name: 'Modern Tech Cyber',
    description: 'Cyan to Indigo diagonal gradient with Website globe logo and extra-rounded modules.',
    category: 'Corporate',
    badge: 'Tech',
    state: {
      contentType: 'url',
      url: 'https://github.com',
      rawText: 'https://github.com',
      errorCorrection: 'H',
      dotStyle: 'classy',
      eyeFrameStyle: 'square',
      eyePupilStyle: 'circle',
      colors: {
        type: 'gradient',
        primary: '#0284c7',
        secondary: '#4f46e5',
        gradientAngle: 135,
        background: '#ffffff',
        transparentBackground: false,
        customEyeColors: false
      },
      logo: {
        sourceType: 'preset',
        presetId: 'globe',
        sizeRatio: 0.21,
        bgShape: 'rounded',
        bgColor: '#ffffff',
        bgPadding: 6,
        borderWidth: 2,
        borderColor: '#e0e7ff',
        removeModulesBehind: true
      },
      frame: {
        style: 'none',
        text: 'SCAN TO EXPLORE',
        textColor: '#ffffff',
        frameColor: '#1e1b4b'
      }
    }
  }
];
