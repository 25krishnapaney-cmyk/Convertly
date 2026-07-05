"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, AlertCircle, FileText, X, ArrowRight, ShieldCheck, Lock, Check } from "lucide-react";
import { validateFileClientSide, formatFileSize, FormatCategory } from "@/lib/formats";
import { ToolOptions, ConversionOptions } from "./ToolOptions";
import { sound } from "@/lib/sound";

interface DropzoneProps {
  onFileSelect: (file: File, targetFormat: string, options: ConversionOptions) => void;
  defaultTargetFormat?: string;
  allowedExtensions?: string[];
  title?: string;
  subtitle?: string;
}

export function Dropzone({
  onFileSelect,
  defaultTargetFormat,
  allowedExtensions,
  title = "Drag & drop files here, or browse",
  subtitle = "Supports JPG, PNG, WEBP, PDF, DOCX, MP4, MP3, WAV up to 500MB.",
}: DropzoneProps) {
  const [isDragging, setIsDragging] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [shakeKey, setShakeKey] = React.useState(0);
  
  // Staged file state when user adjusts target format or pro options
  const [stagedFile, setStagedFile] = React.useState<File | null>(null);
  const [stagedCategory, setStagedCategory] = React.useState<FormatCategory | null>(null);
  const [selectedTarget, setSelectedTarget] = React.useState<string>(defaultTargetFormat || "");
  const [options, setOptions] = React.useState<ConversionOptions>({});

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const processFile = (file: File) => {
    setError(null);
    const validation = validateFileClientSide(file, allowedExtensions);
    
    if (!validation.valid) {
      sound.playError();
      setError(validation.error || "Invalid file format or size.");
      setShakeKey((prev) => prev + 1);
      return;
    }

    sound.playPop(650);
    const category = validation.category;
    setStagedFile(file);
    setStagedCategory(category);

    const target = defaultTargetFormat || (category.targets[0] || "PNG");
    setSelectedTarget(target);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const triggerBrowse = () => {
    sound.playPop(550);
    fileInputRef.current?.click();
  };

  const handleStartConversion = () => {
    if (stagedFile && selectedTarget) {
      sound.playPop(850);
      onFileSelect(stagedFile, selectedTarget, options);
    }
  };

  const resetStagedFile = () => {
    sound.playPop(450);
    setStagedFile(null);
    setStagedCategory(null);
    setError(null);
    setOptions({});
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="w-full max-w-3xl mx-auto relative">
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileInputChange}
        className="hidden"
        accept={allowedExtensions ? allowedExtensions.join(",") : undefined}
      />

      <AnimatePresence mode="wait">
        {!stagedFile ? (
          /* State 1: Dropzone Upload Target (§7.1) */
          <motion.div
            key="dropzone-box"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ 
              opacity: 1, 
              scale: isDragging ? 1.02 : 1,
              x: error ? [-8, 8, -8, 8, 0] : 0 // Shake animation on inline error (§7.1)
            }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={triggerBrowse}
            className={`relative liquid-glass-card overflow-hidden rounded-[2.5rem] p-10 sm:p-16 border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center text-center cursor-pointer shadow-2xl ${
              isDragging
                ? "border-primary bg-primary/10 shadow-2xl scale-[1.01]"
                : error
                ? "border-danger bg-danger/5"
                : "border-white/60 dark:border-white/15 hover:border-primary/50"
            }`}
          >
            {/* Ambient Liquid Glass Floating Orbs */}
            <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-gradient-to-br from-primary/30 to-[#00E5FF]/20 blur-3xl pointer-events-none animate-liquid-float" />
            <div className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-gradient-to-tl from-[#28C76F]/30 to-primary/20 blur-3xl pointer-events-none animate-liquid-float" style={{ animationDelay: '-5s' }} />

            {/* Soft 3D Icon (§3.1 Soft 3D) */}
            <div className={`w-24 h-24 sm:w-28 sm:h-28 rounded-3xl flex items-center justify-center text-white shadow-2xl mb-6 relative transition-transform duration-300 ${
              error ? "bg-danger shadow-danger/30" : "bg-gradient-to-br from-[#004741] via-[#007A70] to-[#002824] text-white shadow-[0_15px_35px_rgba(0,71,65,0.45)] border border-white/25 group-hover:-translate-y-2 group-hover:scale-105"
            }`}>
              {error ? (
                <AlertCircle className="w-12 h-12 stroke-[2] text-white" />
              ) : (
                <Upload className="w-12 h-12 sm:w-14 sm:h-14 stroke-[2] text-white drop-shadow-md" />
              )}
              <div className={`absolute -bottom-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md ${error ? "bg-main" : "bg-success"}`}>
                {error ? "!" : "+"}
              </div>
            </div>

            {/* Inline Error Display (§7.1) */}
            {error ? (
              <motion.div
                key={shakeKey}
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 px-4 py-2 rounded-xl bg-danger/10 border border-danger/20 text-danger text-sm font-semibold flex items-center gap-2 max-w-lg"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </motion.div>
            ) : null}

            <h3 className="text-xl sm:text-2xl font-bold text-main mb-2">
              {title.split("browse")[0]}
              <span className="text-primary underline decoration-2 underline-offset-4">browse</span>
            </h3>
            <p className="text-sm text-muted max-w-md mb-8">
              {subtitle}
            </p>

            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); triggerBrowse(); }}
              className="liquid-glass-btn px-10 py-4 text-base font-bold shadow-xl focus:outline-none focus:ring-2 focus:ring-primary flex items-center gap-2"
            >
              Choose File
            </button>

            <div className="mt-8 pt-6 border-t border-subtle w-full flex flex-wrap items-center justify-around gap-4 text-xs text-muted">
              <span className="flex items-center gap-1.5"><Lock className="w-3.5 h-3.5 text-primary" /> End-to-End SSL Encryption</span>
              <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-success" /> Auto-Deleted after 30 Minutes</span>
            </div>
          </motion.div>
        ) : (
          /* State 2: Target Format & Advanced Options Selector (§8.1) */
          <motion.div
            key="format-selector"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="liquid-glass-card rounded-[2.5rem] p-8 sm:p-12 relative overflow-hidden shadow-2xl"
          >
            {/* Ambient Liquid Glass Floating Orbs */}
            <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-gradient-to-br from-primary/30 to-[#00E5FF]/20 blur-3xl pointer-events-none animate-liquid-float" />
            <div className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-gradient-to-tl from-[#28C76F]/30 to-primary/20 blur-3xl pointer-events-none animate-liquid-float" style={{ animationDelay: '-5s' }} />

            <button
              onClick={resetStagedFile}
              className="absolute top-6 right-6 p-2 rounded-xl bg-surface/80 text-muted hover:text-main hover:bg-surface border border-subtle transition-colors z-10"
              aria-label="Remove file"
            >
              <X className="w-5 h-5" />
            </button>

            {/* File summary pill */}
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-surface dark:bg-surface-elevated border border-subtle mb-8 max-w-lg relative z-10">
              <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 font-bold text-lg">
                {stagedFile.name.split(".").pop()?.toUpperCase() || "FILE"}
              </div>
              <div className="overflow-hidden flex-1">
                <h4 className="font-bold text-main truncate text-base">{stagedFile.name}</h4>
                <p className="text-xs text-muted flex items-center gap-2 mt-0.5">
                  <span>{formatFileSize(stagedFile.size)}</span>
                  <span>•</span>
                  <span className="text-success font-medium">Ready to convert</span>
                </p>
              </div>
            </div>

            <h3 className="font-display text-2xl font-bold text-main mb-2 relative z-10">
              Select Output Format
            </h3>
            <p className="text-sm text-muted mb-6 relative z-10">
              Choose the format you want to convert <span className="font-semibold text-main">{stagedFile.name}</span> into:
            </p>

            {/* Target format pills */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-8 relative z-10">
              {stagedCategory?.targets.map((fmt) => {
                const isSelected = selectedTarget === fmt;
                return (
                  <button
                    key={fmt}
                    onClick={() => { sound.playPop(750); setSelectedTarget(fmt); }}
                    className={`py-3 px-2 rounded-2xl font-bold text-sm transition-all duration-200 flex flex-col items-center justify-center gap-1 border ${
                      isSelected
                        ? "bg-primary text-white border-primary shadow-lg scale-105"
                        : "bg-surface dark:bg-surface-elevated text-main border-subtle hover:border-primary/50"
                    }`}
                  >
                    <span>{fmt}</span>
                    {isSelected && <Check className="w-4 h-4 text-white" />}
                  </button>
                );
              })}
            </div>

            {/* Advanced Pro Settings Panel (§7.5, §7.6) */}
            <div className="relative z-10">
              <ToolOptions
                category={stagedCategory}
                targetFormat={selectedTarget}
                options={options}
                onChange={setOptions}
              />
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-subtle relative z-10">
              <button
                onClick={resetStagedFile}
                className="text-sm font-semibold text-muted hover:text-main transition-colors order-2 sm:order-1"
              >
                Choose a different file
              </button>

              <button
                onClick={handleStartConversion}
                disabled={!selectedTarget}
                className="liquid-glass-btn w-full sm:w-auto px-8 py-4 text-base font-bold flex items-center justify-center gap-2 order-1 sm:order-2 disabled:opacity-50"
              >
                <span>Convert to {selectedTarget}</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
