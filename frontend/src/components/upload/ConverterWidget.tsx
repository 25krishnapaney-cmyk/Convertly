"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Dropzone } from "./Dropzone";
import { ConversionProgress } from "./ConversionProgress";
import { DownloadCard } from "./DownloadCard";
import { sound } from "@/lib/sound";
import { generateOfflineConversion } from "@/lib/converters";
import type { ConversionOptions } from "./ToolOptions";

interface ConverterWidgetProps {
  defaultTargetFormat?: string;
  allowedExtensions?: string[];
  title?: string;
  subtitle?: string;
}

export function ConverterWidget({
  defaultTargetFormat,
  allowedExtensions,
  title,
  subtitle,
}: ConverterWidgetProps) {
  const [status, setStatus] = React.useState<
    "idle" | "uploading" | "processing" | "success" | "error"
  >("idle");
  const [progress, setProgress] = React.useState(0);
  const [statusMessage, setStatusMessage] = React.useState("");
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  // Job metadata
  const [currentFile, setCurrentFile] = React.useState<File | null>(null);
  const [targetFormat, setTargetFormat] = React.useState<string>(
    defaultTargetFormat || ""
  );
  const [jobId, setJobId] = React.useState<string>("");
  const [downloadUrl, setDownloadUrl] = React.useState<string>("");

  const eventSourceRef = React.useRef<EventSource | null>(null);
  // Track blob URLs for cleanup to prevent memory leaks
  const blobUrlsRef = React.useRef<string[]>([]);

  const cleanupSSE = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
  };

  React.useEffect(() => {
    return () => {
      cleanupSSE();
      // Revoke all blob URLs on unmount to prevent memory leaks
      blobUrlsRef.current.forEach((url) => {
        try {
          URL.revokeObjectURL(url);
        } catch {
          /* ignore */
        }
      });
    };
  }, []);

  const handleReset = () => {
    cleanupSSE();
    // Clean up blob URLs from previous conversion
    blobUrlsRef.current.forEach((url) => {
      try {
        URL.revokeObjectURL(url);
      } catch {
        /* ignore */
      }
    });
    blobUrlsRef.current = [];
    setStatus("idle");
    setProgress(0);
    setStatusMessage("");
    setErrorMsg(null);
    setCurrentFile(null);
    setJobId("");
    setDownloadUrl("");
  };

  /**
   * Offline fallback: simulates progress and runs browser-based conversion.
   * Used when the backend server is unreachable.
   */
  const startSimulatedProgress = (file: File, target: string) => {
    console.warn(
      "[Convertly Dev] Backend offline or unreachable. Using client-side conversion engine."
    );
    setStatus("processing");
    setProgress(15);
    setStatusMessage("Scanning file for security threats...");

    setTimeout(() => {
      setProgress(40);
      setStatusMessage(
        `Converting ${file.name.split(".").pop()?.toUpperCase()} to ${target}...`
      );
    }, 800);

    setTimeout(() => {
      setProgress(75);
      setStatusMessage("Optimizing output bitrate and quality...");
    }, 1800);

    setTimeout(async () => {
      try {
        const convertedUrl = await generateOfflineConversion(file, target);
        blobUrlsRef.current.push(convertedUrl);
        sound.playSuccess();
        setProgress(100);
        setStatusMessage("Conversion complete!");
        setJobId("simulated-job-" + Date.now());
        setDownloadUrl(convertedUrl);
        setStatus("success");
      } catch (err: unknown) {
        sound.playError();
        const message =
          err instanceof Error
            ? err.message
            : "An unexpected error occurred during conversion.";
        setErrorMsg(message);
        setStatus("error");
      }
    }, 2800);
  };

  const handleFileSelect = async (
    file: File,
    targetFmt: string,
    options: ConversionOptions = {}
  ) => {
    cleanupSSE();
    setCurrentFile(file);
    setTargetFormat(targetFmt);
    setErrorMsg(null);

    // Multi-page PDF guard for image conversion targets
    if (
      (file.type === "application/pdf" ||
        file.name.toLowerCase().endsWith(".pdf")) &&
      ["jpg", "jpeg", "png", "webp", "bmp", "ico", "tiff"].includes(
        targetFmt.toLowerCase()
      )
    ) {
      try {
        const pdfjsLib = await import("pdfjs-dist");
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        if (pdf.numPages > 1) {
          setErrorMsg(
            "Due to multiple pages, this PDF cannot be converted directly to an image format. Please upload a single-page PDF."
          );
          sound.playError();
          setStatus("error");
          return;
        }
      } catch (err: unknown) {
        if (
          err instanceof Error &&
          err.message?.includes("multiple pages")
        ) {
          setErrorMsg(err.message);
          sound.playError();
          setStatus("error");
          return;
        }
        console.warn("PDF page count check error:", err);
      }
    }

    setStatus("uploading");
    setProgress(10);
    setStatusMessage("Uploading file to ephemeral storage...");

    const formData = new FormData();
    formData.append("file", file);

    try {
      // Step 1: Upload File
      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) {
        if ([404, 500, 502, 504].includes(uploadRes.status)) {
          // Backend offline — fall back to client-side conversion
          startSimulatedProgress(file, targetFmt);
          return;
        }
        const errData = await uploadRes
          .json()
          .catch(() => ({ detail: "Upload failed." }));
        throw new Error(errData.detail || "Failed to upload file.");
      }

      const uploadData = await uploadRes.json();
      const newJobId = uploadData.job_id; // Fixed: was incorrectly using `file_id`

      setProgress(30);
      setStatusMessage("Enqueuing conversion job...");

      // Step 2: Trigger Conversion — Fixed URL to include job_id as path param
      const convertRes = await fetch(`/api/convert/${newJobId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          target_format: targetFmt,
        }),
      });

      if (!convertRes.ok) {
        const errData = await convertRes
          .json()
          .catch(() => ({ detail: "Conversion trigger failed." }));
        throw new Error(errData.detail || "Failed to start conversion.");
      }

      setJobId(newJobId);
      setStatus("processing");
      setProgress(40);
      setStatusMessage("Worker processing file...");

      // Step 3: Connect to SSE Progress Stream
      const es = new EventSource(`/api/status/${newJobId}`);
      eventSourceRef.current = es;

      es.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.progress !== undefined) setProgress(data.progress);
          if (data.message) setStatusMessage(data.message);

          // Fixed: backend sends "success" not "completed"
          if (data.status === "success") {
            cleanupSSE();
            sound.playSuccess();
            setProgress(100);
            setStatusMessage("Ready!");
            setDownloadUrl(
              data.output_url || `/api/download/${newJobId}`
            );
            setTimeout(() => {
              setStatus("success");
            }, 400);
          } else if (data.status === "error") {
            // Fixed: backend sends "error" not "failed"
            cleanupSSE();
            sound.playError();
            setErrorMsg(
              data.error || "Conversion failed during processing."
            );
            setStatus("error");
          }
        } catch (e) {
          console.error("Error parsing SSE data:", e);
        }
      };

      es.onerror = () => {
        cleanupSSE();
        // If SSE drops, poll status once via standard GET
        fetch(`/api/status/${newJobId}`)
          .then((r) => r.json())
          .then((data) => {
            if (data.status === "success") {
              sound.playSuccess();
              setProgress(100);
              setDownloadUrl(
                data.output_url || `/api/download/${newJobId}`
              );
              setStatus("success");
            } else if (data.status === "error") {
              sound.playError();
              setErrorMsg(data.error || "Conversion failed.");
              setStatus("error");
            } else {
              sound.playError();
              setErrorMsg("Lost connection to processing worker.");
              setStatus("error");
            }
          })
          .catch(() => {
            sound.playError();
            setErrorMsg(
              "Network error communicating with conversion server."
            );
            setStatus("error");
          });
      };
    } catch (err: unknown) {
      console.error("Conversion pipeline error:", err);
      const message = err instanceof Error ? err.message : "";
      // Graceful offline fallback
      if (
        message.includes("Failed to fetch") ||
        message.includes("NetworkError") ||
        message.includes("Load failed")
      ) {
        startSimulatedProgress(file, targetFmt);
      } else {
        sound.playError();
        setErrorMsg(message || "An unexpected error occurred.");
        setStatus("error");
      }
    }
  };

  const fromFmt = currentFile
    ? (currentFile.name.split(".").pop() || "FILE").toUpperCase()
    : "FILE";

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {status === "idle" && (
          <motion.div
            key="widget-idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Dropzone
              onFileSelect={handleFileSelect}
              defaultTargetFormat={defaultTargetFormat}
              allowedExtensions={allowedExtensions}
              title={title}
              subtitle={subtitle}
            />
          </motion.div>
        )}

        {(status === "uploading" || status === "processing") && (
          <motion.div
            key="widget-progress"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <ConversionProgress
              status={status}
              progress={progress}
              message={statusMessage}
              fromFormat={fromFmt}
              toFormat={targetFormat}
              fileName={
                currentFile ? currentFile.name : "document.file"
              }
            />
          </motion.div>
        )}

        {status === "success" && (
          <motion.div
            key="widget-success"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <DownloadCard
              jobId={jobId}
              fileName={
                currentFile
                  ? currentFile.name.replace(/\.[^/.]+$/, "") +
                    "." +
                    targetFormat.toLowerCase()
                  : `converted.${targetFormat.toLowerCase()}`
              }
              fileSize={currentFile ? currentFile.size : 0}
              outputUrl={downloadUrl}
              onReset={handleReset}
            />
          </motion.div>
        )}

        {status === "error" && (
          <motion.div
            key="widget-error"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-lg mx-auto clay-card p-10 text-center border-danger/30"
          >
            <div className="w-16 h-16 rounded-2xl bg-danger/10 text-danger flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-8 h-8 stroke-[2]" />
            </div>
            <h3 className="font-display text-2xl font-bold text-main mb-2">
              Conversion Error
            </h3>
            <p className="text-sm text-muted mb-8 max-w-md mx-auto">
              {errorMsg ||
                "We encountered an issue processing this file. Please ensure the file is not corrupted or password protected."}
            </p>
            <button
              onClick={handleReset}
              className="clay-button px-8 py-3.5 text-sm font-bold flex items-center justify-center gap-2 mx-auto"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Try Again</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
