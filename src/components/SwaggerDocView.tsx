import React, { useState, useMemo } from 'react';
import { 
  Terminal, 
  Play, 
  Copy, 
  Check, 
  ExternalLink, 
  Code, 
  ChevronDown, 
  ChevronRight, 
  Sparkles, 
  Download, 
  RefreshCw, 
  ArrowLeft, 
  BookOpen, 
  Globe, 
  Layers, 
  Eye, 
  FileText
} from 'lucide-react';
import { OPENAPI_SPEC, SWAGGER_SAMPLE_PRESETS } from '../utils/openapiSpec';
import { generateQRCodeSvg, renderQRCodeToCanvas } from '../utils/qrRenderer';
import { buildQRStateFromApi, resolveApiCenterLogo, parseApiQueryParams } from '../utils/apiHandler';
import { PRESET_LOGOS } from '../utils/presets';
import { KanikaLogo } from './KanikaLogo';

interface SwaggerDocViewProps {
  onBackToStudio: () => void;
  onOpenLiveUrl?: (url: string) => void;
}

export const SwaggerDocView: React.FC<SwaggerDocViewProps> = ({ onBackToStudio }) => {
  // Active try-it-out state
  const [isTryItOut, setIsTryItOut] = useState(true);
  const [activeTab, setActiveTab] = useState<'endpoints' | 'schemas'>('endpoints');
  const [selectedPresetIndex, setSelectedPresetIndex] = useState(0);

  // Form parameters
  const [paramUrl, setParamUrl] = useState('mystery.com');
  const [paramLogo, setParamLogo] = useState('website');
  const [customLogoUrl, setCustomLogoUrl] = useState('');
  const [paramFormat, setParamFormat] = useState<'view' | 'svg' | 'png' | 'json'>('view');
  const [paramEc, setParamEc] = useState<'L' | 'M' | 'Q' | 'H'>('H');
  const [paramColor, setParamColor] = useState('0f172a');
  const [paramBg, setParamBg] = useState('ffffff');
  const [isBgTransparent, setIsBgTransparent] = useState(false);
  const [paramSize, setParamSize] = useState(512);
  const [paramDownload, setParamDownload] = useState('0');

  // Execution & Response state
  const [isExecuting, setIsExecuting] = useState(false);
  const [lastExecutedParams, setLastExecutedParams] = useState<any>(null);
  const [responseResult, setResponseResult] = useState<{
    status: number;
    statusText: string;
    durationMs: number;
    headers: Record<string, string>;
    svg: string;
    pngBase64?: string;
    jsonBody?: string;
  } | null>(null);

  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [isOpenApiModalOpen, setIsOpenApiModalOpen] = useState(false);
  const [expandedSchemas, setExpandedSchemas] = useState<Record<string, boolean>>({
    QrCodeResponseJson: true,
    LogoMetadata: false,
    MetaInfo: false,
    ErrorResponse: false
  });

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://kanika-qr.makeah';

  // Construct target query and curl
  const effectiveLogo = paramLogo === 'custom' ? customLogoUrl : paramLogo;
  const effectiveBg = isBgTransparent ? 'transparent' : paramBg;

  const requestQueryString = useMemo(() => {
    const p = new URLSearchParams();
    p.set('mode', 'api');
    if (paramUrl) p.set('url', paramUrl);
    if (effectiveLogo && effectiveLogo !== 'none') p.set('centerlogo', effectiveLogo);
    if (paramFormat !== 'view') p.set('format', paramFormat);
    if (paramEc !== 'H') p.set('ec', paramEc);
    if (paramColor && paramColor !== '0f172a') p.set('color', paramColor.replace('#', ''));
    if (effectiveBg && effectiveBg !== 'ffffff') p.set('bg', effectiveBg.replace('#', ''));
    if (paramSize !== 512) p.set('size', String(paramSize));
    if (paramDownload !== '0') p.set('download', paramDownload);
    return p.toString();
  }, [paramUrl, effectiveLogo, paramFormat, paramEc, paramColor, effectiveBg, paramSize, paramDownload]);

  const fullRequestUrl = `${origin}/?${requestQueryString}`;
  const curlCommand = `curl -X GET "${fullRequestUrl}"`;

  // Apply a sample preset
  const applyPreset = (index: number) => {
    setSelectedPresetIndex(index);
    const sample = SWAGGER_SAMPLE_PRESETS[index];
    if (!sample) return;

    setParamUrl(sample.params.url);
    if (sample.params.centerlogo.startsWith('http')) {
      setParamLogo('custom');
      setCustomLogoUrl(sample.params.centerlogo);
    } else {
      setParamLogo(sample.params.centerlogo);
      setCustomLogoUrl('');
    }
    setParamFormat(sample.params.format as any);
    setParamEc(sample.params.ec as any);
    setParamColor(sample.params.color);
    if (sample.params.bg === 'transparent') {
      setIsBgTransparent(true);
      setParamBg('ffffff');
    } else {
      setIsBgTransparent(false);
      setParamBg(sample.params.bg);
    }
    setParamSize(sample.params.size);
    setParamDownload('0');

    // Auto trigger execute for immediate feedback
    executeApiCall({
      url: sample.params.url,
      centerlogo: sample.params.centerlogo,
      format: sample.params.format,
      ec: sample.params.ec,
      color: sample.params.color,
      bg: sample.params.bg,
      size: sample.params.size
    });
  };

  // Live Execute API call in-browser
  const executeApiCall = async (overrideParams?: any) => {
    setIsExecuting(true);
    const startTime = performance.now();

    const targetUrlVal = overrideParams?.url ?? paramUrl;
    const logoVal = overrideParams?.centerlogo ?? effectiveLogo;
    const formatVal = overrideParams?.format ?? paramFormat;
    const ecVal = overrideParams?.ec ?? paramEc;
    const colorVal = overrideParams?.color ?? paramColor;
    const bgVal = overrideParams?.bg ?? effectiveBg;
    const sizeVal = overrideParams?.size ?? paramSize;

    try {
      const mockQuery = `?mode=api&url=${encodeURIComponent(targetUrlVal)}&centerlogo=${encodeURIComponent(logoVal)}&format=${formatVal}&ec=${ecVal}&color=${encodeURIComponent(colorVal)}&bg=${encodeURIComponent(bgVal)}&size=${sizeVal}`;
      const parsed = parseApiQueryParams(mockQuery);
      const apiState = buildQRStateFromApi(parsed);

      // 1. Generate SVG
      const svgOutput = generateQRCodeSvg(apiState, sizeVal);

      // 2. Generate PNG via canvas
      let pngDataUrl = '';
      try {
        const offscreen = document.createElement('canvas');
        await renderQRCodeToCanvas(offscreen, apiState, sizeVal);
        pngDataUrl = offscreen.toDataURL('image/png');
      } catch (e) {
        console.warn('Canvas export skipped:', e);
      }

      // 3. Format JSON response
      const logoInfo = resolveApiCenterLogo(logoVal);
      const jsonPayload = {
        success: true,
        status: 200,
        targetUrl: parsed.normalizedUrl,
        logo: {
          name: logoInfo.displayName,
          type: logoInfo.sourceType,
          presetId: logoInfo.presetId || null,
          customUrl: logoInfo.customUrl || null
        },
        svg: svgOutput,
        pngBase64: pngDataUrl,
        meta: {
          errorCorrection: ecVal,
          dimensions: sizeVal,
          foreground: `#${colorVal.replace('#', '')}`,
          background: bgVal === 'transparent' ? 'transparent' : `#${bgVal.replace('#', '')}`,
          generatedAt: new Date().toISOString()
        }
      };

      const duration = Math.round(performance.now() - startTime);

      let contentTypeHeader = 'text/html; charset=utf-8';
      if (formatVal === 'json') contentTypeHeader = 'application/json; charset=utf-8';
      else if (formatVal === 'svg') contentTypeHeader = 'image/svg+xml; charset=utf-8';
      else if (formatVal === 'png') contentTypeHeader = 'image/png';

      setLastExecutedParams({
        url: targetUrlVal,
        logo: logoVal,
        format: formatVal,
        ec: ecVal,
        color: colorVal,
        bg: bgVal,
        size: sizeVal
      });

      setResponseResult({
        status: 200,
        statusText: 'OK',
        durationMs: Math.max(duration, 14),
        headers: {
          'content-type': contentTypeHeader,
          'cache-control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400',
          'access-control-allow-origin': '*',
          'x-engine': 'AmirulQR-Free-Foreva-v1.4',
          'x-powered-by': 'AI Studio Build Engine',
          'x-request-id': `req_${Math.random().toString(36).substring(2, 10)}`
        },
        svg: svgOutput,
        pngBase64: pngDataUrl,
        jsonBody: JSON.stringify(jsonPayload, null, 2)
      });
    } catch (err: any) {
      setResponseResult({
        status: 400,
        statusText: 'Bad Request',
        durationMs: Math.round(performance.now() - startTime),
        headers: {
          'content-type': 'application/json; charset=utf-8',
          'access-control-allow-origin': '*'
        },
        svg: '',
        jsonBody: JSON.stringify({
          success: false,
          status: 400,
          error: err.message || 'Failed to render QR Code'
        }, null, 2)
      });
    } finally {
      setIsExecuting(false);
    }
  };

  // Run first execution on initial mount
  React.useEffect(() => {
    executeApiCall();
  }, []);

  const handleCopy = (text: string, sectionId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionId);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500/30">
      {/* 1. Swagger Topbar */}
      <header className="sticky top-0 z-40 bg-[#1b1b1b] border-b border-slate-800 px-6 py-3 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <KanikaLogo size={28} />
            <div className="flex items-baseline gap-1.5">
              <span className="font-extrabold text-lg tracking-tight text-white font-mono">
                swagger<span className="text-emerald-400">UI</span>
              </span>
              <span className="text-[10px] bg-slate-800 text-slate-300 font-mono px-1.5 py-0.5 rounded border border-slate-700">
                OAS 3.1.0
              </span>
            </div>
          </div>

          <div className="hidden md:flex items-center ml-4 pl-4 border-l border-slate-700/60">
            <span className="text-xs text-slate-400 font-mono mr-2">Spec:</span>
            <div className="bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs text-emerald-400 font-mono flex items-center gap-2">
              <span>{origin}/openapi.json</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1 rounded">200 OK</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsOpenApiModalOpen(true)}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 transition-colors"
          >
            <FileText className="w-3.5 h-3.5 text-emerald-400" />
            <span>View Raw Spec</span>
          </button>

          <button
            type="button"
            onClick={onBackToStudio}
            className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-md bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Visual Studio</span>
          </button>
        </div>
      </header>

      {/* 2. API Spec Hero Info Banner */}
      <div className="max-w-6xl w-full mx-auto px-4 sm:px-6 pt-8 pb-6">
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 shadow-xl backdrop-blur">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-bold font-display text-white tracking-tight">
                  {OPENAPI_SPEC.info.title}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                  v{OPENAPI_SPEC.info.version}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono text-slate-400 bg-slate-800 border border-slate-700">
                  OpenAPI 3.1.0
                </span>
              </div>
              <p className="text-sm text-slate-300 mt-2.5 max-w-3xl leading-relaxed">
                {OPENAPI_SPEC.info.description}
              </p>

              {/* Server selector & protocol note */}
              <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-300">Base Server:</span>
                  <code className="bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-slate-200 font-mono">
                    {origin}
                  </code>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <Check className="w-3.5 h-3.5" />
                  <span>Reed-Solomon Level H Calibrated</span>
                </div>
                <div className="flex items-center gap-1.5 text-indigo-400">
                  <Globe className="w-3.5 h-3.5" />
                  <span>Zero-config URL normalization</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-col sm:flex-row md:flex-col gap-2 shrink-0">
              <a
                href={`${origin}/?mode=api&url=mystery.com&centerlogo=website`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-medium transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Test Live Mystery.com</span>
              </a>
              <button
                type="button"
                onClick={() => setIsOpenApiModalOpen(true)}
                className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 text-xs font-medium transition-colors"
              >
                <Code className="w-3.5 h-3.5" />
                <span>Export OpenAPI JSON</span>
              </button>
            </div>
          </div>

          {/* Preset Example Chips */}
          <div className="mt-6 pt-5 border-t border-slate-800">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 mb-2.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Interactive Scenarios & Preset Examples:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {SWAGGER_SAMPLE_PRESETS.map((preset, idx) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => applyPreset(idx)}
                  className={`px-3 py-1.5 text-xs rounded-lg border transition-all text-left flex items-center gap-2 ${
                    selectedPresetIndex === idx
                      ? 'bg-emerald-600/25 border-emerald-500 text-emerald-200 font-semibold shadow-sm'
                      : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200'
                  }`}
                  title={preset.description}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${selectedPresetIndex === idx ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                  <span>{preset.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 3. Navigation Tabs */}
        <div className="flex items-center gap-4 mt-8 border-b border-slate-800 pb-2">
          <button
            type="button"
            onClick={() => setActiveTab('endpoints')}
            className={`pb-2 text-sm font-bold tracking-tight transition-colors relative flex items-center gap-2 ${
              activeTab === 'endpoints' ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>Endpoints (GET /?mode=api)</span>
            {activeTab === 'endpoints' && (
              <span className="absolute bottom-[-9px] left-0 right-0 h-0.5 bg-emerald-400 rounded-full" />
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('schemas')}
            className={`pb-2 text-sm font-bold tracking-tight transition-colors relative flex items-center gap-2 ${
              activeTab === 'schemas' ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Schemas & Models</span>
            {activeTab === 'schemas' && (
              <span className="absolute bottom-[-9px] left-0 right-0 h-0.5 bg-emerald-400 rounded-full" />
            )}
          </button>
        </div>

        {/* 4. Tab Content */}
        {activeTab === 'endpoints' ? (
          <div className="space-y-6 mt-6">
            {/* Primary Endpoint Container: GET /?mode=api */}
            <div className="border border-emerald-500/40 rounded-xl overflow-hidden bg-slate-900/60 shadow-lg">
              {/* Endpoint Header Bar (Classic Swagger Style) */}
              <div className="bg-emerald-950/40 border-b border-emerald-500/30 px-5 py-3.5 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 rounded-md text-xs font-mono font-black uppercase bg-emerald-500 text-slate-950 tracking-wider">
                    GET
                  </span>
                  <code className="font-mono text-sm font-bold text-slate-100">
                    /?mode=api
                  </code>
                  <span className="hidden sm:inline text-xs text-slate-400">
                    Generate QR code with center brand logo & multi-format serialization
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsTryItOut(!isTryItOut)}
                    className={`px-3 py-1 text-xs font-semibold rounded transition-colors ${
                      isTryItOut
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                    }`}
                  >
                    {isTryItOut ? 'Cancel' : 'Try it out'}
                  </button>
                </div>
              </div>

              {/* Endpoint Body */}
              <div className="p-5 sm:p-6 space-y-6">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Description
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Renders an enterprise-grade QR code matrix embedding a centered vector logo (e.g. Google Play, Apple App Store, WhatsApp, Instagram, or arbitrary HTTPS image).
                    Supports Reed-Solomon Level H redundancy (30% recovery) to guarantee zero loss of scannability.
                  </p>
                </div>

                {/* Parameters Section */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Parameters
                    </h3>
                    {isTryItOut && (
                      <span className="text-[11px] text-emerald-400 font-mono">
                        Live sandbox mode active
                      </span>
                    )}
                  </div>

                  <div className="overflow-x-auto border border-slate-800 rounded-lg">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-950 text-slate-400 border-b border-slate-800">
                          <th className="p-3 font-semibold">Name</th>
                          <th className="p-3 font-semibold">Description</th>
                          <th className="p-3 font-semibold w-72">Value {isTryItOut && <span className="text-emerald-400">(Interactive)</span>}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                        {/* Parameter 1: mode */}
                        <tr className="hover:bg-slate-850/40">
                          <td className="p-3 align-top font-bold text-slate-200">
                            <div>mode <span className="text-red-400">*</span></div>
                            <div className="text-[10px] text-slate-500 font-normal">query · string</div>
                          </td>
                          <td className="p-3 align-top text-slate-300 font-sans">
                            Activates API dispatch mode. Required for direct endpoints.
                            <div className="mt-1 text-[10px] text-slate-400 font-mono">Default: api</div>
                          </td>
                          <td className="p-3 align-top">
                            <input
                              type="text"
                              value="api"
                              disabled
                              className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-400 font-mono cursor-not-allowed text-xs"
                            />
                          </td>
                        </tr>

                        {/* Parameter 2: url */}
                        <tr className="hover:bg-slate-850/40">
                          <td className="p-3 align-top font-bold text-slate-200">
                            <div>url</div>
                            <div className="text-[10px] text-slate-500 font-normal">query · string</div>
                          </td>
                          <td className="p-3 align-top text-slate-300 font-sans">
                            Target destination URL or arbitrary payload. If protocol is omitted (e.g. <code className="text-emerald-300">mystery.com</code>), the engine automatically formats it to <code className="text-emerald-300">https://mystery.com</code>.
                            <div className="mt-1 text-[10px] text-slate-400 font-mono">Default: mystery.com</div>
                          </td>
                          <td className="p-3 align-top">
                            <input
                              type="text"
                              value={paramUrl}
                              onChange={(e) => setParamUrl(e.target.value)}
                              placeholder="mystery.com"
                              className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-500 rounded px-2.5 py-1.5 text-slate-100 font-mono text-xs focus:outline-none"
                            />
                          </td>
                        </tr>

                        {/* Parameter 3: centerlogo */}
                        <tr className="hover:bg-slate-850/40">
                          <td className="p-3 align-top font-bold text-slate-200">
                            <div>centerlogo</div>
                            <div className="text-[10px] text-slate-500 font-normal">query · string</div>
                          </td>
                          <td className="p-3 align-top text-slate-300 font-sans">
                            Centered brand badge preset or external HTTPS image URL.
                            <div className="mt-1 flex flex-wrap gap-1 text-[10px] text-slate-400 font-mono">
                              <span>website, google-play, apple, whatsapp, instagram, etc.</span>
                            </div>
                          </td>
                          <td className="p-3 align-top space-y-1.5">
                            <select
                              value={paramLogo}
                              onChange={(e) => setParamLogo(e.target.value)}
                              className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-500 rounded px-2.5 py-1.5 text-slate-100 font-mono text-xs focus:outline-none"
                            >
                              <option value="website">website (Globe default)</option>
                              <option value="google-play">google-play (Google Play Official 2022)</option>
                              <option value="apple">apple (App Store)</option>
                              <option value="apple-brand">apple-brand (Apple Monochrome)</option>
                              <option value="whatsapp">whatsapp (WhatsApp Chat)</option>
                              <option value="instagram">instagram (Instagram Sunset)</option>
                              <option value="x">x (X / Twitter)</option>
                              <option value="youtube">youtube (YouTube Video)</option>
                              <option value="linkedin">linkedin (LinkedIn Professional)</option>
                              <option value="tiktok">tiktok (TikTok Music)</option>
                              <option value="facebook">facebook (Facebook)</option>
                              <option value="github">github (GitHub Octocat)</option>
                              <option value="telegram">telegram (Telegram Plane)</option>
                              <option value="spotify">spotify (Spotify Green)</option>
                              <option value="wifi">wifi (Wi-Fi Beacon)</option>
                              <option value="none">none (No center logo)</option>
                              <option value="custom">custom (Direct Image URL...)</option>
                            </select>

                            {paramLogo === 'custom' && (
                              <input
                                type="text"
                                value={customLogoUrl}
                                onChange={(e) => setCustomLogoUrl(e.target.value)}
                                placeholder="https://example.com/logo.svg"
                                className="w-full bg-slate-950 border border-indigo-500/50 rounded px-2 py-1 text-slate-100 font-mono text-xs"
                              />
                            )}
                          </td>
                        </tr>

                        {/* Parameter 4: format */}
                        <tr className="hover:bg-slate-850/40">
                          <td className="p-3 align-top font-bold text-slate-200">
                            <div>format</div>
                            <div className="text-[10px] text-slate-500 font-normal">query · enum</div>
                          </td>
                          <td className="p-3 align-top text-slate-300 font-sans">
                            Output format:
                            <ul className="list-disc list-inside mt-1 space-y-0.5 text-[11px] text-slate-400">
                              <li><code className="text-slate-300">view</code>: Interactive Developer Inspector</li>
                              <li><code className="text-slate-300">svg</code>: Pure vector SVG document</li>
                              <li><code className="text-slate-300">png</code>: High-res binary PNG stream</li>
                              <li><code className="text-slate-300">json</code>: REST metadata with Base64 & SVG</li>
                            </ul>
                          </td>
                          <td className="p-3 align-top">
                            <select
                              value={paramFormat}
                              onChange={(e) => setParamFormat(e.target.value as any)}
                              className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-500 rounded px-2.5 py-1.5 text-slate-100 font-mono text-xs focus:outline-none"
                            >
                              <option value="view">view (Developer Inspector)</option>
                              <option value="svg">svg (Vector SVG)</option>
                              <option value="png">png (Direct Image)</option>
                              <option value="json">json (REST Metadata)</option>
                            </select>
                          </td>
                        </tr>

                        {/* Parameter 5: ec (Error Correction) */}
                        <tr className="hover:bg-slate-850/40">
                          <td className="p-3 align-top font-bold text-slate-200">
                            <div>ec</div>
                            <div className="text-[10px] text-slate-500 font-normal">query · enum</div>
                          </td>
                          <td className="p-3 align-top text-slate-300 font-sans">
                            Reed-Solomon Error Correction capacity.
                            <div className="mt-1 text-[10px] text-slate-400">
                              Level <span className="text-emerald-400 font-semibold">H</span> (~30% recovery) is recommended for center logo clearance.
                            </div>
                          </td>
                          <td className="p-3 align-top">
                            <select
                              value={paramEc}
                              onChange={(e) => setParamEc(e.target.value as any)}
                              className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-500 rounded px-2.5 py-1.5 text-slate-100 font-mono text-xs focus:outline-none"
                            >
                              <option value="H">H (~30% Recovery - Recommended)</option>
                              <option value="Q">Q (~25% Recovery)</option>
                              <option value="M">M (~15% Recovery)</option>
                              <option value="L">L (~7% Recovery)</option>
                            </select>
                          </td>
                        </tr>

                        {/* Parameter 6: color (Foreground) */}
                        <tr className="hover:bg-slate-850/40">
                          <td className="p-3 align-top font-bold text-slate-200">
                            <div>color</div>
                            <div className="text-[10px] text-slate-500 font-normal">query · string</div>
                          </td>
                          <td className="p-3 align-top text-slate-300 font-sans">
                            Hex color code for QR modules (e.g. <code className="text-slate-200">01875F</code>, <code className="text-slate-200">0071E3</code>, <code className="text-slate-200">000000</code>).
                          </td>
                          <td className="p-3 align-top">
                            <div className="flex items-center gap-2">
                              <input
                                type="color"
                                value={`#${paramColor.replace('#', '')}`}
                                onChange={(e) => setParamColor(e.target.value.replace('#', ''))}
                                className="w-7 h-7 rounded border border-slate-700 bg-slate-950 cursor-pointer p-0"
                              />
                              <input
                                type="text"
                                value={paramColor}
                                onChange={(e) => setParamColor(e.target.value.replace('#', ''))}
                                placeholder="0f172a"
                                className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-slate-100 font-mono text-xs focus:outline-none focus:border-emerald-500"
                              />
                            </div>
                          </td>
                        </tr>

                        {/* Parameter 7: bg (Background) */}
                        <tr className="hover:bg-slate-850/40">
                          <td className="p-3 align-top font-bold text-slate-200">
                            <div>bg</div>
                            <div className="text-[10px] text-slate-500 font-normal">query · string</div>
                          </td>
                          <td className="p-3 align-top text-slate-300 font-sans">
                            Background color hex code or 'transparent'.
                          </td>
                          <td className="p-3 align-top space-y-1.5">
                            <div className="flex items-center gap-2">
                              <input
                                type="color"
                                disabled={isBgTransparent}
                                value={`#${paramBg.replace('#', '')}`}
                                onChange={(e) => setParamBg(e.target.value.replace('#', ''))}
                                className="w-7 h-7 rounded border border-slate-700 bg-slate-950 cursor-pointer p-0 disabled:opacity-40"
                              />
                              <input
                                type="text"
                                disabled={isBgTransparent}
                                value={isBgTransparent ? 'transparent' : paramBg}
                                onChange={(e) => setParamBg(e.target.value.replace('#', ''))}
                                className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-slate-100 font-mono text-xs focus:outline-none focus:border-emerald-500 disabled:opacity-50"
                              />
                            </div>
                            <label className="flex items-center gap-1.5 text-[10px] text-slate-400 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={isBgTransparent}
                                onChange={(e) => setIsBgTransparent(e.target.checked)}
                                className="rounded bg-slate-950 border-slate-700 text-emerald-500 focus:ring-0"
                              />
                              <span>Transparent background</span>
                            </label>
                          </td>
                        </tr>

                        {/* Parameter 8: size */}
                        <tr className="hover:bg-slate-850/40">
                          <td className="p-3 align-top font-bold text-slate-200">
                            <div>size</div>
                            <div className="text-[10px] text-slate-500 font-normal">query · integer</div>
                          </td>
                          <td className="p-3 align-top text-slate-300 font-sans">
                            Canvas resolution in pixels (128 - 2048). Default: 512.
                          </td>
                          <td className="p-3 align-top">
                            <input
                              type="number"
                              min={128}
                              max={2048}
                              step={64}
                              value={paramSize}
                              onChange={(e) => setParamSize(parseInt(e.target.value, 10) || 512)}
                              className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-500 rounded px-2.5 py-1.5 text-slate-100 font-mono text-xs focus:outline-none"
                            />
                          </td>
                        </tr>

                        {/* Parameter 9: download */}
                        <tr className="hover:bg-slate-850/40">
                          <td className="p-3 align-top font-bold text-slate-200">
                            <div>download</div>
                            <div className="text-[10px] text-slate-500 font-normal">query · enum</div>
                          </td>
                          <td className="p-3 align-top text-slate-300 font-sans">
                            Auto trigger client file download (1 / true).
                          </td>
                          <td className="p-3 align-top">
                            <select
                              value={paramDownload}
                              onChange={(e) => setParamDownload(e.target.value)}
                              className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-500 rounded px-2.5 py-1.5 text-slate-100 font-mono text-xs focus:outline-none"
                            >
                              <option value="0">0 (false - stream/view)</option>
                              <option value="1">1 (true - trigger download)</option>
                            </select>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Execute Button */}
                  <div className="mt-4 flex items-center justify-between">
                    <div className="text-xs text-slate-400">
                      Query preview: <code className="text-emerald-400 font-mono">/?{requestQueryString}</code>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => executeApiCall()}
                        disabled={isExecuting}
                        className="flex items-center gap-2 px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all disabled:opacity-50"
                      >
                        {isExecuting ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Play className="w-3.5 h-3.5 fill-current" />
                        )}
                        <span>{isExecuting ? 'Executing...' : 'Execute'}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Live Responses Console (Swagger Standard) */}
                <div className="pt-6 border-t border-slate-800">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                    Responses & Live Execution Console
                  </h3>

                  {responseResult ? (
                    <div className="space-y-4">
                      {/* Curl Command Snippet */}
                      <div className="bg-slate-950 border border-slate-800 rounded-lg p-3.5">
                        <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                          <span className="font-semibold text-slate-300 font-mono">cURL Command</span>
                          <button
                            type="button"
                            onClick={() => handleCopy(curlCommand, 'curl')}
                            className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-emerald-400 transition-colors"
                          >
                            {copiedSection === 'curl' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{copiedSection === 'curl' ? 'Copied' : 'Copy'}</span>
                          </button>
                        </div>
                        <pre className="font-mono text-xs text-emerald-300 overflow-x-auto whitespace-pre-wrap break-all">
                          {curlCommand}
                        </pre>
                      </div>

                      {/* Request URL */}
                      <div className="bg-slate-950 border border-slate-800 rounded-lg p-3.5">
                        <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                          <span className="font-semibold text-slate-300 font-mono">Request URL</span>
                          <div className="flex items-center gap-3">
                            <a
                              href={fullRequestUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              <span>Open in Tab</span>
                            </a>
                            <button
                              type="button"
                              onClick={() => handleCopy(fullRequestUrl, 'reqUrl')}
                              className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-emerald-400 transition-colors"
                            >
                              {copiedSection === 'reqUrl' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                              <span>{copiedSection === 'reqUrl' ? 'Copied' : 'Copy'}</span>
                            </button>
                          </div>
                        </div>
                        <pre className="font-mono text-xs text-indigo-300 overflow-x-auto whitespace-pre-wrap break-all">
                          {fullRequestUrl}
                        </pre>
                      </div>

                      {/* Server Response Card */}
                      <div className="border border-slate-800 rounded-lg overflow-hidden bg-slate-950">
                        <div className="bg-slate-900 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold text-slate-300">Server Response:</span>
                            <span className={`px-2 py-0.5 text-xs font-mono font-bold rounded ${
                              responseResult.status === 200
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : 'bg-red-500/20 text-red-400 border border-red-500/30'
                            }`}>
                              {responseResult.status} {responseResult.statusText}
                            </span>
                            <span className="text-[11px] text-slate-500 font-mono">
                              ({responseResult.durationMs}ms)
                            </span>
                          </div>

                          <div className="text-xs text-slate-400 font-mono">
                            {responseResult.headers['content-type']}
                          </div>
                        </div>

                        {/* Live Visual Render + Code Side-by-Side */}
                        <div className="p-4 grid grid-cols-1 lg:grid-cols-12 gap-6">
                          {/* Live Visual Graphic */}
                          <div className="lg:col-span-5 flex flex-col items-center justify-center p-4 bg-slate-900/50 rounded-lg border border-slate-800/80">
                            <div className="text-xs font-semibold text-slate-400 mb-2 flex items-center gap-1.5">
                              <Eye className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Live Render Preview</span>
                            </div>

                            <div 
                              className="w-48 h-48 sm:w-56 sm:h-56 bg-white rounded-xl p-2 shadow-xl flex items-center justify-center overflow-hidden"
                              dangerouslySetInnerHTML={{ __html: responseResult.svg }}
                            />

                            <div className="mt-3 text-[11px] text-slate-400 text-center">
                              Target: <span className="text-slate-200 font-mono">{lastExecutedParams?.url}</span>
                            </div>
                          </div>

                          {/* Response Payload / Headers */}
                          <div className="lg:col-span-7 space-y-3 flex flex-col">
                            {/* Response Body */}
                            <div className="flex-1 flex flex-col">
                              <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                                <span className="font-semibold text-slate-300 font-mono">Response Body</span>
                                <button
                                  type="button"
                                  onClick={() => handleCopy(responseResult.jsonBody || responseResult.svg, 'body')}
                                  className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-emerald-400 transition-colors"
                                >
                                  {copiedSection === 'body' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                  <span>{copiedSection === 'body' ? 'Copied' : 'Copy'}</span>
                                </button>
                              </div>

                              <div className="bg-slate-900 rounded-lg border border-slate-800 p-3 flex-1 max-h-56 overflow-y-auto">
                                <pre className="font-mono text-[11px] text-slate-300 whitespace-pre-wrap break-all">
                                  {paramFormat === 'json' 
                                    ? responseResult.jsonBody 
                                    : (paramFormat === 'svg' ? responseResult.svg : (responseResult.jsonBody || responseResult.svg))}
                                </pre>
                              </div>
                            </div>

                            {/* Response Headers */}
                            <div>
                              <div className="text-xs font-semibold text-slate-400 mb-1 font-mono">Response Headers</div>
                              <div className="bg-slate-900/60 rounded border border-slate-800/80 p-2 font-mono text-[10px] text-slate-400 space-y-0.5">
                                {Object.entries(responseResult.headers).map(([k, v]) => (
                                  <div key={k} className="flex">
                                    <span className="text-slate-500 min-w-32">{k}:</span>
                                    <span className="text-slate-300">{v}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-8 text-center text-slate-500 border border-slate-800 rounded-lg">
                      Click <strong className="text-emerald-400">Execute</strong> to send request and inspect live response.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* 5. Schemas Tab */
          <div className="mt-6 space-y-4">
            {Object.entries(OPENAPI_SPEC.components.schemas).map(([name, schema]: [string, any]) => {
              const isExpanded = !!expandedSchemas[name];
              return (
                <div key={name} className="border border-slate-800 rounded-lg bg-slate-900/60 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setExpandedSchemas(prev => ({ ...prev, [name]: !prev[name] }))}
                    className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-slate-850/50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      {isExpanded ? <ChevronDown className="w-4 h-4 text-emerald-400" /> : <ChevronRight className="w-4 h-4 text-slate-500" />}
                      <span className="font-mono text-sm font-bold text-slate-200">{name}</span>
                      <span className="text-xs text-slate-500 font-mono">({schema.type})</span>
                    </div>
                    <span className="text-xs text-slate-400 font-mono">
                      {Object.keys(schema.properties || {}).length} properties
                    </span>
                  </button>

                  {isExpanded && (
                    <div className="p-4 border-t border-slate-800 bg-slate-950 font-mono text-xs">
                      <div className="space-y-3">
                        {Object.entries(schema.properties || {}).map(([propName, propDef]: [string, any]) => (
                          <div key={propName} className="pl-4 border-l-2 border-emerald-500/30 py-0.5">
                            <div className="flex items-baseline gap-2">
                              <span className="text-emerald-300 font-bold">{propName}</span>
                              <span className="text-slate-500 text-[11px]">{propDef.type || propDef.$ref || 'any'}</span>
                              {(schema.required || []).includes(propName) && (
                                <span className="text-[10px] text-red-400 font-semibold">required</span>
                              )}
                            </div>
                            {propDef.description && (
                              <p className="text-[11px] text-slate-400 mt-0.5 font-sans">{propDef.description}</p>
                            )}
                            {propDef.example !== undefined && (
                              <div className="text-[10px] text-slate-500 mt-0.5">
                                example: <code className="text-amber-300">{JSON.stringify(propDef.example)}</code>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Raw OpenAPI Specification Modal */}
      {isOpenApiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-400" />
                <h3 className="font-bold text-white text-base">OpenAPI 3.1.0 Specification</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleCopy(JSON.stringify(OPENAPI_SPEC, null, 2), 'openapiSpec')}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
                >
                  {copiedSection === 'openapiSpec' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSection === 'openapiSpec' ? 'Copied' : 'Copy JSON'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpenApiModalOpen(false)}
                  className="px-3 py-1.5 text-xs font-semibold rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
            <div className="p-6 flex-1 overflow-y-auto bg-slate-950 font-mono text-xs text-slate-300">
              <pre>{JSON.stringify(OPENAPI_SPEC, null, 2)}</pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
