export type ContentType = 
  | 'url' 
  | 'whatsapp' 
  | 'appstore' 
  | 'social' 
  | 'wifi' 
  | 'vcard' 
  | 'text' 
  | 'email';

export type DotStyle = 'square' | 'dots' | 'rounded' | 'classy' | 'extra-rounded';

export type EyeFrameStyle = 'square' | 'rounded' | 'circle';
export type EyePupilStyle = 'square' | 'rounded' | 'circle';

export type LogoBgShape = 'circle' | 'rounded' | 'square' | 'none';

export type FrameStyle = 'none' | 'bottom-banner' | 'top-banner' | 'polaroid' | 'minimal-border';

export type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';

export interface PresetLogo {
  id: string;
  name: string;
  category: 'store' | 'chat' | 'social' | 'utility';
  iconSvg: string; // SVG string or data URL
  defaultColor?: string;
  brandBgColor?: string;
  defaultForeground?: string;
}

export interface SavedLogo {
  id: string;
  name: string;
  sourceType: 'url' | 'upload';
  url?: string;
  dataUrl: string;
  width?: number;
  height?: number;
  createdAt: number;
}

export interface LogoConfig {
  sourceType: 'preset' | 'url' | 'upload' | 'none';
  presetId?: string;
  url?: string;
  uploadDataUrl?: string;
  savedLogoId?: string;
  sizeRatio: number; // 0.15 to 0.32 (percentage of QR width)
  bgShape: LogoBgShape;
  bgColor: string;
  bgPadding: number; // in pixels at base resolution
  borderWidth: number;
  borderColor: string;
  removeModulesBehind: boolean;
  offsetX?: number; // center calibration X (-0.15 to +0.15, default 0)
  offsetY?: number; // center calibration Y (-0.15 to +0.15, default 0)
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  contentType: ContentType;
  title: string;
  rawText: string;
  state: QRState;
}

export interface ColorConfig {
  type: 'solid' | 'gradient';
  primary: string;
  secondary: string;
  gradientAngle: number; // 0, 45, 90, 135
  background: string;
  transparentBackground: boolean;
  eyeFrameColor?: string;
  eyePupilColor?: string;
  customEyeColors: boolean;
}

export interface FrameConfig {
  style: FrameStyle;
  text: string;
  textColor: string;
  frameColor: string;
}

export interface QRState {
  // Content
  contentType: ContentType;
  rawText: string;
  
  // Specific content builders
  url: string;
  whatsapp: {
    countryCode: string;
    phone: string;
    message: string;
  };
  appStore: {
    platform: 'apple' | 'google';
    appId: string;
    customUrl: string;
  };
  social: {
    platform: 'instagram' | 'x' | 'linkedin' | 'youtube' | 'tiktok' | 'facebook' | 'github';
    username: string;
  };
  wifi: {
    ssid: string;
    password: string;
    encryption: 'WPA' | 'WEP' | 'nopass';
    hidden: boolean;
  };
  vcard: {
    firstName: string;
    lastName: string;
    organization: string;
    title: string;
    phone: string;
    email: string;
    website: string;
  };
  text: {
    content: string;
  };
  email: {
    address: string;
    subject: string;
    body: string;
  };

  // Aesthetics
  errorCorrection: ErrorCorrectionLevel;
  dotStyle: DotStyle;
  eyeFrameStyle: EyeFrameStyle;
  eyePupilStyle: EyePupilStyle;
  margin: number; // margin modules
  colors: ColorConfig;
  logo: LogoConfig;
  frame: FrameConfig;
}
