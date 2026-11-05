import React from 'react';
import { motion } from 'motion/react';
import { AlertTriangle, Pill } from 'lucide-react';

interface IngredientOverlapVisualProps {
  brandNames: string[];
  sharedIngredient: string;
}

export const IngredientOverlapVisual: React.FC<IngredientOverlapVisualProps> = ({
  brandNames,
  sharedIngredient
}) => {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-red-50/60 to-slate-50 border border-red-200 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-lg bg-red-100 text-red-600 flex items-center justify-center font-bold">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-red-800">
            Duplicate Ingredient Overlap
          </span>
        </div>
        <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-semibold">
          High Overdose Risk
        </span>
      </div>

      <p className="text-xs text-slate-600 mb-6">
        Both products appear different, but contain the identical chemical substance:
      </p>

      {/* Interactive Visual Graph */}
      <div className="relative py-2 flex flex-col items-center">
        {/* Brand nodes top row */}
        <div className="flex flex-wrap items-center justify-center gap-4 z-10 w-full mb-8">
          {brandNames.map((brand, idx) => (
            <motion.div
              key={brand}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.15 }}
              className="flex items-center space-x-2 px-3.5 py-2 bg-white rounded-xl shadow-md border border-slate-200 hover:border-red-300 transition-colors"
            >
              <div className="w-6 h-6 rounded-md bg-teal-50 text-teal-700 flex items-center justify-center">
                <Pill className="w-3.5 h-3.5" />
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-slate-900">{brand}</div>
                <div className="text-[10px] text-slate-500 font-medium">Brand Package</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Dynamic connecting lines SVG */}
        <div className="w-full flex items-center justify-center my-1 relative">
          <svg className="w-full h-12 overflow-visible" viewBox="0 0 300 48" fill="none">
            {/* Draw 2 or 3 connecting lines from top to center bottom */}
            {brandNames.length === 2 ? (
              <>
                <motion.path
                  d="M 75 0 C 75 25, 150 20, 150 48"
                  stroke="#EF4444"
                  strokeWidth="2.5"
                  strokeDasharray="4 4"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.8, ease: 'easeInOut' }}
                />
                <motion.path
                  d="M 225 0 C 225 25, 150 20, 150 48"
                  stroke="#EF4444"
                  strokeWidth="2.5"
                  strokeDasharray="4 4"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.8, ease: 'easeInOut' }}
                />
              </>
            ) : (
              <>
                <motion.path
                  d="M 50 0 C 50 25, 150 20, 150 48"
                  stroke="#EF4444"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.8 }}
                />
                <motion.path
                  d="M 150 0 L 150 48"
                  stroke="#EF4444"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.8 }}
                />
                <motion.path
                  d="M 250 0 C 250 25, 150 20, 150 48"
                  stroke="#EF4444"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.8 }}
                />
              </>
            )}
          </svg>
        </div>

        {/* Central Shared Ingredient Node */}
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
          className="z-10 mt-1 flex flex-col items-center justify-center px-6 py-3 bg-red-600 text-white rounded-2xl shadow-lg ring-4 ring-red-100"
        >
          <div className="text-[10px] uppercase font-bold tracking-widest text-red-200">
            Shared Active Ingredient
          </div>
          <div className="text-base font-extrabold tracking-wide uppercase mt-0.5">
            {sharedIngredient}
          </div>
        </motion.div>
      </div>

      <div className="mt-6 pt-3 border-t border-red-200/80 text-[11px] text-red-900 font-medium text-center">
        Taking these together duplicates the active dose and may cause accidental toxicity.
      </div>
    </div>
  );
};
