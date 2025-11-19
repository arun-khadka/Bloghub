from django.db import models
from authors.models import Author
from django.utils.text import slugify
from category.models import Category


class Article(models.Model):
    title = models.CharField(max_length=200)
    slug = models.SlugField(unique=True, max_length=200)
    content = models.TextField()
    excerpt = models.TextField(blank=True, null=True)
    featured_image = models.ImageField(
        upload_to="articles_image_path", blank=True, null=True, max_length=500
    )
    author = models.ForeignKey(
        Author, on_delete=models.CASCADE, related_name="articles"
    )

    category = models.ForeignKey(
        Category,
        on_delete=models.PROTECT,  # Prevent deleting category if articles exist
        related_name="articles",
        null=True,  # Make optional initially for migration
        blank=True,
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    view_count = models.PositiveIntegerField(default=0)
    is_published = models.BooleanField(default=False)
    is_deleted = models.BooleanField(default=False)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.title} by {self.author}"

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)
