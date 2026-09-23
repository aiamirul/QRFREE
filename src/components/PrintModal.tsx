import React, { useEffect, useRef } from 'react';
import { X, Printer } from 'lucide-react';
import { QRState } from '../types/qr';
import { renderQRCodeToCanvas } from '../utils/qrRenderer';

interface PrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: QRState;
}

export const PrintModal: React.FC<PrintModalProps> = ({
  isOpen,
  onClose,
  state
}) => {
  const printCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (isOpen && printCanvasRef.current) {
      renderQRCodeToCanvas(printCanvasRef.current, state, 1200);
    }
  }, [isOpen, state]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold font-display text-white">Print-Ready Sheet</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Paper Card Preview */}
        <div className="my-5 p-6 bg-white text-slate-900 rounded-xl shadow-lg flex flex-col items-center text-center">
          <h2 className="text-xl font-bold tracking-tight font-display text-slate-900">
            {state.frame.text || 'SCAN WITH YOUR CAMERA'}
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-xs">
            Point your smartphone camera at the code below to open the destination instantly.
          </p>

          <div className="my-6 w-64 h-64 flex items-center justify-center">
            <canvas ref={printCanvasRef} className="w-full h-full object-contain" />
          </div>

          <div className="text-[11px] text-slate-400 border-t border-slate-200 pt-3 w-full flex items-center justify-between font-mono">
            <span>Powered by VortexQR</span>
            <span className="truncate max-w-[200px]">{state.rawText}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors shadow-md shadow-indigo-600/30"
          >
            <Printer className="w-4 h-4" />
            <span>Print Now</span>
          </button>
        </div>
      </div>
    </div>
  );
};
