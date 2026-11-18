from django.db import models

class Skill(models.Model):
    group = models.CharField(max_length=40)  # Frontend, Backend, Database, Tools, Soft skills
    name = models.CharField(max_length=60)
    order = models.PositiveSmallIntegerField(default=0)
    class Meta: ordering = ["group", "order"]
    def __str__(self): return f"{self.group}: {self.name}"

class Project(models.Model):
    title = models.CharField(max_length=120)
    summary = models.TextField()
    highlights = models.JSONField(default=list, blank=True)  # list of strings
    stack = models.JSONField(default=list, blank=True)       # list of strings
    tag = models.CharField(max_length=80, blank=True)        # short label, e.g. "Travel planner"
    note = models.CharField(max_length=200, blank=True)      # optional small notice shown on the card
    image = models.ImageField(upload_to="projects/", blank=True, null=True)
    github_url = models.URLField(blank=True)
    live_url = models.URLField(blank=True)
    order = models.PositiveSmallIntegerField(default=0)
    class Meta: ordering = ["order"]
    def __str__(self): return self.title

class Education(models.Model):
    title = models.CharField(max_length=160)
    institution = models.CharField(max_length=160)
    period = models.CharField(max_length=20)
    order = models.PositiveSmallIntegerField(default=0)
    class Meta: ordering = ["order"]
    def __str__(self): return self.title

class Message(models.Model):
    name = models.CharField(max_length=80)
    email = models.EmailField()
    body = models.TextField(max_length=2000)
    created = models.DateTimeField(auto_now_add=True)
    class Meta: ordering = ["-created"]
    def __str__(self): return f"{self.name} ({self.created:%d %b %Y})"

class Profile(models.Model):
    """Single row holding your portrait."""
    photo = models.ImageField(upload_to="profile/", blank=True, null=True)
    @classmethod
    def get(cls):
        return cls.objects.get_or_create(pk=1)[0]
    def __str__(self): return "Profile"

class GalleryImage(models.Model):
    """Extra screenshots shown on the Gallery page."""
    image = models.ImageField(upload_to="gallery/")
    project = models.CharField(max_length=80, blank=True)   # used for the filter buttons
    caption = models.CharField(max_length=160, blank=True)
    order = models.PositiveSmallIntegerField(default=0)
    class Meta: ordering = ["order", "-id"]
    def __str__(self): return self.caption or self.project or f"Image {self.pk}"
