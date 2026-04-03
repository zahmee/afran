# ─── Stage 1: install dependencies ──────────────────────
FROM python:3.12-slim AS builder

COPY --from=ghcr.io/astral-sh/uv:latest /uv /bin/uv

WORKDIR /app
COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-dev

# ─── Stage 2: runtime ────────────────────────────────────
FROM python:3.12-slim

COPY --from=ghcr.io/astral-sh/uv:latest /uv /bin/uv

WORKDIR /app

COPY --from=builder /app/.venv ./.venv
COPY src ./src
COPY main.py .
COPY pyproject.toml uv.lock ./

ENV PYTHONUNBUFFERED=1
ENV RELOAD=false
ENV PORT=8000

VOLUME /data

EXPOSE 8000

CMD ["uv", "run", "python", "main.py"]
