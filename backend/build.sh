#!/usr/bin/env bash
# Render build script: install, collect static files, create/upgrade tables, make the admin user.
set -o errexit
pip install -r requirements.txt
python manage.py collectstatic --no-input
python manage.py makemigrations api --no-input   # no-op when migrations are already committed
python manage.py migrate --no-input
# Creates the dashboard login from env vars the first time; ignored afterwards.
python manage.py createsuperuser --no-input || true
# Forgot the dashboard password? Change DJANGO_SUPERUSER_PASSWORD in Render and redeploy: it is applied here.
python manage.py shell <<'PYEOF'
import os
from django.contrib.auth import get_user_model
name, pw = os.environ.get("DJANGO_SUPERUSER_USERNAME"), os.environ.get("DJANGO_SUPERUSER_PASSWORD")
user = get_user_model().objects.filter(username=name).first() if name else None
if user and pw:
    user.set_password(pw); user.is_staff = user.is_superuser = True; user.save()
    print("Dashboard password synced from DJANGO_SUPERUSER_PASSWORD")
PYEOF