web: gunicorn backend.wsgi --workers 2 --threads 4 --bind 0.0.0.0:$PORT
release: python manage.py migrate --noinput && python manage.py collectstatic --noinput
