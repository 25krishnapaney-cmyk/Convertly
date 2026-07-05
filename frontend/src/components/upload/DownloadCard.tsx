"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Download, CheckCircle2, RefreshCw, Clock, ShieldCheck, FileText, Sparkles } from "lucide-react";
import { formatFileSize } from "@/lib/formats";

interface DownloadCardProps {
  jobId: string;
  fileName: string;
  fileSize?: number;
  outputUrl?: string;
  onReset: () => void;
}

export function DownloadCard({
  jobId,
  fileName,
  fileSize = 0,
  outputUrl,
  onReset,
}: DownloadCardProps) {
  // 30 minute countdown timer for auto-deletion display (§8.1)
  const [timeLeft, setTimeLeft] = React.useState(1800);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const downloadLink = outputUrl || `/api/download/${jobId}`;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ 
        type: "spring", 
        stiffness: 300, 
        damping: 18, 
        mass: 0.8 // Elastic "pop" completion effect (§7.4)
      }}
      className="w-full max-w-2xl mx-auto clay-card p-8 sm:p-12 text-center relative overflow-hidden"
    >
      {/* Celebration glow background */}
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-80 bg-success/15 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse" />

      {/* Success Icon Pop */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: [0, 1.2, 1] }}
        transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
        className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-br from-success to-[#1A9350] flex items-center justify-center text-white shadow-2xl shadow-success/30 mx-auto mb-6 relative"
      >
        <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12 stroke-[2]" />
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          className="absolute -top-1 -right-1 text-warning"
        >
          <Sparkles className="w-6 h-6 fill-warning" />
        </motion.div>
      </motion.div>

      <h3 className="font-display text-3xl sm:text-4xl font-bold text-main mb-2">
        Conversion Successful!
      </h3>
      <p className="text-muted text-base max-w-md mx-auto mb-8">
        Your file has been processed cleanly without watermarks and is ready for download.
      </p>

      {/* Converted File Card Summary */}
      <div className="p-5 rounded-2xl bg-secondary dark:bg-surface-elevated border border-subtle flex items-center justify-between gap-4 max-w-lg mx-auto mb-8 text-left shadow-inner">
        <div className="flex items-center gap-3.5 overflow-hidden">
          <div className="w-12 h-12 rounded-xl bg-success/10 text-success flex items-center justify-center shrink-0 font-bold">
            <FileText className="w-6 h-6" />
          </div>
          <div className="overflow-hidden">
            <h4 className="font-bold text-main truncate text-sm sm:text-base">{fileName}</h4>
            <p className="text-xs text-muted flex items-center gap-2 mt-0.5">
              {fileSize > 0 && <span>{formatFileSize(fileSize)}</span>}
              <span className="text-success font-semibold">100% Quality</span>
            </p>
          </div>
        </div>

        <a
          href={downloadLink}
          download={fileName}
          className="p-3 rounded-xl bg-surface dark:bg-surface border border-subtle text-primary hover:scale-105 active:scale-95 transition-all shadow-sm shrink-0"
          aria-label="Download file"
        >
          <Download className="w-5 h-5" />
        </a>
      </div>

      {/* Primary Action Buttons (§7.5 Claymorphism) */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-lg mx-auto mb-10">
        <a
          href={downloadLink}
          download={fileName}
          className="clay-button w-full sm:flex-1 py-4 px-8 text-base font-bold flex items-center justify-center gap-2 shadow-lg group"
        >
          <Download className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
          <span>Download File</span>
        </a>

        <button
          onClick={onReset}
          className="w-full sm:w-auto py-4 px-6 rounded-2xl bg-surface dark:bg-surface-elevated border border-subtle text-main font-semibold hover:bg-secondary transition-colors flex items-center justify-center gap-2 shadow-sm"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Convert Another</span>
        </button>
      </div>

      {/* Auto-delete hard TTL confirmation banner (§8.1) */}
      <div className="pt-6 border-t border-subtle flex flex-col sm:flex-row items-center justify-center gap-4 text-xs text-muted">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-warning/10 text-warning font-semibold border border-warning/20">
          <Clock className="w-3.5 h-3.5 animate-pulse" />
          <span>Auto-deletion in: {formatTime(timeLeft)}</span>
        </div>
        <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-success" /> Ephemeral server storage guarantee</span>
      </div>
    </motion.div>
  );
}
