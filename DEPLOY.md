# Deploy: backend on Render, frontend on Vercel

## 0. Put the project on GitHub
Push the whole `portfolio` folder (with `backend/` and `frontend/`) to one GitHub repository.
On your computer, run `python manage.py makemigrations api` once inside `backend/` and commit the new `backend/api/migrations/` folder.
Do not commit `db.sqlite3` or `media/`.

## 1. Backend on Render
1. In Render choose **New + > Blueprint**, pick your repository. It reads `render.yaml` and creates the web service and a free PostgreSQL database.
2. When it asks for the values marked `sync: false`, fill in:
   - `DJANGO_SUPERUSER_USERNAME`, `DJANGO_SUPERUSER_EMAIL`, `DJANGO_SUPERUSER_PASSWORD`: your dashboard login (created automatically on first deploy).
   - `CORS_ORIGINS`: your Vercel address, for example `https://shoba-portfolio.vercel.app` (no slash at the end). Leave it blank for now and add it after step 2.
   - `CSRF_TRUSTED_ORIGINS`: your Vercel address and your Render address, separated by a comma.
3. After the first deploy, open `https://YOUR-SERVICE.onrender.com/` and you should see `{"status": "ok"}`.

## 2. Frontend on Vercel
1. In Vercel choose **Add New > Project**, import the same repository.
2. Set **Root Directory** to `frontend`. Vercel detects Vite.
3. Add the environment variable `VITE_API_URL` = `https://YOUR-SERVICE.onrender.com/api`
4. Deploy. Copy the Vercel address, go back to Render, and put it in `CORS_ORIGINS` and `CSRF_TRUSTED_ORIGINS`, then let Render redeploy.

## 3. Add projects and images later
Open `https://YOUR-VERCEL-ADDRESS/#/dashboard` and sign in with the login from step 1.2. Use **Projects** and **Gallery images**. No redeploy is needed.

## Get contact-form messages in your Gmail
Messages are always saved in the dashboard (**Messages** tab). To also get them by email:
- **On your computer:** set `EMAIL_HOST_USER` (your Gmail), `EMAIL_HOST_PASSWORD` (a Gmail App Password) and `NOTIFY_EMAIL` before `python manage.py runserver`. Without them, emails are only printed in the terminal.
- **On Render:** the free plan blocks Gmail/SMTP, so use Resend. Sign up at resend.com with your Gmail, create an API key, then set `RESEND_API_KEY` and `NOTIFY_EMAIL` (the same Gmail) in Render. Resend's free test sender can only deliver to the email you signed up with, which is exactly what you need. Replies go to the visitor because `Reply-To` is set.

## Images and Render's free plan
Render's free web service has no permanent disk. Uploaded images saved on it are lost on every restart or redeploy.
Fix: create a free Cloudinary account, copy the **API environment variable** (`cloudinary://...`) and set it as `CLOUDINARY_URL` in Render. Uploads are then stored on Cloudinary permanently.
The screenshots in `frontend/public/screens/` are part of the Vercel build, so they are never lost.

## Good to know
- The free Render service sleeps after a while with no visitors. The first request after that can take up to a minute. The portfolio shows its built-in content right away, then swaps in dashboard content when the backend wakes up.
- Check Render's current free database limits: free databases have been time-limited, so keep a backup or move to a paid plan before a job application deadline.
- `DEBUG` is `False` on Render, so use a real `SECRET_KEY` (the Blueprint generates one).
