from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.http import JsonResponse
from django.urls import path, include
from django.views.static import serve
from django.urls import re_path

def health(request):  # handy for Render health checks and uptime pings
    return JsonResponse({"status": "ok"})

urlpatterns = [path("", health), path("admin/", admin.site.urls), path("api/", include("api.urls"))]
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
else:  # local-disk uploads (only used when Cloudinary is not configured)
    urlpatterns += [re_path(r"^media/(?P<path>.*)$", serve, {"document_root": settings.MEDIA_ROOT})]
