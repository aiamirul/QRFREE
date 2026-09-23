import React, { useEffect, useState, useRef } from 'react';
import { 
  Check, 
  Copy, 
  Download, 
  ExternalLink, 
  Code2, 
  Terminal, 
  FileJson, 
  Image as ImageIcon, 
  ArrowLeft, 
  Sparkles, 
  Layers, 
  Globe, 
  CheckCircle2,
  Cpu,
  Share2
} from 'lucide-react';
import { KanikaLogo } from './KanikaLogo';
import { ApiRequestParams, buildQRStateFromApi, resolveApiCenterLogo } from '../utils/apiHandler';
import { renderQRCodeToCanvas, generateQRCodeSvg } from '../utils/qrRenderer';
import { QRState } from '../types/qr';

interface ApiResponderViewProps {
  apiParams: ApiRequestParams;
  onOpenInStudio: (state: QRState) => void;
  onOpenSwagger?: () => void;
}

export const ApiResponderView: React.FC<ApiResponderViewProps> = ({ apiParams, onOpenInStudio, onOpenSwagger }) => {
  const [activeTab, setActiveTab] = useState<'preview' | 'svg' | 'json' | 'code'>('preview');
  const [svgString, setSvgString] = useState<string>('');
  const [pngDataUrl, setPngDataUrl] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(true);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [generationTimeMs, setGenerationTimeMs] = useState<number>(14);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const qrState = buildQRStateFromApi(apiParams);
  const logoInfo = resolveApiCenterLogo(apiParams.centerLogoName);

  useEffect(() => {
    let isMounted = true;
    const startTime = performance.now();

    const generateOutputs = async () => {
      setIsGenerating(true);
      try {
        // 1. Generate SVG
        const svg = await generateQRCodeSvg(qrState, apiParams.size);
        if (isMounted) setSvgString(svg);

        // 2. Generate PNG via canvas
        if (canvasRef.current) {
          await renderQRCodeToCanvas(canvasRef.current, qrState, apiParams.size);
          if (isMounted) {
            const dataUrl = canvasRef.current.toDataURL('image/png');
            setPngDataUrl(dataUrl);

            // If auto-download is requested
            if (apiParams.autoDownload) {
              const link = document.createElement('a');
              link.download = `kanika-qr-${Date.now()}.png`;
              link.href = dataUrl;
              link.click();
            }
          }
        }
      } catch (err) {
        console.error('Error rendering API QR code:', err);
      } finally {
        if (isMounted) {
          setGenerationTimeMs(Math.round(performance.now() - startTime));
          setIsGenerating(false);
        }
      }
    };

    generateOutputs();

    return () => {
      isMounted = false;
    };
  }, [apiParams]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const currentApiUrl = window.location.href;

  const jsonResponse = {
    status: 'success',
    code: 200,
    service: 'AmirulQR Free Foreva API',
    timestamp: new Date().toISOString(),
    execution_time: `${generationTimeMs}ms`,
    request: {
      mode: 'api',
      url: apiParams.normalizedUrl,
      centerlogo: apiParams.centerLogoName || 'website',
      errorCorrection: apiParams.errorCorrection,
      size: apiParams.size
    },
    logo: {
      type: logoInfo.sourceType,
      name: logoInfo.displayName,
      presetId: logoInfo.presetId
    },
    data: {
      mime_type: 'image/svg+xml',
      format: apiParams.format,
      svg: svgString,
      png_base64: pngDataUrl.replace(/^data:image\/png;base64,/, '')
    }
  };

  // If the user requested pure SVG output
  if (apiParams.format === 'svg') {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <KanikaLogo size={24} />
              <span className="text-xs font-semibold text-slate-300">AmirulQR API / Raw SVG</span>
            </div>
            <button
              onClick={() => onOpenInStudio(qrState)}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
            >
              Open Studio
            </button>
          </div>
          <div 
            className="w-64 h-64 mx-auto bg-white p-4 rounded-xl shadow-inner flex items-center justify-center"
            dangerouslySetInnerHTML={{ __html: svgString }}
          />
          <div className="flex gap-2">
            <button
              onClick={() => copyToClipboard(svgString, 'raw-svg')}
              className="flex-1 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors flex items-center justify-center gap-1.5"
            >
              {copiedField === 'raw-svg' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedField === 'raw-svg' ? 'Copied SVG!' : 'Copy Raw SVG'}</span>
            </button>
            <button
              onClick={() => downloadFile(svgString, 'qr-code.svg', 'image/svg+xml')}
              className="px-3 py-2 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors"
            >
              Download
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If format is json, show clean raw formatted JSON
  if (apiParams.format === 'json') {
    return (
      <div className="min-h-screen bg-[#0d1117] text-slate-200 p-6 font-mono text-xs">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <KanikaLogo size={22} />
              <span className="font-semibold text-white">AmirulQR Free Foreva API Response [JSON]</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => copyToClipboard(JSON.stringify(jsonResponse, null, 2), 'json-dump')}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white text-xs rounded border border-slate-700 transition-colors flex items-center gap-1"
              >
                {copiedField === 'json-dump' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>Copy JSON</span>
              </button>
              <button
                onClick={() => onOpenInStudio(qrState)}
                className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs rounded transition-colors"
              >
                Open Studio
              </button>
            </div>
          </div>
          <pre className="bg-[#161b22] p-4 rounded-xl border border-slate-800 overflow-x-auto text-emerald-400 leading-relaxed text-[11px]">
            {JSON.stringify(jsonResponse, null, 2)}
          </pre>
        </div>
      </div>
    );
  }

  // Default: Interactive Developer API Responder View
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Hidden canvas for PNG export generation */}
      <canvas ref={canvasRef} className="hidden" />

      {/* API Header Bar */}
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <KanikaLogo size={32} />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white font-display tracking-tight text-base">
                AmirulQR Free Foreva
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                API MODE
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              100% Free Forever Live QR API Endpoint Engine & Webhook Responder
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {onOpenSwagger && (
            <button
              onClick={onOpenSwagger}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-300 bg-emerald-950/50 hover:bg-emerald-900/50 border border-emerald-500/30 rounded-lg transition-colors"
            >
              <Terminal className="w-3.5 h-3.5 text-emerald-400" />
              <span>Swagger Docs</span>
            </button>
          )}
          <button
            onClick={() => onOpenInStudio(qrState)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 rounded-lg shadow-sm transition-all"
          >
            <span>Open in Full Studio</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Main API Body */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Endpoint Callout Banner */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 font-mono text-xs text-slate-300">
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                GET
              </span>
              <span className="text-slate-400">Endpoint:</span>
              <span className="text-white font-medium break-all">
                /?mode=api&url={encodeURIComponent(apiParams.rawUrl || apiParams.normalizedUrl)}&centerlogo={apiParams.centerLogoName || 'website'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 className="w-3 h-3" />
                <span>200 OK</span>
              </span>
              <span className="text-[11px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                ~{generationTimeMs}ms
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-800/80 text-xs">
            <div>
              <span className="text-slate-500 text-[11px] block">Target Payload</span>
              <span className="text-slate-200 font-mono truncate block" title={apiParams.normalizedUrl}>
                {apiParams.normalizedUrl}
              </span>
            </div>
            <div>
              <span className="text-slate-500 text-[11px] block">Center Badge</span>
              <span className="text-indigo-300 font-medium flex items-center gap-1">
                <Globe className="w-3 h-3 text-indigo-400" />
                <span>{logoInfo.displayName}</span>
              </span>
            </div>
            <div>
              <span className="text-slate-500 text-[11px] block">Error Correction</span>
              <span className="text-emerald-400 font-mono font-semibold">
                High (H) · 30% Recovery
              </span>
            </div>
            <div>
              <span className="text-slate-500 text-[11px] block">Direct Formats</span>
              <div className="flex items-center gap-1 mt-0.5">
                <a
                  href={`${currentApiUrl}&format=svg`}
                  className="px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 text-[10px] rounded text-slate-300 font-mono"
                >
                  &format=svg
                </a>
                <a
                  href={`${currentApiUrl}&format=json`}
                  className="px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 text-[10px] rounded text-slate-300 font-mono"
                >
                  &format=json
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Content Split: Left QR Visual & Right Tabs */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Visual QR Code */}
          <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-between shadow-lg">
            <div className="w-full flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-indigo-400" />
                <span>Rendered Output</span>
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                {apiParams.size}×{apiParams.size}px
              </span>
            </div>

            {/* QR Card Container */}
            <div className="w-full max-w-[320px] aspect-square bg-white rounded-2xl p-4 shadow-2xl flex items-center justify-center relative group">
              {isGenerating ? (
                <div className="flex flex-col items-center gap-2 text-slate-400">
                  <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs">Generating QR...</span>
                </div>
              ) : (
                <div 
                  className="w-full h-full flex items-center justify-center transition-transform group-hover:scale-[1.02]"
                  dangerouslySetInnerHTML={{ __html: svgString }}
                />
              )}
            </div>

            {/* Action Bar */}
            <div className="w-full grid grid-cols-2 gap-2 mt-6">
              <button
                type="button"
                onClick={() => {
                  if (pngDataUrl) {
                    const link = document.createElement('a');
                    link.download = `kanika-qr-${Date.now()}.png`;
                    link.href = pngDataUrl;
                    link.click();
                  }
                }}
                className="py-2 px-3 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow transition-colors flex items-center justify-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download PNG</span>
              </button>

              <button
                type="button"
                onClick={() => downloadFile(svgString, `kanika-qr-${Date.now()}.svg`, 'image/svg+xml')}
                className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download SVG</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => copyToClipboard(currentApiUrl, 'api-url')}
              className="w-full mt-2 py-1.5 px-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5"
            >
              {copiedField === 'api-url' ? <Check className="w-3 h-3 text-emerald-400" /> : <Share2 className="w-3 h-3" />}
              <span>{copiedField === 'api-url' ? 'API Link Copied!' : 'Copy Shareable API Link'}</span>
            </button>
          </div>

          {/* Right Column: Code & API Inspector Tabs */}
          <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-lg flex flex-col">
            {/* Tabs */}
            <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800 mb-4">
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={`flex-1 py-1.5 px-3 text-xs font-medium rounded-md transition-colors flex items-center justify-center gap-1.5 ${
                  activeTab === 'preview'
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                <span>Quick Integrations</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('svg')}
                className={`flex-1 py-1.5 px-3 text-xs font-medium rounded-md transition-colors flex items-center justify-center gap-1.5 ${
                  activeTab === 'svg'
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Code2 className="w-3.5 h-3.5 text-sky-400" />
                <span>Vector SVG</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('json')}
                className={`flex-1 py-1.5 px-3 text-xs font-medium rounded-md transition-colors flex items-center justify-center gap-1.5 ${
                  activeTab === 'json'
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <FileJson className="w-3.5 h-3.5 text-amber-400" />
                <span>JSON Response</span>
              </button>
            </div>

            {/* Tab 1: Quick Integrations (cURL, HTML, Fetch) */}
            {activeTab === 'preview' && (
              <div className="space-y-4 flex-1">
                <div>
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-1.5">
                    <span>1. Direct HTML Image Tag</span>
                    <button
                      onClick={() => copyToClipboard(`<img src="${currentApiUrl}&format=svg" alt="AmirulQR Free Foreva" width="250" height="250" />`, 'html')}
                      className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                    >
                      {copiedField === 'html' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedField === 'html' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <pre className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs font-mono text-cyan-300 overflow-x-auto">
{`<img src="${currentApiUrl}&format=svg" alt="AmirulQR Free Foreva" width="250" height="250" />`}
                  </pre>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-1.5">
                    <span>2. cURL Terminal Request</span>
                    <button
                      onClick={() => copyToClipboard(`curl -s "${currentApiUrl}&format=json"`, 'curl')}
                      className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                    >
                      {copiedField === 'curl' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedField === 'curl' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <pre className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs font-mono text-emerald-300 overflow-x-auto">
{`curl -s "${currentApiUrl}&format=json"`}
                  </pre>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-1.5">
                    <span>3. JavaScript / TypeScript Fetch</span>
                    <button
                      onClick={() => copyToClipboard(`const res = await fetch("${currentApiUrl}&format=json");\nconst { data } = await res.json();\nconsole.log(data.svg);`, 'fetch')}
                      className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                    >
                      {copiedField === 'fetch' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedField === 'fetch' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <pre className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs font-mono text-amber-200 overflow-x-auto">
{`const res = await fetch("${currentApiUrl}&format=json");
const { data } = await res.json();
// data.svg contains standalone vector SVG markup`}
                  </pre>
                </div>
              </div>
            )}

            {/* Tab 2: Raw SVG */}
            {activeTab === 'svg' && (
              <div className="space-y-3 flex-1 flex flex-col">
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span>Standalone Vector SVG Markup</span>
                  <button
                    onClick={() => copyToClipboard(svgString, 'svg-markup')}
                    className="flex items-center gap-1 px-2 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-[11px] font-medium transition-colors"
                  >
                    {copiedField === 'svg-markup' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedField === 'svg-markup' ? 'Copied!' : 'Copy SVG'}</span>
                  </button>
                </div>
                <textarea
                  readOnly
                  value={svgString}
                  className="flex-1 w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-[11px] font-mono text-sky-300 focus:outline-none resize-none h-64"
                />
              </div>
            )}

            {/* Tab 3: JSON Response */}
            {activeTab === 'json' && (
              <div className="space-y-3 flex-1 flex flex-col">
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span>REST JSON Payload</span>
                  <button
                    onClick={() => copyToClipboard(JSON.stringify(jsonResponse, null, 2), 'json-copy')}
                    className="flex items-center gap-1 px-2 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-[11px] font-medium transition-colors"
                  >
                    {copiedField === 'json-copy' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedField === 'json-copy' ? 'Copied!' : 'Copy JSON'}</span>
                  </button>
                </div>
                <pre className="flex-1 w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-[11px] font-mono text-emerald-400 overflow-y-auto max-h-80">
                  {JSON.stringify(jsonResponse, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
