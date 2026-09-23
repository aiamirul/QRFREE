import React from 'react';
import { X, Sparkles, Check, ArrowRight } from 'lucide-react';
import { QRState } from '../types/qr';
import { CURATED_TEMPLATES, CuratedTemplate } from '../utils/presets';

interface TemplateGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: CuratedTemplate) => void;
}

export const TemplateGalleryModal: React.FC<TemplateGalleryModalProps> = ({
  isOpen,
  onClose,
  onSelectTemplate
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold font-display text-white">
                Curated Design Templates
              </h3>
              <p className="text-xs text-slate-400">
                Pre-configured color palettes, center badges, and shapes ready for immediate deployment
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Template List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-5 max-h-[60vh] overflow-y-auto pr-1">
          {CURATED_TEMPLATES.map((tpl) => (
            <div
              key={tpl.id}
              onClick={() => {
                onSelectTemplate(tpl);
                onClose();
              }}
              className="group cursor-pointer p-4 rounded-xl bg-slate-950/70 border border-slate-850 hover:border-indigo-500/80 hover:bg-slate-850 transition-all text-left flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold text-indigo-400 uppercase tracking-wider">
                    {tpl.badge}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-3 h-3 rounded-full border border-slate-700"
                      style={{ backgroundColor: tpl.state.colors?.primary }}
                    />
                    {tpl.state.colors?.type === 'gradient' && (
                      <span
                        className="w-3 h-3 rounded-full border border-slate-700"
                        style={{ backgroundColor: tpl.state.colors?.secondary }}
                      />
                    )}
                  </div>
                </div>

                <h4 className="text-sm font-semibold text-slate-100 group-hover:text-indigo-300 transition-colors">
                  {tpl.name}
                </h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  {tpl.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs text-indigo-400 font-medium group-hover:translate-x-0.5 transition-transform">
                <span>Apply Template</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 pt-3 border-t border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
