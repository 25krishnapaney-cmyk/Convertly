import { Image as ImageIcon, FileText, Video, Music, File as FileIcon } from "lucide-react";

export interface FormatCategory {
  name: string;
  maxSizeBytes: number;
  maxSizeLabel: string;
  extensions: string[];
  mimeTypes: string[];
  icon: any;
  targets: string[];
}

export const FORMAT_CATEGORIES: Record<string, FormatCategory> = {
  image: {
    name: "Image",
    maxSizeBytes: 25 * 1024 * 1024, // 25 MB
    maxSizeLabel: "25MB",
    extensions: [".jpg", ".jpeg", ".png", ".webp", ".gif", ".heic", ".avif", ".svg", ".bmp"],
    mimeTypes: [
      "image/jpeg", "image/png", "image/webp", "image/gif", 
      "image/heic", "image/avif", "image/svg+xml", "image/bmp"
    ],
    icon: ImageIcon,
    targets: ["PNG", "JPG", "WEBP", "AVIF", "GIF", "PDF"],
  },
  document: {
    name: "Document",
    maxSizeBytes: 50 * 1024 * 1024, // 50 MB
    maxSizeLabel: "50MB",
    extensions: [".pdf", ".docx", ".doc", ".txt", ".xlsx", ".pptx", ".epub", ".rtf"],
    mimeTypes: [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword",
      "text/plain",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "application/epub+zip",
      "application/rtf"
    ],
    icon: FileText,
    targets: ["PDF", "DOCX", "TXT", "JPG", "PNG"],
  },
  audio: {
    name: "Audio",
    maxSizeBytes: 100 * 1024 * 1024, // 100 MB
    maxSizeLabel: "100MB",
    extensions: [".mp3", ".wav", ".flac", ".ogg", ".m4a", ".aac", ".wma"],
    mimeTypes: [
      "audio/mpeg", "audio/wav", "audio/x-wav", "audio/flac", 
      "audio/ogg", "audio/mp4", "audio/aac", "audio/x-ms-wma"
    ],
    icon: Music,
    targets: ["MP3", "WAV", "FLAC", "OGG", "M4A", "AAC"],
  },
  video: {
    name: "Video",
    maxSizeBytes: 500 * 1024 * 1024, // 500 MB
    maxSizeLabel: "500MB",
    extensions: [".mp4", ".mov", ".webm", ".avi", ".mkv", ".m4v", ".wmv"],
    mimeTypes: [
      "video/mp4", "video/quicktime", "video/webm", 
      "video/x-msvideo", "video/x-matroska", "video/x-m4v", "video/x-ms-wmv"
    ],
    icon: Video,
    targets: ["MP4", "WEBM", "MOV", "MP3", "WAV", "FLAC", "AAC", "OGG", "M4A", "GIF", "AVI"],
  },
};

export function detectFileCategory(file: File): FormatCategory {
  const ext = "." + (file.name.split(".").pop() || "").toLowerCase();
  
  for (const cat of Object.values(FORMAT_CATEGORIES)) {
    if (cat.mimeTypes.includes(file.type) || cat.extensions.includes(ext)) {
      return cat;
    }
  }
  
  // Default fallback
  return {
    name: "General File",
    maxSizeBytes: 50 * 1024 * 1024,
    maxSizeLabel: "50MB",
    extensions: [ext],
    mimeTypes: [file.type || "application/octet-stream"],
    icon: FileIcon,
    targets: ["ZIP", "BIN"],
  };
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export function validateFileClientSide(file: File, allowedExtensions?: string[]): { valid: boolean; error?: string; category: FormatCategory } {
  const category = detectFileCategory(file);
  const ext = "." + (file.name.split(".").pop() || "").toLowerCase();

  // Check extension constraint if specified
  if (allowedExtensions && allowedExtensions.length > 0) {
    const normalizedAllowed = allowedExtensions.map(e => e.startsWith(".") ? e.toLowerCase() : "." + e.toLowerCase());
    if (!normalizedAllowed.includes(ext)) {
      return {
        valid: false,
        error: `Invalid file format (${ext}). Expected: ${normalizedAllowed.join(", ")}`,
        category
      };
    }
  }

  // Check size cap (§9)
  if (file.size > category.maxSizeBytes) {
    return {
      valid: false,
      error: `File exceeds maximum allowed size of ${category.maxSizeLabel} for ${category.name} files (${formatFileSize(file.size)}).`,
      category
    };
  }

  return { valid: true, category };
}
