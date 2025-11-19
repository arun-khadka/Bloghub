from django.db import models
from django.utils import timezone
from users.models import User

class Author(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='author_profile')
    bio = models.TextField(blank=True, null=True)
    social_links = models.JSONField(default=dict, blank=True)  # e.g. {"twitter": "", "facebook": ""}
    created_at = models.DateTimeField(default=timezone.now) 
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.user.fullname or self.user.email
