import os
import time
import uuid
import asyncio
import aiofiles
from typing import Tuple, Optional
from fastapi import UploadFile, HTTPException, status
from app.core.config import settings

# Magic byte signatures for content sniffing (§9)
MAGIC_SIGNATURES = {
    b"\xFF\xD8\xFF": "image/jpeg",
    b"\x89PNG\r\n\x1a\n": "image/png",
    b"GIF87a": "image/gif",
    b"GIF89a": "image/gif",
    b"RIFF": "image/webp",  # RIFF....WEBP
    b"%PDF": "application/pdf",
    b"\x00\x00\x00\x18ftyp": "video/mp4",
    b"\x00\x00\x00\x1Cftyp": "video/mp4",
    b"\x00\x00\x00\x20ftyp": "video/mp4",
    b"\x1a\x45\xdf\xa3": "video/webm", # Matroska / WebM
    b"ID3": "audio/mpeg",
    b"\xFF\xFB": "audio/mpeg",
    b"OggS": "audio/ogg",
    b"RIFF....WAVE": "audio/wav",
    b"PK\x03\x04": "application/zip", # DOCX, XLSX, PPTX, etc.
}

async def sniff_mime_type(file: UploadFile) -> str:
    """
    Sniffs MIME type from file header magic bytes (§9).
    Falls back to content_type header if signature is complex or containerized.
    """
    header = await file.read(16)
    await file.seek(0)
    
    for sig, mime in MAGIC_SIGNATURES.items():
        if header.startswith(sig):
            return mime
        if len(sig) == 4 and sig == b"RIFF" and header[8:12] in (b"WEBP", b"WAVE"):
            return "image/webp" if header[8:12] == b"WEBP" else "audio/wav"
            
    # Default fallback to browser provided content type or octet-stream
    return file.content_type or "application/octet-stream"

def validate_file_size(size_bytes: int, mime_type: str):
    """
    Enforces strict file size caps based on format category (§9).
    """
    if mime_type.startswith("image/"):
        limit = settings.MAX_IMAGE_SIZE_BYTES
        label = "25MB"
    elif mime_type.startswith("video/"):
        limit = settings.MAX_VIDEO_SIZE_BYTES
        label = "500MB"
    elif mime_type.startswith("audio/"):
        limit = settings.MAX_AUDIO_SIZE_BYTES
        label = "100MB"
    else:
        limit = settings.MAX_DOCUMENT_SIZE_BYTES
        label = "50MB"
        
    if size_bytes > limit:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File exceeds maximum allowed size of {label} for this file category."
        )

async def save_upload_file(file: UploadFile) -> Tuple[str, str, int, str]:
    """
    Saves upload to ephemeral storage using randomized UUID filename (§9).
    Returns (job_id, filepath, size_bytes, detected_mime).
    """
    job_id = str(uuid.uuid4())
    detected_mime = await sniff_mime_type(file)
    
    # Extract extension or infer from MIME and sanitize against traversal/executables
    orig_ext = os.path.splitext(file.filename or "")[1].lower()
    dangerous_exts = {".exe", ".sh", ".bat", ".cmd", ".php", ".py", ".pl", ".js", ".vbs", ".msi", ".dll", ".scr", ".pif", ".csh"}
    if not orig_ext or orig_ext in dangerous_exts:
        ext_map = {
            "image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp",
            "application/pdf": ".pdf", "video/mp4": ".mp4", "audio/mpeg": ".mp3"
        }
        orig_ext = ext_map.get(detected_mime, ".bin")
        
    # Sanitize characters in extension
    orig_ext = "".join(c for c in orig_ext if c.isalnum() or c == ".")[:10]
    safe_filename = f"{job_id}{orig_ext}"
    filepath = os.path.join(settings.UPLOAD_DIR, safe_filename)
    
    size_bytes = 0
    async with aiofiles.open(filepath, 'wb') as out_file:
        while chunk := await file.read(65536):
            size_bytes += len(chunk)
            # Inline size check during streaming read to prevent disk DoS
            validate_file_size(size_bytes, detected_mime)
            await out_file.write(chunk)
            
    return job_id, filepath, size_bytes, detected_mime

async def cleanup_expired_files():
    """
    Hard TTL background check (§8.1, §9): Deletes any files older than 30 minutes
    in uploads and outputs directories.
    """
    now = time.time()
    for directory in [settings.UPLOAD_DIR, settings.OUTPUT_DIR]:
        if not os.path.exists(directory):
            continue
        for fname in os.listdir(directory):
            fpath = os.path.join(directory, fname)
            if os.path.isfile(fpath):
                try:
                    mtime = os.path.getmtime(fpath)
                    if now - mtime > settings.FILE_TTL_SECONDS:
                        os.remove(fpath)
                except Exception:
                    pass
