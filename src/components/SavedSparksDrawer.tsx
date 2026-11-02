import React, { useState } from 'react';
import { SavedTitleItem } from '../types';
import { X, Bookmark, Trash2, Copy, Check, Download, ExternalLink, Sparkles } from 'lucide-react';

interface SavedSparksDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  savedTitles: SavedTitleItem[];
  onRemoveTitle: (id: string) => void;
  onClearAll: () => void;
}

export const SavedSparksDrawer: React.FC<SavedSparksDrawerProps> = ({
  isOpen,
  onClose,
  savedTitles,
  onRemoveTitle,
  onClearAll,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  if (!isOpen) return null;

  const handleCopySingle = (title: string, id: string) => {
    navigator.clipboard.writeText(title);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCopyAll = () => {
    if (savedTitles.length === 0) return;
    const text = savedTitles
      .map((item, idx) => `${idx + 1}. ${item.title} (${item.style} - ${item.estimatedCtr})`)
      .join('\n');
    navigator.clipboard.writeText(text);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2200);
  };

  const handleExportMarkdown = () => {
    if (savedTitles.length === 0) return;
    const content = `# CreatorSpark AI - Saved Titles & Sparks
Exported: ${new Date().toLocaleDateString()}

${savedTitles
  .map(
    (item, idx) =>
      `### ${idx + 1}. ${item.title}
- **Topic:** ${item.topic}
- **Style:** ${item.style}
- **Estimated CTR:** ${item.estimatedCtr}
`
  )
  .join('\n')}
---
Generated with CreatorSpark AI — "Your Ideas. Our AI. Viral Possibilities."
`;

    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CreatorSpark-Saved-Titles-${Date.now()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col">
          {/* Drawer Header */}
          <div className="p-5 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-400/10 text-amber-400 border border-amber-400/20">
                <Bookmark className="w-5 h-5 fill-amber-400" />
              </div>
              <div>
                <h3 className="font-display font-bold text-lg text-white">
                  Saved Sparks
                </h3>
                <p className="text-xs text-slate-400">
                  {savedTitles.length} {savedTitles.length === 1 ? 'title' : 'titles'} bookmarked
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="Close drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Actions toolbar */}
          {savedTitles.length > 0 && (
            <div className="px-5 py-3 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between gap-2 text-xs">
              <button
                onClick={handleCopyAll}
                className="flex items-center gap-1.5 font-bold text-amber-400 hover:text-amber-300"
              >
                {copiedAll ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedAll ? 'All Copied!' : 'Copy All'}</span>
              </button>

              <button
                onClick={handleExportMarkdown}
                className="flex items-center gap-1.5 font-bold text-slate-300 hover:text-white"
                title="Download as .md file"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Markdown</span>
              </button>

              <button
                onClick={onClearAll}
                className="flex items-center gap-1.5 text-rose-400 hover:text-rose-300 font-semibold"
                title="Remove all saved titles"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            </div>
          )}

          {/* Drawer Content List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-3">
            {savedTitles.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                <Bookmark className="w-12 h-12 text-slate-600 mb-3" />
                <h4 className="font-bold text-white text-base">No Saved Titles Yet</h4>
                <p className="text-xs mt-1 max-w-xs text-slate-400">
                  Click the bookmark icon next to any generated title to save it for your next video shoot!
                </p>
              </div>
            ) : (
              savedTitles.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl bg-slate-950/80 border border-slate-800 p-4 hover:border-slate-700 transition flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        {item.style}
                      </span>
                      <span className="text-[11px] font-bold text-emerald-400 font-mono">
                        {item.estimatedCtr}
                      </span>
                    </div>

                    <h4 className="font-display font-bold text-sm text-white leading-snug">
                      {item.title}
                    </h4>

                    <div className="mt-2 text-[11px] text-slate-500 truncate">
                      Topic: {item.topic}
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-850 flex items-center justify-between">
                    <button
                      onClick={() => handleCopySingle(item.title, item.id)}
                      className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1"
                    >
                      {copiedId === item.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => onRemoveTitle(item.id)}
                      className="p-1 rounded text-slate-500 hover:text-rose-400 transition"
                      title="Remove from saved"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
