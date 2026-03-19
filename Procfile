web: python3 manage.py migrate --noinput && python3 manage.py collectstatic --noinput && gunicorn backend.wsgi --workers 2 --threads 4 --bind 0.0.0.0:$PORT
