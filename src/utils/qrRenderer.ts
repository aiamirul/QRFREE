import QRCode from 'qrcode';
import { QRState, DotStyle, EyeFrameStyle, EyePupilStyle, LogoBgShape } from '../types/qr';
import { PRESET_LOGOS } from './presets';

// Helper to check if a module is part of the 3 finder patterns (including their 1-module quiet border)
export function isFinderPattern(row: number, col: number, size: number): boolean {
  // Top-left finder (7x7)
  if (row < 7 && col < 7) return true;
  // Top-right finder (7x7)
  if (row < 7 && col >= size - 7) return true;
  // Bottom-left finder (7x7)
  if (row >= size - 7 && col < 7) return true;
  return false;
}

// Check if module is within the center logo clearance zone (with optional calibration offset)
export function isInLogoZone(
  row: number, 
  col: number, 
  size: number, 
  sizeRatio: number,
  offsetX: number = 0,
  offsetY: number = 0
): boolean {
  const centerRow = (size - 1) / 2 + offsetY * size;
  const centerCol = (size - 1) / 2 + offsetX * size;
  // Calculate module radius for logo
  const logoModules = Math.ceil(size * sizeRatio) + 1;
  const half = logoModules / 2;
  return Math.abs(row - centerRow) <= half && Math.abs(col - centerCol) <= half;
}

// Cache loaded images
const imageCache = new Map<string, HTMLImageElement>();

export function getLogoSource(logoConfig: QRState['logo']): string | null {
  if (logoConfig.sourceType === 'none') return null;
  if (logoConfig.sourceType === 'preset' && logoConfig.presetId) {
    const preset = PRESET_LOGOS.find(p => p.id === logoConfig.presetId) ||
      (logoConfig.presetId === 'appstore' ? PRESET_LOGOS.find(p => p.id === 'apple') : undefined);
    if (!preset) return null;
    return `data:image/svg+xml;utf8,${encodeURIComponent(preset.iconSvg)}`;
  }
  if (logoConfig.sourceType === 'upload' && logoConfig.uploadDataUrl) {
    return logoConfig.uploadDataUrl;
  }
  if (logoConfig.sourceType === 'url') {
    // Prefer converted inlined dataUrl if present for CORS safety
    return logoConfig.uploadDataUrl || logoConfig.url || null;
  }
  return null;
}

export function loadLogoImage(src: string): Promise<HTMLImageElement> {
  if (imageCache.has(src)) {
    const cached = imageCache.get(src)!;
    if (cached.complete && cached.naturalWidth > 0) return Promise.resolve(cached);
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    const isDataUrl = src.startsWith('data:');
    if (!isDataUrl) {
      img.crossOrigin = 'anonymous';
    }
    
    img.onload = () => {
      imageCache.set(src, img);
      resolve(img);
    };
    
    img.onerror = () => {
      // If crossOrigin anonymous failed on an external URL, retry without crossOrigin
      if (!isDataUrl && img.crossOrigin) {
        const retryImg = new Image();
        retryImg.onload = () => {
          imageCache.set(src, retryImg);
          resolve(retryImg);
        };
        retryImg.onerror = (e) => reject(e);
        retryImg.src = src;
      } else {
        reject(new Error('Failed to load logo image'));
      }
    };
    
    img.src = src;
  });
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawModule(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  style: DotStyle
) {
  switch (style) {
    case 'dots': {
      ctx.beginPath();
      ctx.arc(x + size / 2, y + size / 2, (size / 2) * 0.88, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'rounded': {
      drawRoundedRect(ctx, x + size * 0.05, y + size * 0.05, size * 0.9, size * 0.9, size * 0.28);
      ctx.fill();
      break;
    }
    case 'extra-rounded': {
      drawRoundedRect(ctx, x + size * 0.06, y + size * 0.06, size * 0.88, size * 0.88, size * 0.44);
      ctx.fill();
      break;
    }
    case 'classy': {
      // Diamond / faceted module
      ctx.beginPath();
      const pad = size * 0.08;
      ctx.moveTo(x + size / 2, y + pad);
      ctx.lineTo(x + size - pad, y + size / 2);
      ctx.lineTo(x + size / 2, y + size - pad);
      ctx.lineTo(x + pad, y + size / 2);
      ctx.closePath();
      ctx.fill();
      break;
    }
    case 'square':
    default: {
      ctx.fillRect(x, y, size + 0.1, size + 0.1);
      break;
    }
  }
}

function drawFinderEye(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  moduleSize: number,
  frameStyle: EyeFrameStyle,
  pupilStyle: EyePupilStyle,
  frameColor: string | CanvasGradient,
  pupilColor: string | CanvasGradient,
  bgColor: string
) {
  const outerSize = 7 * moduleSize;
  const innerOffset = moduleSize;
  const innerSize = 5 * moduleSize;
  const pupilOffset = 2 * moduleSize;
  const pupilSize = 3 * moduleSize;

  // 1. Draw outer 7x7 frame
  ctx.fillStyle = frameColor;
  if (frameStyle === 'circle') {
    ctx.beginPath();
    ctx.arc(x + outerSize / 2, y + outerSize / 2, outerSize / 2, 0, Math.PI * 2);
    ctx.fill();
  } else if (frameStyle === 'rounded') {
    drawRoundedRect(ctx, x, y, outerSize, outerSize, moduleSize * 2.2);
    ctx.fill();
  } else {
    ctx.fillRect(x, y, outerSize, outerSize);
  }

  // 2. Cut out inner 5x5 hollow space with background color
  ctx.fillStyle = bgColor;
  if (frameStyle === 'circle') {
    ctx.beginPath();
    ctx.arc(x + outerSize / 2, y + outerSize / 2, innerSize / 2, 0, Math.PI * 2);
    ctx.fill();
  } else if (frameStyle === 'rounded') {
    drawRoundedRect(ctx, x + innerOffset, y + innerOffset, innerSize, innerSize, moduleSize * 1.4);
    ctx.fill();
  } else {
    ctx.fillRect(x + innerOffset, y + innerOffset, innerSize, innerSize);
  }

  // 3. Draw 3x3 Pupil
  ctx.fillStyle = pupilColor;
  const px = x + pupilOffset;
  const py = y + pupilOffset;
  if (pupilStyle === 'circle') {
    ctx.beginPath();
    ctx.arc(px + pupilSize / 2, py + pupilSize / 2, pupilSize / 2, 0, Math.PI * 2);
    ctx.fill();
  } else if (pupilStyle === 'rounded') {
    drawRoundedRect(ctx, px, py, pupilSize, pupilSize, moduleSize * 1.1);
    ctx.fill();
  } else {
    ctx.fillRect(px, py, pupilSize, pupilSize);
  }
}

export interface RenderOptions {
  forceOpaqueBackground?: boolean;
  opaqueBackgroundColor?: string;
}

export function getOutputDimensions(state: QRState, targetResolution: number): { width: number; height: number } {
  const hasBottomBanner = state.frame.style === 'bottom-banner';
  const hasTopBanner = state.frame.style === 'top-banner';
  const isPolaroid = state.frame.style === 'polaroid';
  const isMinimalBorder = state.frame.style === 'minimal-border';

  let bannerHeight = 0;
  let topBannerHeight = 0;
  let frameExtraWidth = 0;
  let frameExtraHeight = 0;

  if (hasBottomBanner) {
    bannerHeight = Math.round(targetResolution * 0.16);
  } else if (hasTopBanner) {
    topBannerHeight = Math.round(targetResolution * 0.16);
  } else if (isPolaroid) {
    bannerHeight = Math.round(targetResolution * 0.22);
    frameExtraWidth = Math.round(targetResolution * 0.08);
    frameExtraHeight = Math.round(targetResolution * 0.08);
  } else if (isMinimalBorder) {
    frameExtraWidth = Math.round(targetResolution * 0.04);
    frameExtraHeight = Math.round(targetResolution * 0.04);
  }

  const canvasWidth = targetResolution + frameExtraWidth;
  const canvasHeight = targetResolution + topBannerHeight + bannerHeight + frameExtraHeight;
  return { width: canvasWidth, height: canvasHeight };
}

export async function renderQRCodeToCanvas(
  canvas: HTMLCanvasElement,
  state: QRState,
  targetResolution = 800,
  options?: RenderOptions
): Promise<void> {
  const text = state.rawText.trim() || 'https://example.com';
  
  // Generate QR Code data model
  const qr = QRCode.create(text, {
    errorCorrectionLevel: state.errorCorrection
  });

  const moduleCount = qr.modules.size;
  const marginModules = state.margin;
  const totalModules = moduleCount + marginModules * 2;

  // Layout calculation for frames
  const hasBottomBanner = state.frame.style === 'bottom-banner';
  const hasTopBanner = state.frame.style === 'top-banner';
  const isPolaroid = state.frame.style === 'polaroid';
  const isMinimalBorder = state.frame.style === 'minimal-border';

  let bannerHeight = 0;
  let topBannerHeight = 0;
  let frameExtraWidth = 0;
  let frameExtraHeight = 0;

  if (hasBottomBanner) {
    bannerHeight = Math.round(targetResolution * 0.16);
  } else if (hasTopBanner) {
    topBannerHeight = Math.round(targetResolution * 0.16);
  } else if (isPolaroid) {
    bannerHeight = Math.round(targetResolution * 0.22);
    frameExtraWidth = Math.round(targetResolution * 0.08);
    frameExtraHeight = Math.round(targetResolution * 0.08);
  } else if (isMinimalBorder) {
    frameExtraWidth = Math.round(targetResolution * 0.04);
    frameExtraHeight = Math.round(targetResolution * 0.04);
  }

  const qrCanvasSize = targetResolution;
  const canvasWidth = qrCanvasSize + frameExtraWidth;
  const canvasHeight = qrCanvasSize + topBannerHeight + bannerHeight + frameExtraHeight;

  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  // Background Fill (support forced opaque background for JPG or print)
  const forceOpaque = options?.forceOpaqueBackground ?? false;
  const isTransparent = state.colors.transparentBackground && !forceOpaque;
  const bgFillColor = isTransparent
    ? 'transparent'
    : (state.colors.background && state.colors.background !== 'transparent'
        ? state.colors.background
        : (options?.opaqueBackgroundColor || '#ffffff'));
  
  if (isPolaroid || isMinimalBorder) {
    // Fill outer frame card
    ctx.fillStyle = state.frame.frameColor || '#ffffff';
    drawRoundedRect(ctx, 0, 0, canvasWidth, canvasHeight, 16);
    ctx.fill();

    if (isMinimalBorder) {
      ctx.strokeStyle = state.colors.primary;
      ctx.lineWidth = 3;
      ctx.stroke();
    }
  } else if (!isTransparent) {
    ctx.fillStyle = bgFillColor;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  }

  const qrOffsetX = frameExtraWidth / 2;
  const qrOffsetY = topBannerHeight + frameExtraHeight / 2;

  // Compute module pixel size
  const moduleSize = qrCanvasSize / totalModules;
  const originX = qrOffsetX + marginModules * moduleSize;
  const originY = qrOffsetY + marginModules * moduleSize;

  // Background behind QR area
  if (!isTransparent && (isPolaroid || isMinimalBorder)) {
    ctx.fillStyle = bgFillColor;
    ctx.fillRect(qrOffsetX, qrOffsetY, qrCanvasSize, qrCanvasSize);
  }

  // Create Foreground Gradient or Solid Color
  let fgStyle: string | CanvasGradient = state.colors.primary;
  if (state.colors.type === 'gradient') {
    let x1 = originX, y1 = originY, x2 = originX + moduleCount * moduleSize, y2 = originY + moduleCount * moduleSize;
    if (state.colors.gradientAngle === 0) {
      // Horizontal
      x2 = originX + moduleCount * moduleSize;
      y2 = originY;
    } else if (state.colors.gradientAngle === 90) {
      // Vertical
      x2 = originX;
      y2 = originY + moduleCount * moduleSize;
    } else if (state.colors.gradientAngle === 135) {
      // Opposite diagonal
      x1 = originX + moduleCount * moduleSize;
      x2 = originX;
      y2 = originY + moduleCount * moduleSize;
    }
    const grad = ctx.createLinearGradient(x1, y1, x2, y2);
    grad.addColorStop(0, state.colors.primary);
    grad.addColorStop(1, state.colors.secondary);
    fgStyle = grad;
  }

  const hasLogo = state.logo.sourceType !== 'none';
  const logoSource = getLogoSource(state.logo);

  // 1. Draw QR Body Modules
  ctx.fillStyle = fgStyle;
  for (let r = 0; r < moduleCount; r++) {
    for (let c = 0; c < moduleCount; c++) {
      // Skip finder patterns
      if (isFinderPattern(r, c, moduleCount)) continue;

      // Skip logo area if removeModulesBehind is true
      if (hasLogo && state.logo.removeModulesBehind && isInLogoZone(r, c, moduleCount, state.logo.sizeRatio, state.logo.offsetX || 0, state.logo.offsetY || 0)) {
        continue;
      }

      // Check if module is dark
      if (qr.modules.get(r, c)) {
        const mx = originX + c * moduleSize;
        const my = originY + r * moduleSize;
        drawModule(ctx, mx, my, moduleSize, state.dotStyle);
      }
    }
  }

  // 2. Draw Finder Eyes (3 Corners)
  const eyeFrameColor = state.colors.customEyeColors && state.colors.eyeFrameColor ? state.colors.eyeFrameColor : fgStyle;
  const eyePupilColor = state.colors.customEyeColors && state.colors.eyePupilColor ? state.colors.eyePupilColor : fgStyle;
  const eyeBg = isTransparent ? '#ffffff' : bgFillColor;

  // Top-Left
  drawFinderEye(
    ctx,
    originX,
    originY,
    moduleSize,
    state.eyeFrameStyle,
    state.eyePupilStyle,
    eyeFrameColor,
    eyePupilColor,
    eyeBg
  );

  // Top-Right
  drawFinderEye(
    ctx,
    originX + (moduleCount - 7) * moduleSize,
    originY,
    moduleSize,
    state.eyeFrameStyle,
    state.eyePupilStyle,
    eyeFrameColor,
    eyePupilColor,
    eyeBg
  );

  // Bottom-Left
  drawFinderEye(
    ctx,
    originX,
    originY + (moduleCount - 7) * moduleSize,
    moduleSize,
    state.eyeFrameStyle,
    state.eyePupilStyle,
    eyeFrameColor,
    eyePupilColor,
    eyeBg
  );

  // 3. Draw Center Logo (if enabled)
  if (hasLogo && logoSource) {
    try {
      const logoImg = await loadLogoImage(logoSource);
      const offsetXPixels = (state.logo.offsetX || 0) * qrCanvasSize;
      const offsetYPixels = (state.logo.offsetY || 0) * qrCanvasSize;
      const qrCenterPixelX = originX + (moduleCount * moduleSize) / 2 + offsetXPixels;
      const qrCenterPixelY = originY + (moduleCount * moduleSize) / 2 + offsetYPixels;
      
      const logoPixelSize = qrCanvasSize * state.logo.sizeRatio;
      const logoPadding = state.logo.bgPadding * (targetResolution / 500);
      const totalBadgeSize = logoPixelSize + logoPadding * 2;
      const badgeX = qrCenterPixelX - totalBadgeSize / 2;
      const badgeY = qrCenterPixelY - totalBadgeSize / 2;

      // Draw Badge Background & Border
      if (state.logo.bgShape !== 'none') {
        ctx.save();
        ctx.fillStyle = state.logo.bgColor || '#ffffff';
        if (state.logo.borderWidth > 0) {
          ctx.strokeStyle = state.logo.borderColor || '#e2e8f0';
          ctx.lineWidth = state.logo.borderWidth * (targetResolution / 500);
        }

        if (state.logo.bgShape === 'circle') {
          ctx.beginPath();
          ctx.arc(qrCenterPixelX, qrCenterPixelY, totalBadgeSize / 2, 0, Math.PI * 2);
          ctx.fill();
          if (state.logo.borderWidth > 0) ctx.stroke();
        } else if (state.logo.bgShape === 'rounded') {
          const cornerR = totalBadgeSize * 0.22;
          drawRoundedRect(ctx, badgeX, badgeY, totalBadgeSize, totalBadgeSize, cornerR);
          ctx.fill();
          if (state.logo.borderWidth > 0) ctx.stroke();
        } else {
          ctx.fillRect(badgeX, badgeY, totalBadgeSize, totalBadgeSize);
          if (state.logo.borderWidth > 0) ctx.strokeRect(badgeX, badgeY, totalBadgeSize, totalBadgeSize);
        }
        ctx.restore();
      }

      // Draw the Image
      const iconX = qrCenterPixelX - logoPixelSize / 2;
      const iconY = qrCenterPixelY - logoPixelSize / 2;

      ctx.save();
      if (state.logo.bgShape === 'circle' && state.logo.bgPadding === 0) {
        ctx.beginPath();
        ctx.arc(qrCenterPixelX, qrCenterPixelY, logoPixelSize / 2, 0, Math.PI * 2);
        ctx.clip();
      } else if (state.logo.bgShape === 'rounded' && state.logo.bgPadding === 0) {
        drawRoundedRect(ctx, iconX, iconY, logoPixelSize, logoPixelSize, logoPixelSize * 0.22);
        ctx.clip();
      }

      ctx.drawImage(logoImg, iconX, iconY, logoPixelSize, logoPixelSize);
      ctx.restore();
    } catch (e) {
      console.warn('Could not draw logo image:', e);
    }
  }

  // 4. Draw Frames / Banners
  if (hasBottomBanner) {
    const bannerY = qrOffsetY + qrCanvasSize;
    ctx.fillStyle = state.frame.frameColor || state.colors.primary;
    drawRoundedRect(ctx, qrOffsetX + 12, bannerY - 8, qrCanvasSize - 24, bannerHeight - 4, 12);
    ctx.fill();

    // Banner Text
    ctx.fillStyle = state.frame.textColor || '#ffffff';
    ctx.font = `700 ${Math.round(bannerHeight * 0.38)}px 'Space Grotesk', -apple-system, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(state.frame.text.toUpperCase() || 'SCAN ME', canvasWidth / 2, bannerY + bannerHeight / 2 - 10);
  } else if (hasTopBanner) {
    ctx.fillStyle = state.frame.frameColor || state.colors.primary;
    drawRoundedRect(ctx, qrOffsetX + 12, 12, qrCanvasSize - 24, topBannerHeight - 12, 12);
    ctx.fill();

    ctx.fillStyle = state.frame.textColor || '#ffffff';
    ctx.font = `700 ${Math.round(topBannerHeight * 0.38)}px 'Space Grotesk', -apple-system, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(state.frame.text.toUpperCase() || 'SCAN ME', canvasWidth / 2, topBannerHeight / 2 + 6);
  } else if (isPolaroid) {
    ctx.fillStyle = state.frame.textColor || '#0f172a';
    ctx.font = `700 ${Math.round(bannerHeight * 0.32)}px 'Space Grotesk', -apple-system, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(
      state.frame.text || 'SCAN TO CONNECT',
      canvasWidth / 2,
      canvasHeight - bannerHeight / 2 + 10
    );
  }
}

// Generate high-resolution SVG string for download
export function generateQRCodeSVG(state: QRState, targetSize = 1000): string {
  const text = state.rawText.trim() || 'https://example.com';
  const qr = QRCode.create(text, { errorCorrectionLevel: state.errorCorrection });
  const moduleCount = qr.modules.size;
  const margin = state.margin;
  const total = moduleCount + margin * 2;
  const modSize = targetSize / total;
  const origin = margin * modSize;

  const hasLogo = state.logo.sourceType !== 'none';
  const logoSource = getLogoSource(state.logo);

  let defs = '';
  let fgFill = state.colors.primary;

  if (state.colors.type === 'gradient') {
    const gradId = 'qr-gradient-' + Math.random().toString(36).substring(2, 8);
    let x1 = '0%', y1 = '0%', x2 = '100%', y2 = '100%';
    if (state.colors.gradientAngle === 0) { x2 = '100%'; y2 = '0%'; }
    else if (state.colors.gradientAngle === 90) { x2 = '0%'; y2 = '100%'; }
    else if (state.colors.gradientAngle === 135) { x1 = '100%'; y1 = '0%'; x2 = '0%'; y2 = '100%'; }

    defs = `<defs>
      <linearGradient id="${gradId}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">
        <stop offset="0%" stop-color="${state.colors.primary}" />
        <stop offset="100%" stop-color="${state.colors.secondary}" />
      </linearGradient>
    </defs>`;
    fgFill = `url(#${gradId})`;
  }

  let modulesSvg = '';
  for (let r = 0; r < moduleCount; r++) {
    for (let c = 0; c < moduleCount; c++) {
      if (isFinderPattern(r, c, moduleCount)) continue;
      if (hasLogo && state.logo.removeModulesBehind && isInLogoZone(r, c, moduleCount, state.logo.sizeRatio, state.logo.offsetX || 0, state.logo.offsetY || 0)) {
        continue;
      }
      if (qr.modules.get(r, c)) {
        const mx = origin + c * modSize;
        const my = origin + r * modSize;
        if (state.dotStyle === 'dots') {
          modulesSvg += `<circle cx="${mx + modSize / 2}" cy="${my + modSize / 2}" r="${modSize * 0.44}" fill="${fgFill}" />`;
        } else if (state.dotStyle === 'rounded' || state.dotStyle === 'extra-rounded') {
          const rx = state.dotStyle === 'extra-rounded' ? modSize * 0.44 : modSize * 0.28;
          modulesSvg += `<rect x="${mx}" y="${my}" width="${modSize}" height="${modSize}" rx="${rx}" fill="${fgFill}" />`;
        } else if (state.dotStyle === 'classy') {
          const pad = modSize * 0.08;
          modulesSvg += `<polygon points="${mx + modSize / 2},${my + pad} ${mx + modSize - pad},${my + modSize / 2} ${mx + modSize / 2},${my + modSize - pad} ${mx + pad},${my + modSize / 2}" fill="${fgFill}" />`;
        } else {
          modulesSvg += `<rect x="${mx}" y="${my}" width="${modSize + 0.1}" height="${modSize + 0.1}" fill="${fgFill}" />`;
        }
      }
    }
  }

  // Finder eyes helper for SVG
  const renderEyeSvg = (x: number, y: number) => {
    const outer = 7 * modSize;
    const inner = 5 * modSize;
    const pupil = 3 * modSize;
    const innerOff = modSize;
    const pupilOff = 2 * modSize;
    const eyeColor = state.colors.customEyeColors && state.colors.eyeFrameColor ? state.colors.eyeFrameColor : fgFill;
    const pupilColor = state.colors.customEyeColors && state.colors.eyePupilColor ? state.colors.eyePupilColor : fgFill;
    const bg = state.colors.transparentBackground ? '#ffffff' : state.colors.background;

    let res = '';
    // Outer
    if (state.eyeFrameStyle === 'circle') {
      res += `<circle cx="${x + outer / 2}" cy="${y + outer / 2}" r="${outer / 2}" fill="${eyeColor}" />`;
      res += `<circle cx="${x + outer / 2}" cy="${y + outer / 2}" r="${inner / 2}" fill="${bg}" />`;
    } else if (state.eyeFrameStyle === 'rounded') {
      res += `<rect x="${x}" y="${y}" width="${outer}" height="${outer}" rx="${modSize * 2.2}" fill="${eyeColor}" />`;
      res += `<rect x="${x + innerOff}" y="${y + innerOff}" width="${inner}" height="${inner}" rx="${modSize * 1.4}" fill="${bg}" />`;
    } else {
      res += `<rect x="${x}" y="${y}" width="${outer}" height="${outer}" fill="${eyeColor}" />`;
      res += `<rect x="${x + innerOff}" y="${y + innerOff}" width="${inner}" height="${inner}" fill="${bg}" />`;
    }

    // Pupil
    const px = x + pupilOff;
    const py = y + pupilOff;
    if (state.eyePupilStyle === 'circle') {
      res += `<circle cx="${px + pupil / 2}" cy="${py + pupil / 2}" r="${pupil / 2}" fill="${pupilColor}" />`;
    } else if (state.eyePupilStyle === 'rounded') {
      res += `<rect x="${px}" y="${py}" width="${pupil}" height="${pupil}" rx="${modSize * 1.1}" fill="${pupilColor}" />`;
    } else {
      res += `<rect x="${px}" y="${py}" width="${pupil}" height="${pupil}" fill="${pupilColor}" />`;
    }
    return res;
  };

  const eyeTL = renderEyeSvg(origin, origin);
  const eyeTR = renderEyeSvg(origin + (moduleCount - 7) * modSize, origin);
  const eyeBL = renderEyeSvg(origin, origin + (moduleCount - 7) * modSize);

  // Logo SVG
  let logoSvg = '';
  if (hasLogo && logoSource) {
    const offsetX = (state.logo.offsetX || 0) * targetSize;
    const offsetY = (state.logo.offsetY || 0) * targetSize;
    const center = targetSize / 2;
    const badgeCenterX = center + offsetX;
    const badgeCenterY = center + offsetY;
    const logoSize = targetSize * state.logo.sizeRatio;
    const pad = state.logo.bgPadding * 2;
    const badgeSize = logoSize + pad * 2;
    const badgeX = badgeCenterX - badgeSize / 2;
    const badgeY = badgeCenterY - badgeSize / 2;
    const iconX = badgeCenterX - logoSize / 2;
    const iconY = badgeCenterY - logoSize / 2;

    if (state.logo.bgShape !== 'none') {
      const bColor = state.logo.bgColor || '#ffffff';
      const stroke = state.logo.borderWidth > 0 ? `stroke="${state.logo.borderColor}" stroke-width="${state.logo.borderWidth * 2}"` : '';
      if (state.logo.bgShape === 'circle') {
        logoSvg += `<circle cx="${badgeCenterX}" cy="${badgeCenterY}" r="${badgeSize / 2}" fill="${bColor}" ${stroke} />`;
      } else if (state.logo.bgShape === 'rounded') {
        logoSvg += `<rect x="${badgeX}" y="${badgeY}" width="${badgeSize}" height="${badgeSize}" rx="${badgeSize * 0.22}" fill="${bColor}" ${stroke} />`;
      } else {
        logoSvg += `<rect x="${badgeX}" y="${badgeY}" width="${badgeSize}" height="${badgeSize}" fill="${bColor}" ${stroke} />`;
      }
    }

    logoSvg += `<image href="${logoSource}" x="${iconX}" y="${iconY}" width="${logoSize}" height="${logoSize}" />`;
  }

  const bgRect = !state.colors.transparentBackground 
    ? `<rect width="${targetSize}" height="${targetSize}" fill="${state.colors.background}" />` 
    : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${targetSize} ${targetSize}" width="100%" height="100%">
    ${defs}
    ${bgRect}
    ${modulesSvg}
    ${eyeTL}
    ${eyeTR}
    ${eyeBL}
    ${logoSvg}
  </svg>`;
}

export const generateQRCodeSvg = generateQRCodeSVG;
