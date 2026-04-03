# ─── Stage 1: install dependencies ──────────────────────
FROM python:3.12-slim AS builder

# install uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /bin/uv

WORKDIR /app
COPY pyproject.toml uv.lock ./

# install deps into .venv (no dev deps)
RUN uv sync --frozen --no-dev

# ─── Stage 2: runtime ────────────────────────────────────
FROM python:3.12-slim

WORKDIR /app

# copy virtualenv from builder
COPY --from=builder /app/.venv ./.venv

# copy app source
COPY src ./src
COPY main.py .

ENV PATH="/app/.venv/bin:$PATH"
ENV PYTHONUNBUFFERED=1
ENV RELOAD=false
ENV PORT=8000

# database volume
VOLUME /data

EXPOSE 8000

CMD ["python", "main.py"]
