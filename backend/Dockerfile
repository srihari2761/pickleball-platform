FROM python:3.11-slim

WORKDIR /app

COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ .

# Use shell form to allow environment variable expansion
CMD sh -c "python -m uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}"
