from django.contrib import admin
from .models import Skill, Project, Education, Message, Profile, GalleryImage
admin.site.register([Skill, Project, Education, Profile, GalleryImage])
@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ("name", "email", "created")
    readonly_fields = ("name", "email", "body", "created")
