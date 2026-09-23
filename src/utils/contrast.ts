// Contrast and scan-safety calculation utility

export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const sanitized = hex.replace(/^#/, '');
  if (sanitized.length === 3) {
    return {
      r: parseInt(sanitized[0] + sanitized[0], 16),
      g: parseInt(sanitized[1] + sanitized[1], 16),
      b: parseInt(sanitized[2] + sanitized[2], 16)
    };
  }
  if (sanitized.length === 6) {
    return {
      r: parseInt(sanitized.substring(0, 2), 16),
      g: parseInt(sanitized.substring(2, 4), 16),
      b: parseInt(sanitized.substring(4, 6), 16)
    };
  }
  return null;
}

export function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map(c => {
    const val = c / 255;
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

export function getContrastRatio(fgHex: string, bgHex: string): number {
  const fg = hexToRgb(fgHex) || { r: 0, g: 0, b: 0 };
  const bg = hexToRgb(bgHex) || { r: 255, g: 255, b: 255 };
  const l1 = getLuminance(fg.r, fg.g, fg.b);
  const l2 = getLuminance(bg.r, bg.g, bg.b);
  const brightest = Math.max(l1, l2);
  const darkest = Math.min(l1, l2);
  return (brightest + 0.05) / (darkest + 0.05);
}

export function isDarkOnLight(fgHex: string, bgHex: string): boolean {
  const fg = hexToRgb(fgHex) || { r: 0, g: 0, b: 0 };
  const bg = hexToRgb(bgHex) || { r: 255, g: 255, b: 255 };
  const lFg = getLuminance(fg.r, fg.g, fg.b);
  const lBg = getLuminance(bg.r, bg.g, bg.b);
  return lFg < lBg;
}

export interface ScanSafetyReport {
  contrastRatio: number;
  contrastStatus: 'optimal' | 'acceptable' | 'poor';
  isDarkOnLight: boolean;
  logoAreaPercent: number;
  maxRecommendedAreaPercent: number;
  errorCorrectionStatus: 'optimal' | 'warning' | 'critical';
  overallScore: number; // 0 - 100
  notes: string[];
}

export function evaluateScanSafety(
  fgColor: string,
  bgColor: string,
  hasLogo: boolean,
  logoSizeRatio: number,
  errorCorrection: 'L' | 'M' | 'Q' | 'H'
): ScanSafetyReport {
  const contrast = getContrastRatio(fgColor, bgColor);
  const darkOnLight = isDarkOnLight(fgColor, bgColor);

  let contrastStatus: 'optimal' | 'acceptable' | 'poor' = 'poor';
  if (contrast >= 7.0) contrastStatus = 'optimal';
  else if (contrast >= 4.0) contrastStatus = 'acceptable';

  // Area taken by logo
  const logoAreaPercent = hasLogo ? Math.round(logoSizeRatio * logoSizeRatio * 100) : 0;
  
  // Max error tolerance for each level
  const ecTolerance: Record<'L' | 'M' | 'Q' | 'H', number> = {
    L: 7,
    M: 15,
    Q: 25,
    H: 30
  };
  const tolerance = ecTolerance[errorCorrection];
  const maxRecommended = Math.round(tolerance * 0.75); // Leave 25% safety margin for camera distortion

  let ecStatus: 'optimal' | 'warning' | 'critical' = 'optimal';
  const notes: string[] = [];

  if (!darkOnLight) {
    notes.push('Inverted colors (light QR on dark background) might not be recognized by older camera scanners.');
  }

  if (contrastStatus === 'poor') {
    notes.push('Low contrast between QR dots and background may cause scan failures.');
  }

  if (hasLogo) {
    if (logoAreaPercent > tolerance) {
      ecStatus = 'critical';
      notes.push(`Logo occupies ~${logoAreaPercent}% area, which exceeds error recovery level (${tolerance}%). Increase Error Correction to "H".`);
    } else if (logoAreaPercent > maxRecommended) {
      ecStatus = 'warning';
      notes.push(`Logo occupies ~${logoAreaPercent}%, leaving a tight recovery margin. Recommended logo size ≤ 24%.`);
    } else {
      notes.push(`Logo size is well within ${errorCorrection} (30%) error correction limits.`);
    }
  }

  // Calculate score
  let score = 100;
  if (!darkOnLight) score -= 15;
  if (contrastStatus === 'poor') score -= 35;
  else if (contrastStatus === 'acceptable') score -= 10;

  if (ecStatus === 'critical') score -= 40;
  else if (ecStatus === 'warning') score -= 15;

  score = Math.max(10, Math.min(100, score));

  return {
    contrastRatio: Number(contrast.toFixed(1)),
    contrastStatus,
    isDarkOnLight: darkOnLight,
    logoAreaPercent,
    maxRecommendedAreaPercent: maxRecommended,
    errorCorrectionStatus: ecStatus,
    overallScore: score,
    notes
  };
}
