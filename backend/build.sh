#!/usr/bin/env bash
# Render build script: install, collect static files, create/upgrade tables, make the admin user.
set -o errexit
pip install -r requirements.txt
python manage.py collectstatic --no-input
python manage.py makemigrations api --no-input   # no-op when migrations are already committed
python manage.py migrate --no-input
# Creates the dashboard login from env vars the first time; ignored afterwards.
python manage.py createsuperuser --no-input || true
