from django.urls import path
from rest_framework.authtoken.views import obtain_auth_token
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register("manage/projects", views.ProjectViewSet, basename="m-projects")
router.register("manage/gallery", views.GalleryViewSet, basename="m-gallery")
router.register("manage/skills", views.SkillViewSet, basename="m-skills")
router.register("manage/education", views.EducationViewSet, basename="m-education")
router.register("manage/messages", views.MessageViewSet, basename="m-messages")

urlpatterns = [
    path("portfolio/", views.portfolio),
    path("contact/", views.contact),
    path("auth/login/", obtain_auth_token),
    path("manage/profile/", views.ProfileView.as_view()),
] + router.urls
