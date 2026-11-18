from rest_framework import serializers
from .models import Skill, Project, Education, Message, Profile, GalleryImage

MAX_IMAGE = 3 * 1024 * 1024

def check_image(f):
    if f and f.size > MAX_IMAGE:
        raise serializers.ValidationError("Image must be under 3 MB.")
    return f

class SkillSerializer(serializers.ModelSerializer):
    class Meta: model = Skill; fields = ["id", "group", "name"]
class ProjectSerializer(serializers.ModelSerializer):
    class Meta: model = Project; fields = ["id", "title", "tag", "note", "summary", "highlights", "stack", "image", "github_url", "live_url", "order"]
    def validate_image(self, f): return check_image(f)
class EducationSerializer(serializers.ModelSerializer):
    class Meta: model = Education; fields = ["id", "title", "institution", "period"]
class MessageSerializer(serializers.ModelSerializer):
    class Meta: model = Message; fields = ["id", "name", "email", "body", "created"]; read_only_fields = ["id", "created"]
class ProfileSerializer(serializers.ModelSerializer):
    class Meta: model = Profile; fields = ["photo"]
    def validate_photo(self, f): return check_image(f)
class GallerySerializer(serializers.ModelSerializer):
    class Meta: model = GalleryImage; fields = ["id", "image", "project", "caption", "order"]
    def validate_image(self, f): return check_image(f)
