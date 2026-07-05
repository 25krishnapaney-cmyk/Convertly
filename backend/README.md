# File Grave Backend

FastAPI asynchronous backend for File Grave, featuring:
- Celery / arq Redis asynchronous job queue
- MIME magic byte validation and virus scanning hooks
- Ephemeral storage management with strict TTL cleanup
