#!/bin/bash
set -e

echo "=== Migrate ==="
python3 manage.py migrate --noinput

echo "=== Collectstatic ==="
python3 manage.py collectstatic --noinput --clear || echo "collectstatic warning (non-fatal)"

echo "=== Starting gunicorn on port ${PORT:-8000} ==="
exec gunicorn backend.wsgi --workers 2 --threads 4 --bind 0.0.0.0:${PORT:-8000}
