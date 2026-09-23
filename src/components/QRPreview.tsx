import React, { useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  Download, 
  Copy, 
  Printer, 
  Check, 
  Info, 
  ExternalLink,
  Sparkles,
  Maximize2,
  Sliders,
  FileImage,
  Layers,
  ChevronDown,
  AlertCircle
} from 'lucide-react';
import { QRState } from '../types/qr';
import { 
  renderQRCodeToCanvas, 
  generateQRCodeSVG, 
  getOutputDimensions 
} from '../utils/qrRenderer';
import { evaluateScanSafety } from '../utils/contrast';

interface QRPreviewProps {
  state: QRState;
  onOpenPrint: () => void;
  onCopySuccess: () => void;
  copySuccess: boolean;
  onRegisterExportHandlers?: (handlers: {
    downloadPng: () => void;
    downloadJpg: () => void;
    downloadSvg: () => void;
  }) => void;
}

const RESOLUTION_PRESETS = [
  { label: '512 px', value: 512, desc: 'Web / Social' },
  { label: '1024 px', value: 1024, desc: 'HD Standard' },
  { label: '2048 px', value: 2048, desc: '2K Ultra' },
  { label: '4096 px', value: 4096, desc: '4K Print' },
];

export const QRPreview: React.FC<QRPreviewProps> = ({
  state,
  onOpenPrint,
  onCopySuccess,
  copySuccess,
  onRegisterExportHandlers
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [resolution, setResolution] = useState<number>(1024);
  const [isCustomResolution, setIsCustomResolution] = useState<boolean>(false);
  const [customInputVal, setCustomInputVal] = useState<string>('1024');
  const [jpgQuality, setJpgQuality] = useState<number>(0.95);
  const [showFormatSettings, setShowFormatSettings] = useState<boolean>(false);
  const [isRendering, setIsRendering] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<'png' | 'jpg' | 'svg' | null>(null);
  const [activeTab, setActiveTab] = useState<'preview' | 'scanCheck' | 'payload'>('preview');

  // Calculate actual output dimensions including banners / frames
  const outputDimensions = getOutputDimensions(state, resolution);
  const printWidthInches = (outputDimensions.width / 300).toFixed(1);
  const printHeightInches = (outputDimensions.height / 300).toFixed(1);
  const printWidthCm = ((outputDimensions.width / 300) * 2.54).toFixed(1);
  const printHeightCm = ((outputDimensions.height / 300) * 2.54).toFixed(1);

  // Calculate scan safety
  const hasLogo = state.logo.sourceType !== 'none';
  const scanReport = evaluateScanSafety(
    state.colors.primary,
    state.colors.background,
    hasLogo,
    state.logo.sizeRatio,
    state.errorCorrection
  );

  // Render QR code to preview canvas whenever state or resolution changes
  useEffect(() => {
    let isCancelled = false;

    const render = async () => {
      if (!canvasRef.current) return;
      setIsRendering(true);
      try {
        await renderQRCodeToCanvas(canvasRef.current, state, 700);
      } catch (err) {
        console.error('Render error:', err);
      } finally {
        if (!isCancelled) setIsRendering(false);
      }
    };

    render();

    return () => {
      isCancelled = true;
    };
  }, [state]);

  const handleDownloadPng = async () => {
    setIsExporting('png');
    try {
      const offscreen = document.createElement('canvas');
      await renderQRCodeToCanvas(offscreen, state, resolution);
      
      const link = document.createElement('a');
      link.download = `qrcode-${resolution}px-${Date.now()}.png`;
      link.href = offscreen.toDataURL('image/png');
      link.click();

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.75 }
      });
    } catch (e) {
      console.error('PNG export failed:', e);
    } finally {
      setIsExporting(null);
    }
  };

  const handleDownloadJpg = async () => {
    setIsExporting('jpg');
    try {
      const offscreen = document.createElement('canvas');
      // For JPG: force opaque background (clean white or user's chosen background)
      // to avoid black transparency artifacts
      await renderQRCodeToCanvas(offscreen, state, resolution, {
        forceOpaqueBackground: true,
        opaqueBackgroundColor: state.colors.background && state.colors.background !== 'transparent'
          ? state.colors.background
          : '#ffffff'
      });
      
      const link = document.createElement('a');
      link.download = `qrcode-${resolution}px-${Date.now()}.jpg`;
      link.href = offscreen.toDataURL('image/jpeg', jpgQuality);
      link.click();

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.75 }
      });
    } catch (e) {
      console.error('JPG export failed:', e);
    } finally {
      setIsExporting(null);
    }
  };

  const handleDownloadSvg = () => {
    setIsExporting('svg');
    try {
      const svgString = generateQRCodeSVG(state, resolution);
      const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `qrcode-vector-${Date.now()}.svg`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);

      confetti({
        particleCount: 40,
        spread: 50,
        origin: { y: 0.75 }
      });
    } catch (e) {
      console.error('SVG export failed:', e);
    } finally {
      setIsExporting(null);
    }
  };

  // Register external triggers (e.g. from topbar)
  useEffect(() => {
    if (onRegisterExportHandlers) {
      onRegisterExportHandlers({
        downloadPng: handleDownloadPng,
        downloadJpg: handleDownloadJpg,
        downloadSvg: handleDownloadSvg,
      });
    }
  }, [resolution, state, jpgQuality, onRegisterExportHandlers]);

  const handleCopy = async () => {
    try {
      const offscreen = document.createElement('canvas');
      await renderQRCodeToCanvas(offscreen, state, 1024);
      offscreen.toBlob(async (blob) => {
        if (!blob) return;
        try {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ]);
          onCopySuccess();
        } catch (clipErr) {
          console.warn('Clipboard write failed, fallback data URL copy', clipErr);
          await navigator.clipboard.writeText(state.rawText);
          onCopySuccess();
        }
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleSelectPresetResolution = (val: number) => {
    setResolution(val);
    setCustomInputVal(val.toString());
    setIsCustomResolution(false);
  };

  const handleCustomResolutionChange = (valStr: string) => {
    setCustomInputVal(valStr);
    const parsed = parseInt(valStr, 10);
    if (!isNaN(parsed) && parsed >= 128 && parsed <= 5000) {
      setResolution(parsed);
    }
  };

  const handleSliderResolution = (val: number) => {
    setResolution(val);
    setCustomInputVal(val.toString());
    const isPreset = RESOLUTION_PRESETS.some(p => p.value === val);
    setIsCustomResolution(!isPreset);
  };

  const stepResolution = (delta: number) => {
    const nextVal = Math.min(5000, Math.max(256, resolution + delta));
    setResolution(nextVal);
    setCustomInputVal(nextVal.toString());
    const isPreset = RESOLUTION_PRESETS.some(p => p.value === nextVal);
    setIsCustomResolution(!isPreset);
  };

  return (
    <div className="lg:sticky lg:top-20 space-y-4">
      {/* Main Preview Card */}
      <div className="bg-slate-900/80 rounded-2xl p-5 border border-slate-800 shadow-xl backdrop-blur-md">
        {/* Header with status badge */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-300 font-display">
              Live Preview
            </span>
            <span className="text-[11px] text-slate-500">·</span>
            <span className="text-[11px] font-mono text-indigo-400">
              {state.errorCorrection} Level
            </span>
          </div>

          {/* Quick Segmented view switch */}
          <div className="flex items-center gap-1 p-0.5 bg-slate-950 rounded-lg border border-slate-800 text-[11px]">
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-2 py-0.5 rounded transition-colors ${
                activeTab === 'preview' ? 'bg-slate-800 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Visual
            </button>
            <button
              onClick={() => setActiveTab('scanCheck')}
              className={`px-2 py-0.5 rounded flex items-center gap-1 transition-colors ${
                activeTab === 'scanCheck' ? 'bg-slate-800 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>Audit</span>
              <span className={`w-1.5 h-1.5 rounded-full ${
                scanReport.overallScore >= 80 ? 'bg-emerald-400' : 'bg-amber-400'
              }`} />
            </button>
            <button
              onClick={() => setActiveTab('payload')}
              className={`px-2 py-0.5 rounded transition-colors ${
                activeTab === 'payload' ? 'bg-slate-800 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Payload
            </button>
          </div>
        </div>

        {/* Tab 1: Visual Canvas Preview */}
        {activeTab === 'preview' && (
          <div className="relative group">
            {/* Canvas Container with subtle pattern */}
            <div className="relative aspect-square max-w-[360px] mx-auto rounded-xl p-4 flex items-center justify-center bg-slate-950/90 border border-slate-800 shadow-inner overflow-hidden">
              <canvas
                ref={canvasRef}
                className="w-full h-full object-contain rounded-lg transition-transform duration-200 group-hover:scale-[1.01]"
              />
              {isRendering && (
                <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[1px] flex items-center justify-center rounded-xl">
                  <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>

            {/* Quick action overlay chips */}
            <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Ready to Scan</span>
              </span>
              <span className="font-mono text-slate-400">
                {state.rawText.length} characters
              </span>
            </div>
          </div>
        )}

        {/* Tab 2: Scanability Audit */}
        {activeTab === 'scanCheck' && (
          <div className="space-y-3 py-1">
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Scan Reliability Score</p>
                <p className="text-2xl font-bold font-display text-white mt-0.5 tabular-nums">
                  {scanReport.overallScore}/100
                </p>
              </div>
              <div className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                scanReport.overallScore >= 80 
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                  : scanReport.overallScore >= 60
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
              }`}>
                {scanReport.overallScore >= 80 ? 'Optimal' : scanReport.overallScore >= 60 ? 'Acceptable' : 'Warning'}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 bg-slate-950/80 rounded-lg border border-slate-800">
                <span className="text-slate-400 block">Contrast Ratio</span>
                <span className="font-mono text-slate-200 text-sm font-semibold tabular-nums">
                  {scanReport.contrastRatio}:1
                </span>
                <span className={`text-[10px] block mt-0.5 ${
                  scanReport.contrastStatus === 'optimal' ? 'text-emerald-400' : 'text-amber-400'
                }`}>
                  {scanReport.contrastStatus === 'optimal' ? 'High Contrast' : 'Check Lighting'}
                </span>
              </div>

              <div className="p-2.5 bg-slate-950/80 rounded-lg border border-slate-800">
                <span className="text-slate-400 block">Logo Area</span>
                <span className="font-mono text-slate-200 text-sm font-semibold tabular-nums">
                  ~{scanReport.logoAreaPercent}%
                </span>
                <span className={`text-[10px] block mt-0.5 ${
                  scanReport.errorCorrectionStatus === 'optimal' ? 'text-emerald-400' : 'text-amber-400'
                }`}>
                  Max Safe: {scanReport.maxRecommendedAreaPercent}%
                </span>
              </div>
            </div>

            {/* Audit bullet tips */}
            <div className="space-y-1.5 pt-1">
              {scanReport.notes.map((note, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-slate-300 bg-slate-950/50 p-2 rounded-lg border border-slate-800/60">
                  <Info className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                  <span className="leading-snug">{note}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Payload Inspector */}
        {activeTab === 'payload' && (
          <div className="space-y-3 py-1">
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <label className="block text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-1">
                Decoded Content String
              </label>
              <div className="font-mono text-xs text-indigo-300 bg-slate-900/90 p-2.5 rounded-lg border border-slate-800 break-all max-h-32 overflow-y-auto">
                {state.rawText}
              </div>
            </div>

            {state.rawText.startsWith('http') && (
              <a
                href={state.rawText}
                target="_blank"
                rel="noreferrer noopener"
                className="flex items-center justify-center gap-1.5 w-full py-2 bg-slate-950 hover:bg-slate-800 text-indigo-400 text-xs font-semibold rounded-lg border border-slate-800 transition-colors"
              >
                <span>Test Link in New Tab</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* Resolution Control & Export Engine */}
        {/* ============================================================ */}
        <div className="mt-5 pt-4 border-t border-slate-800 space-y-4">
          {/* Resolution Header */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <label className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                <span>Export Resolution</span>
              </label>
              <span className="text-[11px] font-mono text-indigo-300 font-semibold bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                {resolution} × {resolution} px
              </span>
            </div>

            {/* Resolution Preset Buttons */}
            <div className="grid grid-cols-4 gap-1.5 mb-2.5">
              {RESOLUTION_PRESETS.map((preset) => {
                const isSelected = !isCustomResolution && resolution === preset.value;
                return (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => handleSelectPresetResolution(preset.value)}
                    className={`py-1.5 px-2 rounded-lg text-xs font-medium border text-center transition-all ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm font-semibold'
                        : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    <span className="block text-xs">{preset.label}</span>
                    <span className={`block text-[9px] mt-0.5 ${isSelected ? 'text-indigo-200' : 'text-slate-500'}`}>
                      {preset.desc}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Custom Resolution Range & Exact Input */}
            <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800/80 space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="256"
                  max="4096"
                  step="64"
                  value={resolution}
                  onChange={(e) => handleSliderResolution(parseInt(e.target.value, 10))}
                  className="flex-1 accent-indigo-500 bg-slate-800 rounded h-1.5 cursor-pointer"
                />
                
                {/* Numeric input with buttons */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => stepResolution(-128)}
                    className="w-6 h-6 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs flex items-center justify-center font-mono"
                    title="-128px"
                  >
                    -
                  </button>
                  <div className="relative">
                    <input
                      type="number"
                      min="128"
                      max="5000"
                      value={customInputVal}
                      onChange={(e) => {
                        setIsCustomResolution(true);
                        handleCustomResolutionChange(e.target.value);
                      }}
                      className="w-16 bg-slate-900 border border-slate-700 rounded px-1.5 py-0.5 text-center text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => stepResolution(128)}
                    className="w-6 h-6 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs flex items-center justify-center font-mono"
                    title="+128px"
                  >
                    +
                  </button>
                  <span className="text-[11px] text-slate-500 pl-0.5">px</span>
                </div>
              </div>

              {/* Dimensions & 300 DPI Print Size Calculation */}
              <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-850">
                <span className="flex items-center gap-1">
                  <span className="text-slate-500">Output:</span>
                  <strong className="text-slate-300 font-mono">
                    {outputDimensions.width} × {outputDimensions.height} px
                  </strong>
                </span>
                <span className="text-slate-400">
                  Print @ 300 DPI: <strong className="text-indigo-300 font-mono">{printWidthInches}&quot; × {printHeightInches}&quot;</strong> ({printWidthCm} × {printHeightCm} cm)
                </span>
              </div>
            </div>
          </div>

          {/* Quick Format Settings Accordion */}
          <div>
            <button
              type="button"
              onClick={() => setShowFormatSettings(!showFormatSettings)}
              className="flex items-center justify-between w-full text-[11px] text-slate-400 hover:text-slate-200 py-1 transition-colors"
            >
              <span className="flex items-center gap-1.5">
                <FileImage className="w-3 h-3 text-slate-400" />
                <span>Format options (JPG quality & PNG transparency)</span>
              </span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showFormatSettings ? 'rotate-180' : ''}`} />
            </button>

            {showFormatSettings && (
              <div className="mt-2 p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2.5 text-xs text-slate-300 animate-in fade-in duration-150">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">JPG Quality</span>
                  <div className="flex items-center gap-1">
                    {[
                      { label: '85% (Web)', val: 0.85 },
                      { label: '95% (High)', val: 0.95 },
                      { label: '100% (Max)', val: 1.0 },
                    ].map((q) => (
                      <button
                        key={q.val}
                        type="button"
                        onClick={() => setJpgQuality(q.val)}
                        className={`px-2 py-0.5 rounded text-[11px] font-medium border ${
                          jpgQuality === q.val
                            ? 'bg-indigo-600 text-white border-indigo-500'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {q.label}
                      </button>
                    ))}
                  </div>
                </div>

                {state.colors.transparentBackground && (
                  <div className="flex items-start gap-1.5 p-2 rounded bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-400" />
                    <span>
                      <strong>JPG Format Note:</strong> JPG does not support transparent alpha channels. JPG export automatically fills the background with solid white so your QR code scans flawlessly without dark artifacts. Use <strong>PNG</strong> if you need transparent backgrounds.
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Primary Action Buttons Grid */}
          <div className="space-y-2 pt-1">
            <div className="grid grid-cols-2 gap-2">
              {/* PNG Download Button */}
              <button
                type="button"
                onClick={handleDownloadPng}
                disabled={isExporting !== null}
                className="flex items-center justify-center gap-2 py-2.5 px-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition-all shadow-md shadow-indigo-600/20 active:scale-98 disabled:opacity-50"
                title={`Download PNG at ${resolution}px resolution`}
              >
                <Download className="w-4 h-4" />
                <span>
                  {isExporting === 'png' ? 'Generating...' : `Download PNG`}
                </span>
                <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded font-mono font-normal">
                  {resolution}px
                </span>
              </button>

              {/* JPG Download Button */}
              <button
                type="button"
                onClick={handleDownloadJpg}
                disabled={isExporting !== null}
                className="flex items-center justify-center gap-2 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold transition-all shadow-md shadow-emerald-600/20 active:scale-98 disabled:opacity-50"
                title={`Download JPG at ${resolution}px resolution`}
              >
                <Download className="w-4 h-4" />
                <span>
                  {isExporting === 'jpg' ? 'Generating...' : `Download JPG`}
                </span>
                <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded font-mono font-normal">
                  {resolution}px
                </span>
              </button>
            </div>

            {/* Secondary Buttons: Vector SVG, Clipboard Copy, Print Sheet */}
            <div className="grid grid-cols-3 gap-2 pt-1">
              <button
                type="button"
                onClick={handleDownloadSvg}
                disabled={isExporting !== null}
                className="flex items-center justify-center gap-1.5 py-2 px-2.5 bg-slate-800 hover:bg-slate-750 text-slate-200 rounded-xl text-xs font-medium border border-slate-700/80 transition-all active:scale-98"
                title="Download scalable vector SVG for Adobe Illustrator, Figma, or print"
              >
                <Maximize2 className="w-3.5 h-3.5 text-sky-400" />
                <span>Vector SVG</span>
              </button>

              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center justify-center gap-1.5 py-2 px-2.5 bg-slate-950 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-medium border border-slate-800 transition-colors"
              >
                {copySuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-300">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                    <span>Copy</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={onOpenPrint}
                className="flex items-center justify-center gap-1.5 py-2 px-2.5 bg-slate-950 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-medium border border-slate-800 transition-colors"
              >
                <Printer className="w-3.5 h-3.5 text-slate-400" />
                <span>Print</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Format recommendation card */}
      <div className="bg-slate-900/40 rounded-xl p-3.5 border border-slate-800/60 text-xs text-slate-400 space-y-2">
        <p className="font-semibold text-slate-300 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Export Formats Guide</span>
        </p>
        <div className="grid grid-cols-3 gap-2 text-[11px]">
          <div className="p-2 rounded bg-slate-950/60 border border-slate-800/60">
            <strong className="text-indigo-300 block mb-0.5">PNG</strong>
            <span className="text-slate-400">Lossless, crisp dots, supports transparent background.</span>
          </div>
          <div className="p-2 rounded bg-slate-950/60 border border-slate-800/60">
            <strong className="text-emerald-300 block mb-0.5">JPG</strong>
            <span className="text-slate-400">Solid background, widely compatible with all photo printers.</span>
          </div>
          <div className="p-2 rounded bg-slate-950/60 border border-slate-800/60">
            <strong className="text-sky-300 block mb-0.5">SVG</strong>
            <span className="text-slate-400">Infinite resolution vector for signs & Figma.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
