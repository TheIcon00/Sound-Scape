from django.contrib.auth.models import User
from django.db import models
class Song(models.Model):
    GENRE_CHOICES = [
        ('Classic', 'Classic'),
        ('Jazz', 'Jazz'),
        ('Blues', 'Blues'),
        ('Metal', 'Metal'),
    ]

    title = models.CharField(max_length=100)
    artist = models.CharField(max_length=100)
    album = models.CharField(max_length=100, blank=True)
    cover_image = models.ImageField(
        upload_to='covers/',
        blank=True,
        null=True
    )

    genre = models.CharField(max_length=50, choices=GENRE_CHOICES)

    audio_file = models.FileField(upload_to='songs/')
    uploaded_at = models.DateTimeField(auto_now_add=True)

class Library(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    song = models.ForeignKey('Song', on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.user.username} - {self.song.title}"

    def __str__(self):
        return f"{self.user.username} - {self.song.title}"