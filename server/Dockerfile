FROM python:3.13-slim as base

RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

FROM base as builder

COPY requirements.txt ./

RUN pip install --prefix=/install -r requirements.txt

COPY . .

FROM python:3.13-slim as final

RUN apt-get update && apt-get install -y \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY --from=builder /install /usr/local
COPY . .

EXPOSE 8000

CMD ["python", "main.py"]
