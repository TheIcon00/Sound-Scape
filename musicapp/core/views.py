from django.shortcuts import render
from .models import Song, Library
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.shortcuts import render, redirect
from django.contrib import messages

def home(request):
    songs = Song.objects.all()

    user_library = []
    if request.user.is_authenticated:
        user_library = Library.objects.filter(user=request.user)

    return render(request, "core/index.html", {
        "songs": songs,
        "library": user_library
    })


def search_songs(request):
    query = request.GET.get('q')

    if query:
        songs = Song.objects.filter(title__icontains=query)
    else:
        songs = Song.objects.all()

    data = []

    for song in songs:
        if song.audio_file:
            data.append({
                'id': song.id,   # ✅ IMPORTANT
                'title': song.title,
                'artist': song.artist,
                'audio': song.audio_file.url
            })

    return JsonResponse(data, safe=False)
from django.views.decorators.csrf import csrf_exempt

@csrf_exempt
def add_to_library(request):
    if request.method == "POST":

        if not request.user.is_authenticated:
            return JsonResponse({"error": "Login required"}, status=403)

        song_id = request.POST.get("song_id")

        try:
            song = Song.objects.get(id=song_id)

            Library.objects.get_or_create(
                user=request.user,
                song=song
            )

            return JsonResponse({"status": "added"})

        except Song.DoesNotExist:
            return JsonResponse({"error": "Song not found"}, status=404)
@login_required
def toggle_library(request):
    if request.method == "POST":
        song_id = request.POST.get("song_id")

        try:
            song = Song.objects.get(id=song_id)
        except Song.DoesNotExist:
            return JsonResponse({"error": "Song not found"}, status=404)

        library_item = Library.objects.filter(user=request.user, song=song).first()

        if library_item:
            library_item.delete()
            return JsonResponse({"status": "removed"})
        else:
            Library.objects.create(user=request.user, song=song)
            return JsonResponse({"status": "added"})
@login_required
def remove_from_library(request):
    if request.method == "POST":
        song_id = request.POST.get("song_id")
        
        Library.objects.filter(
            user=request.user,
            song_id=song_id
        ).delete()

        return JsonResponse({"status": "removed"})
from django.http import JsonResponse
from .models import Song

def get_songs_by_genre(request):
    genre = request.GET.get("genre")
    songs = Song.objects.filter(genre=genre)

    data = []
    for song in songs:
        data.append({
            "id": song.id,
            "title": song.title,
            "artist": song.artist,
            "audio": song.audio_file.url
        })

    return JsonResponse(data, safe=False)
def signup(request):
    if request.method == "POST":
        username = request.POST.get("username")
        email = request.POST.get("email")
        password = request.POST.get("password")

        if User.objects.filter(username=username).exists():
            messages.error(request, "Username already exists")
            return redirect("signup")

        user = User.objects.create_user(
            username=username,
            email=email,
            password=password
        )
        user.save()

        messages.success(request, "Account created successfully!")
        return redirect("login")

    return render(request, "signup.html")