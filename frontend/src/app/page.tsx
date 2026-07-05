"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  FileText, Image as ImageIcon, Video, Music, 
  ShieldCheck, Clock, Lock, ArrowRight 
} from "lucide-react";
import { ConverterWidget } from "@/components/upload/ConverterWidget";

const CATEGORY_SHORTCUTS = [
  {
    title: "Image Converter",
    desc: "JPG, PNG, WebP, AVIF, GIF, SVG",
    icon: ImageIcon,
    href: "/tools/image",
    color: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    badge: "Fastest",
  },
  {
    title: "PDF Documents",
    desc: "PDF to Word, JPG to PDF, Compress",
    icon: FileText,
    href: "/tools/pdf",
    color: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
    badge: "Popular",
  },
  {
    title: "Video Tools",
    desc: "MP4, MOV, WebM, GIF, AVI, MKV",
    icon: Video,
    href: "/tools/video",
    color: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
    badge: "FFmpeg Powered",
  },
  {
    title: "Audio Converter",
    desc: "MP3, WAV, OGG, FLAC, M4A, AAC",
    icon: Music,
    href: "/tools/audio",
    color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    badge: "Lossless Option",
  },
];

const POPULAR_CONVERSIONS = [
  { from: "JPG", to: "PNG", label: "JPG to PNG", href: "/convert/jpg-to-png" },
  { from: "PNG", to: "WebP", label: "PNG to WebP", href: "/convert/png-to-webp" },
  { from: "PDF", to: "JPG", label: "PDF to JPG", href: "/convert/pdf-to-jpg" },
  { from: "MP4", to: "MP3", label: "MP4 to MP3", href: "/convert/mp4-to-mp3" },
  { from: "HEIC", to: "JPG", label: "HEIC to JPG", href: "/convert/heic-to-jpg" },
  { from: "DOCX", to: "PDF", label: "Word to PDF", href: "/convert/docx-to-pdf" },
  { from: "WEBP", to: "PNG", label: "WebP to PNG", href: "/convert/webp-to-png" },
  { from: "MOV", to: "MP4", label: "MOV to MP4", href: "/convert/mov-to-mp4" },
  { from: "PDF", to: "OPT", label: "PDF Compress", href: "/convert/pdf-compressor" },
  { from: "IMG", to: "OPT", label: "Image Compress", href: "/convert/image-compressor" },
  { from: "WAV", to: "MP3", label: "WAV to MP3", href: "/convert/wav-to-mp3" },
  { from: "AVIF", to: "PNG", label: "AVIF to PNG", href: "/convert/avif-to-png" },
];

export default function HomePage() {
  return (
    <div className="w-full flex-1 flex flex-col items-center">
      {/* Ambient Glow Background Effect */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1000px] h-[500px] bg-gradient-to-tr from-primary/10 via-success/5 to-transparent rounded-full blur-[120px] pointer-events-none -z-10" />

      {/* Hero Section (§6.1) */}
      <section className="w-full max-w-[1440px] px-6 md:px-12 pt-16 pb-20 flex flex-col items-center text-center">
        {/* H1 Headline (§6.1, §3.3 display font) */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-display text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight text-main max-w-4xl leading-[1.08]"
        >
          Convert Files in <span className="bg-gradient-to-r from-primary via-[#00A896] to-success bg-clip-text text-transparent">Seconds.</span>
        </motion.h1>

        {/* Subhead (§6.1) */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 text-lg sm:text-xl text-muted max-w-2xl font-normal leading-relaxed"
        >
          Fast, Secure and Completely Free. No Sign-up Required. All files are automatically deleted after 30 minutes.
        </motion.p>

        {/* Interactive Converter Widget (§7.1, §7.4) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="w-full max-w-3xl mt-12 relative"
        >
          <ConverterWidget />
        </motion.div>
      </section>

      {/* Trust Row (§6.1) */}
      <section className="w-full max-w-[1440px] px-6 md:px-12 py-12 border-y border-subtle bg-surface/30 dark:bg-surface/10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary shrink-0">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-base text-main">Zero Sign-Up Required</h4>
              <p className="text-sm text-muted">Convert instantly without email or passwords.</p>
            </div>
          </div>

          <div className="flex items-center justify-center sm:justify-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-success/10 dark:bg-success/20 flex items-center justify-center text-success shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-base text-main">30-Minute Auto Delete</h4>
              <p className="text-sm text-muted">Files vanish automatically via hard server TTL.</p>
            </div>
          </div>

          <div className="flex items-center justify-center sm:justify-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-warning/10 dark:bg-warning/20 flex items-center justify-center text-warning shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-base text-main">No Watermarks Ever</h4>
              <p className="text-sm text-muted">100% clean output files, ready for professional use.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Category Shortcuts (§6.1 - Claymorphism Cards §3.1, §7.5) */}
      <section className="w-full max-w-[1440px] px-6 md:px-12 py-20">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-10 gap-4">
          <div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-main">Explore Tool Hubs</h2>
            <p className="text-muted mt-1 text-base">Select a dedicated category for specialized format options and settings.</p>
          </div>
          <Link href="/tools" className="text-sm font-semibold text-primary hover:underline inline-flex items-center gap-1">
            View all 120+ tools <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {CATEGORY_SHORTCUTS.map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <motion.div
                key={cat.href}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 * idx }}
              >
                <Link href={cat.href} className="block h-full focus:outline-none focus:ring-2 focus:ring-primary rounded-3xl">
                  <div className="clay-card p-7 h-full flex flex-col justify-between group">
                    <div>
                      <div className="flex items-center justify-between mb-6">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border ${cat.color} group-hover:scale-110 transition-transform duration-300`}>
                          <Icon className="w-7 h-7" />
                        </div>
                        <span className="text-xs font-bold px-3 py-1 rounded-full bg-secondary text-main border border-subtle">
                          {cat.badge}
                        </span>
                      </div>
                      <h3 className="font-bold text-xl text-main group-hover:text-primary transition-colors mb-2">
                        {cat.title}
                      </h3>
                      <p className="text-sm text-muted">
                        {cat.desc}
                      </p>
                    </div>
                    <div className="mt-8 pt-4 border-t border-subtle flex items-center justify-between text-sm font-semibold text-primary">
                      <span>Open tools</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Popular Conversions Grid (§6.1) */}
      <section className="w-full max-w-[1440px] px-6 md:px-12 pb-20">
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-main mb-8">Popular Conversions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-3.5">
          {POPULAR_CONVERSIONS.map((pair) => (
            <Link
              key={pair.href}
              href={pair.href}
              className="clay-card p-4 text-center hover:border-primary transition-all duration-200 flex flex-col items-center justify-center group focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-muted mb-2">
                <span className="px-2 py-0.5 rounded bg-secondary text-main">{pair.from}</span>
                <span>→</span>
                <span className="px-2 py-0.5 rounded bg-primary/10 text-primary">{pair.to}</span>
              </div>
              <span className="text-xs font-semibold text-main group-hover:text-primary transition-colors truncate w-full">
                {pair.label}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* About Section (§6.1) */}
      <section id="about" className="w-full max-w-[1440px] px-6 md:px-12 pb-24">
        <div className="clay-card p-8 md:p-12 relative overflow-hidden bg-gradient-to-br from-surface/80 via-surface/40 to-primary/5 border-primary/20">
          <div className="max-w-3xl">
            <span className="text-xs font-bold px-3.5 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 tracking-wide uppercase mb-4 inline-block">
              About Us
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-main mt-3">
              Built with precision for seamless, privacy-first file conversion.
            </h2>
            <p className="text-muted mt-4 text-base leading-relaxed">
              Convertly was engineered to simplify file workflows without sacrificing your privacy or speed. Unlike traditional online converters that store, mine, or watermark your files, we process your documents in isolated ephemeral memory that is permanently wiped after 30 minutes.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a
                href="https://cv-krishna.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3.5 rounded-2xl bg-primary hover:bg-primary-hover text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2.5 group"
              >
                <span>ABOUT US</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
              <Link
                href="/tools"
                className="px-6 py-3.5 rounded-2xl bg-secondary hover:bg-secondary/80 text-main font-semibold text-sm border border-subtle transition-colors"
              >
                Explore All Tools
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
