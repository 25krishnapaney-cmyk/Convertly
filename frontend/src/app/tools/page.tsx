"use client";

import * as React from "react";
import Link from "next/link";
import { Search, ArrowRight, Layers, Sliders, Sparkles, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ALL_CONVERSION_TOOLS, getToolIcon, searchTools } from "@/lib/allTools";
import { SkeletonCard } from "@/components/ui/SkeletonCard";
import { sound } from "@/lib/sound";

export default function AllToolsPage() {
  const [query, setQuery] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState("All");
  const [isTransitioning, setIsTransitioning] = React.useState(false);
  const [isSearchFocused, setIsSearchFocused] = React.useState(false);

  const categories = ["All", "Image Tools", "PDF Tools", "Video", "Audio", "Specialized"];

  const handleCategoryChange = (cat: string) => {
    if (cat === selectedCategory) return;
    setIsTransitioning(true);
    setSelectedCategory(cat);
    sound.playPop();
    setTimeout(() => {
      setIsTransitioning(false);
    }, 250); // Shimmer transition (§7.3)
  };

  const filteredTools = React.useMemo(() => {
    return searchTools(query, selectedCategory);
  }, [query, selectedCategory]);

  return (
    <div className="w-full max-w-[1440px] mx-auto px-6 md:px-12 py-16 flex-1">
      <div className="max-w-3xl mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase mb-4">
          <Sparkles className="w-3.5 h-3.5" /> 120+ Format Combinations
        </div>
        <h1 className="font-display text-4xl sm:text-5xl font-bold text-main mb-4">
          All Conversion & Pro Tools
        </h1>
        <p className="text-muted text-lg">
          Search over 120+ format pairs and advanced compression engines. Zero login, 30-minute auto-deletion, and instant processing.
        </p>
      </div>

      {/* Neomorphic Animated Search & Category Filter (§6.2, §7.6) */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between mb-12"
      >
        <motion.div 
          className="relative flex-1 max-w-md"
          animate={{ scale: isSearchFocused ? 1.02 : 1 }}
          transition={{ type: "spring", stiffness: 350, damping: 25 }}
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
            placeholder="Search format or tool (e.g. JPG to PNG, DOCX, compress)..."
            value={query}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            onChange={(e) => setQuery(e.target.value)}
            className="neo-input w-full pl-12 pr-10 text-sm focus:ring-2 focus:ring-primary shadow-sm hover:shadow-md transition-shadow"
            aria-label="Search conversion tools"
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

        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <motion.button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className={`relative px-4 py-2 rounded-xl text-xs font-semibold transition-colors duration-200 focus:outline-none cursor-pointer ${
                  isSelected
                    ? "text-white shadow-md font-bold"
                    : "bg-surface dark:bg-surface-elevated text-muted hover:text-main border border-subtle hover:border-primary/40"
                }`}
              >
                {isSelected && (
                  <motion.div
                    layoutId="activeCategoryTabTools"
                    className="absolute inset-0 bg-primary rounded-xl -z-10 shadow-md"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{cat}</span>
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Claymorphism Tools Grid (§6.2, §7.5) with Shimmer Loaders (§7.3) */}
      {isTransitioning ? (
        <SkeletonCard count={8} />
      ) : filteredTools.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredTools.map((tool) => {
            const Icon = getToolIcon(tool.category);
            return (
              <Link
                key={tool.id}
                href={`/convert/${tool.id}`}
                className="clay-card p-6 flex flex-col justify-between group hover:border-primary transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${
                      tool.isSpecialized ? "bg-warning/15 text-warning" : "bg-primary/10 dark:bg-primary/20 text-primary"
                    }`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    {tool.badge ? (
                      <span className="text-[11px] font-bold px-2.5 py-1 rounded-md bg-primary text-white shadow-sm">
                        {tool.badge}
                      </span>
                    ) : (
                      <span className="text-xs font-medium px-2.5 py-1 rounded-md bg-secondary text-muted">
                        {tool.category}
                      </span>
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
                  <span>{tool.isSpecialized ? "Launch pro tool" : "Convert now"}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 clay-card max-w-md mx-auto">
          <Layers className="w-12 h-12 text-muted mx-auto mb-4 opacity-50" />
          <h3 className="font-bold text-lg text-main mb-1">No matching tools found</h3>
          <p className="text-sm text-muted mb-6">We couldn’t find a format matching &quot;{query}&quot;.</p>
          <button
            onClick={() => { setQuery(""); setSelectedCategory("All"); }}
            className="clay-button px-6 py-2.5 text-xs font-semibold"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
}
