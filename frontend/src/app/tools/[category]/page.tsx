"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Search, Image as ImageIcon, FileText, Video, Music, ArrowRight, ArrowLeft, Sliders, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getToolsByCategory, getToolIcon } from "@/lib/allTools";
import { SkeletonCard } from "@/components/ui/SkeletonCard";
import { sound } from "@/lib/sound";

const CATEGORY_META: Record<string, { title: string; desc: string; icon: any }> = {
  image: {
    title: "Image Converter & Pro Tools Hub",
    desc: "Convert, compress, resize, and transform JPG, PNG, WebP, HEIC, AVIF, and SVG images with zero quality loss.",
    icon: ImageIcon,
  },
  pdf: {
    title: "PDF Document & Compression Hub",
    desc: "Convert PDF to Word, compress documents up to 80%, merge files, and export images instantly.",
    icon: FileText,
  },
  video: {
    title: "Video Converter & Audio Extractor Hub",
    desc: "Convert MP4, MOV, AVI, WebM, and MKV files. Extract high-bitrate MP3 audio or compress for web sharing.",
    icon: Video,
  },
  audio: {
    title: "Audio Converter & Bitrate Studio",
    desc: "Convert and compress MP3, WAV, AAC, FLAC, and OGG audio with studio-grade bitrate controls.",
    icon: Music,
  },
};

export default function ToolCategoryPage() {
  const params = useParams();
  const categorySlug = ((params?.category as string) || "image").toLowerCase();
  
  const catInfo = CATEGORY_META[categorySlug] || {
    title: `${categorySlug.toUpperCase()} Tools`,
    desc: "Fast, privacy-first online conversion and compression tools.",
    icon: ImageIcon,
  };

  const [query, setQuery] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [isSearchFocused, setIsSearchFocused] = React.useState(false);

  React.useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 350); // Shimmer animation (§7.3)
    return () => clearTimeout(timer);
  }, [categorySlug]);

  const tools = React.useMemo(() => getToolsByCategory(categorySlug), [categorySlug]);
  const filteredTools = tools.filter((t) => 
    t.label.toLowerCase().includes(query.toLowerCase()) || 
    t.desc.toLowerCase().includes(query.toLowerCase())
  );
  
  const Icon = catInfo.icon;

  return (
    <div className="w-full max-w-[1440px] mx-auto px-6 md:px-12 py-16 flex-1">
      <div className="mb-8">
        <Link 
          href="/tools" 
          className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-hover transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back to All Tools
        </Link>
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase mb-4">
            <Icon className="w-3.5 h-3.5" /> {categorySlug.toUpperCase()} TOOLS
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-main mb-4">
            {catInfo.title}
          </h1>
          <p className="text-muted text-lg">
            {catInfo.desc}
          </p>
        </div>
      </div>

      {/* Neomorphic Animated Search Input (§6.2, §7.6) */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative max-w-md mb-12"
      >
        <motion.div
          animate={{ 
            rotate: isSearchFocused ? 90 : 0,
            scale: isSearchFocused ? 1.15 : 1,
            color: isSearchFocused ? "var(--primary)" : "var(--text-muted)"
          }}
          transition={{ type: "spring", stiffness: 350, damping: 20 }}
          className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none z-10 flex items-center justify-center"
        >
          <Search className="w-5 h-5" />
        </motion.div>
        <input
          type="text"
          placeholder={`Search ${categorySlug} tools & formats...`}
          value={query}
          onFocus={() => setIsSearchFocused(true)}
          onBlur={() => setIsSearchFocused(false)}
          onChange={(e) => setQuery(e.target.value)}
          className="neo-input w-full pl-12 pr-10 text-sm focus:ring-2 focus:ring-primary shadow-sm hover:shadow-md transition-shadow"
          aria-label={`Search ${categorySlug} conversion tools`}
        />
        <AnimatePresence>
          {query && (
            <motion.button
              initial={{ opacity: 0, scale: 0.5, rotate: -90 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.5, rotate: 90 }}
              transition={{ duration: 0.15 }}
              onClick={() => {
                setQuery("");
                sound.playPop();
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-muted hover:text-main hover:bg-secondary/50 transition-colors cursor-pointer z-10"
              aria-label="Clear search query"
            >
              <X className="w-4 h-4" />
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Claymorphism Cards Grid (§6.2, §7.5) with Skeleton Loaders (§7.3) */}
      {loading ? (
        <SkeletonCard count={8} />
      ) : filteredTools.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredTools.map((tool) => {
            const ToolIcon = getToolIcon(tool.category);
            return (
              <Link
                key={tool.id}
                href={`/convert/${tool.id}`}
                className="clay-card p-6 flex flex-col justify-between group hover:border-primary transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${
                      tool.isSpecialized ? "bg-warning/15 text-warning" : "bg-primary/10 dark:bg-primary/20 text-primary"
                    }`}>
                      <ToolIcon className="w-6 h-6" />
                    </div>
                    {tool.badge ? (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-primary text-white">
                        {tool.badge}
                      </span>
                    ) : (
                      <div className="flex items-center gap-1 text-xs font-bold text-muted">
                        <span className="px-2 py-0.5 rounded bg-secondary text-main">{tool.from}</span>
                        <span>→</span>
                        <span className="px-2 py-0.5 rounded bg-primary/10 text-primary">{tool.to}</span>
                      </div>
                    )}
                  </div>
                  <h3 className="font-bold text-lg text-main group-hover:text-primary transition-colors">
                    {tool.label}
                  </h3>
                  <p className="text-xs text-muted mt-2 line-clamp-2 leading-relaxed">
                    {tool.desc}
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-subtle flex items-center justify-between text-xs font-semibold text-primary">
                  <span>{tool.isSpecialized ? "Launch pro tool" : "Open tool"}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 clay-card max-w-md mx-auto">
          <h3 className="font-bold text-lg text-main mb-1">No tools found</h3>
          <p className="text-sm text-muted">Try a different keyword or check All Tools.</p>
        </div>
      )}
    </div>
  );
}
