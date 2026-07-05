"use client";

import * as React from "react";
import { Sliders, Check, Shield, Zap, FileText, Image as ImageIcon, Music, Video } from "lucide-react";
import { FormatCategory } from "@/lib/formats";

export interface ConversionOptions {
  // Image options
  quality?: number;
  resizeWidth?: string;
  resizeHeight?: string;
  stripMetadata?: boolean;
  // Audio options
  audioBitrate?: string;
  sampleRate?: string;
  channels?: string;
  // Video options
  videoResolution?: string;
  frameRate?: string;
  muteAudio?: boolean;
  // Document / PDF options
  compressionLevel?: "low" | "medium" | "high" | "extreme";
  pageRange?: string;
}

interface ToolOptionsProps {
  category: FormatCategory | null;
  targetFormat: string;
  options: ConversionOptions;
  onChange: (newOptions: ConversionOptions) => void;
}

export function ToolOptions({ category, targetFormat, options, onChange }: ToolOptionsProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  if (!category) return null;
  const catName = category.name.toLowerCase();

  const handleUpdate = (updates: Partial<ConversionOptions>) => {
    onChange({ ...options, ...updates });
  };

  return (
    <div className="w-full max-w-lg mx-auto mb-8 text-left">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-5 py-3 rounded-2xl bg-surface dark:bg-surface-elevated border border-subtle hover:border-primary/40 transition-all flex items-center justify-between text-sm font-semibold text-main shadow-sm group focus:outline-none focus:ring-2 focus:ring-primary"
      >
        <span className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-primary group-hover:rotate-45 transition-transform duration-300" />
          <span>Advanced {category.name} Settings</span>
        </span>
        <span className="text-xs text-muted px-2.5 py-1 rounded-lg bg-subtle/40">
          {isOpen ? "Hide Options" : "Customize Output"}
        </span>
      </button>

      {isOpen && (
        <div className="mt-3 p-6 rounded-2xl bg-surface/90 dark:bg-surface-elevated/90 border border-subtle shadow-lg space-y-6 animate-fade-in backdrop-blur-md">
          {/* Image Settings */}
          {catName === "image" && (
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-xs font-semibold text-main mb-2">
                  <span>Output Quality</span>
                  <span className="text-primary font-bold">{options.quality || 90}%</span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={100}
                  value={options.quality || 90}
                  onChange={(e) => handleUpdate({ quality: Number(e.target.value) })}
                  className="w-full accent-primary h-2 bg-subtle rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-muted mt-1">
                  <span>Smallest file size</span>
                  <span>Balanced</span>
                  <span>Lossless quality</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-main mb-1">Resize Width (px)</label>
                  <input
                    type="number"
                    placeholder="Original"
                    value={options.resizeWidth || ""}
                    onChange={(e) => handleUpdate({ resizeWidth: e.target.value })}
                    className="neo-input w-full text-xs py-2"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-main mb-1">Resize Height (px)</label>
                  <input
                    type="number"
                    placeholder="Original"
                    value={options.resizeHeight || ""}
                    onChange={(e) => handleUpdate({ resizeHeight: e.target.value })}
                    className="neo-input w-full text-xs py-2"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2.5 text-xs text-main cursor-pointer pt-2 select-none">
                <input
                  type="checkbox"
                  checked={options.stripMetadata !== false}
                  onChange={(e) => handleUpdate({ stripMetadata: e.target.checked })}
                  className="w-4 h-4 rounded text-primary focus:ring-primary accent-primary"
                />
                <span>Strip EXIF / GPS metadata (Recommended for privacy)</span>
              </label>
            </div>
          )}

          {/* Audio Settings */}
          {catName === "audio" && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-main mb-1.5">Audio Bitrate</label>
                <select
                  value={options.audioBitrate || "320k"}
                  onChange={(e) => handleUpdate({ audioBitrate: e.target.value })}
                  className="neo-input w-full text-xs py-2"
                >
                  <option value="320k">320 kbps — Lossless Studio Quality</option>
                  <option value="256k">256 kbps — High Quality</option>
                  <option value="192k">192 kbps — Standard CD Quality</option>
                  <option value="128k">128 kbps — Compact Radio Quality</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-main mb-1.5">Sample Rate</label>
                  <select
                    value={options.sampleRate || "48000"}
                    onChange={(e) => handleUpdate({ sampleRate: e.target.value })}
                    className="neo-input w-full text-xs py-2"
                  >
                    <option value="48000">48.0 kHz (Studio)</option>
                    <option value="44100">44.1 kHz (Audio CD)</option>
                    <option value="22050">22.05 kHz (Compact)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-main mb-1.5">Channels</label>
                  <select
                    value={options.channels || "stereo"}
                    onChange={(e) => handleUpdate({ channels: e.target.value })}
                    className="neo-input w-full text-xs py-2"
                  >
                    <option value="stereo">2.0 Stereo (Default)</option>
                    <option value="mono">1.0 Mono</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Video Settings */}
          {catName === "video" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-main mb-1.5">Target Resolution</label>
                  <select
                    value={options.videoResolution || "original"}
                    onChange={(e) => handleUpdate({ videoResolution: e.target.value })}
                    className="neo-input w-full text-xs py-2"
                  >
                    <option value="original">Original Size (No Scale)</option>
                    <option value="1080p">1080p Full HD (1920×1080)</option>
                    <option value="720p">720p HD (1280×720)</option>
                    <option value="480p">480p SD (854×480)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-main mb-1.5">Frame Rate</label>
                  <select
                    value={options.frameRate || "original"}
                    onChange={(e) => handleUpdate({ frameRate: e.target.value })}
                    className="neo-input w-full text-xs py-2"
                  >
                    <option value="original">Original FPS</option>
                    <option value="60">60 fps (Smooth)</option>
                    <option value="30">30 fps (Standard)</option>
                    <option value="24">24 fps (Cinematic)</option>
                  </select>
                </div>
              </div>

              <label className="flex items-center gap-2.5 text-xs text-main cursor-pointer pt-2 select-none">
                <input
                  type="checkbox"
                  checked={options.muteAudio === true}
                  onChange={(e) => handleUpdate({ muteAudio: e.target.checked })}
                  className="w-4 h-4 rounded text-primary focus:ring-primary accent-primary"
                />
                <span>Mute audio track (Create silent video / animation)</span>
              </label>
            </div>
          )}

          {/* Document / PDF Settings */}
          {(catName === "document" || targetFormat === "PDF") && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-main mb-1.5">Compression & Quality Level</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(["low", "medium", "high", "extreme"] as const).map((lvl) => {
                    const isSel = (options.compressionLevel || "medium") === lvl;
                    return (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => handleUpdate({ compressionLevel: lvl })}
                        className={`py-2 px-3 rounded-xl text-xs font-bold capitalize border transition-all ${
                          isSel
                            ? "bg-primary text-white border-primary shadow-sm"
                            : "bg-surface dark:bg-surface text-muted border-subtle hover:text-main"
                        }`}
                      >
                        {lvl}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-main mb-1">Page Range (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. All or 1-5, 8, 11-13"
                  value={options.pageRange || ""}
                  onChange={(e) => handleUpdate({ pageRange: e.target.value })}
                  className="neo-input w-full text-xs py-2"
                />
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-subtle flex items-center justify-between text-[11px] text-muted font-medium">
            <span className="flex items-center gap-1"><Zap className="w-3.5 h-3.5 text-warning" /> High-speed hardware encoder</span>
            <button
              type="button"
              onClick={() => onChange({})}
              className="text-primary hover:underline font-semibold"
            >
              Reset to Defaults
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
