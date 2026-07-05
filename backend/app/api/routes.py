import os
import json
import asyncio
from typing import Optional
from fastapi import APIRouter, UploadFile, File, HTTPException, status, BackgroundTasks
from fastapi.responses import StreamingResponse, FileResponse
from pydantic import BaseModel
from app.core.config import settings
from app.services.file_manager import save_upload_file
from app.queue.redis_client import update_job_status, get_job_status, get_redis_client

router = APIRouter(prefix=settings.API_PREFIX, tags=["Conversion"])

class ConvertRequest(BaseModel):
    target_format: str

@router.post("/upload", status_code=status.HTTP_201_CREATED)
async def upload_file(file: UploadFile = File(...)):
    """
    Upload endpoint (§8.3): Does MIME + size validation and stores ephemeral file (§9).
    Returns job_id and metadata.
    """
    try:
        job_id, filepath, size_bytes, detected_mime = await save_upload_file(file)
        
        # Initialize job state in Redis
        await update_job_status(
            job_id=job_id,
            status="idle",
            progress=0,
            message="File ready for conversion.",
        )
        
        # Store filepath and mime in Redis hash for later conversion pickup
        r = await get_redis_client()
        await r.hset(f"convertly:job:{job_id}", mapping={
            "filepath": filepath,
            "filename": file.filename or "untitled",
            "mime_type": detected_mime,
            "size_bytes": str(size_bytes)
        })
        
        return {
            "job_id": job_id,
            "filename": file.filename or "untitled",
            "size_bytes": size_bytes,
            "mime_type": detected_mime
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.post("/convert/{job_id}")
async def start_conversion(job_id: str, request: ConvertRequest):
    """
    Enqueues conversion job to arq task queue (§8.2, §8.3).
    """
    job_data = await get_job_status(job_id)
    if not job_data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found or expired.")
        
    filepath = job_data.get("filepath")
    if not filepath or not os.path.exists(filepath):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Source file expired or missing.")
        
    target_format = request.target_format.lower().strip(".")
    
    await update_job_status(job_id, "validating", 5, f"Queued for conversion to {target_format.upper()}...")
    
    # Try to enqueue job via arq pool if running, else run background task or inline in dev
    try:
        from arq import create_pool
        from arq.connections import RedisSettings
        redis_settings = RedisSettings.from_dsn(settings.REDIS_URL)
        pool = await create_pool(redis_settings)
        await pool.enqueue_job("run_conversion_job", job_id, filepath, target_format)
        await pool.close()
    except Exception as e:
        # Fallback for local testing without separate arq worker running
        from app.workers.main import run_conversion_job
        asyncio.create_task(run_conversion_job({}, job_id, filepath, target_format))
        
    return {"status": "enqueued", "job_id": job_id, "target_format": target_format}

@router.get("/status/{job_id}")
async def stream_job_status(job_id: str):
    """
    Server-Sent Events (SSE) progress streaming endpoint (§8.1, §8.3).
    """
    async def event_generator():
        last_state = None
        retained_count = 0
        while True:
            job_data = await get_job_status(job_id)
            if not job_data:
                yield f"data: {json.dumps({'status': 'error', 'message': 'Job expired or not found.'})}\n\n"
                break
                
            current_state = json.dumps(job_data)
            if current_state != last_state:
                last_state = current_state
                yield f"data: {current_state}\n\n"
                
            status_val = job_data.get("status")
            if status_val in ("success", "error"):
                retained_count += 1
                if retained_count >= 3:  # Send completion state a couple times then close stream
                    break
                    
            await asyncio.sleep(0.4)
            
    return StreamingResponse(event_generator(), media_type="text/event-stream")

@router.get("/download/{job_id}")
async def download_file(job_id: str):
    """
    Download endpoint (§8.3): Returns generated file with appropriate headers.
    """
    job_data = await get_job_status(job_id)
    if not job_data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job expired or not found.")
        
    if job_data.get("status") != "success":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="File conversion not yet completed.")
        
    orig_name = job_data.get("filename", "converted_file")
    base_name = os.path.splitext(orig_name)[0]
    
    # Find matching output file in output directory strictly by job_id UUID
    for fname in os.listdir(settings.OUTPUT_DIR):
        if fname.startswith(job_id):
            fpath = os.path.join(settings.OUTPUT_DIR, fname)
            if os.path.isfile(fpath):
                ext = os.path.splitext(fname)[1]
                download_name = f"{base_name}_convertly{ext}"
                return FileResponse(
                    path=fpath,
                    filename=download_name,
                    media_type="application/octet-stream",
                    headers={"Content-Disposition": f'attachment; filename="{download_name}"'}
                )
                
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Output file not found on server.")
