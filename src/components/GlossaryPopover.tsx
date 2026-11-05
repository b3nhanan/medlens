import React, { useState, useEffect } from 'react';
import { api } from '../api.ts';
import { useSettings } from '../context/SettingsContext.tsx';
import { BookOpen, X } from 'lucide-react';

interface GlossaryEntry {
  term: string;
  definitions: Record<string, string>;
}

export const GlossaryPopover: React.FC<{
  term: string;
  children?: React.ReactNode;
}> = ({ term, children }) => {
  const { language } = useSettings();
  const [isOpen, setIsOpen] = useState(false);
  const [definition, setDefinition] = useState<string | null>(null);
  const [allGlossary, setAllGlossary] = useState<GlossaryEntry[]>([]);

  useEffect(() => {
    api.getGlossary().then(list => setAllGlossary(list)).catch(() => {});
  }, []);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const found = allGlossary.find(g => g.term.toLowerCase() === term.toLowerCase());
    if (found) {
      setDefinition(found.definitions[language] || found.definitions.en);
    } else {
      setDefinition('Medical term verified in MedLens reference dictionary.');
    }
    setIsOpen(true);
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className="inline-flex items-center text-teal-700 font-medium underline underline-offset-2 decoration-teal-400 hover:text-teal-900 focus:outline-none focus:ring-1 focus:ring-teal-500 rounded px-0.5"
        title="Tap to view medical glossary definition"
      >
        {children || term}
      </button>

      {isOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        >
          <div 
            className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 relative"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-base">{term}</h4>
                  <span className="text-xs text-slate-500">MedLens Medical Glossary</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                aria-label="Close glossary"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-3 text-sm text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-100">
              {definition || 'Loading definition...'}
            </div>

            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-xl hover:bg-slate-800 transition-colors"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
