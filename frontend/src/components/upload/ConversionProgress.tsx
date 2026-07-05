"use client";

import * as React from "react";
import { motion, useSpring, useTransform } from "framer-motion";
import { Loader2, ArrowRight, ShieldCheck, Zap, Sparkles } from "lucide-react";

interface ConversionProgressProps {
  status: "validating" | "uploading" | "processing" | "success" | "error";
  progress: number;
  message?: string;
  fromFormat: string;
  toFormat: string;
  fileName: string;
}

export function ConversionProgress({
  status,
  progress = 0,
  message = "Processing your file...",
  fromFormat,
  toFormat,
  fileName,
}: ConversionProgressProps) {
  // Smooth animated percentage counter (§7.4) - no frame skipping
  const springProgress = useSpring(0, {
    stiffness: 100,
    damping: 20,
    restDelta: 0.5,
  });

  React.useEffect(() => {
    springProgress.set(progress);
  }, [progress, springProgress]);

  const displayPercent = useTransform(springProgress, (current) => Math.round(current));
  const [percentValue, setPercentValue] = React.useState(0);

  React.useEffect(() => {
    const unsubscribe = displayPercent.on("change", (latest) => {
      setPercentValue(latest);
    });
    return () => unsubscribe();
  }, [displayPercent]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 15 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -15 }}
      transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }} // Elastic controlled curve (§3.5)
      className="w-full max-w-2xl mx-auto glass-panel rounded-[2.2rem] p-8 sm:p-12 border border-subtle shadow-2xl relative overflow-hidden"
    >
      {/* Ambient glowing particles in background */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse" />

      {/* Morphing File-Icon Header (§7.4) */}
      <div className="flex items-center justify-center gap-4 mb-8">
        <motion.div
          animate={{ scale: [1, 1.05, 1], rotate: [0, -3, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="w-16 h-16 rounded-2xl bg-surface dark:bg-surface-elevated border border-subtle shadow-md flex flex-col items-center justify-center text-main"
        >
          <span className="text-xs text-muted">FROM</span>
          <span className="font-display font-bold text-lg text-primary">{fromFormat}</span>
        </motion.div>

        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          <ArrowRight className="w-5 h-5 animate-pulse" />
        </div>

        <motion.div
          animate={{ scale: [1, 1.05, 1], rotate: [0, 3, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          className="w-16 h-16 rounded-2xl bg-primary text-white shadow-lg shadow-primary/30 flex flex-col items-center justify-center"
        >
          <span className="text-[10px] text-white/70">TO</span>
          <span className="font-display font-bold text-lg">{toFormat}</span>
        </motion.div>
      </div>

      {/* File Info */}
      <div className="text-center mb-6">
        <h4 className="font-bold text-lg text-main truncate max-w-md mx-auto">{fileName}</h4>
        <p className="text-sm text-muted mt-1 flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-primary shrink-0" />
          <span>{message}</span>
        </p>
      </div>

      {/* Liquid Loading Bar (§7.4 - Organic wave fill, not a plain rectangle) */}
      <div className="w-full bg-surface/80 dark:bg-surface-elevated/80 rounded-2xl p-1.5 border border-subtle shadow-inner mb-4">
        <div className="w-full h-8 rounded-xl overflow-hidden relative bg-subtle/30">
          <motion.div
            className="h-full liquid-progress-bar rounded-xl relative overflow-hidden"
            style={{ width: `${percentValue}%` }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            {/* Animated wave/shimmer overlay inside progress bar */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent animate-shimmer" />
          </motion.div>
        </div>
      </div>

      {/* Smooth Percentage Counter & Status badge (§7.4) */}
      <div className="flex items-center justify-between text-sm font-semibold">
        <div className="flex items-center gap-1.5 text-primary">
          <Sparkles className="w-4 h-4" />
          <span className="capitalize">{status}</span>
        </div>
        <div className="font-display text-2xl font-bold text-main">
          {percentValue}%
        </div>
      </div>

      {/* Security note footer */}
      <div className="mt-8 pt-6 border-t border-subtle flex items-center justify-center gap-6 text-xs text-muted">
        <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-success" /> ClamAV Scanned</span>
        <span className="flex items-center gap-1"><Zap className="w-3.5 h-3.5 text-warning" /> High-Speed Engine</span>
      </div>
    </motion.div>
  );
}
