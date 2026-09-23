import React from 'react';
import { 
  Palette, 
  Eye, 
  Grid, 
  Frame, 
  ShieldCheck, 
  Sparkles,
  Sliders
} from 'lucide-react';
import { 
  QRState, 
  DotStyle, 
  EyeFrameStyle, 
  EyePupilStyle, 
  FrameStyle, 
  ErrorCorrectionLevel 
} from '../types/qr';

interface StyleControlsProps {
  state: QRState;
  onChange: (updater: (prev: QRState) => QRState) => void;
}

const COLOR_PRESETS = [
  { name: 'Monochrome', primary: '#09090b', secondary: '#27272a', bg: '#ffffff' },
  { name: 'WhatsApp Green', primary: '#075E54', secondary: '#25D366', bg: '#ffffff' },
  { name: 'Royal Indigo', primary: '#4338CA', secondary: '#6366F1', bg: '#ffffff' },
  { name: 'Sunset Crimson', primary: '#991B1B', secondary: '#EA580C', bg: '#ffffff' },
  { name: 'Cyber Teal', primary: '#0369A1', secondary: '#06B6D4', bg: '#ffffff' },
  { name: 'Deep Purple', primary: '#581C87', secondary: '#A855F7', bg: '#ffffff' },
  { name: 'Dark Mode Invert', primary: '#38BDF8', secondary: '#818CF8', bg: '#090D16' },
];

export const StyleControls: React.FC<StyleControlsProps> = ({ state, onChange }) => {
  const updateField = (section: keyof QRState, field: string, val: any) => {
    onChange((prev) => ({
      ...prev,
      [section]: {
        ...(prev[section] as any),
        [field]: val
      }
    }));
  };

  const applyColorPreset = (preset: typeof COLOR_PRESETS[0]) => {
    onChange((prev) => ({
      ...prev,
      colors: {
        ...prev.colors,
        primary: preset.primary,
        secondary: preset.secondary,
        background: preset.bg,
        transparentBackground: false
      }
    }));
  };

  return (
    <section id="style-section" className="bg-slate-900/60 rounded-xl p-5 border border-slate-800/80 shadow-sm space-y-6">
      <div>
        <h2 className="text-sm font-semibold text-slate-200 tracking-wide uppercase font-display">
          03. QR Aesthetic & Shape Customizer
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Fine-tune module dots, corner eye shapes, color gradients, and CTA frames
        </p>
      </div>

      {/* 1. Dot / Module Shape */}
      <div>
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 mb-2">
          <Grid className="w-3.5 h-3.5 text-indigo-400" />
          <span>Module Dot Style</span>
        </div>
        <div className="grid grid-cols-5 gap-1.5">
          {(
            [
              { id: 'square', label: 'Square' },
              { id: 'dots', label: 'Circles' },
              { id: 'rounded', label: 'Rounded' },
              { id: 'extra-rounded', label: 'Squircle' },
              { id: 'classy', label: 'Diamond' },
            ] as { id: DotStyle; label: string }[]
          ).map((item) => {
            const isSelected = state.dotStyle === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onChange((prev) => ({ ...prev, dotStyle: item.id }))}
                className={`py-2 px-1 text-xs font-medium rounded-md border text-center transition-colors ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                    : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Finder Eye Styles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 mb-2">
            <Eye className="w-3.5 h-3.5 text-sky-400" />
            <span>Corner Eye Frame</span>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {(['square', 'rounded', 'circle'] as EyeFrameStyle[]).map((style) => (
              <button
                key={style}
                type="button"
                onClick={() => onChange((prev) => ({ ...prev, eyeFrameStyle: style }))}
                className={`py-1.5 text-xs font-medium rounded-md border capitalize transition-colors ${
                  state.eyeFrameStyle === style
                    ? 'bg-sky-600 text-white border-sky-500 shadow-sm'
                    : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {style}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 mb-2">
            <Eye className="w-3.5 h-3.5 text-indigo-400" />
            <span>Inner Eye Pupil</span>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {(['square', 'rounded', 'circle'] as EyePupilStyle[]).map((style) => (
              <button
                key={style}
                type="button"
                onClick={() => onChange((prev) => ({ ...prev, eyePupilStyle: style }))}
                className={`py-1.5 text-xs font-medium rounded-md border capitalize transition-colors ${
                  state.eyePupilStyle === style
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                    : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {style}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Colors & Gradients */}
      <div className="space-y-3 pt-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
            <Palette className="w-3.5 h-3.5 text-emerald-400" />
            <span>Color Palette & Gradients</span>
          </div>

          <div className="flex items-center gap-1 p-0.5 bg-slate-950 rounded border border-slate-800 text-[11px]">
            <button
              type="button"
              onClick={() => updateField('colors', 'type', 'solid')}
              className={`px-2 py-0.5 rounded ${
                state.colors.type === 'solid' ? 'bg-slate-800 text-white font-medium' : 'text-slate-400'
              }`}
            >
              Solid
            </button>
            <button
              type="button"
              onClick={() => updateField('colors', 'type', 'gradient')}
              className={`px-2 py-0.5 rounded ${
                state.colors.type === 'gradient' ? 'bg-slate-800 text-white font-medium' : 'text-slate-400'
              }`}
            >
              Gradient
            </button>
          </div>
        </div>

        {/* Quick color preset chips */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] text-slate-400">Themes:</span>
          {COLOR_PRESETS.map((p) => (
            <button
              key={p.name}
              type="button"
              onClick={() => applyColorPreset(p)}
              className="flex items-center gap-1.5 px-2 py-1 text-[11px] rounded bg-slate-950/80 border border-slate-800 hover:border-slate-700 text-slate-300 transition-colors"
            >
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.primary }} />
              <span>{p.name}</span>
            </button>
          ))}
        </div>

        {/* Color pickers */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div>
            <label className="block text-xs text-slate-400 mb-1">
              {state.colors.type === 'gradient' ? 'Gradient Start' : 'Foreground Color'}
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={state.colors.primary}
                onChange={(e) => updateField('colors', 'primary', e.target.value)}
                className="w-8 h-8 rounded border border-slate-700 bg-transparent cursor-pointer"
              />
              <input
                type="text"
                value={state.colors.primary}
                onChange={(e) => updateField('colors', 'primary', e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-200 font-mono"
              />
            </div>
          </div>

          {state.colors.type === 'gradient' ? (
            <div>
              <label className="block text-xs text-slate-400 mb-1">Gradient End</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={state.colors.secondary}
                  onChange={(e) => updateField('colors', 'secondary', e.target.value)}
                  className="w-8 h-8 rounded border border-slate-700 bg-transparent cursor-pointer"
                />
                <input
                  type="text"
                  value={state.colors.secondary}
                  onChange={(e) => updateField('colors', 'secondary', e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-200 font-mono"
                />
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-xs text-slate-400 mb-1">Background Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={state.colors.background}
                  disabled={state.colors.transparentBackground}
                  onChange={(e) => updateField('colors', 'background', e.target.value)}
                  className="w-8 h-8 rounded border border-slate-700 bg-transparent cursor-pointer disabled:opacity-40"
                />
                <input
                  type="text"
                  value={state.colors.background}
                  disabled={state.colors.transparentBackground}
                  onChange={(e) => updateField('colors', 'background', e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-200 font-mono disabled:opacity-40"
                />
              </div>
            </div>
          )}
        </div>

        {/* Gradient Angle (if gradient) */}
        {state.colors.type === 'gradient' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Gradient Direction</label>
              <select
                value={state.colors.gradientAngle}
                onChange={(e) => updateField('colors', 'gradientAngle', parseInt(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-200"
              >
                <option value={0}>Horizontal (Left → Right)</option>
                <option value={90}>Vertical (Top → Bottom)</option>
                <option value={45}>Diagonal (Top-Left → Bottom-Right)</option>
                <option value={135}>Reverse Diagonal (Top-Right → Bottom-Left)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Background Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={state.colors.background}
                  disabled={state.colors.transparentBackground}
                  onChange={(e) => updateField('colors', 'background', e.target.value)}
                  className="w-8 h-8 rounded border border-slate-700 bg-transparent cursor-pointer disabled:opacity-40"
                />
                <input
                  type="text"
                  value={state.colors.background}
                  disabled={state.colors.transparentBackground}
                  onChange={(e) => updateField('colors', 'background', e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-200 font-mono disabled:opacity-40"
                />
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
            <input
              type="checkbox"
              checked={state.colors.transparentBackground}
              onChange={(e) => updateField('colors', 'transparentBackground', e.target.checked)}
              className="rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-0"
            />
            <span>Transparent Background (PNG & SVG)</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
            <input
              type="checkbox"
              checked={state.colors.customEyeColors}
              onChange={(e) => updateField('colors', 'customEyeColors', e.target.checked)}
              className="rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-0"
            />
            <span>Custom Corner Eye Colors</span>
          </label>
        </div>

        {/* Custom Eye Colors panel */}
        {state.colors.customEyeColors && (
          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Eye Frame Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={state.colors.eyeFrameColor || state.colors.primary}
                  onChange={(e) => updateField('colors', 'eyeFrameColor', e.target.value)}
                  className="w-7 h-7 rounded border border-slate-700 bg-transparent cursor-pointer"
                />
                <input
                  type="text"
                  value={state.colors.eyeFrameColor || state.colors.primary}
                  onChange={(e) => updateField('colors', 'eyeFrameColor', e.target.value)}
                  className="w-24 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Eye Pupil Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={state.colors.eyePupilColor || state.colors.primary}
                  onChange={(e) => updateField('colors', 'eyePupilColor', e.target.value)}
                  className="w-7 h-7 rounded border border-slate-700 bg-transparent cursor-pointer"
                />
                <input
                  type="text"
                  value={state.colors.eyePupilColor || state.colors.primary}
                  onChange={(e) => updateField('colors', 'eyePupilColor', e.target.value)}
                  className="w-24 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200 font-mono"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 4. Frames & Call To Action */}
      <div className="space-y-3 pt-1">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
          <Frame className="w-3.5 h-3.5 text-amber-400" />
          <span>Frame & Call To Action Badge</span>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
          {(
            [
              { id: 'none', label: 'No Frame' },
              { id: 'bottom-banner', label: 'Bottom Banner' },
              { id: 'top-banner', label: 'Top Banner' },
              { id: 'polaroid', label: 'Polaroid Card' },
              { id: 'minimal-border', label: 'Hairline Card' },
            ] as { id: FrameStyle; label: string }[]
          ).map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => updateField('frame', 'style', f.id)}
              className={`py-1.5 text-xs font-medium rounded-md border transition-colors ${
                state.frame.style === f.id
                  ? 'bg-amber-600 text-white border-amber-500 shadow-sm'
                  : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {state.frame.style !== 'none' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-slate-950/80 rounded-lg border border-slate-800">
            <div className="sm:col-span-2">
              <label className="block text-xs text-slate-400 mb-1">Banner / Frame Text</label>
              <input
                type="text"
                value={state.frame.text}
                onChange={(e) => updateField('frame', 'text', e.target.value)}
                placeholder="SCAN ME"
                className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-100"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Frame Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={state.frame.frameColor}
                  onChange={(e) => updateField('frame', 'frameColor', e.target.value)}
                  className="w-7 h-7 rounded border border-slate-700 bg-transparent cursor-pointer"
                />
                <input
                  type="text"
                  value={state.frame.frameColor}
                  onChange={(e) => updateField('frame', 'frameColor', e.target.value)}
                  className="w-20 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200 font-mono"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 5. Error Correction & Margins */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
              <span>Error Correction Level</span>
            </label>
            <span className="text-[11px] text-emerald-400">
              {state.errorCorrection === 'H' ? 'Level H (30% recovery)' : `Level ${state.errorCorrection}`}
            </span>
          </div>

          <div className="grid grid-cols-4 gap-1.5">
            {(
              [
                { id: 'L', label: 'L (7%)' },
                { id: 'M', label: 'M (15%)' },
                { id: 'Q', label: 'Q (25%)' },
                { id: 'H', label: 'H (30%)' },
              ] as { id: ErrorCorrectionLevel; label: string }[]
            ).map((ec) => (
              <button
                key={ec.id}
                type="button"
                onClick={() => onChange((prev) => ({ ...prev, errorCorrection: ec.id }))}
                className={`py-1 text-xs rounded border transition-colors ${
                  state.errorCorrection === ec.id
                    ? 'bg-indigo-600 text-white border-indigo-500 font-semibold'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {ec.label}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Higher levels allow larger center logos and damaged codes to scan reliably.
          </p>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
              <Sliders className="w-3.5 h-3.5 text-slate-400" />
              <span>Quiet Zone (Margin)</span>
            </label>
            <span className="text-xs font-mono text-slate-300">{state.margin} modules</span>
          </div>
          <input
            type="range"
            min="1"
            max="6"
            step="1"
            value={state.margin}
            onChange={(e) => onChange((prev) => ({ ...prev, margin: parseInt(e.target.value) }))}
            className="w-full accent-indigo-500 bg-slate-800 rounded h-1.5"
          />
          <div className="flex justify-between text-[10px] text-slate-500 mt-1">
            <span>Compact (1)</span>
            <span>Standard (2-3)</span>
            <span>Spacious (6)</span>
          </div>
        </div>
      </div>
    </section>
  );
};
