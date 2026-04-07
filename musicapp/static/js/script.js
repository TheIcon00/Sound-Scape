const resultsBox = document.getElementById("results");
const genreSection = document.getElementById("genre-section");
const genreTitle = document.getElementById("genre-title");
let currentSong = null;
let currentSongSrc = "";
const albumTitle = document.getElementById("album-title");
const albumArtist = document.getElementById("album-artist");
const albumImg = document.getElementById("album-img");
let isSeeking = false;
const playBtn = document.getElementById("play");
const title = document.getElementById("title");
let isPlaying = false;
const searchInput = document.getElementById("search");
const resultsDiv = document.getElementById("results");

const progressBar = document.getElementById("progress-bar");
const currentTimeEl = document.getElementById("current-time");
const durationEl = document.getElementById("duration");

const libraryBtn = document.getElementById("library-btn");
const librarySection = document.getElementById("library-section");
const genreButtons = document.querySelectorAll(".genre-btn");
const libraryTitle = document.getElementById("library-title");

const songs = Array.from(document.querySelectorAll(".song-item"));

const audio = new Audio(); 

let currentIndex = 0;

playBtn.addEventListener("click", () => {
    
    if (!currentSongSrc) {
        alert("Select a song first!");
        return;
    }

    if (audio.paused) {
        audio.play();
        requestAnimationFrame(updateProgress);
        playBtn.textContent = "⏸";
    } else {
        audio.pause();
        playBtn.textContent = "▶";
    }
});

searchInput.addEventListener("keyup", () => {
    let query = searchInput.value;
    if (query === "") {
        resultsDiv.innerHTML = "";
        return;
    }

    fetch(`/search/?q=${query}`)
        .then(res => res.json())
        .then(data => {
            resultsDiv.innerHTML = "";

            data.forEach((song) => {
                const div = document.createElement("div");
                div.classList.add("song-item");
                div.dataset.title = song.title;
div.dataset.artist = song.artist || "Unknown";
                div.dataset.src = song.audio;
div.dataset.id = song.id;

                div.innerHTML = `
  <span class="song-name">${song.title}</span>
  <div class="song-controls">
    <button class="play-btn">▶</button>
    <button class="add-btn" data-id="${song.id}">➕</button>
  </div>
`;
                resultsDiv.appendChild(div);
            });
        });
});

function formatTime(time) {
    let minutes = Math.floor(time / 60);
    let seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
}

progressBar.addEventListener("input", () => {
    isSeeking = true;
    audio.currentTime = progressBar.value;
});

progressBar.addEventListener("change", () => {
    isSeeking = false;
});

function updateProgress() {
    if (!audio.duration){
        requestAnimationFrame(updateProgress);
        return;  
    } 

    const progress = (audio.currentTime / audio.duration) * 100;

    progressBar.value = audio.currentTime;

    progressBar.style.background =
        `linear-gradient(to right, #1db954 ${progress}%, #444 ${progress}%)`;

    currentTimeEl.textContent = formatTime(audio.currentTime);
    durationEl.textContent = formatTime(audio.duration);

    requestAnimationFrame(updateProgress);
}
audio.addEventListener("loadedmetadata", () => {
    progressBar.max = audio.duration;
    progressBar.value = 0; 
    durationEl.textContent = formatTime(audio.duration);
});
audio.addEventListener("play", () => {
    isPlaying = true;

    if (currentSong) {
        albumTitle.textContent = currentSong.dataset.title;
        albumArtist.textContent = currentSong.dataset.artist;

        if (currentSong.dataset.image) {
            albumImg.src = currentSong.dataset.image;
        }
    }

    requestAnimationFrame(updateProgress);
});
audio.addEventListener("pause", () => {
    isPlaying = false;
});


progressBar.addEventListener("input", () => {
    isSeeking = true;
    audio.currentTime = progressBar.value;
});


progressBar.addEventListener("change", () => {
    isSeeking = false;
});


audio.addEventListener("loadedmetadata", () => {
    durationEl.textContent = formatTime(audio.duration);
    progressBar.max = audio.duration;
});

function loadSong(index) {
    const item = songs[index];

    currentSongSrc = item.dataset.src;
    audio.src = currentSongSrc;

    title.textContent = `${item.dataset.title} - ${item.dataset.artist}`;
    audio.play();
    requestAnimationFrame(updateProgress);
    playBtn.textContent = "⏸";
}

document.getElementById("next").addEventListener("click", () => {
    currentIndex = (currentIndex + 1) % songs.length;
    loadSong(currentIndex);
});

document.getElementById("prev").addEventListener("click", () => {
    currentIndex = (currentIndex - 1 + songs.length) % songs.length;
    loadSong(currentIndex);
});


audio.addEventListener("ended", () => {
    if (currentIndex < songs.length - 1) {
        currentIndex++;
        loadSong(currentIndex);
    } else {
        playBtn.textContent = "▶";
    }
});

libraryBtn.addEventListener("click", (e) => {
    e.stopPropagation();

    librarySection.classList.remove("hidden");

    genreSection.classList.add("hidden");

    libraryTitle.textContent = "My Library";
});

genreButtons.forEach(btn => {
    btn.addEventListener("click", () => {

        const selectedGenre = btn.dataset.genre;

        librarySection.classList.add("hidden");

        genreSection.classList.remove("hidden");

        genreTitle.textContent = selectedGenre;

        fetch(`/genre/?genre=${selectedGenre}`)
        .then(res => res.json())
        .then(data => {

            genreSection.innerHTML = `<h2>${selectedGenre}</h2>`;

            if (data.length === 0) {
                genreSection.innerHTML += "<p>No songs found</p>";
                return;
            }

            data.forEach(song => {
                const div = document.createElement("div");

                div.classList.add("song-item");
                div.dataset.src = song.audio;
                div.dataset.id = song.id;
                div.dataset.title = song.title;
                div.dataset.artist = song.artist;

                div.innerHTML = `
                    <span class="song-name">🎵 ${song.title}</span>
                    <div class="song-controls">
                        <button class="play-btn">▶</button>
                        <button class="add-btn" data-id="${song.id}">➕</button>
                    </div>
                `;

                genreSection.appendChild(div);
            });

        });
    });
});

document.addEventListener("click", (e) => {

    const isClickInsideLibrary = librarySection.contains(e.target);
    const isClickInsideGenre = genreSection.contains(e.target);
    const isLibraryBtn = e.target === libraryBtn;
    const isGenreBtn = e.target.classList.contains("genre-btn");

    if (
        !isClickInsideLibrary &&
        !isClickInsideGenre &&
        !isLibraryBtn &&
        !isGenreBtn
    ) {
        librarySection.classList.add("hidden");
        genreSection.classList.add("hidden");
    }
});

window.addEventListener("scroll", () => {
    const section = document.querySelector(".experience");

    if (!section) return;

    const position = section.getBoundingClientRect().top;
    const screenHeight = window.innerHeight;

    if (position < screenHeight - 100) {
        section.style.opacity = "1";
        section.style.transform = "translateY(0)";
    } else {
        section.style.opacity = "0";
        section.style.transform = "translateY(50px)";
    }
});
const faders = document.querySelectorAll(".fade-in");

window.addEventListener("scroll", () => {
  faders.forEach(el => {
    const top = el.getBoundingClientRect().top;
    if (top < window.innerHeight - 100) {
      el.classList.add("show");
    }
  });
});
let selectedIndex = -1;


document.addEventListener("keydown", (e) => {
    const items = document.querySelectorAll(".song-item");
    if (e.key === "ArrowDown") {
        selectedIndex = (selectedIndex + 1) % items.length;
    } else if (e.key === "ArrowUp") {
        selectedIndex = (selectedIndex - 1 + items.length) % items.length;
    }

    items.forEach((item, i) => {
        item.classList.toggle("active", i === selectedIndex);
    });
});
const volumeSlider = document.getElementById("volume-slider");
const muteBtn = document.getElementById("mute-btn");

audio.volume = 1;

volumeSlider.addEventListener("input", () => {
    audio.volume = volumeSlider.value;

    if (audio.volume == 0) {
        muteBtn.textContent = "🔇";
    } else {
        muteBtn.textContent = "🔊";
    }
});

muteBtn.addEventListener("click", () => {
    if (audio.volume > 0) {
        audio.volume = 0;
        volumeSlider.value = 0;
        muteBtn.textContent = "🔇";
    } else {
        audio.volume = 1;
        volumeSlider.value = 1;
        muteBtn.textContent = "🔊";
    }
});





document.addEventListener("click", function(e) {
    if (e.target.closest(".add-btn")) {
  e.stopPropagation(); 
}
if (e.target.classList.contains("play-btn")) {

  e.stopPropagation();

  const item = e.target.closest(".song-item, .music-card");
  if (!item) return;

  const src = item.dataset.src;
  const title = item.dataset.title || "Unknown";
  const artist = item.dataset.artist || "";

  if (!src) return;

  if (currentSongSrc === src) {
    if (audio.paused) {
      audio.play();
      e.target.textContent = "⏸";
      playBtn.textContent = "⏸";
    } else {
      audio.pause();
      e.target.textContent = "▶";
      playBtn.textContent = "▶";
    }
    return;
  }

  currentSongSrc = src;
  audio.src = src;
  audio.play();

  document.getElementById("title").textContent =
    `Now Playing: ${title} - ${artist}`;

  document.querySelectorAll(".play-btn").forEach(b => b.textContent = "▶");

  e.target.textContent = "⏸";
  playBtn.textContent = "⏸";
}

if (e.target.closest(".add-btn")) {

  e.stopPropagation(); 

  const btn = e.target.closest(".add-btn");
  const item = btn.closest(".song-item, .music-card");
  const songId = btn.dataset.id;

  if (!songId) {
    console.log("No song ID ❌");
    return;
  }

  const isAdded = btn.textContent.trim() === "❤️";

  const url = isAdded ? "/remove-from-library/" : "/add-to-library/";

  fetch(url, {
    method: "POST",
    headers: {
      "X-CSRFToken": getCSRFToken(),
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: `song_id=${songId}`
  })
  .then(res => res.json())
  .then(data => {

    if (isAdded) {
      btn.textContent = "➕";
      removeFromLibraryUI(songId);
    } else {
      btn.textContent = "❤️";
      addToLibraryUI(item);
    }

  })
  .catch(err => console.log("Error:", err));
}

});
function getCSRFToken() {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, 10) === ('csrftoken=')) {
        cookieValue = cookie.substring(10);
        break;
      }
    }
  }
  return cookieValue;
}

function removeFromLibraryUI(id) {
  const librarySection = document.getElementById("library-section");

  const song = librarySection.querySelector(`[data-id="${id}"]`);
  if (song) song.remove();

  // If empty → show message again
  if (!librarySection.querySelector(".song-item")) {
    const msg = document.createElement("p");
    msg.textContent = "No songs in your library yet";
    librarySection.appendChild(msg);
  }
}
function addToLibraryUI(item) {

  const librarySection = document.getElementById("library-section");

  const title = item.dataset.title;
  const artist = item.dataset.artist;
  const src = item.dataset.src;
  const id = item.dataset.id;

  const exists = librarySection.querySelector(`[data-id="${id}"]`);
  if (exists) {
    console.log("Song already in library 🚫");
    return; 
  }

  const emptyMsg = librarySection.querySelector("p");
  if (emptyMsg) emptyMsg.remove();

  const div = document.createElement("div");
  div.classList.add("song-item");

  div.dataset.src = src;
  div.dataset.id = id;
  div.dataset.title = title;
  div.dataset.artist = artist;

  div.innerHTML = `
    <span class="song-name">🎵 ${title}</span>
    <div class="song-controls">
      <button class="play-btn">▶</button>
      <button class="add-btn" data-id="${id}">❤️</button>
    </div>
  `;

  librarySection.appendChild(div);
}
audio.addEventListener("ended", () => {
  currentSongSrc = "";

  document.querySelectorAll(".play-btn").forEach(btn => {
    btn.textContent = "▶";
  });

  playBtn.textContent = "▶";
});
