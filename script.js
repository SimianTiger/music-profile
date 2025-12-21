// ====================================
// PLAYLIST CONFIGURATION
// ====================================
const playlist = [
    {
        name: "Track Name 1",
        artist: "Artist Name",
        audio: "assets/music/track1.mp3",
        video: "assets/videos/video1.mp4",
        cover: "assets/covers/cover1.jpg"
    },
    {
        name: "Track Name 2",
        artist: "Artist Name",
        audio: "assets/music/track2.mp3",
        video: "assets/videos/video2.mp4",
        cover: "assets/covers/cover2.jpg"
    },
    {
        name: "Track Name 3",
        artist: "Artist Name",
        audio: "assets/music/track3.mp3",
        video: "assets/videos/video3.mp4",
        cover: "assets/covers/cover3.jpg"
    }
];

// ====================================
// GLOBAL VARIABLES
// ====================================
let currentTrackIndex = 0;
let isPlaying = false;

// DOM Elements
const audioPlayer = document.getElementById('audioPlayer');
const bgVideo = document.getElementById('bgVideo');
const coverImage = document.getElementById('coverImage');
const trackName = document.getElementById('trackName');
const trackArtist = document.getElementById('trackArtist');
const playPauseBtn = document.getElementById('playPauseBtn');
const playIcon = document.getElementById('playIcon');
const pauseIcon = document.getElementById('pauseIcon');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const progressSlider = document.getElementById('progressSlider');
const progressFill = document.getElementById('progressFill');
const currentTimeEl = document.getElementById('currentTime');
const durationEl = document.getElementById('duration');

// ====================================
// INITIALIZATION
// ====================================
function init() {
    loadTrack(currentTrackIndex);
    setupEventListeners();
}

// ====================================
// LOAD TRACK
// ====================================
function loadTrack(index) {
    const track = playlist[index];
    
    // Update audio
    audioPlayer.src = track.audio;
    
    // Update video with smooth transition
    bgVideo.style.opacity = '0';
    setTimeout(() => {
        bgVideo.src = track.video;
        bgVideo.load();
        bgVideo.style.opacity = '1';
    }, 300);
    
    // Update cover with fade effect
    coverImage.style.opacity = '0';
    setTimeout(() => {
        coverImage.src = track.cover;
        coverImage.style.opacity = '1';
    }, 300);
    
    // Update track info
    trackName.textContent = track.name;
    trackArtist.textContent = track.artist;
    
    // Reset progress
    progressSlider.value = 0;
    progressFill.style.width = '0%';
    currentTimeEl.textContent = '0:00';
}

// ====================================
// PLAY/PAUSE FUNCTIONALITY
// ====================================
function togglePlayPause() {
    if (isPlaying) {
        pauseTrack();
    } else {
        playTrack();
    }
}

function playTrack() {
    audioPlayer.play();
    bgVideo.play();
    isPlaying = true;
    playIcon.style.display = 'none';
    pauseIcon.style.display = 'block';
}

function pauseTrack() {
    audioPlayer.pause();
    bgVideo.pause();
    isPlaying = false;
    playIcon.style.display = 'block';
    pauseIcon.style.display = 'none';
}

// ====================================
// TRACK NAVIGATION
// ====================================
function nextTrack() {
    currentTrackIndex = (currentTrackIndex + 1) % playlist.length;
    loadTrack(currentTrackIndex);
    if (isPlaying) {
        playTrack();
    }
}

function prevTrack() {
    currentTrackIndex = (currentTrackIndex - 1 + playlist.length) % playlist.length;
    loadTrack(currentTrackIndex);
    if (isPlaying) {
        playTrack();
    }
}

// ====================================
// PROGRESS BAR
// ====================================
function updateProgress() {
    if (audioPlayer.duration) {
        const progress = (audioPlayer.currentTime / audioPlayer.duration) * 100;
        progressSlider.value = progress;
        progressFill.style.width = progress + '%';
        
        currentTimeEl.textContent = formatTime(audioPlayer.currentTime);
        durationEl.textContent = formatTime(audioPlayer.duration);
    }
}

function seekTrack() {
    const seekTime = (progressSlider.value / 100) * audioPlayer.duration;
    audioPlayer.currentTime = seekTime;
}

function formatTime(seconds) {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

// ====================================
// EVENT LISTENERS
// ====================================
function setupEventListeners() {
    // Play/Pause button
    playPauseBtn.addEventListener('click', togglePlayPause);
    
    // Navigation buttons
    prevBtn.addEventListener('click', prevTrack);
    nextBtn.addEventListener('click', nextTrack);
    
    // Progress bar
    progressSlider.addEventListener('input', seekTrack);
    audioPlayer.addEventListener('timeupdate', updateProgress);
    
    // Auto-play next track
    audioPlayer.addEventListener('ended', nextTrack);
    
    // Update duration when metadata loads
    audioPlayer.addEventListener('loadedmetadata', () => {
        durationEl.textContent = formatTime(audioPlayer.duration);
    });
    
    // Keyboard controls
    document.addEventListener('keydown', (e) => {
        switch(e.code) {
            case 'Space':
                e.preventDefault();
                togglePlayPause();
                break;
            case 'ArrowRight':
                nextTrack();
                break;
            case 'ArrowLeft':
                prevTrack();
                break;
        }
    });
}

// ====================================
// START APPLICATION
// ====================================
document.addEventListener('DOMContentLoaded', init);