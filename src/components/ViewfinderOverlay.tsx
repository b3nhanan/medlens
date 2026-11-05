import React from 'react';
import { motion } from 'motion/react';

interface ViewfinderOverlayProps {
  isScanning?: boolean;
  progress?: number;
  statusText?: string;
}

export const ViewfinderOverlay: React.FC<ViewfinderOverlayProps> = ({
  isScanning = false,
  progress = 0,
  statusText
}) => {
  return (
    <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-slate-900 border-2 border-slate-700/80 shadow-inner flex items-center justify-center">
      {/* Corner Brackets */}
      <div className="absolute top-4 left-4 w-7 h-7 border-t-4 border-l-4 border-teal-400 rounded-tl-lg pointer-events-none z-10" />
      <div className="absolute top-4 right-4 w-7 h-7 border-t-4 border-r-4 border-teal-400 rounded-tr-lg pointer-events-none z-10" />
      <div className="absolute bottom-4 left-4 w-7 h-7 border-b-4 border-l-4 border-teal-400 rounded-bl-lg pointer-events-none z-10" />
      <div className="absolute bottom-4 right-4 w-7 h-7 border-b-4 border-r-4 border-teal-400 rounded-br-lg pointer-events-none z-10" />

      {/* Target Crosshairs in Center */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
        <div className="w-12 h-0.5 bg-teal-300" />
        <div className="h-12 w-0.5 bg-teal-300 absolute" />
      </div>

      {/* Animated Laser Scanning Line */}
      {isScanning && (
        <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-teal-400 to-transparent shadow-[0_0_15px_#2dd4bf] animate-scan-laser z-20" />
      )}

      {/* Scanning status banner */}
      {isScanning && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-6 inset-x-6 z-20 bg-slate-900/90 backdrop-blur-md border border-teal-500/40 rounded-xl p-3 text-center"
        >
          <div className="flex items-center justify-between text-xs text-teal-300 mb-1.5 font-medium">
            <span>{statusText || 'Optical Character Recognition...'}</span>
            <span className="font-mono-clinical font-bold">{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <motion.div 
              className="bg-teal-400 h-1.5 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ ease: 'linear' }}
            />
          </div>
        </motion.div>
      )}
    </div>
  );
};
