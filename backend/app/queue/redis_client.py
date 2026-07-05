import json
import time
from typing import Optional, Dict, Any
import redis.asyncio as redis
from app.core.config import settings

# Global redis client instance
_redis_client: Optional[redis.Redis] = None

async def get_redis_client() -> redis.Redis:
    global _redis_client
    if _redis_client is None:
        _redis_client = redis.from_url(settings.REDIS_URL, decode_responses=True)
    return _redis_client

async def update_job_status(
    job_id: str,
    status: str,
    progress: int,
    message: str = "",
    error: Optional[str] = None,
    output_url: Optional[str] = None
):
    """
    Updates the job status in a Redis hash keyed by job_id (§8.2).
    Also publishes to a pub/sub channel for immediate SSE push notification.
    """
    r = await get_redis_client()
    key = f"filegrave:job:{job_id}"
    
    data = {
        "job_id": job_id,
        "status": status,       # idle, validating, uploading, processing, success, error
        "progress": str(progress),
        "message": message,
        "updated_at": str(time.time()),
    }
    if error:
        data["error"] = error
    if output_url:
        data["output_url"] = output_url
        
    await r.hset(key, mapping=data)
    # Set TTL on job state to match file TTL + extra buffer (e.g. 1 hour)
    await r.expire(key, settings.FILE_TTL_SECONDS + 3600)
    
    # Publish to pub/sub for real-time SSE subscribers
    await r.publish(f"filegrave:pubsub:{job_id}", json.dumps(data))

async def get_job_status(job_id: str) -> Optional[Dict[str, Any]]:
    r = await get_redis_client()
    key = f"filegrave:job:{job_id}"
    data = await r.hgetall(key)
    if not data:
        return None
    # convert progress back to int
    if "progress" in data:
        try:
            data["progress"] = int(data["progress"])
        except ValueError:
            data["progress"] = 0
    return data
