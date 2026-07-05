import { Image as ImageIcon, FileText, Video, Music, Archive, Sliders, Layers } from "lucide-react";

export interface ToolItem {
  id: string; // e.g. "jpg-to-png" or "pdf-compressor"
  label: string; // e.g. "JPG to PNG"
  from: string; // e.g. "JPG"
  to: string; // e.g. "PNG"
  category: "Image Tools" | "PDF Tools" | "Video" | "Audio" | "Specialized";
  categorySlug: "image" | "pdf" | "video" | "audio" | "specialized";
  desc: string;
  isSpecialized?: boolean;
  badge?: string;
}

export const ALL_CONVERSION_TOOLS: ToolItem[] = [
  // --- IMAGE TOOLS ---
  { id: "jpg-to-png", label: "JPG to PNG", from: "JPG", to: "PNG", category: "Image Tools", categorySlug: "image", desc: "Convert JPEG images to transparent PNG files." },
  { id: "png-to-jpg", label: "PNG to JPG", from: "PNG", to: "JPG", category: "Image Tools", categorySlug: "image", desc: "Convert PNG graphics to compressed JPG photos." },
  { id: "png-to-webp", label: "PNG to WebP", from: "PNG", to: "WebP", category: "Image Tools", categorySlug: "image", desc: "Convert PNG to next-gen WebP format for fast web loading." },
  { id: "webp-to-png", label: "WebP to PNG", from: "WebP", to: "PNG", category: "Image Tools", categorySlug: "image", desc: "Convert WebP images back to universally supported PNG." },
  { id: "webp-to-jpg", label: "WebP to JPG", from: "WebP", to: "JPG", category: "Image Tools", categorySlug: "image", desc: "Convert Google WebP images to standard JPEG format." },
  { id: "jpg-to-webp", label: "JPG to WebP", from: "JPG", to: "WebP", category: "Image Tools", categorySlug: "image", desc: "Compress JPG photos into lightweight WebP format." },
  { id: "heic-to-jpg", label: "HEIC to JPG", from: "HEIC", to: "JPG", category: "Image Tools", categorySlug: "image", desc: "Convert Apple iPhone HEIC photos to standard JPG.", badge: "Popular" },
  { id: "heic-to-png", label: "HEIC to PNG", from: "HEIC", to: "PNG", category: "Image Tools", categorySlug: "image", desc: "Convert iOS HEIC images to lossless PNG format." },
  { id: "avif-to-png", label: "AVIF to PNG", from: "AVIF", to: "PNG", category: "Image Tools", categorySlug: "image", desc: "Convert AVIF high-efficiency images to PNG." },
  { id: "avif-to-jpg", label: "AVIF to JPG", from: "AVIF", to: "JPG", category: "Image Tools", categorySlug: "image", desc: "Convert modern AVIF format into standard JPG." },
  { id: "svg-to-png", label: "SVG to PNG", from: "SVG", to: "PNG", category: "Image Tools", categorySlug: "image", desc: "Render scalable vector SVG files into high-res PNG." },
  { id: "png-to-svg", label: "PNG to SVG", from: "PNG", to: "SVG", category: "Image Tools", categorySlug: "image", desc: "Vectorize raster PNG images into SVG format." },
  { id: "gif-to-mp4", label: "GIF to MP4", from: "GIF", to: "MP4", category: "Image Tools", categorySlug: "image", desc: "Convert animated GIFs into smooth video MP4 clips." },
  { id: "jpg-to-pdf", label: "JPG to PDF", from: "JPG", to: "PDF", category: "Image Tools", categorySlug: "image", desc: "Combine multiple JPG images into a single PDF document.", badge: "Top Rated" },
  { id: "png-to-pdf", label: "PNG to PDF", from: "PNG", to: "PDF", category: "Image Tools", categorySlug: "image", desc: "Convert PNG images into printable PDF documents." },
  { id: "bmp-to-png", label: "BMP to PNG", from: "BMP", to: "PNG", category: "Image Tools", categorySlug: "image", desc: "Convert uncompressed bitmap files to PNG." },
  { id: "tiff-to-jpg", label: "TIFF to JPG", from: "TIFF", to: "JPG", category: "Image Tools", categorySlug: "image", desc: "Convert high-res TIFF scans into manageable JPG files." },
  { id: "ico-to-png", label: "ICO to PNG", from: "ICO", to: "PNG", category: "Image Tools", categorySlug: "image", desc: "Extract favicon ICO files into transparent PNGs." },

  // --- PDF & DOCUMENT TOOLS ---
  { id: "pdf-to-jpg", label: "PDF to JPG", from: "PDF", to: "JPG", category: "PDF Tools", categorySlug: "pdf", desc: "Extract PDF pages into high-resolution JPG images.", badge: "Popular" },
  { id: "pdf-to-png", label: "PDF to PNG", from: "PDF", to: "PNG", category: "PDF Tools", categorySlug: "pdf", desc: "Convert PDF documents to transparent PNG graphics." },
  { id: "docx-to-pdf", label: "DOCX to PDF", from: "DOCX", to: "PDF", category: "PDF Tools", categorySlug: "pdf", desc: "Convert Microsoft Word documents into secure PDFs.", badge: "Top Rated" },
  { id: "pdf-to-docx", label: "PDF to Word", from: "PDF", to: "DOCX", category: "PDF Tools", categorySlug: "pdf", desc: "Convert PDF files into editable Microsoft Word DOCX." },
  { id: "xlsx-to-pdf", label: "Excel to PDF", from: "XLSX", to: "PDF", category: "PDF Tools", categorySlug: "pdf", desc: "Convert Excel spreadsheets to cleanly formatted PDF." },
  { id: "pptx-to-pdf", label: "PowerPoint to PDF", from: "PPTX", to: "PDF", category: "PDF Tools", categorySlug: "pdf", desc: "Convert PowerPoint slide decks into PDF documents." },
  { id: "txt-to-pdf", label: "TXT to PDF", from: "TXT", to: "PDF", category: "PDF Tools", categorySlug: "pdf", desc: "Convert plain text files into professional PDF reports." },
  { id: "epub-to-pdf", label: "EPUB to PDF", from: "EPUB", to: "PDF", category: "PDF Tools", categorySlug: "pdf", desc: "Convert eBook EPUB files to standard PDF format." },

  // --- SPECIALIZED PRO TOOLS (§15 step 9) ---
  { id: "pdf-compressor", label: "PDF Compressor", from: "PDF", to: "PDF", category: "Specialized", categorySlug: "specialized", desc: "Compress heavy PDF documents up to 80% without losing text readability.", isSpecialized: true, badge: "Pro Tool" },
  { id: "image-compressor", label: "Image Compressor", from: "IMAGE", to: "OPT", category: "Specialized", categorySlug: "specialized", desc: "Smart lossy/lossless compression for JPG, PNG, and WebP images.", isSpecialized: true, badge: "Pro Tool" },
  { id: "image-resizer", label: "Image Resizer", from: "IMAGE", to: "RESIZE", category: "Specialized", categorySlug: "specialized", desc: "Resize pixel dimensions and change aspect ratio of images.", isSpecialized: true, badge: "Pro Tool" },
  { id: "video-compressor", label: "Video Compressor", from: "VIDEO", to: "OPT", category: "Specialized", categorySlug: "specialized", desc: "Reduce MP4 and MOV video sizes with H.264/HEVC encoding.", isSpecialized: true, badge: "Pro Tool" },

  // --- VIDEO TOOLS ---
  { id: "mp4-to-mp3", label: "MP4 to MP3", from: "MP4", to: "MP3", category: "Video", categorySlug: "video", desc: "Extract crystal clear MP3 audio tracks from MP4 videos.", badge: "Popular" },
  { id: "mp4-to-wav", label: "MP4 to WAV", from: "MP4", to: "WAV", category: "Video", categorySlug: "video", desc: "Extract uncompressed lossless WAV audio tracks from MP4 videos." },
  { id: "mov-to-mp3", label: "MOV to MP3", from: "MOV", to: "MP3", category: "Video", categorySlug: "video", desc: "Extract audio tracks from Apple MOV video recordings." },
  { id: "webm-to-mp3", label: "WebM to MP3", from: "WebM", to: "MP3", category: "Video", categorySlug: "video", desc: "Convert WebM video audio streams into portable MP3." },
  { id: "mkv-to-mp3", label: "MKV to MP3", from: "MKV", to: "MP3", category: "Video", categorySlug: "video", desc: "Extract high-quality MP3 audio from Matroska MKV containers." },
  { id: "avi-to-mp3", label: "AVI to MP3", from: "AVI", to: "MP3", category: "Video", categorySlug: "video", desc: "Extract MP3 audio tracks from legacy AVI video files." },
  { id: "mov-to-mp4", label: "MOV to MP4", from: "MOV", to: "MP4", category: "Video", categorySlug: "video", desc: "Convert Apple MOV recordings into universally playable MP4.", badge: "Top Rated" },
  { id: "webm-to-mp4", label: "WebM to MP4", from: "WebM", to: "MP4", category: "Video", categorySlug: "video", desc: "Convert HTML5 WebM videos to standard H.264 MP4 format." },
  { id: "mp4-to-gif", label: "MP4 to GIF", from: "MP4", to: "GIF", category: "Video", categorySlug: "video", desc: "Create high-frame animated GIFs from video clips." },
  { id: "mkv-to-mp4", label: "MKV to MP4", from: "MKV", to: "MP4", category: "Video", categorySlug: "video", desc: "Convert Matroska MKV container files into standard MP4." },
  { id: "avi-to-mp4", label: "AVI to MP4", from: "AVI", to: "MP4", category: "Video", categorySlug: "video", desc: "Convert legacy AVI recordings to compressed MP4." },

  // --- AUDIO TOOLS ---
  { id: "wav-to-mp3", label: "WAV to MP3", from: "WAV", to: "MP3", category: "Audio", categorySlug: "audio", desc: "Compress uncompressed studio WAV audio into 320k MP3.", badge: "Popular" },
  { id: "flac-to-mp3", label: "FLAC to MP3", from: "FLAC", to: "MP3", category: "Audio", categorySlug: "audio", desc: "Convert lossless FLAC music files into portable MP3." },
  { id: "m4a-to-mp3", label: "M4A to MP3", from: "M4A", to: "MP3", category: "Audio", categorySlug: "audio", desc: "Convert Apple M4A voice memos and audio to standard MP3." },
  { id: "mp3-to-wav", label: "MP3 to WAV", from: "MP3", to: "WAV", category: "Audio", categorySlug: "audio", desc: "Decompress MP3 files into uncompressed WAV format." },
  { id: "ogg-to-mp3", label: "OGG to MP3", from: "OGG", to: "MP3", category: "Audio", categorySlug: "audio", desc: "Convert Vorbis OGG audio streams to universal MP3." },
  { id: "aac-to-mp3", label: "AAC to MP3", from: "AAC", to: "MP3", category: "Audio", categorySlug: "audio", desc: "Convert advanced audio coding AAC files to MP3 format." },
];

export function getToolIcon(category: string) {
  switch (category) {
    case "Image Tools":
    case "image":
      return ImageIcon;
    case "PDF Tools":
    case "pdf":
      return FileText;
    case "Video":
    case "video":
      return Video;
    case "Audio":
    case "audio":
      return Music;
    case "Specialized":
    case "specialized":
      return Sliders;
    default:
      return Layers;
  }
}

export function getToolBySlug(slug: string): ToolItem | undefined {
  return ALL_CONVERSION_TOOLS.find((t) => t.id.toLowerCase() === slug.toLowerCase());
}

export function getToolsByCategory(catSlug: string): ToolItem[] {
  if (catSlug === "all") return ALL_CONVERSION_TOOLS;
  return ALL_CONVERSION_TOOLS.filter((t) => t.categorySlug.toLowerCase() === catSlug.toLowerCase());
}

export function searchTools(query: string, categoryFilter: string = "All"): ToolItem[] {
  const q = query.toLowerCase().trim();
  return ALL_CONVERSION_TOOLS.filter((t) => {
    const matchesQ = !q || t.label.toLowerCase().includes(q) || t.from.toLowerCase().includes(q) || t.to.toLowerCase().includes(q) || t.desc.toLowerCase().includes(q);
    const matchesCat = categoryFilter === "All" || t.category === categoryFilter || t.categorySlug === categoryFilter.toLowerCase();
    return matchesQ && matchesCat;
  });
}
