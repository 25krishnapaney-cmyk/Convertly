import { Image as ImageIcon, FileText, Archive, Sliders, Layers } from "lucide-react";

export interface ToolItem {
  id: string; // e.g. "jpg-to-png" or "pdf-compressor"
  label: string; // e.g. "JPG to PNG"
  from: string; // e.g. "JPG"
  to: string; // e.g. "PNG"
  category: "Image Tools" | "PDF Tools" | "Compression";
  categorySlug: "image" | "pdf" | "compression";
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

  // --- COMPRESSION TOOLS ---
  { id: "pdf-compressor", label: "PDF Compressor", from: "PDF", to: "PDF", category: "Compression", categorySlug: "compression", desc: "Compress heavy PDF documents up to 80% without losing text readability." },
  { id: "image-compressor", label: "Image Compressor", from: "IMAGE", to: "OPT", category: "Compression", categorySlug: "compression", desc: "Smart lossy/lossless compression for JPG, PNG, and WebP images." },
  { id: "file-compressor", label: "File Compressor", from: "FILE", to: "ZIP", category: "Compression", categorySlug: "compression", desc: "Compress any file into a lightweight ZIP archive for easy sharing and storage." },
];

export function getToolIcon(category: string) {
  switch (category) {
    case "Image Tools":
    case "image":
      return ImageIcon;
    case "PDF Tools":
    case "pdf":
      return FileText;
    case "Compression":
    case "compression":
      return Archive;
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
