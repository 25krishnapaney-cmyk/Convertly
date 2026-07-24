import * as React from "react";
import Link from "next/link";
import { ShieldCheck, Lock, Zap, RefreshCw, Layers } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-subtle bg-surface/40 dark:bg-surface/20 mt-24 py-16">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12">
        {/* Trust Claims Row (§6.1, §9) */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-12 border-b border-subtle mb-12">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-sm text-main">Zero Login Required</h4>
              <p className="text-xs text-muted mt-0.5">No signup, no tracking, start converting instantly.</p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-success/10 dark:bg-success/20 flex items-center justify-center text-success shrink-0">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-sm text-main">Auto-Delete in 30 Min</h4>
              <p className="text-xs text-muted mt-0.5">Hard server-side TTL guarantees ephemeral storage.</p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-warning/10 dark:bg-warning/20 flex items-center justify-center text-warning shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-sm text-main">Ultra-Fast Engines</h4>
              <p className="text-xs text-muted mt-0.5">Powered by Pillow, pypdfium2 & Compression engines.</p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-sm text-main">Privacy & Security First</h4>
              <p className="text-xs text-muted mt-0.5">ClamAV virus scanning & HTTPS-only encryption.</p>
            </div>
          </div>
        </div>

        {/* Swiss Grid Navigation Links (§3.4, §5) */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-16">
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white shadow-sm">
                <Layers className="w-4 h-4" />
              </div>
              <span className="font-display text-xl font-bold text-main">File Grave<span className="text-success">.</span></span>
            </Link>
            <p className="text-sm text-muted max-w-sm mb-6">
              The fastest, lightest, most beautiful online file converter. Built with privacy-first ephemeral processing and WCAG AA accessibility.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-success/10 text-success text-xs font-medium border border-success/20">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
              All Systems Operational
            </div>
          </div>

          <div>
            <h5 className="font-semibold text-sm text-main mb-4 tracking-wide uppercase">Tool Hubs</h5>
            <ul className="space-y-2.5 text-sm text-muted">
              <li><Link href="/tools/image" className="hover:text-main transition-colors">Image Tools</Link></li>
              <li><Link href="/tools/pdf" className="hover:text-main transition-colors">PDF Tools</Link></li>
              <li><Link href="/tools/compression" className="hover:text-main transition-colors">File Compression</Link></li>
              <li><Link href="/tools" className="hover:text-main transition-colors">All Tools Directory</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="font-semibold text-sm text-main mb-4 tracking-wide uppercase">Popular Pairs</h5>
            <ul className="space-y-2.5 text-sm text-muted">
              <li><Link href="/convert/jpg-to-png" className="hover:text-main transition-colors">JPG to PNG</Link></li>
              <li><Link href="/convert/png-to-webp" className="hover:text-main transition-colors">PNG to WebP</Link></li>
              <li><Link href="/convert/pdf-to-jpg" className="hover:text-main transition-colors">PDF to JPG</Link></li>
              <li><Link href="/convert/docx-to-pdf" className="hover:text-main transition-colors">DOCX to PDF</Link></li>
              <li><Link href="/convert/file-compressor" className="hover:text-main transition-colors">File Compress</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="font-semibold text-sm text-main mb-4 tracking-wide uppercase">About & Legal</h5>
            <ul className="space-y-2.5 text-sm text-muted">
              <li>
                <a href="https://cv-krishna.vercel.app" target="_blank" rel="noopener noreferrer" className="hover:text-primary font-medium text-primary transition-colors">
                  ABOUT US
                </a>
              </li>
              <li><Link href="/privacy" className="hover:text-main transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-main transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-subtle flex flex-col sm:flex-row items-center justify-between text-xs text-muted gap-4">
          <p>© {new Date().getFullYear()} File Grave. No file is ever stored permanently.</p>
          <div className="flex items-center gap-6">
            <span>WCAG AA Compliant</span>
            <span>SSR / SSG Optimized</span>
            <span>Zero Tracking</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
