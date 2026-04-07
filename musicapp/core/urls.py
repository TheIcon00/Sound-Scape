from django.urls import path
from . import views
id="liburl01"

urlpatterns = [
    path('', views.home, name='home'),
    path('search/', views.search_songs, name='search_songs'),
    path('add-to-library/', views.add_to_library, name='add_to_library'),
    path('toggle-library/', views.toggle_library, name='toggle_library'),
    path("remove-from-library/", views.remove_from_library, name="remove_from_library"),
    path("genre/", views.get_songs_by_genre, name="genre"),]
    