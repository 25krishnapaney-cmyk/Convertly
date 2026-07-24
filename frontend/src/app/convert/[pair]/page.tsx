"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Sparkles, CheckCircle2, ShieldCheck, Zap, Lock, ArrowRight } from "lucide-react";
import { ConverterWidget } from "@/components/upload/ConverterWidget";
import { getToolBySlug, ALL_CONVERSION_TOOLS, getToolIcon } from "@/lib/allTools";

export default function ConvertToolPage() {
  const params = useParams();
  const pairSlug = (params?.pair as string) || "file-to-file";
  
  const toolData = getToolBySlug(pairSlug);
  
  // Parse pair fallback (e.g., "jpg-to-png" -> from: "JPG", to: "PNG")
  const parts = pairSlug.split("-to-");
  const fromFormat = toolData ? toolData.from : (parts[0] ? parts[0].toUpperCase() : "FILE");
  const toFormat = toolData ? toolData.to : (parts[1] ? parts[1].toUpperCase() : "FILE");

  const allowedExt = fromFormat !== "FILE" && fromFormat !== "IMAGE" && fromFormat !== "VIDEO" 
    ? [`.${fromFormat.toLowerCase()}`] 
    : undefined;

  const pageTitle = toolData ? `${toolData.label} — Free & Zero Login` : `Convert ${fromFormat} to ${toFormat} Free`;
  const pageDesc = toolData ? toolData.desc : `Fast, privacy-first online ${fromFormat} to ${toFormat} converter. No email registration, zero permanent storage, and high-speed processing.`;

  // Get 4 related tools for SEO internal linking (§6.3, §12)
  const relatedTools = React.useMemo(() => {
    return ALL_CONVERSION_TOOLS.filter(t => t.id !== pairSlug).slice(0, 4);
  }, [pairSlug]);

  return (
    <div className="w-full max-w-[1440px] mx-auto px-6 md:px-12 py-16 flex-1 flex flex-col items-center">
      {/* Back link */}
      <div className="w-full max-w-3xl mb-8">
        <Link href="/tools" className="inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-main transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to All Tools Directory
        </Link>
      </div>

      {/* Title & SEO Header (§6.3, §12) */}
      <div className="text-center max-w-2xl mb-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase mb-4 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: "8s" }} />
          <span>{toolData?.badge || "High-Speed Conversion Engine"}</span>
        </div>
        <h1 className="font-display text-4xl sm:text-5xl font-bold text-main leading-tight">
          {toolData ? toolData.label : `Convert ${fromFormat} to ${toFormat}`}
        </h1>
        <p className="text-muted mt-4 text-base sm:text-lg leading-relaxed">
          {pageDesc}
        </p>
      </div>

      {/* Interactive Converter Widget (§6.3, §7.1, §7.4) */}
      <div className="w-full max-w-3xl">
        <ConverterWidget
          defaultTargetFormat={toFormat !== "OPT" && toFormat !== "RESIZE" ? toFormat : undefined}
          allowedExtensions={allowedExt}
          title={`Select ${fromFormat} file to process`}
          subtitle={`Drag & drop your ${fromFormat} file here or click to browse. Fully automated with zero watermarks.`}
        />
      </div>

      {/* Trust guarantees pill */}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs font-semibold text-muted">
        <span className="flex items-center gap-1.5"><Lock className="w-4 h-4 text-primary" /> End-to-End SSL Encryption</span>
        <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-success" /> 30-Minute Hard TTL Deletion</span>
        <span className="flex items-center gap-1.5"><Zap className="w-4 h-4 text-warning" /> Sub-Second Pillow & FFmpeg Engines</span>
      </div>

      {/* How it works section for SEO (§12) */}
      <div className="w-full max-w-4xl mt-20 pt-16 border-t border-subtle">
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-main mb-8 text-center sm:text-left">
          How to use {toolData ? toolData.label : `${fromFormat} to ${toFormat}`}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="clay-card p-6">
            <span className="w-10 h-10 rounded-xl bg-primary text-white font-bold text-base flex items-center justify-center mb-5 shadow-md">1</span>
            <h4 className="font-bold text-main mb-2 text-lg">Upload Source File</h4>
            <p className="text-sm text-muted leading-relaxed">Select or drag your {fromFormat} file directly into our secure ephemeral dropzone.</p>
          </div>
          <div className="clay-card p-6">
            <span className="w-10 h-10 rounded-xl bg-primary text-white font-bold text-base flex items-center justify-center mb-5 shadow-md">2</span>
            <h4 className="font-bold text-main mb-2 text-lg">Customize & Convert</h4>
            <p className="text-sm text-muted leading-relaxed">Adjust quality sliders, bitrates, or compression levels in our pro panel, then process instantly.</p>
          </div>
          <div className="clay-card p-6">
            <span className="w-10 h-10 rounded-xl bg-primary text-white font-bold text-base flex items-center justify-center mb-5 shadow-md">3</span>
            <h4 className="font-bold text-main mb-2 text-lg">Download Clean File</h4>
            <p className="text-sm text-muted leading-relaxed">Download your clean file with 100% original quality. Source files vanish automatically after 30 mins.</p>
          </div>
        </div>
      </div>

      {/* Related Conversion Tools for SEO Internal Linking (§6.3, §12) */}
      <div className="w-full max-w-4xl mt-16 pt-12 border-t border-subtle">
        <div className="flex items-center justify-between mb-8">
          <h3 className="font-display text-2xl font-bold text-main">Related Conversion Tools</h3>
          <Link href="/tools" className="text-sm font-semibold text-primary hover:underline inline-flex items-center gap-1">
            Explore all 30+ tools <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {relatedTools.map((tool) => {
            const Icon = getToolIcon(tool.category);
            return (
              <Link
                key={tool.id}
                href={`/convert/${tool.id}`}
                className="clay-card p-5 flex flex-col justify-between group hover:border-primary transition-all duration-200"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-main group-hover:text-primary transition-colors">{tool.label}</h4>
                    <span className="text-[10px] text-muted">{tool.category}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs font-semibold text-primary pt-3 border-t border-subtle/50">
                  <span>Open tool</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
