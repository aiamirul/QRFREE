import React from 'react';
import { Clock, ExternalLink, ChevronRight, Globe, MessageCircle, Apple, Share2, Wifi, User, Mail, FileText } from 'lucide-react';
import { HistoryItem } from '../types/qr';

interface RecentLinksBarProps {
  history: HistoryItem[];
  onSelectHistoryItem: (item: HistoryItem) => void;
  onOpenHistoryModal: () => void;
}

export const RecentLinksBar: React.FC<RecentLinksBarProps> = ({
  history,
  onSelectHistoryItem,
  onOpenHistoryModal
}) => {
  if (history.length === 0) return null;

  const topRecent = history.slice(0, 4);

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'whatsapp': return <MessageCircle className="w-3 h-3 text-emerald-400" />;
      case 'appstore': return <Apple className="w-3 h-3 text-sky-400" />;
      case 'social': return <Share2 className="w-3 h-3 text-pink-400" />;
      case 'wifi': return <Wifi className="w-3 h-3 text-cyan-400" />;
      case 'vcard': return <User className="w-3 h-3 text-violet-400" />;
      case 'email': return <Mail className="w-3 h-3 text-amber-400" />;
      case 'text': return <FileText className="w-3 h-3 text-slate-400" />;
      default: return <Globe className="w-3 h-3 text-indigo-400" />;
    }
  };

  return (
    <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs mb-6">
      <div className="flex items-center gap-2 shrink-0">
        <div className="w-6 h-6 rounded-md bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
          <Clock className="w-3.5 h-3.5" />
        </div>
        <span className="font-semibold text-slate-300">Recent Generated Links:</span>
      </div>

      {/* Quick Pills */}
      <div className="flex flex-wrap items-center gap-1.5 flex-1 min-w-0">
        {topRecent.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelectHistoryItem(item)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950/80 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500/40 text-slate-300 hover:text-white transition-all text-xs max-w-[200px] truncate"
            title={`Restore: ${item.rawText}`}
          >
            {getContentTypeIcon(item.contentType)}
            <span className="truncate">{item.title}</span>
          </button>
        ))}
      </div>

      {/* View All Button */}
      <button
        type="button"
        onClick={onOpenHistoryModal}
        className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-medium shrink-0 ml-auto transition-colors text-xs"
      >
        <span>View History ({history.length})</span>
        <ChevronRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
