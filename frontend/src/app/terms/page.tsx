import * as React from "react";
import { FileText, AlertCircle, CheckCircle } from "lucide-react";

export default function TermsOfServicePage() {
  return (
    <div className="w-full max-w-[1440px] mx-auto px-6 md:px-12 py-20 flex-1">
      <div className="max-w-3xl mx-auto">
        <h1 className="font-display text-4xl sm:text-5xl font-bold text-main mb-4">
          Terms of Service
        </h1>
        <p className="text-muted text-sm mb-12">Last updated: {new Date().toLocaleDateString()}</p>

        <div className="space-y-8 text-main leading-relaxed">
          <section className="clay-card p-8">
            <h2 className="font-bold text-xl mb-3 flex items-center gap-2 text-primary">
              <CheckCircle className="w-5 h-5" /> 1. Acceptance of Terms
            </h2>
            <p className="text-sm text-muted">
              By accessing and using Convertly, you accept and agree to be bound by the terms and provision of this agreement. Convertly is provided as a free, zero-login online service.
            </p>
          </section>

          <section className="clay-card p-8">
            <h2 className="font-bold text-xl mb-3 flex items-center gap-2 text-warning">
              <AlertCircle className="w-5 h-5" /> 2. Lawful Use & Content Restrictions
            </h2>
            <p className="text-sm text-muted">
              You agree not to upload any files containing malware, viruses, illegal material, or copyrighted content for which you do not possess authorization or distribution rights. Convertly reserves the right to terminate conversion processing for any file that triggers security alarms or violates applicable laws.
            </p>
          </section>

          <section className="clay-card p-8">
            <h2 className="font-bold text-xl mb-3 flex items-center gap-2 text-primary">
              <FileText className="w-5 h-5" /> 3. Disclaimer of Warranties
            </h2>
            <p className="text-sm text-muted">
              The service is provided on an &quot;as is&quot; and &quot;as available&quot; basis without any warranties of any kind, whether express or implied. While we strive for 100% conversion accuracy and uptime, Convertly is not liable for any data loss, corruption, or business interruption resulting from the use of our conversion engines.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
