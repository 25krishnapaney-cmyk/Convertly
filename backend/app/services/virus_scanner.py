import asyncio
import shutil
import logging
from fastapi import HTTPException, status

logger = logging.getLogger("filegrave.scanner")

async def scan_file_for_viruses(filepath: str) -> bool:
    """
    Scans file using ClamAV (§9) before any conversion job runs.
    If ClamAV (clamscan) is installed, runs an async subprocess scan.
    If ClamAV is not present (e.g. local dev without clamd), logs warning and allows file.
    """
    clamscan_path = shutil.which("clamscan")
    if not clamscan_path:
        logger.warning(f"ClamAV (clamscan) binary not found on PATH. Skipping virus scan for {filepath}.")
        return True
        
    try:
        proc = await asyncio.create_subprocess_exec(
            clamscan_path,
            "--no-summary",
            filepath,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE
        )
        stdout, stderr = await proc.communicate()
        
        # clamscan returns 0 for clean, 1 for virus found, 2 for error
        if proc.returncode == 1:
            logger.error(f"Virus detected in file {filepath}: {stdout.decode()}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Security violation: Virus or malware signature detected in uploaded file."
            )
        elif proc.returncode != 0:
            logger.warning(f"ClamAV scan error for {filepath}: {stderr.decode()}")
            
        return True
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error during virus scan: {str(e)}")
        # Fail safe or allow with warning based on strict security policy
        return True
