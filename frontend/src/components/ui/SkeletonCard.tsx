"use client";

import * as React from "react";

export function SkeletonCard({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="clay-card p-6 h-48 relative overflow-hidden bg-surface/40 dark:bg-surface/20 flex flex-col justify-between border border-subtle/50"
        >
          {/* Animated shimmer wave (§7.3) */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 dark:via-white/5 to-transparent animate-shimmer" />

          <div>
            <div className="flex items-center justify-between mb-5">
              <div className="w-12 h-12 rounded-2xl bg-subtle/60 dark:bg-subtle/30" />
              <div className="w-16 h-5 rounded-md bg-subtle/40" />
            </div>
            <div className="w-3/4 h-6 rounded-lg bg-subtle/60 dark:bg-subtle/30 mb-2.5" />
            <div className="w-full h-3.5 rounded bg-subtle/40 mb-1" />
            <div className="w-4/5 h-3.5 rounded bg-subtle/30" />
          </div>

          <div className="mt-4 pt-3 border-t border-subtle/40 flex items-center justify-between">
            <div className="w-20 h-4 rounded bg-subtle/40" />
            <div className="w-4 h-4 rounded-full bg-subtle/40" />
          </div>
        </div>
      ))}
    </div>
  );
}
