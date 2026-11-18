# Shoba Niki J – Portfolio (React + Django + PostgreSQL)

## 1. Database
No setup needed locally: without `DB_PASSWORD` the backend uses a SQLite file (`db.sqlite3`).
To use PostgreSQL instead, create an empty database named `portfolio` and set `$env:DB_PASSWORD` to YOUR postgres password (the one you chose when installing PostgreSQL).

## 2. Backend
```
cd backend
python -m venv venv && venv\Scripts\activate        # macOS/Linux: source venv/bin/activate
pip install -r requirements.txt                       # if psycopg2-binary fails: pip install "psycopg[binary]"
$env:DB_PASSWORD="your_postgres_password"             # PowerShell; repeat in each new window
python manage.py makemigrations api
python manage.py migrate
python manage.py createsuperuser                      # this account signs in to the dashboard
python manage.py runserver
```

### Get contact messages in your Gmail
Create a Gmail App Password (Google Account > Security > 2-Step Verification > App passwords), then in the same window as runserver:
```
$env:EMAIL_HOST_USER="you@gmail.com"
$env:EMAIL_HOST_PASSWORD="your16letterapppassword"
```
Without these, messages are still saved (dashboard) and printed in the backend terminal.

## 3. Frontend
```
cd frontend
npm install
npm run dev
```
- Portfolio: http://localhost:5173 (pages: #/about, #/projects, #/gallery, #/education, #/contact)
- Dashboard: http://localhost:5173/#/dashboard (sign in with the superuser)
- Raw Django admin (backup): http://localhost:8000/admin

## Dashboard
Upload your profile photo, add/edit/delete projects with screenshots, add Gallery images, manage skills and education, and read contact-form messages.
Uploaded images are stored in `backend/media/`.

## Deploying
See DEPLOY.md for the step-by-step guide (Render backend + Vercel frontend).

### Older notes
`npm run build` and host `frontend/dist`; host the backend with persistent storage for `media/` (or add S3-style storage).
Set `VITE_API_URL`, `CORS_ORIGINS`, `ALLOWED_HOSTS`, `DEBUG=False`, a real `SECRET_KEY`, and serve `/media/` from your host.

## Adding projects or images after deploy
Open `/#/dashboard` on your live site, sign in, and use **Projects** or **Gallery images**. No code change or redeploy is needed.
After pulling this update run `python manage.py makemigrations api && python manage.py migrate` once (new Gallery table and project label/notice fields).
On free hosts (Render) uploaded files can disappear when the server restarts; use persistent storage or cloud storage such as Cloudinary or S3 for `media/`.
