FROM python:3.10-slim
WORKDIR /app
RUN apt-get update && apt-get install -y gcc g++ make curl git build-essential
COPY requirements.txt .
RUN pip install --no-cache-dir --default-timeout=1000 accelerate transformers fastapi uvicorn pydantic psycopg2-binary redis httpx
COPY src/ ./src/
COPY models/ ./models/
EXPOSE 8000
CMD ["uvicorn", "src.api.main:app", "--host", "0.0.0.0", "--port", "8000"]
