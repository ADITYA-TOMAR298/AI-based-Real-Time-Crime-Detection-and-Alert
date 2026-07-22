FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=7860 \
    DATA_DIR=/tmp/crime_detection

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends libgl1 libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

COPY Requirements.txt ./
RUN pip install --no-cache-dir -r Requirements.txt

COPY backend ./backend
COPY third_party ./third_party
COPY models ./models

RUN mkdir -p /tmp/crime_detection/snapshots /tmp/crime_detection/criminal_photos

EXPOSE 7860

CMD sh -c "uvicorn backend.api:app --host 0.0.0.0 --port ${PORT}"
