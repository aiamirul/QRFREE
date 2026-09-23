import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  RotateCcw, 
  Layers, 
  ShieldCheck, 
  Smartphone, 
  Check, 
  Download,
  Share2,
  ExternalLink,
  MessageCircle,
  Apple,
  Terminal,
  Globe
} from 'lucide-react';
import { QRState, HistoryItem } from './types/qr';
import { CURATED_TEMPLATES, PRESET_LOGOS, CuratedTemplate } from './utils/presets';
import { 
  getStoredHistory, 
  saveItemToHistory, 
  removeItemFromHistory, 
  clearStoredHistory 
} from './utils/historyStorage';
import { parseApiQueryParams, buildQRStateFromApi } from './utils/apiHandler';
import { TopBar } from './components/TopBar';
import { ContentTabs } from './components/ContentTabs';
import { LogoSelector } from './components/LogoSelector';
import { StyleControls } from './components/StyleControls';
import { QRPreview } from './components/QRPreview';
import { TemplateGalleryModal } from './components/TemplateGalleryModal';
import { PrintModal } from './components/PrintModal';
import { RecentLinksModal } from './components/RecentLinksModal';
import { RecentLinksBar } from './components/RecentLinksBar';
import { ApiResponderView } from './components/ApiResponderView';
import { ApiDocsModal } from './components/ApiDocsModal';
import { KanikaLogo } from './components/KanikaLogo';

const INITIAL_STATE: QRState = {
  contentType: 'url',
  rawText: 'https://mystery.com',
  url: 'https://mystery.com',
  whatsapp: {
    countryCode: '+1',
    phone: '5550192834',
    message: 'Hello! I would like to inquire about your services.'
  },
  appStore: {
    platform: 'apple',
    appId: '1234567890',
    customUrl: 'https://apps.apple.com/app/id1234567890'
  },
  social: {
    platform: 'instagram',
    username: 'studio.design'
  },
  wifi: {
    ssid: 'Studio_Guest_WiFi',
    password: 'Connect2026!',
    encryption: 'WPA',
    hidden: false
  },
  vcard: {
    firstName: 'Alex',
    lastName: 'Vance',
    organization: 'Kanika Studio',
    title: 'Design Director',
    phone: '+1 555-0199',
    email: 'alex@kanika.studio',
    website: 'https://mystery.com'
  },
  text: {
    content: 'Welcome to Kanika QR Makeah!'
  },
  email: {
    address: 'contact@kanika.studio',
    subject: 'Project Inquiry',
    body: 'Hi, I came across your work and would love to connect.'
  },
  errorCorrection: 'H',
  dotStyle: 'rounded',
  eyeFrameStyle: 'rounded',
  eyePupilStyle: 'rounded',
  margin: 2,
  colors: {
    type: 'solid',
    primary: '#0f172a',
    secondary: '#334155',
    gradientAngle: 90,
    background: '#ffffff',
    transparentBackground: false,
    customEyeColors: false
  },
  logo: {
    sourceType: 'preset',
    presetId: 'globe',
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
    style: 'bottom-banner',
    text: 'VISIT WEBSITE',
    textColor: '#ffffff',
    frameColor: '#0f172a'
  }
};

const STORAGE_KEY = 'kanika_qr_state_v1';

export default function App() {
  // Check if URL parameters request API mode
  const [apiParams, setApiParams] = useState(() => parseApiQueryParams());
  const [isApiMode, setIsApiMode] = useState(() => apiParams.isApiMode);

  const [state, setState] = useState<QRState>(() => {
    // If URL has direct parameters even if not mode=api (e.g. url=...&centerlogo=...)
    const parsed = parseApiQueryParams();
    if (parsed.rawUrl) {
      return buildQRStateFromApi(parsed);
    }

    try {
      const saved = localStorage.getItem(STORAGE_KEY) || localStorage.getItem('vortex_qr_state_v1');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to parse saved state:', e);
    }
    return INITIAL_STATE;
  });

  const [history, setHistory] = useState<HistoryItem[]>(() => getStoredHistory());
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isApiDocsModalOpen, setIsApiDocsModalOpen] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const exportHandlersRef = useRef<{
    downloadPng: () => void;
    downloadJpg: () => void;
    downloadSvg: () => void;
  } | null>(null);

  // Re-check query parameters if popstate occurs
  useEffect(() => {
    const handlePopState = () => {
      const parsed = parseApiQueryParams();
      setApiParams(parsed);
      setIsApiMode(parsed.isApiMode);
      if (parsed.isApiMode) {
        setState(buildQRStateFromApi(parsed));
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Sync state to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn('Storage sync error:', e);
    }
  }, [state]);

  // Debounced auto-save recent generated links to local storage
  useEffect(() => {
    if (!state.rawText || state.rawText.trim() === '' || state.rawText === 'https://example.com') {
      return;
    }

    const timer = setTimeout(() => {
      const updated = saveItemToHistory(state);
      setHistory(updated);
    }, 1400);

    return () => clearTimeout(timer);
  }, [state.rawText, state.contentType]);

  const triggerSaveToHistory = () => {
    const updated = saveItemToHistory(state);
    setHistory(updated);
  };

  const handleCopySuccess = () => {
    triggerSaveToHistory();
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2400);
  };

  const handleExportPng = () => {
    triggerSaveToHistory();
    exportHandlersRef.current?.downloadPng();
  };

  const handleExportJpg = () => {
    triggerSaveToHistory();
    exportHandlersRef.current?.downloadJpg();
  };

  const handleExportSvg = () => {
    triggerSaveToHistory();
    exportHandlersRef.current?.downloadSvg();
  };

  const handleSelectTemplate = (template: CuratedTemplate) => {
    setState((prev) => ({
      ...prev,
      ...template.state,
      colors: {
        ...prev.colors,
        ...(template.state.colors || {})
      },
      logo: {
        ...prev.logo,
        ...(template.state.logo || {}),
        offsetX: 0,
        offsetY: 0
      },
      frame: {
        ...prev.frame,
        ...(template.state.frame || {})
      }
    }));
  };

  const handleSelectHistoryItem = (item: HistoryItem) => {
    setState(item.state);
  };

  const handleDeleteHistoryItem = (id: string) => {
    const updated = removeItemFromHistory(id);
    setHistory(updated);
  };

  const handleClearAllHistory = () => {
    clearStoredHistory();
    setHistory([]);
  };

  const resetToDefault = () => {
    setState(INITIAL_STATE);
  };

  const applyQuickPreset = (presetKey: 'apple' | 'whatsapp' | 'instagram' | 'wifi') => {
    const tpl = CURATED_TEMPLATES.find(t => t.id.startsWith(presetKey));
    if (tpl) {
      handleSelectTemplate(tpl);
    }
  };

  // If app is queried in API mode (?mode=api&url=mystery.com&centerlogo=website)
  if (isApiMode) {
    return (
      <ApiResponderView
        apiParams={apiParams}
        onOpenInStudio={(apiState) => {
          setState(apiState);
          setIsApiMode(false);
          // Clean URL parameter without reloading
          window.history.replaceState({}, '', window.location.pathname);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500/30">
      {/* Strict 3-zone Top Bar with History Counter & API link */}
      <TopBar
        onOpenTemplates={() => setIsTemplateModalOpen(true)}
        onOpenHistory={() => setIsHistoryModalOpen(true)}
        onOpenApiDocs={() => setIsApiDocsModalOpen(true)}
        historyCount={history.length}
        onCopyImage={handleCopySuccess}
        onExportPng={handleExportPng}
        onExportJpg={handleExportJpg}
        onExportSvg={handleExportSvg}
        copySuccess={copySuccess}
      />

      {/* Hero Intro Banner */}
      <div className="border-b border-slate-850 bg-gradient-to-b from-slate-900/60 to-slate-950 px-6 py-6 md:py-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mb-2">
              <span className="text-indigo-400 font-semibold flex items-center gap-1">
                <KanikaLogo size={16} />
                <span>Kanika QR Makeah</span>
              </span>
              <span aria-hidden="true">·</span>
              <span>Centered Badges & Optical Calibration</span>
              <span aria-hidden="true">·</span>
              <span>Vector SVG & PNG Export</span>
              <span aria-hidden="true">·</span>
              <button
                onClick={() => setIsApiDocsModalOpen(true)}
                className="text-emerald-400 hover:text-emerald-300 font-mono font-medium underline underline-offset-2 flex items-center gap-1"
              >
                <Terminal className="w-3 h-3" />
                <span>?mode=api</span>
              </button>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold font-display tracking-tight text-white max-w-2xl text-balance">
              Kanika QR Makeah — Custom QR Studio & Live API
            </h1>
            <p className="text-sm text-slate-400 mt-1.5 max-w-2xl">
              Generate QR codes with centered brand logos, optical calibration, or query this app directly as an API with <code className="text-indigo-300 bg-slate-900 px-1.5 py-0.5 rounded font-mono text-xs">?mode=api&url=mystery.com&centerlogo=website</code>.
            </p>
          </div>

          {/* Quick preset badge buttons and API link */}
          <div className="flex flex-col items-start md:items-end gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-slate-400 mr-1">Quick Load:</span>
              <button
                onClick={() => applyQuickPreset('apple')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 hover:text-white transition-colors"
              >
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                <span>Apple Store</span>
              </button>
              <button
                onClick={() => applyQuickPreset('whatsapp')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 hover:text-white transition-colors"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>WhatsApp</span>
              </button>
              <button
                onClick={() => applyQuickPreset('instagram')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 hover:text-white transition-colors"
              >
                <span className="w-2 h-2 rounded-full bg-rose-400" />
                <span>Instagram</span>
              </button>
              <button
                onClick={() => setIsTemplateModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/30 text-xs text-indigo-300 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>More Presets</span>
              </button>
            </div>

            {/* Direct API test link button */}
            <a
              href="/?mode=api&url=mystery.com&centerlogo=website"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900/90 hover:bg-indigo-950/60 border border-emerald-500/30 hover:border-emerald-500/60 text-xs text-slate-300 hover:text-emerald-300 transition-all font-mono shadow-sm"
              title="Test the API endpoint: ?mode=api&url=mystery.com&centerlogo=website"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Test API: ?mode=api&url=mystery.com&centerlogo=website</span>
              <ExternalLink className="w-3 h-3 text-emerald-400" />
            </a>
          </div>
        </div>
      </div>

      {/* Main Studio Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 md:py-8">
        {/* Recent Generated Links Quick Ribbon */}
        <RecentLinksBar
          history={history}
          onSelectHistoryItem={handleSelectHistoryItem}
          onOpenHistoryModal={() => setIsHistoryModalOpen(true)}
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Configuration Controls (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Section 1: Content Destination */}
            <ContentTabs state={state} onChange={setState} />

            {/* Section 2: Logo Hub & Center Calibration */}
            <LogoSelector state={state} onChange={setState} />

            {/* Section 3: Visual Styling & Frames */}
            <StyleControls state={state} onChange={setState} />

            {/* Footer controls inside column */}
            <div className="flex items-center justify-between text-xs text-slate-500 pt-2 pb-8">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Auto-saved to local browser session</span>
              </div>
              <button
                type="button"
                onClick={resetToDefault}
                className="flex items-center gap-1.5 text-slate-400 hover:text-rose-300 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset to Default</span>
              </button>
            </div>
          </div>

          {/* Right Column: Sticky Live Preview, Audit & Export (5 cols) */}
          <div className="lg:col-span-5">
            <QRPreview
              state={state}
              onOpenPrint={() => setIsPrintModalOpen(true)}
              onCopySuccess={handleCopySuccess}
              copySuccess={copySuccess}
              onRegisterExportHandlers={(handlers) => {
                exportHandlersRef.current = handlers;
              }}
            />
          </div>
        </div>
      </main>

      {/* Quiet Domain Footer */}
      <footer className="mt-auto border-t border-slate-900 bg-slate-950 py-6 px-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <KanikaLogo size={20} />
            <span className="font-semibold text-slate-300 font-display">Kanika QR Makeah</span>
            <span aria-hidden="true">·</span>
            <span>QR Generator with Centered Badges, Optical Calibration & Live API Mode</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <button
              onClick={() => setIsApiDocsModalOpen(true)}
              className="hover:text-indigo-400 transition-colors font-mono"
            >
              API Reference
            </button>
            <span aria-hidden="true">·</span>
            <span>Reed-Solomon H (30%)</span>
            <span aria-hidden="true">·</span>
            <span>Saved in Local Storage</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <TemplateGalleryModal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        onSelectTemplate={handleSelectTemplate}
      />

      <PrintModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        state={state}
      />

      <RecentLinksModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        history={history}
        onSelectHistoryItem={handleSelectHistoryItem}
        onDeleteItem={handleDeleteHistoryItem}
        onClearAll={handleClearAllHistory}
      />

      <ApiDocsModal
        isOpen={isApiDocsModalOpen}
        onClose={() => setIsApiDocsModalOpen(false)}
        currentUrl={state.url || state.rawText || 'mystery.com'}
        currentLogoPreset={state.logo.presetId || 'website'}
      />
    </div>
  );
}
