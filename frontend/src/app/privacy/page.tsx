import * as React from "react";
import { ShieldCheck, Lock, Trash2, Server } from "lucide-react";

export default function PrivacyPolicyPage() {
  return (
    <div className="w-full max-w-[1440px] mx-auto px-6 md:px-12 py-20 flex-1">
      <div className="max-w-3xl mx-auto">
        <h1 className="font-display text-4xl sm:text-5xl font-bold text-main mb-4">
          Privacy Policy
        </h1>
        <p className="text-muted text-sm mb-12">Last updated: {new Date().toLocaleDateString()}</p>

        <div className="space-y-8 text-main leading-relaxed">
          <section className="clay-card p-8">
            <h2 className="font-bold text-xl mb-3 flex items-center gap-2 text-primary">
              <Lock className="w-5 h-5" /> 1. Zero Login & Zero Profiling
            </h2>
            <p className="text-sm text-muted">
              Convertly does not require user registration, email verification, or passwords. We do not build user profiles, track personal conversion histories across sessions, or sell user metadata to third parties.
            </p>
          </section>

          <section className="clay-card p-8">
            <h2 className="font-bold text-xl mb-3 flex items-center gap-2 text-success">
              <Trash2 className="w-5 h-5" /> 2. Ephemeral Storage & 30-Minute Hard TTL
            </h2>
            <p className="text-sm text-muted">
              All uploaded source files and generated output files are held exclusively in temporary server directories. A hard server-side time-to-live (TTL) cron job automatically deletes all files after exactly 30 minutes. We do not maintain backups or permanent archives of user files.
            </p>
          </section>

          <section className="clay-card p-8">
            <h2 className="font-bold text-xl mb-3 flex items-center gap-2 text-warning">
              <ShieldCheck className="w-5 h-5" /> 3. Data Processing & Virus Scanning
            </h2>
            <p className="text-sm text-muted">
              To ensure platform security, all incoming uploads are scanned using ClamAV antivirus engines and validated via MIME content sniffing prior to processing. File contents are processed in sandboxed worker environments and are never inspected by human personnel.
            </p>
          </section>

          <section className="clay-card p-8">
            <h2 className="font-bold text-xl mb-3 flex items-center gap-2 text-primary">
              <Server className="w-5 h-5" /> 4. Edge Encryption & Infrastructure
            </h2>
            <p className="text-sm text-muted">
              All data in transit is encrypted using HTTPS with HTTP Strict Transport Security (HSTS) enabled. We utilize Cloudflare CDN edge caching for static assets only; file payloads are never cached at edge nodes.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
