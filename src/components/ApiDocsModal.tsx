import React, { useState } from 'react';
import { 
  X, 
  Terminal, 
  Copy, 
  Check, 
  ExternalLink, 
  Sparkles, 
  Code2, 
  Globe, 
  Layers, 
  ArrowRight,
  ShieldCheck,
  FileJson
} from 'lucide-react';
import { KanikaLogo } from './KanikaLogo';
import { PRESET_LOGOS } from '../utils/presets';
import { constructApiUrl } from '../utils/apiHandler';

interface ApiDocsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUrl?: string;
  currentLogoPreset?: string;
}

export const ApiDocsModal: React.FC<ApiDocsModalProps> = ({
  isOpen,
  onClose,
  currentUrl = 'mystery.com',
  currentLogoPreset = 'website'
}) => {
  const [testUrl, setTestUrl] = useState(currentUrl || 'mystery.com');
  const [testLogo, setTestLogo] = useState(currentLogoPreset || 'website');
  const [testFormat, setTestFormat] = useState<'view' | 'svg' | 'json' | 'png'>('view');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://kanika-qr.example';
  const generatedApiUrl = `${currentOrigin}/?mode=api&url=${encodeURIComponent(testUrl)}&centerlogo=${encodeURIComponent(testLogo)}${testFormat !== 'view' ? `&format=${testFormat}` : ''}`;

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <KanikaLogo size={28} />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white font-display">
                  Kanika QR Makeah API Engine
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  GET API
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Generate high-resolution QR codes with centered logos dynamically via URL queries
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Quick Example Callout */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-950/50 to-purple-950/30 border border-indigo-500/30 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-300">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>Requested Example Endpoint:</span>
            </div>
            <div className="flex items-center justify-between gap-2 p-2.5 bg-slate-950/80 rounded-lg border border-slate-800">
              <code className="text-xs font-mono text-emerald-400 truncate">
                /?mode=api&url=mystery.com&centerlogo=website
              </code>
              <button
                type="button"
                onClick={() => copyText(`${currentOrigin}/?mode=api&url=mystery.com&centerlogo=website`, 'example')}
                className="px-2.5 py-1 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded transition-colors shrink-0 flex items-center gap-1"
              >
                {copiedKey === 'example' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'example' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Interactive URL Generator */}
          <div className="space-y-3 bg-slate-950/70 p-4 rounded-xl border border-slate-800">
            <div className="text-xs font-semibold text-slate-200 flex items-center justify-between">
              <span>Interactive Endpoint Builder</span>
              <span className="text-[11px] text-slate-400 font-normal">Real-time dynamic query builder</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">
                  Target URL (<code className="text-indigo-300">url=</code>)
                </label>
                <input
                  type="text"
                  value={testUrl}
                  onChange={(e) => setTestUrl(e.target.value)}
                  placeholder="mystery.com"
                  className="w-full bg-slate-900 border border-slate-750 rounded-lg px-3 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">
                  Center Logo (<code className="text-indigo-300">centerlogo=</code>)
                </label>
                <select
                  value={testLogo}
                  onChange={(e) => setTestLogo(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-750 rounded-lg px-3 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-indigo-500"
                >
                  <option value="website">website (Globe Web preset)</option>
                  <option value="apple">apple (App Store preset)</option>
                  <option value="whatsapp">whatsapp</option>
                  <option value="instagram">instagram</option>
                  <option value="google-play">google-play</option>
                  <option value="wifi">wifi</option>
                  <option value="github">github</option>
                  <option value="x">x (Twitter)</option>
                  <option value="youtube">youtube</option>
                  <option value="linkedin">linkedin</option>
                  <option value="none">none (no center logo)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1">
                Format (<code className="text-indigo-300">format=</code>)
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: 'view', label: 'Console (view)' },
                  { id: 'svg', label: 'Vector (svg)' },
                  { id: 'json', label: 'REST (json)' },
                  { id: 'png', label: 'Image (png)' }
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setTestFormat(f.id as any)}
                    className={`py-1 text-[11px] font-medium rounded border transition-colors ${
                      testFormat === f.id
                        ? 'bg-indigo-600/30 border-indigo-500 text-indigo-300'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Generated Live URL Output */}
            <div className="pt-2 border-t border-slate-850">
              <span className="text-[11px] text-slate-400 block mb-1">Live Endpoint:</span>
              <div className="flex items-center gap-2 p-2 bg-slate-900 rounded-lg border border-slate-800">
                <code className="flex-1 text-[11px] font-mono text-cyan-300 truncate">
                  {generatedApiUrl}
                </code>
                <button
                  type="button"
                  onClick={() => copyText(generatedApiUrl, 'live-api')}
                  className="px-2.5 py-1 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded transition-colors shrink-0 flex items-center gap-1"
                >
                  {copiedKey === 'live-api' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedKey === 'live-api' ? 'Copied' : 'Copy'}</span>
                </button>
                <a
                  href={generatedApiUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
                  title="Open in new tab"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>

          {/* Parameters Documentation Table */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
              <Code2 className="w-3.5 h-3.5 text-indigo-400" />
              <span>Query Parameters Reference</span>
            </h4>
            <div className="border border-slate-800 rounded-xl overflow-hidden text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 text-[11px]">
                    <th className="p-2.5 font-semibold">Parameter</th>
                    <th className="p-2.5 font-semibold">Type</th>
                    <th className="p-2.5 font-semibold">Description</th>
                    <th className="p-2.5 font-semibold">Example</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850 font-mono text-[11px]">
                  <tr>
                    <td className="p-2.5 text-indigo-300 font-bold">mode</td>
                    <td className="p-2.5 text-slate-400">string</td>
                    <td className="p-2.5 text-slate-300 font-sans">Required. Activates API engine responder.</td>
                    <td className="p-2.5 text-emerald-400">api</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 text-indigo-300 font-bold">url</td>
                    <td className="p-2.5 text-slate-400">string</td>
                    <td className="p-2.5 text-slate-300 font-sans">Target website or destination link.</td>
                    <td className="p-2.5 text-emerald-400">mystery.com</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 text-indigo-300 font-bold">centerlogo</td>
                    <td className="p-2.5 text-slate-400">string</td>
                    <td className="p-2.5 text-slate-300 font-sans">
                      Badge preset or external image URL. Supports <code className="text-indigo-300">website</code>, <code className="text-indigo-300">apple</code>, <code className="text-indigo-300">whatsapp</code>, etc.
                    </td>
                    <td className="p-2.5 text-emerald-400">website</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 text-indigo-300 font-bold">format</td>
                    <td className="p-2.5 text-slate-400">enum</td>
                    <td className="p-2.5 text-slate-300 font-sans">Response type: <code className="text-slate-300">view</code> (console), <code className="text-slate-300">svg</code>, <code className="text-slate-300">json</code>, or <code className="text-slate-300">png</code>.</td>
                    <td className="p-2.5 text-emerald-400">svg</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 text-indigo-300 font-bold">ec</td>
                    <td className="p-2.5 text-slate-400">enum</td>
                    <td className="p-2.5 text-slate-300 font-sans">Error correction: <code className="text-slate-300">L</code>, <code className="text-slate-300">M</code>, <code className="text-slate-300">Q</code>, <code className="text-slate-300">H</code> (default: H).</td>
                    <td className="p-2.5 text-emerald-400">H</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 text-indigo-300 font-bold">size</td>
                    <td className="p-2.5 text-slate-400">integer</td>
                    <td className="p-2.5 text-slate-300 font-sans">Target canvas dimension in pixels.</td>
                    <td className="p-2.5 text-emerald-400">512</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-800 bg-slate-950/60">
          <span className="text-xs text-slate-400">
            Powered by <strong className="text-white">Kanika QR Makeah</strong>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
