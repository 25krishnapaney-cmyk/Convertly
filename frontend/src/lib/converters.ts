/**
 * converters.ts — Offline file conversion engine for Convertly
 *
 * All browser-based conversions that run when the backend is offline or
 * unavailable. Each conversion produces a Blob URL string.
 *
 * Supports: Image conversions, Document conversions, and File compression.
 */

import { jsPDF } from "jspdf";

// ─── Helpers ───────────────────────────────────────────────────────────────

/** XML-safe escaping for OOXML content */
function escapeXml(str: string): string {
  return str
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** CRC-32 used for the ZIP container in DOCX creation */
function crc32(data: Uint8Array): number {
  let crc = 0xffffffff;
  for (let i = 0; i < data.length; i++) {
    crc ^= data[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

// ─── DOCX Archive Builder ──────────────────────────────────────────────────

/**
 * Creates a valid OpenXML (.docx) ZIP container in Store mode (uncompressed).
 * Includes styles.xml for heading support and proper paragraph formatting.
 */
export function createDocxArchive(text: string, title: string): Blob {
  const enc = new TextEncoder();

  const contentTypesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\r\n<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/></Types>`;

  const relsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\r\n<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>`;

  const wordRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\r\n<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`;

  const stylesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\r\n<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/><w:pPr><w:spacing w:after="120" w:line="276" w:lineRule="auto"/></w:pPr><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/><w:sz w:val="22"/></w:rPr></w:style><w:style w:type="paragraph" w:styleId="Heading1"><w:name w:val="heading 1"/><w:pPr><w:spacing w:before="360" w:after="120"/></w:pPr><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/><w:b/><w:sz w:val="32"/><w:color w:val="1F3864"/></w:rPr></w:style><w:style w:type="paragraph" w:styleId="Heading2"><w:name w:val="heading 2"/><w:pPr><w:spacing w:before="240" w:after="120"/></w:pPr><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/><w:b/><w:sz w:val="28"/><w:color w:val="2E74B5"/></w:rPr></w:style><w:style w:type="paragraph" w:styleId="PageBreak"><w:name w:val="Page Break"/><w:pPr><w:jc w:val="center"/><w:spacing w:before="240" w:after="120"/></w:pPr><w:rPr><w:b/><w:color w:val="555555"/><w:sz w:val="26"/></w:rPr></w:style></w:styles>`;

  const paragraphs = text
    .split("\n")
    .map((line) => {
      const trimmed = line.trim();
      if (!trimmed)
        return `<w:p><w:pPr><w:spacing w:after="120"/></w:pPr><w:r><w:t> </w:t></w:r></w:p>`;
      if (trimmed.startsWith("--- Page ")) {
        return `<w:p><w:pPr><w:pStyle w:val="PageBreak"/></w:pPr><w:r><w:t>${escapeXml(trimmed)}</w:t></w:r></w:p>`;
      }
      return `<w:p><w:pPr><w:spacing w:after="120"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/><w:sz w:val="22"/></w:rPr><w:t xml:space="preserve">${escapeXml(line)}</w:t></w:r></w:p>`;
    })
    .join("");

  const docXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\r\n<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${paragraphs}<w:sectPr><w:pgSz w:w="12240" w:h="15840"/><w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440"/></w:sectPr></w:body></w:document>`;

  const files = [
    { name: "[Content_Types].xml", data: enc.encode(contentTypesXml) },
    { name: "_rels/.rels", data: enc.encode(relsXml) },
    { name: "word/_rels/document.xml.rels", data: enc.encode(wordRelsXml) },
    { name: "word/styles.xml", data: enc.encode(stylesXml) },
    { name: "word/document.xml", data: enc.encode(docXml) },
  ];

  const localHeaders: Uint8Array[] = [];
  const centralDir: Uint8Array[] = [];
  let offset = 0;

  for (const f of files) {
    const nameBytes = enc.encode(f.name);
    const fileCrc = crc32(f.data);
    const size = f.data.length;

    const lh = new Uint8Array(30 + nameBytes.length + size);
    const lhView = new DataView(lh.buffer);
    lhView.setUint32(0, 0x04034b50, true);
    lhView.setUint16(4, 20, true);
    lhView.setUint16(6, 0, true);
    lhView.setUint16(8, 0, true);
    lhView.setUint32(10, 0, true);
    lhView.setUint32(14, fileCrc, true);
    lhView.setUint32(18, size, true);
    lhView.setUint32(22, size, true);
    lhView.setUint16(26, nameBytes.length, true);
    lhView.setUint16(28, 0, true);
    lh.set(nameBytes, 30);
    lh.set(f.data, 30 + nameBytes.length);
    localHeaders.push(lh);

    const cd = new Uint8Array(46 + nameBytes.length);
    const cdView = new DataView(cd.buffer);
    cdView.setUint32(0, 0x02014b50, true);
    cdView.setUint16(4, 20, true);
    cdView.setUint16(6, 20, true);
    cdView.setUint16(8, 0, true);
    cdView.setUint16(10, 0, true);
    cdView.setUint32(12, 0, true);
    cdView.setUint32(16, fileCrc, true);
    cdView.setUint32(20, size, true);
    cdView.setUint32(24, size, true);
    cdView.setUint16(28, nameBytes.length, true);
    cdView.setUint16(30, 0, true);
    cdView.setUint16(32, 0, true);
    cdView.setUint16(34, 0, true);
    cdView.setUint16(36, 0, true);
    cdView.setUint32(38, 0, true);
    cdView.setUint32(42, offset, true);
    cd.set(nameBytes, 46);
    centralDir.push(cd);

    offset += lh.length;
  }

  let cdSize = 0;
  for (const cd of centralDir) cdSize += cd.length;

  const eocd = new Uint8Array(22);
  const eocdView = new DataView(eocd.buffer);
  eocdView.setUint32(0, 0x06054b50, true);
  eocdView.setUint16(4, 0, true);
  eocdView.setUint16(6, 0, true);
  eocdView.setUint16(8, files.length, true);
  eocdView.setUint16(10, files.length, true);
  eocdView.setUint32(12, cdSize, true);
  eocdView.setUint32(16, offset, true);
  eocdView.setUint16(20, 0, true);

  // Combine all parts into a single blob (cast to avoid TS strict ArrayBufferLike issue)
  const allParts: BlobPart[] = [
    ...localHeaders.map(h => new Uint8Array(h) as BlobPart),
    ...centralDir.map(c => new Uint8Array(c) as BlobPart),
    new Uint8Array(eocd) as BlobPart,
  ];

  return new Blob(allParts, {
    type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  });
}

// ─── PDF Text Extraction with Spatial Layout ───────────────────────────────

interface TextItem {
  str: string;
  transform: number[];
  width: number;
  height: number;
  fontName?: string;
}

/**
 * Extract text from a PDF preserving spatial layout (line breaks, paragraphs).
 * Uses Y-coordinate gaps to detect paragraph vs line breaks and X-coordinates
 * to preserve reading order.
 */
async function extractPdfTextWithLayout(file: File): Promise<string> {
  const pdfjsLib = await import("pdfjs-dist");
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const allPages: string[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const items = textContent.items as TextItem[];

    if (items.length === 0) continue;

    // Sort by Y descending (top of page first), then X ascending (left to right)
    const sorted = [...items].sort((a, b) => {
      const yDiff = b.transform[5] - a.transform[5];
      if (Math.abs(yDiff) > 2) return yDiff;
      return a.transform[4] - b.transform[4];
    });

    const lines: string[] = [];
    let currentLine = sorted[0].str;
    let lastY = sorted[0].transform[5];
    let lastX = sorted[0].transform[4] + (sorted[0].width || 0);
    const avgHeight =
      items.reduce((sum, item) => sum + Math.abs(item.transform[3] || 12), 0) /
      items.length;

    for (let j = 1; j < sorted.length; j++) {
      const item = sorted[j];
      const y = item.transform[5];
      const x = item.transform[4];
      const yGap = Math.abs(lastY - y);

      if (yGap > avgHeight * 1.5) {
        // Large gap → paragraph break
        lines.push(currentLine);
        if (yGap > avgHeight * 3) {
          lines.push(""); // Extra blank line for large gaps
        }
        currentLine = item.str;
      } else if (yGap > avgHeight * 0.3) {
        // Normal line break
        lines.push(currentLine);
        currentLine = item.str;
      } else {
        // Same line — add space if there's a horizontal gap
        const gap = x - lastX;
        if (gap > avgHeight * 0.3) {
          currentLine += " " + item.str;
        } else {
          currentLine += item.str;
        }
      }

      lastY = y;
      lastX = x + (item.width || 0);
    }
    if (currentLine) lines.push(currentLine);

    if (i > 1) {
      allPages.push(`\n--- Page ${i} ---\n`);
    }
    allPages.push(lines.join("\n"));
  }

  return allPages.join("\n").trim();
}

// ─── Conversion Functions ──────────────────────────────────────────────────

/**
 * DOCX → PDF using mammoth for proper DOCX parsing
 */
async function convertDocxToPdf(file: File): Promise<string> {
  const mammoth = await import("mammoth");
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.convertToHtml({ arrayBuffer });
  const html = result.value;

  // Create an offscreen container to measure and render the HTML
  const container = document.createElement("div");
  container.style.cssText = `
    position: absolute; left: -9999px; top: -9999px;
    width: 500px; font-family: 'Calibri', 'Arial', sans-serif;
    font-size: 11pt; line-height: 1.6; color: #000;
  `;

  // Apply minimal styling for headings, lists, tables
  const style = document.createElement("style");
  style.textContent = `
    .docx-render h1 { font-size: 18pt; font-weight: bold; margin: 12pt 0 6pt; }
    .docx-render h2 { font-size: 15pt; font-weight: bold; margin: 10pt 0 5pt; }
    .docx-render h3 { font-size: 13pt; font-weight: bold; margin: 8pt 0 4pt; }
    .docx-render p { margin: 0 0 6pt; }
    .docx-render ul, .docx-render ol { margin: 4pt 0 8pt 20pt; }
    .docx-render li { margin: 2pt 0; }
    .docx-render table { border-collapse: collapse; width: 100%; margin: 6pt 0; }
    .docx-render td, .docx-render th { border: 1px solid #999; padding: 4pt 6pt; font-size: 10pt; }
    .docx-render strong, .docx-render b { font-weight: bold; }
    .docx-render em, .docx-render i { font-style: italic; }
    .docx-render img { max-width: 100%; height: auto; }
  `;
  container.className = "docx-render";
  container.appendChild(style);
  container.innerHTML += html;
  document.body.appendChild(container);

  // Wait a frame for layout to settle
  await new Promise((r) => requestAnimationFrame(r));

  // Extract text content line by line from the rendered HTML
  const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 50;
  const usableWidth = pageWidth - margin * 2;
  let y = margin;

  // Walk through all child elements and render them
  const children = container.querySelectorAll("h1, h2, h3, h4, p, li, tr, br");
  if (children.length === 0) {
    // Fallback: use innerText
    const text = container.innerText || "";
    const lines = doc.splitTextToSize(text, usableWidth);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    for (const line of lines) {
      if (y > pageHeight - margin) {
        doc.addPage();
        y = margin;
      }
      doc.text(line, margin, y);
      y += 14;
    }
  } else {
    for (const el of children) {
      const tag = el.tagName.toLowerCase();
      const text = (el as HTMLElement).innerText || el.textContent || "";
      if (!text.trim()) continue;

      let fontSize = 11;
      let fontStyle: "normal" | "bold" = "normal";
      let lineSpacing = 14;

      if (tag === "h1") {
        fontSize = 18;
        fontStyle = "bold";
        lineSpacing = 22;
        y += 12; // Extra space before heading
      } else if (tag === "h2") {
        fontSize = 15;
        fontStyle = "bold";
        lineSpacing = 18;
        y += 8;
      } else if (tag === "h3" || tag === "h4") {
        fontSize = 13;
        fontStyle = "bold";
        lineSpacing = 16;
        y += 6;
      } else if (tag === "li") {
        fontSize = 11;
        lineSpacing = 14;
      }

      doc.setFontSize(fontSize);
      doc.setFont("helvetica", fontStyle);

      const prefix = tag === "li" ? "• " : "";
      const xOffset = tag === "li" ? margin + 15 : margin;
      const textWidth = tag === "li" ? usableWidth - 15 : usableWidth;

      const lines = doc.splitTextToSize(prefix + text, textWidth);
      for (const line of lines) {
        if (y > pageHeight - margin) {
          doc.addPage();
          y = margin;
        }
        doc.text(line, xOffset, y);
        y += lineSpacing;
      }

      // Add paragraph spacing after block elements
      if (tag === "p" || tag.startsWith("h")) {
        y += 4;
      }
    }
  }

  // Cleanup
  document.body.removeChild(container);

  const blob = doc.output("blob");
  return URL.createObjectURL(blob);
}

/**
 * Image → PDF using jsPDF with proper image rendering
 */
function convertImageToPdf(file: File, fileName: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      try {
        const orientation = img.width > img.height ? "landscape" : "portrait";
        const doc = new jsPDF({
          orientation,
          unit: "px",
          format: [img.width, img.height],
        });
        const format =
          fileName.endsWith(".png") || file.type.includes("png")
            ? "PNG"
            : "JPEG";
        doc.addImage(img, format, 0, 0, img.width, img.height);
        const blob = doc.output("blob");
        resolve(URL.createObjectURL(blob));
      } catch {
        resolve(URL.createObjectURL(file));
      }
    };
    img.onerror = () => resolve(URL.createObjectURL(file));
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Image → Image conversion using Canvas API
 */
function convertImageToImage(
  file: File,
  ext: string
): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      try {
        // SVG output: wrap as embedded image
        if (ext === "svg") {
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0);
          const dataUrl = canvas.toDataURL("image/png");
          const svgXml = `<svg xmlns="http://www.w3.org/2000/svg" width="${img.width}" height="${img.height}" viewBox="0 0 ${img.width} ${img.height}"><image href="${dataUrl}" width="${img.width}" height="${img.height}"/></svg>`;
          resolve(
            URL.createObjectURL(
              new Blob([svgXml], { type: "image/svg+xml;charset=utf-8" })
            )
          );
          return;
        }

        const canvas = document.createElement("canvas");
        const width = img.width;
        const height = img.height;
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          // Fill white background for formats without alpha
          if (["jpg", "jpeg", "opt", "compress"].includes(ext)) {
            ctx.fillStyle = "#FFFFFF";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          }
          ctx.drawImage(img, 0, 0, width, height);
          const mime = ["jpg", "jpeg", "opt", "compress"].includes(ext)
            ? "image/jpeg"
            : ext === "webp"
              ? "image/webp"
              : "image/png";
          const quality = ["opt", "compress"].includes(ext)
            ? 0.75
            : 0.95;
          canvas.toBlob(
            (blob) => {
              if (blob) resolve(URL.createObjectURL(blob));
              else resolve(URL.createObjectURL(file));
            },
            mime,
            quality
          );
          return;
        }
      } catch {
        /* fall through */
      }
      resolve(URL.createObjectURL(file));
    };
    img.onerror = () => resolve(URL.createObjectURL(file));
    img.src = URL.createObjectURL(file);
  });
}

/**
 * PDF → Image conversion using pdfjs-dist canvas rendering
 */
async function convertPdfToImage(file: File, ext: string): Promise<string> {
  const pdfjsLib = await import("pdfjs-dist");
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  if (pdf.numPages > 1) {
    throw new Error(
      "Due to multiple pages, this PDF cannot be converted directly to an image format. Please upload a single-page PDF."
    );
  }
  const page = await pdf.getPage(1);
  const viewport = page.getViewport({ scale: 2.0 });
  const canvas = document.createElement("canvas");
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    if (["jpg", "jpeg"].includes(ext)) {
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    await page.render({ canvasContext: ctx, viewport, canvas }).promise;
    const mime = ["jpg", "jpeg"].includes(ext)
      ? "image/jpeg"
      : ext === "webp"
        ? "image/webp"
        : "image/png";
    return await new Promise<string>((resolve) => {
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(URL.createObjectURL(blob));
          else resolve(URL.createObjectURL(file));
        },
        mime,
        0.95
      );
    });
  }
  return URL.createObjectURL(file);
}

/**
 * PDF → Document (DOCX, DOC, TXT, RTF, MD, HTML) using spatial text extraction
 */
async function convertPdfToDocument(
  file: File,
  ext: string
): Promise<string> {
  let fullText = await extractPdfTextWithLayout(file);

  if (!fullText.trim()) {
    fullText =
      "[This PDF appears to be a scanned/image-based document with no embedded text layer. To convert scanned PDFs, OCR processing is required. Please use a PDF with a text layer for best results.]";
  }

  let contentBlob: Blob;

  if (ext === "docx") {
    contentBlob = createDocxArchive(fullText, file.name);
  } else if (ext === "doc") {
    const docHtml = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>${escapeXml(file.name)}</title><style>body { font-family: 'Calibri', 'Arial', sans-serif; font-size: 11pt; line-height: 1.5; padding: 2cm; }</style></head><body>${fullText
      .split("\n")
      .map((p) => `<p>${escapeXml(p) || "&nbsp;"}</p>`)
      .join("")}</body></html>`;
    contentBlob = new Blob([docHtml], {
      type: "application/vnd.ms-word;charset=utf-8",
    });
  } else if (ext === "html") {
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${escapeXml(file.name)}</title><style>body{font-family:sans-serif;max-width:800px;margin:2rem auto;line-height:1.6;padding:1rem;}</style></head><body>${fullText
      .split("\n")
      .map((p) => `<p>${escapeXml(p)}</p>`)
      .join("")}</body></html>`;
    contentBlob = new Blob([html], { type: "text/html;charset=utf-8" });
  } else {
    const mimeMap: Record<string, string> = {
      txt: "text/plain",
      rtf: "application/rtf",
      md: "text/markdown",
    };
    contentBlob = new Blob([fullText], {
      type: mimeMap[ext] || "text/plain;charset=utf-8",
    });
  }

  return URL.createObjectURL(contentBlob);
}

/**
 * Text/Document → PDF using jsPDF text rendering
 */
async function convertTextToPdf(file: File): Promise<string> {
  const text = await file.text();
  const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 50;
  const lines = doc.splitTextToSize(text, pageWidth - margin * 2);
  doc.setFont("courier", "normal");
  doc.setFontSize(10);
  let y = margin;
  for (const line of lines) {
    if (y > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }
    doc.text(line, margin, y);
    y += 14;
  }
  const blob = doc.output("blob");
  return URL.createObjectURL(blob);
}

/**
 * Document → Document text conversions (TXT, MD, JSON, CSV, HTML, XML, etc.)
 */
async function convertDocumentToDocument(
  file: File,
  ext: string,
  fileName: string
): Promise<string> {
  const text = await file.text();
  let formattedText = text;

  if (ext === "json" && fileName.endsWith(".csv")) {
    const lines = text.split("\n").filter(Boolean);
    const headers = lines[0]?.split(",") || [];
    const result = lines.slice(1).map((l) => {
      const vals = l.split(",");
      const obj: Record<string, string | undefined> = {};
      headers.forEach((h, idx) => {
        obj[h.trim()] = vals[idx]?.trim();
      });
      return obj;
    });
    formattedText = JSON.stringify(result, null, 2);
  } else if (ext === "csv" && fileName.endsWith(".json")) {
    try {
      const arr = JSON.parse(text);
      if (Array.isArray(arr) && arr.length > 0) {
        const keys = Object.keys(arr[0]);
        formattedText = [
          keys.join(","),
          ...arr.map((o: Record<string, unknown>) =>
            keys.map((k) => JSON.stringify(o[k] ?? "")).join(",")
          ),
        ].join("\n");
      }
    } catch {
      /* keep original */
    }
  } else if (ext === "docx") {
    return URL.createObjectURL(createDocxArchive(formattedText, file.name));
  } else if (ext === "doc") {
    const docHtml = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>${file.name}</title><style>body { font-family: 'Calibri', 'Arial', sans-serif; font-size: 11pt; line-height: 1.5; padding: 2cm; }</style></head><body>${formattedText
      .split("\n")
      .map((p) => `<p>${p || "&nbsp;"}</p>`)
      .join("")}</body></html>`;
    return URL.createObjectURL(
      new Blob([docHtml], { type: "application/vnd.ms-word;charset=utf-8" })
    );
  }

  const mimeMap: Record<string, string> = {
    txt: "text/plain",
    md: "text/markdown",
    json: "application/json",
    csv: "text/csv",
    html: "text/html",
    xml: "text/xml",
    rtf: "application/rtf",
  };
  const blob = new Blob([formattedText], {
    type: mimeMap[ext] || "text/plain",
  });
  return URL.createObjectURL(blob);
}

// ─── File Compression (ZIP) ────────────────────────────────────────────────

/**
 * Compress a file into a ZIP archive using a minimal ZIP builder.
 * Uses the Deflate algorithm via CompressionStream API (modern browsers).
 */
async function compressFileToZip(file: File): Promise<string> {
  const enc = new TextEncoder();
  const fileData = new Uint8Array(await file.arrayBuffer());
  const fileName = file.name || "compressed_file";

  // Try to compress using DeflateRaw via CompressionStream
  let compressedData: Uint8Array;
  let compressionMethod = 0; // 0 = stored, 8 = deflate

  if (typeof CompressionStream !== "undefined") {
    try {
      const cs = new CompressionStream("deflate-raw");
      const writer = cs.writable.getWriter();
      const reader = cs.readable.getReader();

      const chunks: Uint8Array[] = [];
      const readAll = (async () => {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          chunks.push(value);
        }
      })();

      writer.write(fileData);
      writer.close();
      await readAll;

      let totalLen = 0;
      for (const c of chunks) totalLen += c.length;
      compressedData = new Uint8Array(totalLen);
      let pos = 0;
      for (const c of chunks) {
        compressedData.set(c, pos);
        pos += c.length;
      }
      compressionMethod = 8;
    } catch {
      // Fallback to stored (no compression)
      compressedData = fileData;
      compressionMethod = 0;
    }
  } else {
    // No CompressionStream support — store uncompressed
    compressedData = fileData;
    compressionMethod = 0;
  }

  const fileCrc = crc32(fileData);
  const nameBytes = enc.encode(fileName);
  const uncompressedSize = fileData.length;
  const compressedSize = compressedData.length;

  // Build Local File Header
  const lh = new Uint8Array(30 + nameBytes.length + compressedSize);
  const lhView = new DataView(lh.buffer);
  lhView.setUint32(0, 0x04034b50, true);  // Local file header signature
  lhView.setUint16(4, 20, true);           // Version needed
  lhView.setUint16(6, 0, true);            // General purpose bit flag
  lhView.setUint16(8, compressionMethod, true); // Compression method
  lhView.setUint32(10, 0, true);           // Mod time/date
  lhView.setUint32(14, fileCrc, true);     // CRC-32
  lhView.setUint32(18, compressedSize, true);   // Compressed size
  lhView.setUint32(22, uncompressedSize, true); // Uncompressed size
  lhView.setUint16(26, nameBytes.length, true); // File name length
  lhView.setUint16(28, 0, true);           // Extra field length
  lh.set(nameBytes, 30);
  lh.set(compressedData, 30 + nameBytes.length);

  // Build Central Directory Header
  const cd = new Uint8Array(46 + nameBytes.length);
  const cdView = new DataView(cd.buffer);
  cdView.setUint32(0, 0x02014b50, true);  // Central directory header signature
  cdView.setUint16(4, 20, true);           // Version made by
  cdView.setUint16(6, 20, true);           // Version needed
  cdView.setUint16(8, 0, true);            // General purpose bit flag
  cdView.setUint16(10, compressionMethod, true); // Compression method
  cdView.setUint32(12, 0, true);           // Mod time/date
  cdView.setUint32(16, fileCrc, true);     // CRC-32
  cdView.setUint32(20, compressedSize, true);   // Compressed size
  cdView.setUint32(24, uncompressedSize, true); // Uncompressed size
  cdView.setUint16(28, nameBytes.length, true); // File name length
  cdView.setUint16(30, 0, true);           // Extra field length
  cdView.setUint16(32, 0, true);           // File comment length
  cdView.setUint16(34, 0, true);           // Disk number start
  cdView.setUint16(36, 0, true);           // Internal file attributes
  cdView.setUint32(38, 0, true);           // External file attributes
  cdView.setUint32(42, 0, true);           // Relative offset of local header
  cd.set(nameBytes, 46);

  // Build End of Central Directory
  const eocd = new Uint8Array(22);
  const eocdView = new DataView(eocd.buffer);
  eocdView.setUint32(0, 0x06054b50, true);
  eocdView.setUint16(4, 0, true);
  eocdView.setUint16(6, 0, true);
  eocdView.setUint16(8, 1, true);          // Total entries this disk
  eocdView.setUint16(10, 1, true);         // Total entries
  eocdView.setUint32(12, cd.length, true); // Central directory size
  eocdView.setUint32(16, lh.length, true); // Offset of central directory
  eocdView.setUint16(20, 0, true);         // Comment length

  const zipBlob = new Blob(
    [new Uint8Array(lh), new Uint8Array(cd), new Uint8Array(eocd)],
    { type: "application/zip" }
  );

  return URL.createObjectURL(zipBlob);
}

// ─── Main Conversion Router ───────────────────────────────────────────────

/**
 * Routes the conversion to the appropriate handler based on file type and
 * target format. Returns a Blob URL pointing to the converted file.
 */
export async function generateOfflineConversion(
  file: File,
  targetFmt: string
): Promise<string> {
  const ext = targetFmt.toLowerCase();
  const fileName = file.name.toLowerCase();
  const isImg =
    file.type.startsWith("image/") ||
    ["jpg", "jpeg", "png", "webp", "gif", "heic", "avif", "svg", "bmp", "tiff", "ico"].some(
      (e) => fileName.endsWith("." + e)
    );
  const isPdf =
    file.type === "application/pdf" || fileName.endsWith(".pdf");
  const isDocx =
    file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    fileName.endsWith(".docx");
  const isDoc =
    file.type.startsWith("text/") ||
    [
      "txt", "md", "json", "csv", "html", "xml", "log", "docx", "doc", "rtf",
      "xlsx", "xls", "pptx", "ppt", "epub",
    ].some((e) => fileName.endsWith("." + e));

  const imageExts = ["png", "jpg", "jpeg", "webp", "bmp", "ico", "tiff", "svg", "opt", "compress"];

  // 0. File compression (ZIP)
  if (ext === "zip") {
    return compressFileToZip(file);
  }

  // 1. DOCX → PDF (mammoth-based — the key fix)
  if (ext === "pdf" && isDocx) {
    return convertDocxToPdf(file);
  }

  // 2. Image → PDF
  if (ext === "pdf" && isImg && !isPdf) {
    return convertImageToPdf(file, fileName);
  }

  // 3. Image → Image
  if (imageExts.includes(ext) && isImg && !isPdf) {
    return convertImageToImage(file, ext);
  }

  // 4. PDF → Image
  if (imageExts.includes(ext) && isPdf) {
    return convertPdfToImage(file, ext);
  }

  // 5. PDF → Document (DOCX, DOC, TXT, etc.)
  if (["docx", "doc", "txt", "rtf", "md", "html"].includes(ext) && isPdf) {
    return convertPdfToDocument(file, ext);
  }

  // 6. Text/Document → PDF
  if (ext === "pdf" && isDoc) {
    if (isPdf) {
      // PDF → PDF (pass-through for compressor)
      return URL.createObjectURL(
        new Blob([await file.arrayBuffer()], { type: "application/pdf" })
      );
    }
    return convertTextToPdf(file);
  }

  // 7. Document → Document
  if (
    ["txt", "md", "json", "csv", "html", "xml", "rtf", "docx", "doc"].includes(ext) &&
    isDoc
  ) {
    return convertDocumentToDocument(file, ext, fileName);
  }

  // 8. Fallback: return original file as blob URL
  return URL.createObjectURL(file);
}
