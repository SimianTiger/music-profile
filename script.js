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
let audioContext;
let analyser;
let dataArray;
let particlesArray = [];

// DOM Elements
const audioPlayer = document.getElementById('audioPlayer');
const bgVideo = document.getElementById('bgVideo');
const coverImage = document.getElementById('coverImage');
const playerCover = document.getElementById('playerCover');
const trackName = document.getElementById('trackName');
const trackArtist = document.getElementById('trackArtist');
const playPauseBtn = document.getElementById('playPauseBtn');
const playIcon = document.getElementById('playIcon');
const pauseIcon = document.getElementById('pauseIcon');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const progressSlider = document.getElementById('progressSlider');
const progressFill = document.getElementById('progressFill');
const progressHover = document.getElementById('progressHover');
const currentTimeEl = document.getElementById('currentTime');
const durationEl = document.getElementById('duration');
const volumeSlider = document.getElementById('volumeSlider');
const volumeBtn = document.getElementById('volumeBtn');
const volumeIcon = document.getElementById('volumeIcon');
const visualizerCanvas = document.getElementById('visualizer');
const particlesCanvas = document.getElementById('particlesCanvas');

// ====================================
// PARTICLES SYSTEM
// ====================================
class Particle {
    constructor(canvas) {
        this.canvas = canvas;
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 0.5;
        this.speedX = Math.random() * 0.5 - 0.25;
        this.speedY = Math.random() * 0.5 - 0.25;
        this.opacity = Math.random() * 0.5 + 0.2;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.x > this.canvas.width) this.x = 0;
        if (this.x < 0) this.x = this.canvas.width;
        if (this.y > this.canvas.height) this.y = 0;
        if (this.y < 0) this.y = this.canvas.height;
    }

    draw(ctx) {
        ctx.fillStyle = `rgba(30, 215, 96, ${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

function initParticles() {
    particlesCanvas.width = window.innerWidth;
    particlesCanvas.height = window.innerHeight;
    
    const particleCount = window.innerWidth < 768 ? 30 : 50;
    
    for (let i = 0; i < particleCount; i++) {
        particlesArray.push(new Particle(particlesCanvas));
    }
    
    animateParticles();
}

function animateParticles() {
    const ctx = particlesCanvas.getContext('2d');
    ctx.clearRect(0, 0, particlesCanvas.width, particlesCanvas.height);
    
    particlesArray.forEach(particle => {
        particle.update();
        particle.draw(ctx);
    });
    
    // Draw connections
    particlesArray.forEach((particle1, i) => {
        particlesArray.slice(i + 1).forEach(particle2 => {
            const dx = particle1.x - particle2.x;
            const dy = particle1.y - particle2.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 150) {
                ctx.strokeStyle = `rgba(30, 215, 96, ${0.1 * (1 - distance / 150)})`;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(particle1.x, particle1.y);
                ctx.lineTo(particle2.x, particle2.y);
                ctx.stroke();
            }
        });
    });
    
    requestAnimationFrame(animateParticles);
}

// ====================================
// AUDIO VISUALIZER
// ====================================
function initAudioVisualizer() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        const source = audioContext.createMediaElementSource(audioPlayer);
        source.connect(analyser);
        analyser.connect(audioContext.destination);
        analyser.fftSize = 256;
        const bufferLength = analyser.frequencyBinCount;
        dataArray = new Uint8Array(bufferLength);
    }
    
    drawVisualizer();
}

function drawVisualizer() {
    if (!analyser) return;
    
    requestAnimationFrame(drawVisualizer);
    
    analyser.getByteFrequencyData(dataArray);
    
    const ctx = visualizerCanvas.getContext('2d');
    const width = visualizerCanvas.width;
    const height = visualizerCanvas.height;
    
    ctx.clearRect(0, 0, width, height);
    
    const barCount = 64;
    const barWidth = width / barCount;
    
    for (let i = 0; i < barCount; i++) {
        const barHeight = (dataArray[i] / 255) * height * 0.8;
        const x = i * barWidth;
        const y = height / 2;
        
        const gradient = ctx.createLinearGradient(x, y - barHeight / 2, x, y + barHeight / 2);
        gradient.addColorStop(0, 'rgba(30, 215, 96, 0.8)');
        gradient.addColorStop(0.5, 'rgba(30, 215, 96, 0.4)');
        gradient.addColorStop(1, 'rgba(30, 215, 96, 0.1)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(x, y - barHeight / 2, barWidth - 2, barHeight);
    }
}

// ====================================
// INITIALIZATION
// ====================================
function init() {
    loadTrack(currentTrackIndex);
    setupEventListeners();
    initParticles();
    
    // Set canvas sizes
    visualizerCanvas.width = 400;
    visualizerCanvas.height = 400;
    
    // Set initial volume
    audioPlayer.volume = volumeSlider.value / 100;
}

// ====================================
// LOAD TRACK
// ====================================
function loadTrack(index) {
    const track = playlist[index];
    
    // Update audio
    audioPlayer.src = track.audio;
    
    // Update video with smooth transition
    bgVideo.style.transition = 'opacity 0.5s ease';
    bgVideo.style.opacity = '0';
    setTimeout(() => {
        bgVideo.src = track.video;
        bgVideo.load();
        bgVideo.play();
        bgVideo.style.opacity = '1';
    }, 500);
    
    // Update covers with fade effect
    [coverImage, playerCover].forEach(img => {
        img.style.transition = 'opacity 0.3s ease';
        img.style.opacity = '0';
        setTimeout(() => {
            img.src = track.cover;
            img.style.opacity = '1';
        }, 300);
    });
    
    // Update track info
    trackName.textContent = track.name;
    trackArtist.textContent = track.artist;
    
    // Reset progress
    progressSlider.value = 0;
    progressFill.style.width = '0%';
    currentTimeEl.textContent = '0:00';
    
    // Save to localStorage
    localStorage.setItem('lastTrackIndex', index);
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
    
    if (!audioContext) {
        initAudioVisualizer();
    } else if (audioContext.state === 'suspended') {
        audioContext.resume();
    }
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
        setTimeout(() => playTrack(), 100);
    }
}

function prevTrack() {
    if (audioPlayer.currentTime > 3) {
        audioPlayer.currentTime = 0;
    } else {
        currentTrackIndex = (currentTrackIndex - 1 + playlist.length) % playlist.length;
        loadTrack(currentTrackIndex);
        if (isPlaying) {
            setTimeout(() => playTrack(), 100);
        }
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
// VOLUME CONTROL
// ====================================
function updateVolume() {
    audioPlayer.volume = volumeSlider.value / 100;
    updateVolumeIcon();
}

function updateVolumeIcon() {
    const volume = volumeSlider.value;
    
    if (volume == 0) {
        volumeIcon.innerHTML = '<path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>';
    } else if (volume < 50) {
        volumeIcon.innerHTML = '<path d="M7 9v6h4l5 5V4l-5 5H7z"/>';
    } else {
        volumeIcon.innerHTML = '<path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>';
    }
}

function toggleMute() {
    if (audioPlayer.volume > 0) {
        audioPlayer.dataset.previousVolume = audioPlayer.volume;
        audioPlayer.volume = 0;
        volumeSlider.value = 0;
    } else {
        const previousVolume = audioPlayer.dataset.previousVolume || 0.8;
        audioPlayer.volume = previousVolume;
        volumeSlider.value = previousVolume * 100;
    }
    updateVolumeIcon();
}

// ====================================
// PROGRESS HOVER EFFECT
// ====================================
function handleProgressHover(e) {
    const rect = progressSlider.getBoundingClientRect();
    const percent = ((e.clientX - rect.left) / rect.width) * 100;
    progressHover.style.width = Math.max(0, Math.min(100, percent)) + '%';
}

function clearProgressHover() {
    progressHover.style.width = '0%';
}

// ====================================
// EVENT LISTENERS
// ====================================
function setupEventListeners() {
    // Play/Pause
    playPauseBtn.addEventListener('click', togglePlayPause);
    
    // Navigation
    prevBtn.addEventListener('click', prevTrack);
    nextBtn.addEventListener('click', nextTrack);
    
    // Progress
    progressSlider.addEventListener('input', seekTrack);
    progressSlider.addEventListener('mousemove', handleProgressHover);
    progressSlider.addEventListener('mouseleave', clearProgressHover);
    audioPlayer.addEventListener('timeupdate', updateProgress);
    audioPlayer.addEventListener('ended', nextTrack);
    
    // Volume
    volumeSlider.addEventListener('input', updateVolume);
    volumeBtn.addEventListener('click', toggleMute);
    
    // Metadata
    audioPlayer.addEventListener('loadedmetadata', () => {
        durationEl.textContent = formatTime(audioPlayer.duration);
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        switch(e.code) {
            case 'Space':
                e.preventDefault();
                togglePlayPause();
                break;
            case 'ArrowRight':
                if (e.shiftKey) {
                    nextTrack();
                } else {
                    audioPlayer.currentTime = Math.min(audioPlayer.currentTime + 5, audioPlayer.duration);
                }
                break;
            case 'ArrowLeft':
                if (e.shiftKey) {
                    prevTrack();
                } else {
                    audioPlayer.currentTime = Math.max(audioPlayer.currentTime - 5, 0);
                }
                break;
            case 'ArrowUp':
                e.preventDefault();
                volumeSlider.value = Math.min(100, parseInt(volumeSlider.value) + 10);
                updateVolume();
                break;
            case 'ArrowDown':
                e.preventDefault();
                volumeSlider.value = Math.max(0, parseInt(volumeSlider.value) - 10);
                updateVolume();
                break;
            case 'KeyM':
                toggleMute();
                break;
        }
    });
    
    // Window resize
    window.addEventListener('resize', () => {
        particlesCanvas.width = window.innerWidth;
        particlesCanvas.height = window.innerHeight;
    });
    
    // Load last played track
    const lastTrack = localStorage.getItem('lastTrackIndex');
    if (lastTrack !== null) {
        currentTrackIndex = parseInt(lastTrack);
        loadTrack(currentTrackIndex);
    }
}

// ====================================
// START APPLICATION
// ====================================
document.addEventListener('DOMContentLoaded', init);
