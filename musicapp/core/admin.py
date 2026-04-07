from django.contrib import admin
from .models import Song

admin.site.register(Song)
admin.register(Song)
class SongAdmin(admin.ModelAdmin):
    list_display = ('title', 'artist')