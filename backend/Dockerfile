FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=off

# Install system dependencies & conversion binaries (§4)
# ffmpeg for audio/video, libreoffice for documents, imagemagick for images, poppler-utils/ghostscript for PDF, pandoc
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    libreoffice \
    imagemagick \
    poppler-utils \
    ghostscript \
    pandoc \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Create non-root user for sandboxed subprocess execution (§8.2)
RUN useradd -m -u 1000 convertly && \
    mkdir -p /tmp/convertly/uploads /tmp/convertly/outputs && \
    chown -R convertly:convertly /app /tmp/convertly

COPY pyproject.toml ./
RUN pip install --no-cache-dir -e .

COPY . .
RUN chown -R convertly:convertly /app

USER convertly

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
