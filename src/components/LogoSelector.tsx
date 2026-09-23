import React, { useState, useRef, useEffect } from 'react';
import { 
  Image as ImageIcon, 
  Upload, 
  Link as LinkIcon, 
  Layers, 
  Check, 
  X, 
  Sparkles, 
  ShieldAlert,
  Info,
  Move,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Crosshair,
  RotateCcw,
  Bookmark,
  Trash2,
  ExternalLink,
  Star,
  CheckCircle2,
  Plus
} from 'lucide-react';
import { QRState, LogoBgShape, SavedLogo } from '../types/qr';
import { PRESET_LOGOS } from '../utils/presets';
import { 
  getSavedLogos, 
  saveLogoToStorage, 
  deleteSavedLogo, 
  convertImageUrlToDataUrl 
} from '../utils/savedLogosStorage';

interface LogoSelectorProps {
  state: QRState;
  onChange: (updater: (prev: QRState) => QRState) => void;
}

const POPULAR_URL_SAMPLES = [
  {
    name: 'Stripe',
    url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/stripe/stripe-original.svg'
  },
  {
    name: 'Shopify',
    url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/shopify/shopify-original.svg'
  },
  {
    name: 'React',
    url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg'
  },
  {
    name: 'GitHub',
    url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg'
  },
  {
    name: 'Discord',
    url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/discordjs/discordjs-original.svg'
  }
];

export const LogoSelector: React.FC<LogoSelectorProps> = ({ state, onChange }) => {
  const [activeTab, setActiveTab] = useState<'preset' | 'url' | 'upload' | 'saved'>(() => {
    if (state.logo.savedLogoId) return 'saved';
    if (state.logo.sourceType === 'url') return 'url';
    if (state.logo.sourceType === 'upload') return 'upload';
    return 'preset';
  });

  const [urlInput, setUrlInput] = useState(state.logo.url || '');
  const [urlError, setUrlError] = useState<string | null>(null);
  const [isUrlTesting, setIsUrlTesting] = useState(false);
  const [loadedUrlDimensions, setLoadedUrlDimensions] = useState<{ width: number; height: number } | null>(null);

  // Saved Logos from localStorage
  const [savedLogos, setSavedLogos] = useState<SavedLogo[]>(() => getSavedLogos());
  const [customLogoName, setCustomLogoName] = useState('');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Synchronize local savedLogos if storage changes
  useEffect(() => {
    setSavedLogos(getSavedLogos());
  }, []);

  const selectPreset = (presetId: string) => {
    onChange((prev) => ({
      ...prev,
      errorCorrection: prev.errorCorrection === 'L' || prev.errorCorrection === 'M' ? 'H' : prev.errorCorrection,
      logo: {
        ...prev.logo,
        sourceType: 'preset',
        presetId,
        url: undefined,
        uploadDataUrl: undefined,
        savedLogoId: undefined
      }
    }));
  };

  const removeLogo = () => {
    onChange((prev) => ({
      ...prev,
      logo: {
        ...prev.logo,
        sourceType: 'none',
        presetId: undefined,
        url: undefined,
        uploadDataUrl: undefined,
        savedLogoId: undefined
      }
    }));
  };

  const applyCustomUrl = async (url: string) => {
    const trimmed = url.trim();
    if (!trimmed) {
      setUrlError('Please enter a valid image URL');
      return;
    }
    setUrlError(null);
    setIsUrlTesting(true);

    try {
      // Convert external image URL to inlined base64 data URL for CORS & offline stability
      const { dataUrl, width, height } = await convertImageUrlToDataUrl(trimmed);
      setLoadedUrlDimensions({ width, height });
      setIsUrlTesting(false);

      // Guess a friendly default name for saving
      let defaultName = 'Custom Logo';
      try {
        const parsed = new URL(trimmed);
        const pathname = parsed.pathname.split('/').filter(Boolean).pop() || '';
        defaultName = pathname.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ') || parsed.hostname;
        defaultName = defaultName.charAt(0).toUpperCase() + defaultName.slice(1);
      } catch {
        defaultName = 'Web Icon';
      }
      setCustomLogoName(defaultName);

      onChange((prev) => ({
        ...prev,
        errorCorrection: 'H',
        logo: {
          ...prev.logo,
          sourceType: 'url',
          url: trimmed,
          uploadDataUrl: dataUrl,
          presetId: undefined,
          savedLogoId: undefined
        }
      }));
    } catch (err: any) {
      setIsUrlTesting(false);
      setUrlError(err?.message || 'Could not load image. Make sure the link is a direct image URL (.svg, .png, .jpg, .webp).');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (PNG, SVG, JPG, WebP)');
      return;
    }

    const cleanFileName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
    setCustomLogoName(cleanFileName.charAt(0).toUpperCase() + cleanFileName.slice(1));

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        onChange((prev) => ({
          ...prev,
          errorCorrection: 'H',
          logo: {
            ...prev.logo,
            sourceType: 'upload',
            uploadDataUrl: dataUrl,
            presetId: undefined,
            url: undefined,
            savedLogoId: undefined
          }
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveActiveLogoToStorage = () => {
    const activeDataUrl = state.logo.uploadDataUrl || state.logo.url;
    if (!activeDataUrl) return;

    const nameToUse = customLogoName.trim() || (state.logo.sourceType === 'url' ? 'Web Logo' : 'Uploaded Logo');
    const { logos, newLogo } = saveLogoToStorage(
      nameToUse,
      activeDataUrl,
      state.logo.url,
      state.logo.sourceType === 'url' ? 'url' : 'upload',
      loadedUrlDimensions || undefined
    );

    setSavedLogos(logos);
    setSaveSuccessMsg(`"${nameToUse}" saved to your browser storage!`);
    setTimeout(() => setSaveSuccessMsg(null), 3000);

    // Link active state to this saved logo
    onChange((prev) => ({
      ...prev,
      logo: {
        ...prev.logo,
        savedLogoId: newLogo.id
      }
    }));
  };

  const handleSelectSavedLogo = (saved: SavedLogo) => {
    onChange((prev) => ({
      ...prev,
      errorCorrection: 'H',
      logo: {
        ...prev.logo,
        sourceType: saved.sourceType === 'url' ? 'url' : 'upload',
        savedLogoId: saved.id,
        url: saved.url,
        uploadDataUrl: saved.dataUrl,
        presetId: undefined
      }
    }));
  };

  const handleDeleteSavedLogo = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const updated = deleteSavedLogo(id);
    setSavedLogos(updated);

    if (state.logo.savedLogoId === id) {
      onChange((prev) => ({
        ...prev,
        logo: {
          ...prev.logo,
          savedLogoId: undefined
        }
      }));
    }
  };

  const updateLogoConfig = (field: string, value: any) => {
    onChange((prev) => ({
      ...prev,
      logo: {
        ...prev.logo,
        [field]: value
      }
    }));
  };

  const currentOffsetX = state.logo.offsetX || 0;
  const currentOffsetY = state.logo.offsetY || 0;
  const isOffsetCalibrated = currentOffsetX !== 0 || currentOffsetY !== 0;

  const nudge = (dx: number, dy: number) => {
    const newX = Math.round(Math.max(-0.15, Math.min(0.15, currentOffsetX + dx)) * 1000) / 1000;
    const newY = Math.round(Math.max(-0.15, Math.min(0.15, currentOffsetY + dy)) * 1000) / 1000;
    onChange((prev) => ({
      ...prev,
      logo: {
        ...prev.logo,
        offsetX: newX,
        offsetY: newY
      }
    }));
  };

  const resetCalibration = () => {
    onChange((prev) => ({
      ...prev,
      logo: {
        ...prev.logo,
        offsetX: 0,
        offsetY: 0
      }
    }));
  };

  const hasLogo = state.logo.sourceType !== 'none';
  const isCurrentLogoSaved = Boolean(
    state.logo.savedLogoId || 
    (hasLogo && savedLogos.some(l => (state.logo.url && l.url === state.logo.url) || (state.logo.uploadDataUrl && l.dataUrl === state.logo.uploadDataUrl)))
  );

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-indigo-400" />
            <span>Center Logo & Badge</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Embed verified brand presets, image URLs, or saved custom logos with optical calibration
          </p>
        </div>

        {hasLogo ? (
          <button
            type="button"
            onClick={removeLogo}
            className="flex items-center gap-1 px-2.5 py-1 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-md border border-rose-500/20 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            <span>Remove Logo</span>
          </button>
        ) : (
          <span className="text-xs text-slate-500">No logo active</span>
        )}
      </div>

      {/* Success notification banner */}
      {saveSuccessMsg && (
        <div className="flex items-center gap-2 px-3 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-xs text-emerald-300 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* Source Selector 4 Tabs */}
      <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-950/60 rounded-lg border border-slate-800 mb-4">
        <button
          type="button"
          onClick={() => setActiveTab('preset')}
          className={`flex-1 min-w-[120px] flex items-center justify-center gap-1.5 py-1.5 px-2 text-xs font-medium rounded-md transition-colors ${
            activeTab === 'preset'
              ? 'bg-slate-800 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-indigo-400" />
          <span>Presets ({PRESET_LOGOS.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('url')}
          className={`flex-1 min-w-[110px] flex items-center justify-center gap-1.5 py-1.5 px-2 text-xs font-medium rounded-md transition-colors ${
            activeTab === 'url'
              ? 'bg-slate-800 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <LinkIcon className="w-3.5 h-3.5 text-emerald-400" />
          <span>Image URL</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('upload')}
          className={`flex-1 min-w-[110px] flex items-center justify-center gap-1.5 py-1.5 px-2 text-xs font-medium rounded-md transition-colors ${
            activeTab === 'upload'
              ? 'bg-slate-800 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Upload className="w-3.5 h-3.5 text-sky-400" />
          <span>Upload File</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('saved')}
          className={`flex-1 min-w-[120px] flex items-center justify-center gap-1.5 py-1.5 px-2 text-xs font-medium rounded-md transition-colors ${
            activeTab === 'saved'
              ? 'bg-slate-800 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Bookmark className="w-3.5 h-3.5 text-amber-400" />
          <span>Saved Logos ({savedLogos.length})</span>
        </button>
      </div>

      {/* Tab 1: Preset Logos Grid */}
      {activeTab === 'preset' && (
        <div className="space-y-3">
          <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
            {PRESET_LOGOS.map((preset) => {
              const isSelected = state.logo.sourceType === 'preset' && state.logo.presetId === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => selectPreset(preset.id)}
                  className={`group relative flex flex-col items-center justify-center p-2 rounded-lg border transition-all ${
                    isSelected
                      ? 'bg-indigo-600/20 border-indigo-500 ring-1 ring-indigo-500'
                      : 'bg-slate-950/80 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                  }`}
                  title={preset.name}
                >
                  <div
                    className="w-7 h-7 flex items-center justify-center rounded transition-transform group-hover:scale-105"
                    dangerouslySetInnerHTML={{ __html: preset.iconSvg }}
                  />
                  <span className="text-[10px] text-slate-300 mt-1.5 truncate max-w-full font-medium">
                    {preset.name}
                  </span>
                  {isSelected && (
                    <div className="absolute top-1 right-1 w-3.5 h-3.5 bg-indigo-500 rounded-full flex items-center justify-center text-white text-[9px]">
                      <Check className="w-2.5 h-2.5" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Custom URL Image */}
      {activeTab === 'url' && (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Direct Image URL (SVG, PNG, JPG, or WebP)
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    applyCustomUrl(urlInput);
                  }
                }}
                placeholder="https://example.com/logo.svg or .png"
                className="flex-1 bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={() => applyCustomUrl(urlInput)}
                disabled={isUrlTesting || !urlInput.trim()}
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors disabled:opacity-50 whitespace-nowrap flex items-center gap-1.5"
              >
                {isUrlTesting ? (
                  <>
                    <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Loading...</span>
                  </>
                ) : (
                  <span>Apply Logo</span>
                )}
              </button>
            </div>
            {urlError && (
              <p className="text-xs text-rose-400 mt-1.5 flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                <span>{urlError}</span>
              </p>
            )}
          </div>

          {/* Quick 1-click Sample Brand URLs */}
          <div className="pt-1">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Quick Test Brands via URL:</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {POPULAR_URL_SAMPLES.map((sample) => (
                <button
                  key={sample.name}
                  type="button"
                  onClick={() => {
                    setUrlInput(sample.url);
                    applyCustomUrl(sample.url);
                  }}
                  className="px-2.5 py-1 text-xs rounded-md bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors flex items-center gap-1"
                >
                  <LinkIcon className="w-2.5 h-2.5 text-emerald-400" />
                  <span>{sample.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Active URL Card with Save to Local Storage Action */}
          {state.logo.sourceType === 'url' && (state.logo.uploadDataUrl || state.logo.url) && (
            <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center p-1.5 overflow-hidden shrink-0">
                  <img
                    src={state.logo.uploadDataUrl || state.logo.url}
                    alt="Active URL Logo"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-white">Active URL Logo</span>
                    <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-medium border border-emerald-500/20">
                      Applied
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5 font-mono">
                    {state.logo.url}
                  </p>
                </div>
              </div>

              {/* Save to Local Storage Box */}
              <div className="pt-2 border-t border-slate-850 flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="flex-1 flex items-center gap-2">
                  <Bookmark className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <input
                    type="text"
                    value={customLogoName}
                    onChange={(e) => setCustomLogoName(e.target.value)}
                    placeholder="Enter name to save (e.g. My Brand)"
                    className="flex-1 bg-slate-900 border border-slate-750 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSaveActiveLogoToStorage}
                  disabled={isCurrentLogoSaved}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 shrink-0 ${
                    isCurrentLogoSaved
                      ? 'bg-slate-800 text-slate-400 cursor-default'
                      : 'bg-amber-600 hover:bg-amber-500 text-white'
                  }`}
                >
                  <Star className={`w-3.5 h-3.5 ${isCurrentLogoSaved ? 'fill-amber-400 text-amber-400' : ''}`} />
                  <span>{isCurrentLogoSaved ? 'Saved in Local Storage' : 'Save to My Logos'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Upload Image File */}
      {activeTab === 'upload' && (
        <div className="space-y-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/png,image/svg+xml,image/jpeg,image/webp"
            className="hidden"
          />
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-950/40 group"
          >
            <div className="w-10 h-10 rounded-full bg-slate-800 group-hover:bg-indigo-600/20 text-slate-400 group-hover:text-indigo-400 flex items-center justify-center mb-2 transition-colors">
              <Upload className="w-5 h-5" />
            </div>
            <p className="text-xs font-medium text-slate-200">
              Click or drag image file here
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Supports PNG, SVG, JPG, or WebP. Converted securely into local base64.
            </p>
          </div>

          {state.logo.sourceType === 'upload' && state.logo.uploadDataUrl && (
            <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center p-1.5 overflow-hidden shrink-0">
                  <img
                    src={state.logo.uploadDataUrl}
                    alt="Uploaded logo"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-medium text-slate-200 truncate">
                      {customLogoName || 'Uploaded File'}
                    </p>
                    <span className="px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-400 text-[10px] font-medium border border-sky-500/20">
                      Active
                    </span>
                  </div>
                  <p className="text-[10px] text-emerald-400">Ready & active in QR center</p>
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs text-indigo-400 hover:text-indigo-300"
                >
                  Replace
                </button>
              </div>

              {/* Save to Local Storage Box for Uploads */}
              <div className="pt-2 border-t border-slate-850 flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="flex-1 flex items-center gap-2">
                  <Bookmark className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <input
                    type="text"
                    value={customLogoName}
                    onChange={(e) => setCustomLogoName(e.target.value)}
                    placeholder="Enter name to save (e.g. Company Crest)"
                    className="flex-1 bg-slate-900 border border-slate-750 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSaveActiveLogoToStorage}
                  disabled={isCurrentLogoSaved}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 shrink-0 ${
                    isCurrentLogoSaved
                      ? 'bg-slate-800 text-slate-400 cursor-default'
                      : 'bg-amber-600 hover:bg-amber-500 text-white'
                  }`}
                >
                  <Star className={`w-3.5 h-3.5 ${isCurrentLogoSaved ? 'fill-amber-400 text-amber-400' : ''}`} />
                  <span>{isCurrentLogoSaved ? 'Saved in Local Storage' : 'Save to My Logos'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Saved Logos from Local Storage */}
      {activeTab === 'saved' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Your personal logo collection (stored in browser):</span>
            <span className="font-mono text-amber-400">{savedLogos.length} saved</span>
          </div>

          {savedLogos.length === 0 ? (
            <div className="text-center py-8 px-4 border border-dashed border-slate-800 rounded-xl bg-slate-950/40">
              <Bookmark className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-xs font-medium text-slate-300">No saved logos yet</p>
              <p className="text-[11px] text-slate-500 mt-1 max-w-sm mx-auto">
                Enter an Image URL or upload an image, then click <span className="text-amber-400">"Save to My Logos"</span> to keep them here for 1-click reuse across your QR codes.
              </p>
              <button
                type="button"
                onClick={() => setActiveTab('url')}
                className="mt-3 px-3 py-1.5 text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg transition-colors"
              >
                Add Logo via URL
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {savedLogos.map((item) => {
                const isSelected = 
                  state.logo.savedLogoId === item.id || 
                  (state.logo.uploadDataUrl === item.dataUrl) ||
                  (Boolean(state.logo.url) && state.logo.url === item.url);

                return (
                  <div
                    key={item.id}
                    onClick={() => handleSelectSavedLogo(item)}
                    className={`group relative p-2.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-indigo-950/40 border-indigo-500 ring-1 ring-indigo-500 shadow-md'
                        : 'bg-slate-950/80 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1 mb-2">
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 uppercase">
                        {item.sourceType}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => handleDeleteSavedLogo(e, item.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 transition-opacity"
                        title="Delete from local storage"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="w-12 h-12 mx-auto rounded-lg bg-slate-900 border border-slate-800 p-2 flex items-center justify-center mb-2 overflow-hidden">
                      <img
                        src={item.dataUrl}
                        alt={item.name}
                        className="w-full h-full object-contain"
                      />
                    </div>

                    <div className="text-center">
                      <p className="text-xs font-semibold text-slate-200 truncate" title={item.name}>
                        {item.name}
                      </p>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        {new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </p>
                    </div>

                    {isSelected && (
                      <div className="absolute top-2 right-2 w-4 h-4 bg-indigo-500 rounded-full flex items-center justify-center text-white text-[10px]">
                        <Check className="w-2.5 h-2.5" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Logo Tuning Controls & Optical Calibration (active whenever a logo is selected) */}
      {hasLogo && (
        <div className="mt-5 pt-4 border-t border-slate-800/80 space-y-4">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
            <span>Center Logo Styling</span>
            <span className="text-[11px] font-normal text-indigo-400 flex items-center gap-1">
              <Info className="w-3 h-3" />
              <span>Error Correction set to High (H)</span>
            </span>
          </div>

          {/* Size slider */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-slate-400">Logo Size</span>
              <span className="font-mono text-slate-200">{Math.round(state.logo.sizeRatio * 100)}% of QR</span>
            </div>
            <input
              type="range"
              min="0.14"
              max="0.30"
              step="0.01"
              value={state.logo.sizeRatio}
              onChange={(e) => updateLogoConfig('sizeRatio', parseFloat(e.target.value))}
              className="w-full accent-indigo-500 bg-slate-800 rounded h-1.5"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1">
              <span>Subtle (15%)</span>
              <span className="text-emerald-400">Recommended (20% - 24%)</span>
              <span>Prominent (30%)</span>
            </div>
          </div>

          {/* Background Shape */}
          <div>
            <label className="block text-xs text-slate-400 mb-1.5">
              Badge Background Shape
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(['rounded', 'circle', 'square', 'none'] as LogoBgShape[]).map((shape) => {
                const isSelected = state.logo.bgShape === shape;
                return (
                  <button
                    key={shape}
                    type="button"
                    onClick={() => updateLogoConfig('bgShape', shape)}
                    className={`py-1.5 text-xs rounded-md font-medium border capitalize transition-colors ${
                      isSelected
                        ? 'bg-indigo-600/20 border-indigo-500 text-indigo-200'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {shape === 'rounded' ? 'Squircle' : shape}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Background and Border colors */}
          {state.logo.bgShape !== 'none' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Badge Background Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={state.logo.bgColor}
                    onChange={(e) => updateLogoConfig('bgColor', e.target.value)}
                    className="w-8 h-8 rounded border border-slate-700 bg-transparent cursor-pointer"
                  />
                  <input
                    type="text"
                    value={state.logo.bgColor}
                    onChange={(e) => updateLogoConfig('bgColor', e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs font-mono text-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Badge Border Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={state.logo.borderColor}
                    onChange={(e) => updateLogoConfig('borderColor', e.target.value)}
                    className="w-8 h-8 rounded border border-slate-700 bg-transparent cursor-pointer"
                  />
                  <input
                    type="text"
                    value={state.logo.borderColor}
                    onChange={(e) => updateLogoConfig('borderColor', e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs font-mono text-slate-200"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Background padding & border width */}
          {state.logo.bgShape !== 'none' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                  <span>Badge Padding</span>
                  <span className="font-mono text-slate-300">{state.logo.bgPadding}px</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="16"
                  value={state.logo.bgPadding}
                  onChange={(e) => updateLogoConfig('bgPadding', parseInt(e.target.value))}
                  className="w-full accent-indigo-500 bg-slate-800 rounded h-1.5"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                  <span>Border Width</span>
                  <span className="font-mono text-slate-300">{state.logo.borderWidth}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="6"
                  value={state.logo.borderWidth}
                  onChange={(e) => updateLogoConfig('borderWidth', parseInt(e.target.value))}
                  className="w-full accent-indigo-500 bg-slate-800 rounded h-1.5"
                />
              </div>
            </div>
          )}

          {/* Module clearance toggle */}
          <div className="flex items-center justify-between pt-1">
            <div>
              <span className="text-xs font-medium text-slate-300">Clean Module Clearance</span>
              <p className="text-[11px] text-slate-500">Remove QR data dots behind center badge for highest scanner readability</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={state.logo.removeModulesBehind}
                onChange={(e) => updateLogoConfig('removeModulesBehind', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          {/* Precision Center Calibration (Top, Bottom, Left, Right) */}
          <div className="pt-3 border-t border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200">
                  <Move className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Optical Center Calibration (Top, Bottom, Left, Right)</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Nudge or slide the logo coordinates to compensate for optical weight or non-centered glyphs
                </p>
              </div>

              {isOffsetCalibrated && (
                <button
                  type="button"
                  onClick={resetCalibration}
                  className="flex items-center gap-1 px-2 py-0.5 text-[11px] text-slate-400 hover:text-indigo-300 bg-slate-800/60 hover:bg-slate-800 rounded border border-slate-700 transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset Center</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center bg-slate-950/70 p-3 rounded-xl border border-slate-850">
              {/* Nudge D-Pad Controller */}
              <div className="sm:col-span-5 flex flex-col items-center justify-center">
                <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500 mb-1.5">
                  Tactile Nudge
                </span>
                <div className="grid grid-cols-3 gap-1 w-28 h-28 p-1 bg-slate-900/90 rounded-xl border border-slate-800 shadow-inner">
                  <div />
                  {/* Top / Up */}
                  <button
                    type="button"
                    onClick={() => nudge(0, -0.01)}
                    title="Nudge Top / Up"
                    className="flex items-center justify-center rounded-lg bg-slate-800 hover:bg-indigo-600/30 text-slate-300 hover:text-indigo-300 border border-slate-700/60 transition-colors active:scale-95"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <div />

                  {/* Left */}
                  <button
                    type="button"
                    onClick={() => nudge(-0.01, 0)}
                    title="Nudge Left"
                    className="flex items-center justify-center rounded-lg bg-slate-800 hover:bg-indigo-600/30 text-slate-300 hover:text-indigo-300 border border-slate-700/60 transition-colors active:scale-95"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>

                  {/* True Center Reset */}
                  <button
                    type="button"
                    onClick={resetCalibration}
                    title="Center (0, 0)"
                    className={`flex items-center justify-center rounded-lg transition-colors active:scale-95 ${
                      !isOffsetCalibrated
                        ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/40'
                        : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700/60'
                    }`}
                  >
                    <Crosshair className="w-4 h-4" />
                  </button>

                  {/* Right */}
                  <button
                    type="button"
                    onClick={() => nudge(0.01, 0)}
                    title="Nudge Right"
                    className="flex items-center justify-center rounded-lg bg-slate-800 hover:bg-indigo-600/30 text-slate-300 hover:text-indigo-300 border border-slate-700/60 transition-colors active:scale-95"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <div />
                  {/* Bottom / Down */}
                  <button
                    type="button"
                    onClick={() => nudge(0, 0.01)}
                    title="Nudge Bottom / Down"
                    className="flex items-center justify-center rounded-lg bg-slate-800 hover:bg-indigo-600/30 text-slate-300 hover:text-indigo-300 border border-slate-700/60 transition-colors active:scale-95"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                  <div />
                </div>
              </div>

              {/* Sliders with direct readout */}
              <div className="sm:col-span-7 space-y-3">
                {/* Horizontal Alignment */}
                <div>
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="text-slate-400">Horizontal (Left / Right)</span>
                    <span className="font-mono text-slate-200">
                      {currentOffsetX === 0
                        ? 'Centered (0%)'
                        : currentOffsetX > 0
                        ? `Right +${Math.round(currentOffsetX * 100)}%`
                        : `Left ${Math.round(currentOffsetX * 100)}%`}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="-0.12"
                    max="0.12"
                    step="0.005"
                    value={currentOffsetX}
                    onChange={(e) => updateLogoConfig('offsetX', parseFloat(e.target.value))}
                    className="w-full accent-indigo-500 bg-slate-800 rounded h-1.5"
                  />
                  <div className="flex justify-between text-[9px] text-slate-500 mt-0.5 font-mono">
                    <span>◀ Left -12%</span>
                    <span>Center</span>
                    <span>Right +12% ▶</span>
                  </div>
                </div>

                {/* Vertical Alignment */}
                <div>
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="text-slate-400">Vertical (Top / Bottom)</span>
                    <span className="font-mono text-slate-200">
                      {currentOffsetY === 0
                        ? 'Centered (0%)'
                        : currentOffsetY > 0
                        ? `Bottom +${Math.round(currentOffsetY * 100)}%`
                        : `Top ${Math.round(currentOffsetY * 100)}%`}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="-0.12"
                    max="0.12"
                    step="0.005"
                    value={currentOffsetY}
                    onChange={(e) => updateLogoConfig('offsetY', parseFloat(e.target.value))}
                    className="w-full accent-indigo-500 bg-slate-800 rounded h-1.5"
                  />
                  <div className="flex justify-between text-[9px] text-slate-500 mt-0.5 font-mono">
                    <span>▲ Top -12%</span>
                    <span>Center</span>
                    <span>Bottom +12% ▼</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
