import json
import logging
import re
import urllib.request
from django.conf import settings
from django.core.mail import EmailMessage
from django.http import Http404, HttpResponse
from django.utils import timezone
from rest_framework import viewsets, mixins
from rest_framework.decorators import api_view
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Skill, Project, Education, Message, Profile, GalleryImage
from .serializers import SkillSerializer, ProjectSerializer, EducationSerializer, MessageSerializer, ProfileSerializer, GallerySerializer

def send_with_resend(subject, body, reply_to):
    """Email through Resend's HTTPS API. Render's free plan blocks SMTP, so Gmail SMTP cannot be used there."""
    req = urllib.request.Request(
        "https://api.resend.com/emails",
        data=json.dumps({"from": settings.RESEND_FROM, "to": [settings.NOTIFY_EMAIL], "reply_to": reply_to,
                         "subject": subject, "text": body}).encode(),
        headers={"Authorization": f"Bearer {settings.RESEND_API_KEY}", "Content-Type": "application/json",
                 "User-Agent": "portfolio-backend/1.0"},
    )
    urllib.request.urlopen(req, timeout=10).read()

MAX_RESUME = 5 * 1024 * 1024

def resume_version(profile):
    """Changes every time a new resume is uploaded, so browsers never show an old copy."""
    return int(profile.resume_updated.timestamp()) if profile.resume_data and profile.resume_updated else None

# ---- public ----
@api_view(["GET"])
def resume(request):
    p = Profile.get()
    if not p.resume_data:
        raise Http404("No resume uploaded yet")
    name = re.sub(r"[^A-Za-z0-9._ -]", "", p.resume_name or "") or "resume.pdf"
    r = HttpResponse(bytes(p.resume_data), content_type="application/pdf")
    r["Content-Disposition"] = f'{"attachment" if request.GET.get("download") else "inline"}; filename="{name}"'
    r["Cache-Control"] = "public, max-age=300"
    return r

@api_view(["GET"])
def portfolio(request):
    ctx = {"request": request}
    return Response({
        "photo": ProfileSerializer(Profile.get(), context=ctx).data["photo"],
        "resume": resume_version(Profile.get()),  # None until a PDF is uploaded in the dashboard
        "skills": SkillSerializer(Skill.objects.all(), many=True).data,
        "projects": ProjectSerializer(Project.objects.all(), many=True, context=ctx).data,
        "education": EducationSerializer(Education.objects.all(), many=True).data,
        "gallery": [{"src": g["image"], "project": g["project"], "caption": g["caption"]}
                    for g in GallerySerializer(GalleryImage.objects.all(), many=True, context=ctx).data],
    })

@api_view(["POST"])
def contact(request):
    s = MessageSerializer(data=request.data)
    s.is_valid(raise_exception=True)
    m = s.save()
    try:  # the message is already saved; an email problem must not lose it
        name = " ".join(m.name.split())
        subject = f"New message from {name} <{m.email}>"
        body = f"Name: {name}\nEmail: {m.email}\n\n{m.body}"
        if settings.RESEND_API_KEY:
            send_with_resend(subject, body, m.email)  # HTTPS: works on Render's free plan
        else:
            EmailMessage(subject=subject, body=body, to=[settings.NOTIFY_EMAIL or settings.DEFAULT_FROM_EMAIL], reply_to=[m.email]).send()
    except Exception:
        logging.getLogger(__name__).exception("Could not email contact message")
    return Response({"ok": True}, status=201)

# ---- dashboard (token required) ----
class Manage(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
class ProjectViewSet(Manage):
    queryset = Project.objects.all(); serializer_class = ProjectSerializer
    parser_classes = [MultiPartParser, FormParser]
class GalleryViewSet(Manage):
    queryset = GalleryImage.objects.all(); serializer_class = GallerySerializer
    parser_classes = [MultiPartParser, FormParser]
class SkillViewSet(Manage):
    queryset = Skill.objects.all(); serializer_class = SkillSerializer
class EducationViewSet(Manage):
    queryset = Education.objects.all(); serializer_class = EducationSerializer
class MessageViewSet(mixins.ListModelMixin, mixins.DestroyModelMixin, viewsets.GenericViewSet):
    permission_classes = [IsAuthenticated]
    queryset = Message.objects.all(); serializer_class = MessageSerializer

class ProfileView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]
    def get(self, request):
        return Response(ProfileSerializer(Profile.get(), context={"request": request}).data)
    def patch(self, request):
        s = ProfileSerializer(Profile.get(), data=request.data, partial=True, context={"request": request})
        s.is_valid(raise_exception=True)
        s.save()
        return Response(s.data)


class ResumeView(APIView):
    """Dashboard: upload, replace or remove the resume PDF."""
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def info(self):
        p = Profile.get()
        has = bool(p.resume_data)
        return {"has_resume": has, "name": p.resume_name if has else "", "updated": p.resume_updated if has else None,
                "version": resume_version(p), "size": len(bytes(p.resume_data)) if has else 0}

    def get(self, request):
        return Response(self.info())

    def post(self, request):
        f = request.FILES.get("resume")
        if not f:
            return Response({"resume": ["Choose a PDF file first."]}, status=400)
        if f.size > MAX_RESUME:
            return Response({"resume": ["The PDF must be under 5 MB."]}, status=400)
        data = f.read()
        if not data.startswith(b"%PDF"):
            return Response({"resume": ["This is not a PDF file. Please upload a .pdf resume."]}, status=400)
        p = Profile.get()
        p.resume_data, p.resume_name, p.resume_updated = data, f.name[:120], timezone.now()
        p.save(update_fields=["resume_data", "resume_name", "resume_updated"])
        return Response(self.info())

    patch = post

    def delete(self, request):
        p = Profile.get()
        p.resume_data, p.resume_name, p.resume_updated = None, "", None
        p.save(update_fields=["resume_data", "resume_name", "resume_updated"])
        return Response(status=204)