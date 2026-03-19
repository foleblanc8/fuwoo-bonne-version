FROM python:3.12-slim

WORKDIR /app

# Dépendances système pour psycopg2
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq-dev gcc && rm -rf /var/lib/apt/lists/*

# Installer les dépendances Python
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copier le projet (sans node_modules)
COPY . .

EXPOSE 8000

CMD python3 manage.py migrate --noinput && \
    python3 manage.py collectstatic --noinput && \
    gunicorn backend.wsgi --workers 2 --threads 4 --bind 0.0.0.0:${PORT:-8000}
