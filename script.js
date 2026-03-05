// ================== UI ELEMENTS ==================
const supabaseUrl = 'https://ymoerovmdqvythjuqcfw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inltb2Vyb3ZtZHF2eXRoanVxY2Z3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyMDY4ODYsImV4cCI6MjA4Nzc4Mjg4Nn0.y97AIxXcH4D6ZlCpKcOxnNgObfoLvZ3HtSlGMxj07-M';
const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);
const playBtn = document.getElementById('play-btn');
const playIcon = document.getElementById('play-icon');
const pauseIcon = document.getElementById('pause-icon');
const nextBtn = document.getElementById('next-btn');
const prevBtn = document.getElementById('prev-btn');
const body = document.body;
// ================== GLOBAL IMAGE FALLBACK ==================
document.addEventListener('error', function(e) {
    if (e.target.tagName && e.target.tagName.toLowerCase() === 'img') {
        // If an image 404s, replace it instantly to keep the UI clean
        e.target.src = 'https://picsum.photos/400/400?grayscale&blur=2';
    }
}, true); // The 'true' is critical to catch the errors as they happen!

const localMusicInput = document.getElementById('local-music-input');
const addLocalBtn = document.getElementById('add-local-btn');
const musicGrid = document.getElementById('music-grid');

const playerTitle = document.getElementById('player-title');
const playerArtist = document.getElementById('player-artist');
const playerCover = document.getElementById('player-cover');
const progressSlider = document.getElementById('progress-slider');
const currentTimeEl = document.getElementById('current-time');
const totalTimeEl = document.getElementById('total-time');
const volumeSlider = document.getElementById('volume-slider');

const volumeBtn = document.getElementById('volume-btn');
const playerHeartBtn = document.getElementById('player-heart-btn');
const playerHeartIcon = document.getElementById('player-heart-icon');
let previousVolume = 1;

const shuffleBtn = document.getElementById('shuffle-btn');
const repeatBtn = document.getElementById('repeat-btn');
const downloadBtn = document.getElementById('download-btn');
const autoplayBtn = document.getElementById('autoplay-btn');

// Navigation
const searchInput = document.getElementById('search-input');
const localSection = document.getElementById('local-section');
const searchResultsContainer = document.getElementById('search-results-container');
const searchGrid = document.getElementById('search-grid');
const libraryTitle = document.getElementById('library-title');
const searchTermEl = document.getElementById('search-term');
const backToLibraryBtn = document.getElementById('back-to-library');

const likedSection = document.getElementById('liked-section');
const likedGrid = document.getElementById('liked-grid');
const likedSongsBtn = document.getElementById('liked-songs-btn');
const backToLibraryFromLiked = document.getElementById('back-to-library-from-liked');

const recentSection = document.getElementById('recent-section');
const recentGrid = document.getElementById('recent-grid');
const recentlyPlayedBtn = document.getElementById('recently-played-btn');
const backToLibraryFromRecent = document.getElementById('back-to-library-from-recent');

const homeSection = document.getElementById('home-section');
const homeBtn = document.getElementById('home-btn');
const libraryBtn = document.getElementById('library-btn');

const playlistView = document.getElementById('playlist-view');
const playlistTitle = document.getElementById('playlist-title');
const playlistGrid = document.getElementById('playlist-grid');
const backToHomeFromPlaylist = document.getElementById('back-to-home-from-playlist');
const newPlaylistBtn = document.getElementById('new-playlist-btn');
const playlistsList = document.getElementById('playlists-list');

const continueSection = document.getElementById('continue-section');
const continueCard = document.getElementById('continue-card');
const homeRecentGrid = document.getElementById('home-recent-grid');
const latestGrid = document.getElementById('latest-grid');
const latestLoading = document.getElementById('latest-loading');

// ================== TOAST NOTIFICATION ==================
function showToast(message) {
    const toast = document.getElementById('toast-notification');
    const toastMsg = document.getElementById('toast-message');
    if (!toast || !toastMsg) return;
    
    toastMsg.textContent = message;
    toast.classList.remove('opacity-0', 'translate-y-10');
    
    setTimeout(() => {
        toast.classList.add('opacity-0', 'translate-y-10');
    }, 3000);
}

// ================== 3-DOT MENU LOGIC ==================
const thumbnail = document.getElementById('modal-thumbnail');
const menuBtn = document.getElementById('thumbnail-menu-btn');
const menu = document.getElementById('thumbnail-menu');
const changePhotoBtn = document.getElementById('change-photo-btn');
const removePhotoBtn = document.getElementById('remove-photo-btn');

menuBtn.addEventListener('click', (e) => {
    e.stopPropagation();           
    menu.classList.toggle('hidden');
});

document.addEventListener('click', () => {
    menu.classList.add('hidden');
});

changePhotoBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    menu.classList.add('hidden');
    document.getElementById('thumbnail-upload').click();
});

removePhotoBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    menu.classList.add('hidden');
    document.getElementById('uploaded-thumbnail').classList.add('hidden');
    document.getElementById('default-icon').classList.remove('hidden');
    currentThumbnailBase64 = null;
});

// ================== MOBILE SIDEBAR LOGIC ==================
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const closeSidebarBtn = document.getElementById('close-sidebar-btn');
const sidebar = document.getElementById('sidebar');
const mobileOverlay = document.getElementById('mobile-overlay');

function toggleMobileMenu() {
    if (!sidebar || !mobileOverlay) return; 
    
    const isClosed = sidebar.classList.contains('-translate-x-[120%]');
    if (isClosed) {
        sidebar.classList.remove('-translate-x-[120%]');
        mobileOverlay.classList.remove('hidden');
        setTimeout(() => mobileOverlay.classList.remove('opacity-0'), 10);
    } else {
        sidebar.classList.add('-translate-x-[120%]');
        mobileOverlay.classList.add('opacity-0');
        setTimeout(() => mobileOverlay.classList.add('hidden'), 300);
    }
}

if (mobileMenuBtn) mobileMenuBtn.addEventListener('click', toggleMobileMenu);
if (closeSidebarBtn) closeSidebarBtn.addEventListener('click', toggleMobileMenu);
if (mobileOverlay) mobileOverlay.addEventListener('click', toggleMobileMenu);

document.querySelectorAll('.nav-links li').forEach(link => {
    link.addEventListener('click', () => {
        if (sidebar && window.innerWidth < 768 && !sidebar.classList.contains('-translate-x-[120%]')) {
            toggleMobileMenu();
        }
    });
});

// ================== AUDIO & STATE ==================
const audioPlayer = new Audio();
let isPlaying = false;
let playlist = [];
let currentSongIndex = -1;
let addedKeys = new Set();

let isShuffle = false;
let repeatMode = 0;
let timeSaveTimeout = null;
let likedSongs = [];
let recentlyPlayed = [];
let currentPlaylistName = "Home";

let latestPage = 1;
let isLoadingLatest = false;
let latestSeenVideoIds = new Set();
let autoplayEnabled = true;

const trendingQueries = [
    "Bangla popular song", "Top Bollywood hit", "top punjabi song",
    "Best Rap song bangla", "Best hip hop song", "Top rap song", "EDM festival hit",
    "Best punjab rap song", "Rock hit playlist", "New music releases", "Latest pop song",
    "New English song this month", "Fresh music playlist", "Viral song right now",
    "TikTok viral hit", "Chill vibes playlist", "Late night music mix", "Workout motivation song",
    "Relaxing study music", "Sad song playlist", "Feel good music mix",
    "2000s throwback hit", "90s best song playlist", "Classic party song"
];

const emptyHeartSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>`;
const filledHeartSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="#00f2ff" stroke="#00f2ff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>`;

let appState = {
    playlist: [], currentSongIndex: -1, currentTime: 0, volume: 1,
    isShuffle: false, repeatMode: 0, wasPlaying: false, likedSongs: [],
    recentlyPlayed: [], userPlaylists: {}
};

async function saveAppState() {
    const serializablePlaylist = playlist.filter(s => s.videoId).map(s => ({
        title:s.title, artist:s.artist, cover:s.cover, videoId:s.videoId, duration:s.duration
    }));
    
    appState.playlist = serializablePlaylist;
    appState.currentSongIndex = currentSongIndex;
    appState.currentTime = audioPlayer.currentTime || 0;
    appState.volume = audioPlayer.volume;
    appState.isShuffle = isShuffle;
    appState.repeatMode = repeatMode;
    appState.wasPlaying = isPlaying;
    appState.autoplayEnabled = autoplayEnabled;
    appState.likedSongs = likedSongs;
    appState.recentlyPlayed = recentlyPlayed;
    appState.userPlaylists = appState.userPlaylists || {};
    
    localStorage.setItem('auraPlayerState', JSON.stringify(appState));
    if (currentUser) {
        await supabaseClient
        .from('profiles')
        .upsert({ id: currentUser.id, app_data: appState });
    }
}

async function loadAppState() {
    const saved = localStorage.getItem('auraPlayerState');
    if (!saved) return updateVolumeIcon();

    try { appState = JSON.parse(saved); } catch (e) { return updateVolumeIcon(); }

    isShuffle = !!appState.isShuffle;
    repeatMode = Number(appState.repeatMode) || 0;
    autoplayEnabled = appState.autoplayEnabled !== undefined ? !!appState.autoplayEnabled : true;

    shuffleBtn.style.color = isShuffle ? '#00f2ff' : '#b3b3b3';
    updateRepeatButtonUI();
    if (autoplayBtn) autoplayBtn.style.color = autoplayEnabled ? '#00f2ff' : '#b3b3b3';

    likedSongs = appState.likedSongs || [];
    recentlyPlayed = appState.recentlyPlayed || [];
    appState.userPlaylists = appState.userPlaylists || {};

    const vol = parseFloat(appState.volume) || 1;
    audioPlayer.volume = vol;
    volumeSlider.value = vol;
    previousVolume = vol > 0 ? vol : 1;
    updateVolumeIcon();

    // 🚀 THE FIX: We stop fetching 20 audio streams at startup! 
    // We just load the text/images instantly.
    const savedData = appState.playlist || [];
    playlist = savedData.map(data => ({
        title: data.title, 
        artist: data.artist, 
        url: null, // Audio will be fetched lazily only when the user hits play
        cover: data.cover, 
        videoId: data.videoId, 
        duration: data.duration
    }));

    let newIndex = -1;
    if (appState.currentSongIndex >= 0) {
        const savedId = savedData[appState.currentSongIndex]?.videoId;
        newIndex = playlist.findIndex(s => s.videoId === savedId);
    }
    currentSongIndex = newIndex;

    if (currentSongIndex >= 0) {
        const wasPlayingSaved = !!appState.wasPlaying;
        const savedTime = parseFloat(appState.currentTime) || 0;
        
        // This will handle the background fetching safely
        loadAndPlayTrack(currentSongIndex, false);

        const handleMetadata = () => {
            if (savedTime > 0 && audioPlayer.duration) audioPlayer.currentTime = Math.min(savedTime, audioPlayer.duration - 0.5);
            if (wasPlayingSaved) {
                audioPlayer.play().then(() => { isPlaying = true; updatePlayBtnUI(); }).catch(() => { isPlaying = false; updatePlayBtnUI(); });
            } else { isPlaying = false; updatePlayBtnUI(); }
            updatePlayerHeart(); saveAppState();
            audioPlayer.removeEventListener('loadedmetadata', handleMetadata);
        };
        audioPlayer.addEventListener('loadedmetadata', handleMetadata, { once: true });
        if (audioPlayer.readyState >= 1) handleMetadata();
    } else {
        isPlaying = false; updatePlayBtnUI();
    }
    renderPlaylistsSidebar();
}

// ================== CUSTOM PLAYLISTS ==================
function createPlaylist(name) {
    if (!name || appState.userPlaylists[name]) {
        showToast("Invalid or duplicate playlist name");
        return false;
    }
    appState.userPlaylists[name] = [];
    saveAppState();
    renderPlaylistsSidebar();
    return true;
}

function addSongToPlaylist(playlistName, song) {
    if (!appState.userPlaylists[playlistName]) return false;

    const exists = appState.userPlaylists[playlistName].some(s => 
        (song.videoId && s.videoId === song.videoId) ||
        (!song.videoId && s.title === song.title)
    );
    if (exists) {
        showToast("Song already in playlist");
        return false;
    }

    appState.userPlaylists[playlistName].push({
        title: song.title,
        artist: song.artist,
        cover: song.cover,
        videoId: song.videoId || null,
        duration: song.duration || 0
    });
    saveAppState();
    showToast(`Added to "${playlistName}"`);
    return true;
}

function removeSongFromPlaylist(playlistName, song) {
    if (!appState.userPlaylists[playlistName]) return;
    appState.userPlaylists[playlistName] = appState.userPlaylists[playlistName].filter(s => 
        !(song.videoId && s.videoId === song.videoId) &&
        !(!song.videoId && s.title === song.title)
    );
    saveAppState();
    if (currentPlaylistName === playlistName) renderCurrentPlaylist();
}

function renderPlaylistsSidebar() {
    playlistsList.innerHTML = '';
    Object.keys(appState.userPlaylists).forEach(name => {
        const li = document.createElement('li');
        li.className = 'group flex items-center justify-between w-full transition-all cursor-pointer py-2 px-3 rounded-xl hover:bg-white/10';
        li.innerHTML = `
            <span class="text-white flex-1 truncate">${name}</span>
            <button class="delete-playlist-btn opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-500 p-1">🗑</button>`;
        li.querySelector('span').addEventListener('click', () => {
            loadCustomPlaylist(name);
            // NEW: Auto-close the sidebar on mobile!
            const sidebar = document.getElementById('sidebar');
            if (sidebar && window.innerWidth < 768 && !sidebar.classList.contains('-translate-x-[120%]')) {
                toggleMobileMenu();
            }
        });
        li.querySelector('.delete-playlist-btn').addEventListener('click', (e) => {
            e.stopPropagation(); openDeleteModal(name); 
        });
        playlistsList.appendChild(li);
    });
}

function loadCustomPlaylist(name) {
    if (!appState.userPlaylists[name]) return;
    currentPlaylistName = name;
    hideAllSections();
    playlistView.classList.remove('hidden');
    playlistTitle.textContent = name;
    playlistGrid.innerHTML = '';
    appState.userPlaylists[name].forEach(song => {
        const card = createSongCard(song);
        const removeBtn = document.createElement('button');
        removeBtn.className = 'absolute top-3 left-3 bg-black/70 text-white text-xs px-2 py-0.5 rounded hover:bg-red-500 z-20';
        removeBtn.textContent = 'Remove';
        removeBtn.onclick = (e) => { e.stopPropagation(); removeSongFromPlaylist(name, song); };
        card.style.position = 'relative';
        card.querySelector('.relative').appendChild(removeBtn);
        playlistGrid.appendChild(card);
    });
}

function renderCurrentPlaylist() {
    if (currentPlaylistName && appState.userPlaylists[currentPlaylistName]) {
        loadCustomPlaylist(currentPlaylistName);
    }
}

// ================== DELETE PLAYLIST MODAL LOGIC ==================
const deletePlaylistModal = document.getElementById('delete-playlist-modal');
const deletePlaylistNameDisplay = document.getElementById('delete-playlist-name-display');
const cancelDeleteBtn = document.getElementById('cancel-delete-btn');
const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
let playlistToDelete = null;

function openDeleteModal(name) {
    playlistToDelete = name;
    deletePlaylistNameDisplay.textContent = name;
    deletePlaylistModal.classList.remove('hidden');
    setTimeout(() => {
        deletePlaylistModal.classList.remove('opacity-0');
        deletePlaylistModal.querySelector('div').classList.remove('scale-95');
        deletePlaylistModal.querySelector('div').classList.add('scale-100');
    }, 10);
}

function closeDeleteModal() {
    deletePlaylistModal.classList.add('opacity-0');
    deletePlaylistModal.querySelector('div').classList.remove('scale-100');
    deletePlaylistModal.querySelector('div').classList.add('scale-95');
    setTimeout(() => { deletePlaylistModal.classList.add('hidden'); playlistToDelete = null; }, 200);
}

cancelDeleteBtn.addEventListener('click', closeDeleteModal);
deletePlaylistModal.addEventListener('click', (e) => { if (e.target === deletePlaylistModal) closeDeleteModal(); });
confirmDeleteBtn.addEventListener('click', () => {
    if (playlistToDelete) {
        delete appState.userPlaylists[playlistToDelete];
        saveAppState();
        renderPlaylistsSidebar();
        if (currentPlaylistName === playlistToDelete) showHome();
    }
    closeDeleteModal();
});

// ================== SECTION SWITCHING ==================
function hideAllSections() {
    homeSection.classList.add('hidden'); localSection.classList.add('hidden'); searchResultsContainer.classList.add('hidden');
    likedSection.classList.add('hidden'); recentSection.classList.add('hidden'); playlistView.classList.add('hidden');
}

function showHome() { hideAllSections(); homeSection.classList.remove('hidden'); renderHomeDashboard(); }
function showLibrary() { hideAllSections(); localSection.classList.remove('hidden'); }
function showSearch() { hideAllSections(); searchResultsContainer.classList.remove('hidden'); }
function showLiked() { hideAllSections(); likedSection.classList.remove('hidden'); renderLikedGrid(); }
function showRecent() { hideAllSections(); recentSection.classList.remove('hidden'); renderRecentGrid(); }

homeBtn.addEventListener('click', showHome);
libraryBtn.addEventListener('click', showLibrary);
likedSongsBtn.addEventListener('click', showLiked);
recentlyPlayedBtn.addEventListener('click', showRecent);

// ================== NEW PLAYLIST MODAL ==================
let currentThumbnailBase64 = null;

newPlaylistBtn?.addEventListener('click', () => {
    const existingCount = Object.keys(appState.userPlaylists).length;
    document.getElementById('playlist-name-input').value = existingCount === 0 ? "My Playlist" : `My Playlist #${existingCount + 1}`;
    document.getElementById('playlist-desc-input').value = '';
    document.getElementById('uploaded-thumbnail').classList.add('hidden');
    document.getElementById('default-icon').classList.remove('hidden');
    currentThumbnailBase64 = null;
    document.getElementById('new-playlist-modal').classList.remove('hidden');
});

document.getElementById('close-modal-btn')?.addEventListener('click', () => {
    document.getElementById('new-playlist-modal').classList.add('hidden');
});

document.getElementById('modal-thumbnail')?.addEventListener('click', () => document.getElementById('thumbnail-upload').click());

document.getElementById('thumbnail-upload')?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(ev) {
        const img = new Image();
        img.onload = function() {
            const canvas = document.createElement('canvas');
            const size = Math.min(img.width, img.height);
            canvas.width = size; canvas.height = size;
            const ctx = canvas.getContext('2d');
            const x = (img.width - size) / 2; const y = (img.height - size) / 2;
            ctx.drawImage(img, x, y, size, size, 0, 0, size, size);
            currentThumbnailBase64 = canvas.toDataURL('image/jpeg', 0.9);
            document.getElementById('uploaded-thumbnail').src = currentThumbnailBase64;
            document.getElementById('uploaded-thumbnail').classList.remove('hidden');
            document.getElementById('default-icon').classList.add('hidden');
        };
        img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
});

document.getElementById('save-new-playlist-btn').addEventListener('click', () => {
    const name = document.getElementById('playlist-name-input').value.trim();
    if (!name) return showToast("Playlist name cannot be empty");
    if (appState.userPlaylists[name]) return showToast("A playlist with this name already exists");

    appState.userPlaylists[name] = [];
    const desc = document.getElementById('playlist-desc-input').value.trim();
    if (desc) appState.userPlaylists[name].description = desc;
    if (currentThumbnailBase64) appState.userPlaylists[name].cover = currentThumbnailBase64;

    if (pendingSongToAdd) {
        appState.userPlaylists[name].push({ 
            title: pendingSongToAdd.title, 
            artist: pendingSongToAdd.artist, 
            cover: pendingSongToAdd.cover, 
            videoId: pendingSongToAdd.videoId || null,
            duration: pendingSongToAdd.duration || 0 
        });
        pendingSongToAdd = null; 
        showToast("Playlist created and song added!");
    } else {
        showToast("Playlist created!");
    }

    saveAppState(); renderPlaylistsSidebar();
    document.getElementById('new-playlist-modal').classList.add('hidden');
    loadCustomPlaylist(name);
});

backToLibraryBtn.addEventListener('click', showHome);
backToLibraryFromLiked.addEventListener('click', showHome);
backToLibraryFromRecent.addEventListener('click', showHome);
backToHomeFromPlaylist.addEventListener('click', showHome);

function renderHomeDashboard() { renderContinueListening(); renderRecentlyPlayedInHome(); renderLatestSongs(); }

function renderContinueListening() {
    if (currentSongIndex < 0 || (appState.currentTime || 0) <= 10) { continueSection.classList.add('hidden'); return; }
    const song = playlist[currentSongIndex];
    const minutes = Math.floor(appState.currentTime / 60);
    const seconds = Math.floor(appState.currentTime % 60);
    const timeStr = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

    continueCard.innerHTML = `
        <img src="${song.cover || 'https://picsum.photos/56/56'}" class="w-32 h-32 object-cover rounded-2xl shadow-2xl">
        <div class="flex-1">
            <div class="text-cyan-400 text-sm font-medium mb-1">Continue where you left off</div>
            <h3 class="text-2xl font-bold text-white mb-1">${song.title}</h3>
            <p class="text-gray-400">${song.artist}</p>
            <div class="mt-4 text-cyan-400 text-sm flex items-center gap-2"><i data-lucide="clock" class="w-4 h-4"></i> Resume from ${timeStr}</div>
        </div>
    `;
    continueSection.classList.remove('hidden');
    continueCard.onclick = () => loadAndPlayTrack(currentSongIndex, true);
}

function renderRecentlyPlayedInHome() {
    homeRecentGrid.innerHTML = '';
    const display = recentlyPlayed.slice(0, 10);
    if (display.length === 0) {
        homeRecentGrid.innerHTML = `<div class="col-span-full text-center py-12 text-gray-400">No recent songs yet. Play something!</div>`; return;
    }
    display.forEach(song => homeRecentGrid.appendChild(createSongCard(song)));
}

function renderLatestSongs() {
    latestPage = 1; isLoadingLatest = false; latestSeenVideoIds.clear(); latestGrid.innerHTML = ''; loadMoreLatestSongs();
}

async function loadMoreLatestSongs() {
    if (isLoadingLatest) return;
    isLoadingLatest = true; latestLoading.classList.remove('hidden');
    const query = trendingQueries[(latestPage - 1) % trendingQueries.length];

    try {
        const res = await fetch(`/api/search?query=${encodeURIComponent(query)}`);
        const data = await res.json();
        if (data && data.songs) {
            data.songs.forEach(song => {
                if (latestSeenVideoIds.has(song.videoId)) return;
                latestSeenVideoIds.add(song.videoId);
                latestGrid.appendChild(createSongCard(song));
            });
            if (data.songs.length > 0) latestPage++;
        }
    } catch (err) { console.error(err); }
    isLoadingLatest = false; latestLoading.classList.add('hidden');
}

function createSongCard(song) {
    const card = document.createElement('div');
    card.className = 'local-song bg-white/5 border border-white/10 rounded-2xl p-4 hover:bg-cyan-400/10 hover:-translate-y-1 hover:border-cyan-400 transition-all cursor-pointer overflow-hidden relative';
    const isLocal = !song.videoId;
    const heartSVG = isLiked(song) ? filledHeartSVG : emptyHeartSVG;

    card.innerHTML = `
        <div class="relative w-full h-32 rounded-2xl mb-4 overflow-hidden border border-white/10">
            ${song.cover ? `<img src="${song.cover}" class="w-full h-full object-cover">` : isLocal ? `<div class="w-full h-full bg-gradient-to-br from-zinc-900 via-zinc-800 to-black flex items-center justify-center"><div class="text-7xl text-cyan-400/70">♪</div></div>` : `<span class="text-5xl flex items-center justify-center h-full text-white/30">🎵</span>`}
            <button class="heart-btn absolute top-3 right-3 p-1.5 text-white hover:scale-110 transition-transform z-20">${heartSVG}</button>
            <button class="add-playlist-btn absolute top-3 left-3 bg-black/60 hover:bg-cyan-400 text-white text-xs px-2 py-0.5 rounded transition-all z-20">+ Playlist</button>
        </div>
        <h3 class="text-white font-bold truncate">${song.title}</h3>
        <p class="text-gray-400 text-sm">${song.artist}</p>
    `;

    card.addEventListener('click', (e) => {
        if (!e.target.closest('.heart-btn') && !e.target.closest('.add-playlist-btn') && !e.target.closest('button')) playSongFromCard(song);
    });

    card.querySelector('.heart-btn').addEventListener('click', (e) => {
        e.stopPropagation(); toggleLike(song);
        e.currentTarget.innerHTML = isLiked(song) ? filledHeartSVG : emptyHeartSVG;
    });

    card.querySelector('.add-playlist-btn').addEventListener('click', (e) => {
        e.stopPropagation(); showAddToPlaylistModal(song);
    });

    return card;
}

function playSongFromCard(song) {
    if (!song.videoId) return showToast('Local file must be added from library first.');
    playerTitle.textContent = "Loading song..."; playerArtist.textContent = song.artist || "Please wait";
    playerCover.src = song.cover || "https://picsum.photos/56/56";

    fetch(`/api/stream?videoId=${song.videoId}`).then(res => res.json()).then(data => {
        if (data.error) { playerTitle.textContent = "Failed"; return showToast(data.error); }
        const fullSong = { ...song, url: data.url };
        let index = playlist.findIndex(s => s.videoId === song.videoId);
        if (index === -1) { playlist.push(fullSong); index = playlist.length - 1; }
        
        loadAndPlayTrack(index);
        addToRecentlyPlayed(fullSong); // Dead code removed from here!
        
    }).catch(() => { playerTitle.textContent = "Load failed"; showToast('Failed to load song. Try another one.'); });
}

function addToRecentlyPlayed(song) {
    if (!song) return;
    const index = recentlyPlayed.findIndex(r => (song.videoId && r.videoId === song.videoId) || (!song.videoId && r.title === song.title));
    if (index > -1) recentlyPlayed.splice(index, 1);
    recentlyPlayed.unshift({ title: song.title, artist: song.artist, cover: song.cover, videoId: song.videoId || null, duration: song.duration || 0 });
    if (recentlyPlayed.length > 10) recentlyPlayed.pop();
    saveAppState();
}

function isLiked(song) {
    if (!song) return false;
    return likedSongs.some(l => (song.videoId && l.videoId === song.videoId) || (!song.videoId && l.title === song.title && l.artist === song.artist));
}

function toggleLike(song) {
    if (!song) return;
    const index = likedSongs.findIndex(l => (song.videoId && l.videoId === song.videoId) || (!song.videoId && l.title === song.title && l.artist === song.artist));
    if (index > -1) likedSongs.splice(index, 1);
    else likedSongs.push({ title: song.title, artist: song.artist, cover: song.cover, videoId: song.videoId || null, duration: song.duration || 0 });
    saveAppState(); updatePlayerHeart(); renderLikedGrid();
}

function updatePlayerHeart() {
    if (currentSongIndex < 0) { if (playerHeartBtn) playerHeartBtn.style.opacity = '0.3'; return; }
    if (playerHeartBtn) playerHeartBtn.style.opacity = '1';
    const song = playlist[currentSongIndex];
    if (playerHeartIcon) playerHeartIcon.innerHTML = isLiked(song) ? filledHeartSVG : emptyHeartSVG;
}

function renderLikedGrid() {
    likedGrid.innerHTML = '';
    if (likedSongs.length === 0) {
        likedGrid.innerHTML = `<div class="col-span-full text-center py-20"><div class="text-6xl mb-4 text-gray-400">♡</div><p class="text-2xl font-bold text-white">No liked songs yet</p><p class="text-gray-400 mt-2">Heart any song to add it here</p></div>`; return;
    }
    likedSongs.forEach(song => likedGrid.appendChild(createSongCard(song)));
}

function renderRecentGrid() {
    recentGrid.innerHTML = '';
    if (recentlyPlayed.length === 0) {
        recentGrid.innerHTML = `<div class="col-span-full text-center py-20"><div class="text-6xl mb-4 text-gray-400">🕒</div><p class="text-2xl font-bold text-white">No recent songs yet</p><p class="text-gray-400 mt-2">Play something to see it here</p></div>`; return;
    }
    recentlyPlayed.forEach(song => recentGrid.appendChild(createSongCard(song)));
}

addLocalBtn.addEventListener('click', () => localMusicInput.click());
localMusicInput.addEventListener('change', async (event) => {
    if (!currentUser) {
        localMusicInput.value = '';
        showToast("Please Sign Up to upload music to the cloud!");
        return openAuthModal();
    }
    const files = Array.from(event.target.files).filter(f => f.type.startsWith('audio/'));
    if (!files.length) return;
    
    localMusicInput.value = '';
    showToast("Starting upload process...");
    console.log(`Found ${files.length} file(s) to process.`);

    for (const file of files) {
        // 1. Get the file extension (usually .mp3)
        const extension = file.name.split('.').pop() || 'mp3';
        
        // 2. BULLETPROOF NAME: We only use numbers and random letters for the cloud path
        // Example: 1709451234_x7b9a.mp3
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${extension}`;
        
        // 3. Keep the pretty name for your database UI!
        const cleanTitle = file.name.replace(/\.[^/.]+$/, "").trim();
        
        console.log(`Processing: ${cleanTitle} (Saving to cloud as ${fileName})`);
        try {
            console.log("Step 1: Checking database for duplicates...");
            const { data: existingSongs, error: searchError } = await supabaseClient
                .from('song')
                .select('title')
                .eq('title', cleanTitle)

            if (searchError) {
                console.error("Step 1 Failed - Search Error:", searchError);
            }

            if (existingSongs && existingSongs.length > 0) {
                console.log(`Duplicate found for ${cleanTitle}, skipping.`);
                showToast(`"${cleanTitle}" is already in your library!`);
                continue; 
            }

            console.log("Step 2: No duplicate found. Uploading to Storage Bucket...");
            const { data: uploadData, error: uploadError } = await supabaseClient
                .storage
                .from('Local_music')
                .upload(fileName, file);

            if (uploadError) {
                console.error("Step 2 Failed - Storage Upload Error:", uploadError);
                showToast(`Failed to upload ${cleanTitle}`);
                continue;
            }

            console.log("Step 3: Upload successful. Getting public URL...");
            const { data: publicUrlData } = supabaseClient
                .storage
                .from('Local_music')
                .getPublicUrl(fileName);

            const songUrl = publicUrlData.publicUrl;

            console.log("Step 4: Saving to database...");
            const { data: dbData, error: dbError } = await supabaseClient
                .from('song') 
                .insert([
                    { title: cleanTitle, artist: 'Local File', file_url: songUrl, user_id: currentUser.id }
                ])
                .select(); 

            if (dbError) {
                console.error("Step 4 Failed - Database Insert Error:", dbError);
            } else {
                console.log("Step 5: Success!");
                showToast(`Successfully saved ${cleanTitle}!`);
                fetchAndRenderLibrary(); 
            }
        } catch (err) {
            console.error("Critical Catch Error:", err);
        }
    }
});

async function fetchAndRenderLibrary() {
    if (!currentUser) return;
    musicGrid.innerHTML = '<div class="col-span-full text-center py-10 text-cyan-400">Loading your cloud library...</div>';
    

    const { data: songs, error } = await supabaseClient
        .from('song')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('id', { ascending: false });

    if (error) {
        console.error("Error fetching library:", error);
        musicGrid.innerHTML = '<div class="col-span-full text-center text-red-500">Failed to load library.</div>';
        return;
    }

    musicGrid.innerHTML = ''; 

    if (!songs || songs.length === 0) {
        musicGrid.innerHTML = '<div class="col-span-full text-center py-20 text-gray-400">No cloud music found. Upload some!</div>';
        return;
    }

 
    songs.forEach(song => {
        const fileName = song.file_url.split('/').pop();
        const card = document.createElement('div');
        card.className = 'local-song bg-white/5 border border-white/10 rounded-2xl p-4 hover:bg-cyan-400/10 hover:-translate-y-1 hover:border-cyan-400 transition-all cursor-pointer relative group';
        
        card.innerHTML = `
            <div class="relative w-full h-32 bg-gradient-to-br from-zinc-900 via-zinc-800 to-black rounded-2xl mb-4 flex items-center justify-center overflow-hidden border border-white/10">
                <div class="text-6xl text-cyan-400/80">♪</div>
                <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div class="absolute bottom-3 left-3 text-xs text-white/70 font-medium">CLOUD</div>
                <button class="delete-cloud-btn absolute top-3 right-3 bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-30 shadow-lg font-bold">Delete</button>
            </div>
            <h3 class="text-white font-bold truncate">${song.title}</h3>
            <p class="text-gray-400 text-sm">Cloud Library</p>
        `;

        card.addEventListener('click', (e) => {
            if (!e.target.closest('.delete-cloud-btn')) playCloudSong(song);
        });

        card.querySelector('.delete-cloud-btn').addEventListener('click', async (e) => {
            e.stopPropagation();
            if (confirm(`Permanently delete "${song.title}" from the cloud?`)) {
                await deleteCloudSong(song.id, fileName);
            }
        });

        musicGrid.appendChild(card);
    });
}

function playCloudSong(song) {
    const formattedSong = { title: song.title, artist: song.artist, url: song.file_url, cover: song.cover_url || null, videoId: null, duration: 0 };
    let index = playlist.findIndex(s => s.url === formattedSong.url);
    if (index === -1) { playlist.push(formattedSong); index = playlist.length - 1; }
    loadAndPlayTrack(index);
}

async function deleteCloudSong(id, fileName) {
    showToast("Deleting...");
    await supabaseClient.storage.from('Local_music').remove([fileName]);
    const { error } = await supabaseClient.from('song').delete().eq('id', id);
    if (error) {
        console.error("Delete error:", error);
        showToast("Failed to delete.");
    } else {
        showToast("Song deleted forever.");
        fetchAndRenderLibrary(); // Refresh grid
    }
}

let searchTimeout = null;
searchInput.addEventListener('input', () => {
    const query = searchInput.value.trim();
    clearTimeout(searchTimeout);
    if (query === '') { showHome(); return; }
    searchTimeout = setTimeout(async () => { await performSearch(query); }, 350);
});

document.querySelectorAll('#search-tabs button').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('#search-tabs button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById('all-tab-content').classList.toggle('hidden', btn.dataset.tab !== 'all');
        document.getElementById('songs-tab-content').classList.toggle('hidden', btn.dataset.tab !== 'songs');
        document.getElementById('artists-tab-content').classList.toggle('hidden', btn.dataset.tab !== 'artists');
        document.getElementById('albums-tab-content').classList.toggle('hidden', btn.dataset.tab !== 'albums');
    });
});

async function performSearch(query) {
    const searchLoading = document.getElementById('search-loading');
    const searchContentWrapper = document.getElementById('search-content-wrapper');
    const artistsGrid = document.getElementById('artists-grid');
    const albumsGrid = document.getElementById('albums-grid');

    // 1. Show the glowing skeleton loader immediately
    showSearch(); 
    searchTermEl.textContent = query;
    searchLoading.classList.remove('hidden');
    searchContentWrapper.classList.add('hidden');

    try {
        const res = await fetch(`/api/search?query=${encodeURIComponent(query)}`);
        const data = await res.json(); // Now expects { songs, artists, albums }
        
        // 2. Hide loader, show content
        searchLoading.classList.add('hidden');
        searchContentWrapper.classList.remove('hidden');

        document.getElementById('top-result').innerHTML = ''; 
        document.getElementById('search-songs-list').innerHTML = ''; 
        document.getElementById('songs-list').innerHTML = '';
        artistsGrid.innerHTML = '';
        albumsGrid.innerHTML = '';

        if (!data.songs || data.songs.length === 0) {
            document.getElementById('search-songs-list').innerHTML = `<div class="text-center py-20 text-gray-400"><div class="text-6xl mb-4">😕</div><p class="text-2xl">No results found</p></div>`;
            return;
        }

        // Render Songs
        if (data.songs.length > 0) document.getElementById('top-result').appendChild(createTopResultCard(data.songs[0]));
        
        const listEl = document.getElementById('search-songs-list');
        const songsTabList = document.getElementById('songs-list');
        data.songs.forEach(song => {
            const item = createSearchListItem(song);
            listEl.appendChild(item);
            songsTabList.appendChild(item.cloneNode(true));
        });

        // Render Artists
        data.artists.forEach(artist => {
            const artistCard = document.createElement('div');
            artistCard.className = 'bg-white/5 border border-white/10 p-4 rounded-2xl hover:bg-white/10 hover:border-cyan-400 transition-all cursor-pointer text-center group';
            artistCard.innerHTML = `
                <img src="${artist.cover}" class="w-full aspect-square rounded-full object-cover mb-4 shadow-lg group-hover:shadow-[0_0_20px_rgba(0,242,255,0.4)] transition-shadow">
                <h4 class="text-white font-bold truncate">${artist.name}</h4>
                <p class="text-xs text-gray-400 mt-1">${artist.subscribers}</p>
            `;
            artistCard.onclick = () => showToast(`Artist view for ${artist.name} coming soon!`);
            artistsGrid.appendChild(artistCard);
        });

        // Render Albums/Playlists
        data.albums.forEach(album => {
            const albumCard = document.createElement('div');
            albumCard.className = 'bg-white/5 border border-white/10 p-4 rounded-2xl hover:bg-white/10 hover:border-cyan-400 transition-all cursor-pointer group';
            albumCard.innerHTML = `
                <img src="${album.cover}" class="w-full aspect-square rounded-lg object-cover mb-4 shadow-lg group-hover:shadow-[0_0_20px_rgba(0,242,255,0.4)] transition-shadow">
                <h4 class="text-white font-bold truncate">${album.title}</h4>
                <p class="text-xs text-gray-400 mt-1">${album.artist}</p>
            `;
            albumCard.onclick = () => showToast(`Album view for ${album.title} coming soon!`);
            albumsGrid.appendChild(albumCard);
        });

    } catch (err) { 
        console.error(err); 
        searchLoading.classList.add('hidden');
        showToast('Search failed. Make sure server is running.'); 
    }
}

function createTopResultCard(song) {
    const div = document.createElement('div');
    div.innerHTML = `
        <div class="hero-card"><img src="${song.cover || 'https://picsum.photos/400'}" alt="${song.title}">
        <div class="hero-content"><div class="top-label">TOP RESULT</div><h3>${song.title}</h3><p>${song.artist}</p><button class="flex items-center justify-center gap-3"><svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.14v14l11-7z"/></svg><span>PLAY</span></button></div></div>`;
    div.addEventListener('click', (e) => { if (!e.target.closest('button')) playSongFromCard(song); });
    div.querySelector('button').addEventListener('click', (e) => { e.stopPropagation(); playSongFromCard(song); });
    return div;
}
function createSearchListItem(song) {
    const item = document.createElement('div'); item.className = 'search-list-item cursor-pointer';
    item.innerHTML = `
        <div class="thumbnail-container"><img src="${song.cover || 'https://picsum.photos/56'}" alt=""><div class="play-overlay"><svg width="28" height="28" viewBox="0 0 24 24" fill="white"><path d="M8 5.14v14l11-7z"/></svg></div></div>
        <div class="song-info"><div class="song-title">${song.title}</div><div class="song-artist">${song.artist}</div></div>
        <div class="actions"><button class="heart-btn text-2xl z-20">${isLiked(song) ? filledHeartSVG : emptyHeartSVG}</button><button class="add-playlist-btn text-cyan-400 text-3xl leading-none z-20">+</button></div>`;
    item.addEventListener('click', (e) => { if (!e.target.closest('button')) playSongFromCard(song); });
    item.querySelector('.heart-btn').addEventListener('click', (e) => { e.stopPropagation(); toggleLike(song); e.currentTarget.innerHTML = isLiked(song) ? filledHeartSVG : emptyHeartSVG; });
    item.querySelector('.add-playlist-btn').addEventListener('click', (e) => { e.stopPropagation(); showAddToPlaylistModal(song); });
    return item;
}

shuffleBtn.addEventListener('click', () => { isShuffle = !isShuffle; shuffleBtn.style.color = isShuffle ? '#00f2ff' : '#b3b3b3'; saveAppState(); });
repeatBtn.addEventListener('click', () => { repeatMode = (repeatMode + 1) % 3; updateRepeatButtonUI(); saveAppState(); });
autoplayBtn.addEventListener('click', () => { autoplayEnabled = !autoplayEnabled; autoplayBtn.style.color = autoplayEnabled ? '#00f2ff' : '#b3b3b3'; saveAppState(); });
downloadBtn.addEventListener('click', () => { if (currentSongIndex === -1) return; const song = playlist[currentSongIndex]; const a = document.createElement('a'); a.href = song.url; a.download = `${song.title}.mp3`; document.body.appendChild(a); a.click(); document.body.removeChild(a); });

async function loadAndPlayTrack(index, autoplay = true) {
    if (index < 0 || index >= playlist.length) return;
    currentSongIndex = index; 
    const song = playlist[currentSongIndex];
    
    // LAZY LOAD FIX: Fetch the audio stream instantly if it is missing!
    if (song.videoId && !song.url) {
        playerTitle.textContent = "Loading audio...";
        try {
            const res = await fetch(`/api/stream?videoId=${song.videoId}`);
            const data = await res.json();
            if (data.url) song.url = data.url;
        } catch(e) { console.error("Stream fetch failed"); }
    }

    if (autoplay) addToRecentlyPlayed(song);
    
    // Safely assign the URL now that we have it
    if (song.url) audioPlayer.src = song.url; 
    
    playerTitle.textContent = song.title; 
    playerArtist.textContent = song.artist || "Local Library";
    if (song.cover) playerCover.src = song.cover; else playerCover.src = "https://picsum.photos/56/56";
    
if (autoplay) { audioPlayer.play().catch(() => {}); isPlaying = true; } else { isPlaying = false; }
    
    updatePlayBtnUI(); 
    updatePlayerHeart(); 
    saveAppState();
    
    // NEW: Tell the AI to check the queue every time a song starts!
    maintainSmartQueue();

    // NEW: Pre-fetch the next track so mobile browsers don't block playback!
    prefetchNextSong();
}


function updatePlayBtnUI() {
    if (isPlaying) { playIcon.classList.add('hidden'); pauseIcon.classList.remove('hidden'); body.classList.add('music-playing'); } 
    else { playIcon.classList.remove('hidden'); pauseIcon.classList.add('hidden'); body.classList.remove('music-playing'); }
}

playBtn.addEventListener('click', () => {
    if (!audioPlayer.src) return;
    if (isPlaying) audioPlayer.pause(); else { audioPlayer.play().catch(() => {}); addToRecentlyPlayed(playlist[currentSongIndex]); }
    isPlaying = !isPlaying; updatePlayBtnUI(); saveAppState();
});
playerHeartBtn.addEventListener('click', () => { if (currentSongIndex < 0) return; toggleLike(playlist[currentSongIndex]); updatePlayerHeart(); });
nextBtn.addEventListener('click', () => {
    if (playlist.length === 0) return;
    if (repeatMode === 2) return loadAndPlayTrack(currentSongIndex);
    let nextIndex = isShuffle ? (() => { let n = currentSongIndex; while (n === currentSongIndex) n = Math.floor(Math.random() * playlist.length); return n; })() : (currentSongIndex + 1) % playlist.length;
    loadAndPlayTrack(nextIndex);
});
prevBtn.addEventListener('click', () => {
    if (playlist.length === 0) return;
    const prevIndex = (currentSongIndex - 1 + playlist.length) % playlist.length; loadAndPlayTrack(prevIndex);
});
audioPlayer.addEventListener('ended', () => {
    // 1. Handle Single Song Repeat
    if (repeatMode === 2) { 
        audioPlayer.currentTime = 0; 
        audioPlayer.play().catch(() => {}); 
        return; 
    }
    
    const isAtEnd = currentSongIndex >= playlist.length - 1;
    
    // 2. Play the next song instantly (AI already loaded it!)
    if (!isAtEnd) {
        let nextIndex = isShuffle ? 
            (() => { let n = currentSongIndex; while (n === currentSongIndex && playlist.length > 1) n = Math.floor(Math.random() * playlist.length); return n; })() 
            : currentSongIndex + 1;
        loadAndPlayTrack(nextIndex); 
        return;
    }
    
    // 3. We only reach this if Autoplay is OFF and the queue is completely empty
    if (repeatMode === 1 && playlist.length > 0) { 
        loadAndPlayTrack(0); 
    } else { 
        isPlaying = false; 
        updatePlayBtnUI(); 
    }
});

function formatTime(s) { 
    if (isNaN(s) || !isFinite(s)) return "0:00"; 
    const m = Math.floor(s / 60); const sec = Math.floor(s % 60); return `${m}:${sec < 10 ? '0' : ''}${sec}`; 
}
audioPlayer.addEventListener('loadedmetadata', () => {
    const song = playlist[currentSongIndex];
    let trueDuration = (song && song.duration) ? song.duration : audioPlayer.duration;
    if (!trueDuration || trueDuration === Infinity || isNaN(trueDuration)) trueDuration = 0; 
    progressSlider.max = trueDuration; totalTimeEl.textContent = formatTime(trueDuration);
});
audioPlayer.addEventListener('timeupdate', () => {
    const song = playlist[currentSongIndex];
    let trueDuration = (song && song.duration) ? song.duration : audioPlayer.duration;
    if (!trueDuration || !isFinite(trueDuration) || isNaN(trueDuration)) trueDuration = 0; 
    if (trueDuration > 0) { progressSlider.max = trueDuration; totalTimeEl.textContent = formatTime(trueDuration); }
    progressSlider.value = audioPlayer.currentTime; currentTimeEl.textContent = formatTime(audioPlayer.currentTime);
    clearTimeout(timeSaveTimeout); timeSaveTimeout = setTimeout(saveAppState, 2000);
});
progressSlider.addEventListener('input', () => audioPlayer.currentTime = progressSlider.value);
volumeSlider.addEventListener('input', (e) => {
    const newVol = parseFloat(e.target.value); audioPlayer.volume = newVol; if (newVol > 0) previousVolume = newVol;
    updateVolumeIcon(); saveAppState();
});
volumeBtn.addEventListener('click', () => {
    if (audioPlayer.volume === 0) { audioPlayer.volume = previousVolume; volumeSlider.value = previousVolume; } 
    else { previousVolume = audioPlayer.volume; audioPlayer.volume = 0; volumeSlider.value = 0; }
    updateVolumeIcon(); saveAppState();
});
function updateVolumeIcon() {
    const vol = audioPlayer.volume; let svgHTML;
    if (vol < 0.01) svgHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>`;
    else if (vol < 0.4) svgHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon></svg>`;
    else if (vol < 0.7) svgHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>`;
    else svgHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path></svg>`;
    volumeBtn.innerHTML = svgHTML;
}
function updateRepeatButtonUI() {
    if (repeatMode === 0) { repeatBtn.style.color = '#b3b3b3'; repeatBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><path d="M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>`; } 
    else if (repeatMode === 1) { repeatBtn.style.color = '#00f2ff'; repeatBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><path d="M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>`; } 
    else { repeatBtn.style.color = '#00f2ff'; repeatBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><path d="M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/><text x="12" y="19" font-size="8" text-anchor="middle" fill="#00f2ff">1</text></svg>`; }
}
const mainContent = document.querySelector('main');
mainContent.addEventListener('scroll', () => {
    if (homeSection.classList.contains('hidden')) return;
    if (isLoadingLatest) return;
    if (mainContent.scrollTop + mainContent.clientHeight >= mainContent.scrollHeight - 400) loadMoreLatestSongs();
});

// ================== YT-STYLE ADD TO PLAYLIST MODAL ==================
let pendingSongToAdd = null;
const addToPlaylistModal = document.getElementById('add-to-playlist-modal');
const playlistSelectionList = document.getElementById('playlist-selection-list');

function showAddToPlaylistModal(song) {
    pendingSongToAdd = song;
    renderPlaylistSelectionModal();
    addToPlaylistModal.classList.remove('hidden');
    setTimeout(() => {
        addToPlaylistModal.classList.remove('opacity-0');
        addToPlaylistModal.querySelector('div').classList.remove('scale-95');
        addToPlaylistModal.querySelector('div').classList.add('scale-100');
    }, 10);
}

function closeAddToPlaylistModal() {
    addToPlaylistModal.classList.add('opacity-0');
    addToPlaylistModal.querySelector('div').classList.remove('scale-100');
    addToPlaylistModal.querySelector('div').classList.add('scale-95');
    setTimeout(() => addToPlaylistModal.classList.add('hidden'), 200);
}

function renderPlaylistSelectionModal() {
    playlistSelectionList.innerHTML = '';
    const playlists = Object.keys(appState.userPlaylists);
    if (playlists.length === 0) {
        playlistSelectionList.innerHTML = `<div class="text-center py-6 text-gray-500 text-sm">No custom playlists yet.</div>`; return;
    }
    playlists.forEach(name => {
        const li = document.createElement('div');
        li.className = 'flex items-center gap-4 p-3 rounded-xl hover:bg-white/10 cursor-pointer transition-colors group';
        const coverImg = appState.userPlaylists[name].cover ? `<img src="${appState.userPlaylists[name].cover}" class="w-12 h-12 object-cover rounded-lg border border-white/10">` : `<div class="w-12 h-12 bg-zinc-800 rounded-lg flex items-center justify-center text-gray-400 border border-white/5"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg></div>`;
        li.innerHTML = `${coverImg}<span class="text-white font-medium text-lg group-hover:text-cyan-400 transition-colors">${name}</span>`;
        li.onclick = () => { if (pendingSongToAdd) { addSongToPlaylist(name, pendingSongToAdd); pendingSongToAdd = null; } closeAddToPlaylistModal(); };
        playlistSelectionList.appendChild(li);
    });
}

document.getElementById('close-add-to-playlist-btn')?.addEventListener('click', () => { closeAddToPlaylistModal(); pendingSongToAdd = null; });
addToPlaylistModal?.addEventListener('click', (e) => { if (e.target === addToPlaylistModal) { closeAddToPlaylistModal(); pendingSongToAdd = null; } });
document.getElementById('create-new-from-modal-btn')?.addEventListener('click', () => {
    closeAddToPlaylistModal(); 
    const existingCount = Object.keys(appState.userPlaylists).length;
    document.getElementById('playlist-name-input').value = existingCount === 0 ? "My Playlist" : `My Playlist #${existingCount + 1}`;
    document.getElementById('playlist-desc-input').value = '';
    document.getElementById('uploaded-thumbnail').classList.add('hidden');
    document.getElementById('default-icon').classList.remove('hidden');
    currentThumbnailBase64 = null; document.getElementById('new-playlist-modal').classList.remove('hidden');
});

// ========================================================
// INFINITE AI RADIO ENGINE
// ========================================================
let isGeneratingQueue = false;

async function maintainSmartQueue() {
    if (!autoplayEnabled || isGeneratingQueue || playlist.length === 0) return;

    // Trigger if 3 or fewer songs are left in the queue
    if (playlist.length - currentSongIndex <= 3) {
        isGeneratingQueue = true;
        
        try {
            const seedSong = playlist[playlist.length - 1]; 
            const playedIds = playlist.map(s => s.videoId).filter(Boolean);
            const historyArtists = recentlyPlayed.map(s => s.artist).filter(Boolean);
            const uniqueRecentArtists = [...new Set(historyArtists)].slice(0, 5);

            const res = await fetch('/api/autoplay/queue', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    seedTitle: seedSong.title,
                    seedArtist: seedSong.artist || '',
                    historyArtists: uniqueRecentArtists,
                    playedVideoIds: playedIds
                })
            });

            if (res.ok) {
                const data = await res.json();
                if (data.queue && data.queue.length > 0) {
                    data.queue.forEach(nextSong => {
                        playlist.push({
                            title: nextSong.title,
                            artist: nextSong.artist,
                            cover: nextSong.cover,
                            videoId: nextSong.videoId,
                            duration: nextSong.duration || 0,
                            url: null // Lazy load audio
                        });
                    });
                    console.log(`🎵 AI Radio added ${data.queue.length} upcoming tracks!`);
                    saveAppState();

                    // NEW: If we were almost out of songs, start pre-fetching the new batch immediately!
                    prefetchNextSong(); 
                }
            }
        } catch (error) {
            console.error("Queue Generator Failed:", error);
        } finally {
            isGeneratingQueue = false;
        }
    }
}

// ================== MOBILE AUTOPLAY FIX ==================
async function prefetchNextSong() {
    const nextIndex = currentSongIndex + 1;
    // If there is a next song, and we haven't fetched its URL yet...
    if (nextIndex < playlist.length) {
        const nextSong = playlist[nextIndex];
        if (nextSong.videoId && !nextSong.url) {
            try {
                console.log(`Pre-fetching audio for: ${nextSong.title}`);
                const res = await fetch(`/api/stream?videoId=${nextSong.videoId}`);
                const data = await res.json();
                if (data.url) {
                    nextSong.url = data.url; // Save it to the playlist ahead of time!
                }
            } catch (e) {
                console.error("Prefetch failed", e);
            }
        }
    }
}
// ================== PASSWORD VISIBILITY TOGGLE ==================
const toggleAuthPasswordBtn = document.getElementById('toggle-auth-password');
const eyeOpenIcon = document.getElementById('eye-open');
const eyeClosedIcon = document.getElementById('eye-closed');

if (toggleAuthPasswordBtn) {
    toggleAuthPasswordBtn.addEventListener('click', (e) => {
        e.preventDefault(); // Stop the form from submitting
        if (authPassword.type === 'password') {
            authPassword.type = 'text';
            eyeOpenIcon.classList.add('hidden');
            eyeClosedIcon.classList.remove('hidden');
        } else {
            authPassword.type = 'password';
            eyeOpenIcon.classList.remove('hidden');
            eyeClosedIcon.classList.add('hidden');
        }
    });
}

// ================== AUTHENTICATION (LOGIN & GUEST) ==================
let currentUser = null;
let isSignUpMode = false;
let isGuest = false;
const GUEST_TRIAL_MS = 3 * 24 * 60 * 60 * 1000;

const forgotPasswordBtn = document.getElementById('forgot-password-btn');
const forgotPasswordContainer = document.getElementById('forgot-password-container');
const authModal = document.getElementById('auth-modal');
const authHeaderBtn = document.getElementById('auth-header-btn');
const closeAuthBtn = document.getElementById('close-auth-btn');
const authTitle = document.getElementById('auth-title');
const authSubtitle = document.getElementById('auth-subtitle');
const authSubmitBtn = document.getElementById('auth-submit-btn');
const guestBtn = document.getElementById('guest-btn');
const authSwitchText = document.getElementById('auth-switch-text');
const authSwitchBtn = document.getElementById('auth-switch-btn');
const authEmail = document.getElementById('auth-email');
const authPassword = document.getElementById('auth-password');

//async function checkAuth() {
function updateAuthUI() {
    const guestDivider = guestBtn.previousElementSibling;
    const loggedOutIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`;
    
    // NEW: Check the cloud state for a custom profile picture!
    let loggedInContent = `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><polyline points="16 11 18 13 22 9"/></svg>`;
    
    if (appState.profilePic) {
        // If they have a picture, replace the SVG with their actual face!
        loggedInContent = `<img src="${appState.profilePic}" class="w-full h-full object-cover rounded-xl border-none">`;
    }

    if (currentUser) {
        authHeaderBtn.classList.add('text-cyan-400', 'border-cyan-400/50'); 
        // We use p-0 so the image perfectly fills the square button
        if (appState.profilePic) authHeaderBtn.classList.add('p-0'); 
        else authHeaderBtn.classList.remove('p-0');
        
        authHeaderBtn.innerHTML = loggedInContent;
        guestBtn.classList.add('hidden');
        if (guestDivider) guestDivider.classList.add('hidden');
    } else if (isGuest) {
        authHeaderBtn.classList.remove('text-cyan-400', 'border-cyan-400/50', 'p-0');
        authHeaderBtn.innerHTML = loggedOutIcon;
        guestBtn.classList.add('hidden');
        if (guestDivider) guestDivider.classList.add('hidden');
    } else {
        authHeaderBtn.classList.remove('text-cyan-400', 'border-cyan-400/50', 'p-0');
        authHeaderBtn.innerHTML = loggedOutIcon;
        guestBtn.classList.remove('hidden');
        if (guestDivider) guestDivider.classList.remove('hidden');
    }
}

function openAuthModal() {
    authModal.classList.remove('hidden');
    setTimeout(() => {
        authModal.classList.remove('opacity-0');
        authModal.querySelector('div').classList.remove('scale-95');
    }, 10);
}

function closeAuthModal() {
    authModal.classList.add('opacity-0');
    authModal.querySelector('div').classList.add('scale-95');
    setTimeout(() => authModal.classList.add('hidden'), 200);
}
// ================== PROFILE DROPDOWN ENGINE ==================
const profileDropdown = document.getElementById('profile-dropdown');
const menuLogoutBtn = document.getElementById('menu-logout-btn');
const settingsAutoplayToggle = document.getElementById('settings-autoplay-toggle');

if (authHeaderBtn) {
    authHeaderBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (currentUser) {
            // Update the name and picture dynamically from our saved state
            document.getElementById('dropdown-name').textContent = appState.profileName || currentUser.email.split('@')[0];
            if (appState.profilePic) {
                document.getElementById('dropdown-pic').src = appState.profilePic;
            }
            // Toggle Dropdown
            const isHidden = profileDropdown.classList.contains('hidden');
            if (isHidden) {
                profileDropdown.classList.remove('hidden');
                setTimeout(() => {
                    profileDropdown.classList.remove('opacity-0', 'scale-95');
                }, 10);
            } else {
                closeDropdown();
            }
        } else {
            openAuthModal();
        }
    });
}

// Close Dropdown if clicked outside
document.addEventListener('click', (e) => {
    if (profileDropdown && !profileDropdown.classList.contains('hidden') && !e.target.closest('#profile-dropdown') && !e.target.closest('#auth-header-btn')) {
        closeDropdown();
    }
});

function closeDropdown() {
    profileDropdown.classList.add('opacity-0', 'scale-95');
    setTimeout(() => profileDropdown.classList.add('hidden'), 200);
}

// ================== MENU MODAL TRIGGERS ==================
const openMenuModal = (modalId) => {
    closeDropdown();
    const modal = document.getElementById(modalId);
    modal.classList.remove('hidden');
    setTimeout(() => {
        modal.classList.remove('opacity-0');
        modal.querySelector('div').classList.remove('scale-95');
    }, 10);
};

const closeMenuModals = () => {
    ['profile-modal', 'email-settings-modal', 'settings-modal'].forEach(id => {
        const modal = document.getElementById(id);
        if(!modal.classList.contains('hidden')) {
            modal.classList.add('opacity-0');
            modal.querySelector('div').classList.add('scale-95');
            setTimeout(() => modal.classList.add('hidden'), 200);
        }
    });
};

document.getElementById('menu-profile-btn')?.addEventListener('click', () => openMenuModal('profile-modal'));
document.getElementById('menu-email-btn')?.addEventListener('click', () => openMenuModal('email-settings-modal'));
document.getElementById('menu-settings-btn')?.addEventListener('click', () => openMenuModal('settings-modal'));

document.querySelectorAll('.close-menu-modal').forEach(btn => {
    btn.addEventListener('click', closeMenuModals);
});

// Sync Settings Toggle with actual Autoplay logic
settingsAutoplayToggle?.addEventListener('change', (e) => {
    autoplayEnabled = e.target.checked;
    if (autoplayBtn) autoplayBtn.style.color = autoplayEnabled ? '#00f2ff' : '#b3b3b3';
    saveAppState();
    showToast(autoplayEnabled ? "Smart Autoplay Enabled" : "Smart Autoplay Disabled");
});

// Log Out from Menu
menuLogoutBtn?.addEventListener('click', async () => {
    closeDropdown();
    await supabaseClient.auth.signOut();
    currentUser = null;
    isGuest = false;
    showToast("Signed out successfully");
    updateAuthUI();
    // Stop music on logout
    audioPlayer.pause();
    isPlaying = false;
    updatePlayBtnUI();
    showHome();
});

guestBtn.addEventListener('click', () => {
    if (!localStorage.getItem('aura_guest_start')) {
        localStorage.setItem('aura_guest_start', Date.now());
    }
    isGuest = true;
    closeAuthModal();
    showToast("Enjoy your 3-day guest trial!");
    updateAuthUI();
});

closeAuthBtn.addEventListener('click', () => {
    if (currentUser || isGuest) {
        closeAuthModal();
    } else {
        showToast("You must sign in or choose Guest mode.");
    }
});

authSwitchBtn.addEventListener('click', () => {
    isSignUpMode = !isSignUpMode;
    authTitle.textContent = isSignUpMode ? "Create Account" : "Sign In";
    authSubtitle.textContent = isSignUpMode ? "Join the future of music." : "Welcome back to Aura.";
    authSubmitBtn.textContent = isSignUpMode ? "Sign Up" : "Sign In";
    authSwitchText.textContent = isSignUpMode ? "Already have an account?" : "Don't have an account?";
    authSwitchBtn.textContent = isSignUpMode ? "Sign In" : "Sign Up";
    if (forgotPasswordContainer) forgotPasswordContainer.classList.toggle('hidden', isSignUpMode);
});
// ================== FORGOT PASSWORD LOGIC ==================
forgotPasswordBtn?.addEventListener('click', async () => {
    const email = authEmail.value.trim();
    
    // Make sure they typed an email first!
    if (!email) {
        return showToast("Please enter your email address first!");
    }

    forgotPasswordBtn.disabled = true;
    forgotPasswordBtn.textContent = "Sending...";

    // Tell Supabase to send the secure reset link
    const { data, error } = await supabaseClient.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin, // Redirects them back to your site
    });

    if (error) {
        showToast(error.message);
    } else {
        showToast("Password reset email sent! Check your inbox.");
    }

    forgotPasswordBtn.disabled = false;
    forgotPasswordBtn.textContent = "Forgot Password?";
});

authSubmitBtn.addEventListener('click', async () => {
    const email = authEmail.value.trim();
    const password = authPassword.value;
    if (!email || !password) return showToast("Please enter email and password");

    authSubmitBtn.textContent = "Loading..."; authSubmitBtn.disabled = true;

    if (isSignUpMode) {
        const { data, error } = await supabaseClient.auth.signUp({ email, password });
        if (error) showToast(error.message);
        else { showToast("Account created successfully!"); closeAuthModal(); checkAccess(); }
    } else {
        const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
        if (error) showToast("Invalid login credentials");
        else { showToast("Welcome back!"); closeAuthModal(); checkAccess(); }
    }
    authSubmitBtn.disabled = false; authSubmitBtn.textContent = isSignUpMode ? "Sign Up" : "Sign In";
});

async function checkAccess() {
    const { data: { session } } = await supabaseClient.auth.getSession();
    currentUser = session?.user || null;

    if (currentUser) {
        const hasGuestData = localStorage.getItem('aura_guest_start') !== null;
        // FIX: Changed .single() to .maybeSingle() to prevent the 406 crash!
        const { data } = await supabaseClient.from('profiles').select('app_data').eq('id', currentUser.id).maybeSingle();
        
        if (data && data.app_data) {
            appState = data.app_data;
            likedSongs = appState.likedSongs || [];
            recentlyPlayed = appState.recentlyPlayed || [];
            appState.userPlaylists = appState.userPlaylists || {};
            renderPlaylistsSidebar();

            localStorage.setItem('auraPlayerState', JSON.stringify(appState));
        } else {
            await saveAppState(); 
            if (hasGuestData) {
                showToast("Guest data successfully synced to your new account!");
            }
        }
        localStorage.removeItem('aura_guest_start');
        
        updateAuthUI();
        fetchAndRenderLibrary();
        return; 
    }
    const guestStart = localStorage.getItem('aura_guest_start');
    if (guestStart) {
        const elapsed = Date.now() - parseInt(guestStart, 10);
        if (elapsed > 3 * 24 * 60 * 60 * 1000) {
            isGuest = false;
            localStorage.removeItem('aura_guest_start');
            localStorage.removeItem('auraPlayerState'); 
            openAuthModal();
            showToast("Your 3-day trial has expired. Please sign up!");
        } else {
            isGuest = true;
            updateAuthUI();
        }
    } else {
        openAuthModal();
    }
}
// ================== PASSWORD RECOVERY ENGINE ==================
// 1. Listen for the exact moment a user clicks the recovery email link
supabaseClient.auth.onAuthStateChange(async (event, session) => {
    if (event === 'PASSWORD_RECOVERY') {
        // FIX: Force close the standard Sign In modal so it doesn't block the screen!
        closeAuthModal();
        
        const updateModal = document.getElementById('update-password-modal');
        updateModal.classList.remove('hidden');
        
        // Slight delay for smooth animation
        setTimeout(() => {
            updateModal.classList.remove('opacity-0');
            updateModal.querySelector('div').classList.remove('scale-95');
        }, 10);
    }
});

// 2. Save the new password when they click the button
document.getElementById('save-new-password-btn')?.addEventListener('click', async () => {
    const newPassword = document.getElementById('new-password-input').value;
    const btn = document.getElementById('save-new-password-btn');
    
    if (!newPassword || newPassword.length < 6) {
        return showToast("Password must be at least 6 characters.");
    }
    
    btn.textContent = "Updating..."; 
    btn.disabled = true;

    // Tell Supabase to update the account with the new password
    const { error } = await supabaseClient.auth.updateUser({ password: newPassword });
    
    if (error) {
        showToast(error.message);
    } else {
        showToast("Password updated successfully!");
        
        // Hide the modal, they are done!
        const updateModal = document.getElementById('update-password-modal');
        updateModal.classList.add('opacity-0');
        updateModal.querySelector('div').classList.add('scale-95');
        setTimeout(() => updateModal.classList.add('hidden'), 200);
        
        // Show the home page now that they are securely logged in
        showHome();
    }
    
    btn.textContent = "Update Password"; 
    btn.disabled = false;
});

// ================== MY PROFILE LOGIC (WITH CROPPER) ==================
const profileModalImg = document.getElementById('profile-modal-img');
const profileImageUpload = document.getElementById('profile-image-upload');
const profileImgContainer = document.getElementById('profile-img-container');
const profileNameInput = document.getElementById('profile-name-input');
const profileDobInput = document.getElementById('profile-dob-input');
const saveProfileBtn = document.getElementById('save-profile-btn');

// New Workspace Elements
const profileViewSection = document.getElementById('profile-view-section');
const profileCropSection = document.getElementById('profile-crop-section');
const profileInputsSection = document.getElementById('profile-inputs-section');
const cropImageTarget = document.getElementById('crop-image-target');
const confirmCropBtn = document.getElementById('confirm-crop-btn');

let tempProfilePicBase64 = null;
let cropper = null;

// 1. Open file picker
profileImgContainer?.addEventListener('click', () => {
    profileImageUpload.click();
});

// 2. Load the image into the Cropper workspace
profileImageUpload?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Hide normal UI, show cropping UI
    profileViewSection.classList.add('hidden');
    profileInputsSection.classList.add('hidden');
    profileCropSection.classList.remove('hidden');
    profileCropSection.classList.add('flex');

    const reader = new FileReader();
    reader.onload = function(ev) {
        cropImageTarget.src = ev.target.result;
        
        // Destroy old cropper if it exists
        if (cropper) cropper.destroy();
        
        // Initialize mobile-friendly cropper
        cropper = new Cropper(cropImageTarget, {
            aspectRatio: 1, // Force square/circle
            viewMode: 1,    // Restrict within bounds
            dragMode: 'move', // Let the user drag the image with their finger
            autoCropArea: 1,
            cropBoxMovable: false, // Lock the circle in the center
            cropBoxResizable: false, // Lock the circle size
            guides: false,
            center: false,
            highlight: false,
            background: false
        });
    };
    reader.readAsDataURL(file);
});

// 3. Confirm Crop Position
confirmCropBtn?.addEventListener('click', () => {
    if (!cropper) return;
    
    // Grab the beautifully positioned image and compress it
    const canvas = cropper.getCroppedCanvas({ width: 150, height: 150 });
    tempProfilePicBase64 = canvas.toDataURL('image/jpeg', 0.8);
    
    // Update preview
    profileModalImg.src = tempProfilePicBase64;
    
    // Hide cropping UI, restore normal UI
    profileCropSection.classList.add('hidden');
    profileCropSection.classList.remove('flex');
    profileViewSection.classList.remove('hidden');
    profileInputsSection.classList.remove('hidden');
});

// 4. Pre-fill their existing data
document.getElementById('menu-profile-btn')?.addEventListener('click', () => {
    profileNameInput.value = appState.profileName || (currentUser ? currentUser.email.split('@')[0] : 'Aura User');
    profileDobInput.value = appState.profileDob || '';
    profileModalImg.src = appState.profilePic || 'https://picsum.photos/100';
    tempProfilePicBase64 = null;
    
    // Ensure normal UI is visible in case they closed the modal mid-crop
    profileCropSection.classList.add('hidden');
    profileCropSection.classList.remove('flex');
    profileViewSection.classList.remove('hidden');
    profileInputsSection.classList.remove('hidden');
});

// 4. Save to Database
saveProfileBtn?.addEventListener('click', async () => {
    if (!currentUser) return showToast("You must be signed in to save your profile!");
    
    saveProfileBtn.textContent = "Saving to cloud...";
    saveProfileBtn.disabled = true;

    // Update the App State
    appState.profileName = profileNameInput.value.trim();
    appState.profileDob = profileDobInput.value;
    if (tempProfilePicBase64) {
        appState.profilePic = tempProfilePicBase64;
    }

    // Push the state silently to Supabase
    await saveAppState();

    // Instantly update the visuals in the Dropdown Menu
    document.getElementById('dropdown-name').textContent = appState.profileName;
    if (appState.profilePic) {
        document.getElementById('dropdown-pic').src = appState.profilePic;
        updateAuthUI();
    }

    showToast("Profile updated successfully!");
    
    // Smoothly close the modal
    const profileModal = document.getElementById('profile-modal');
    profileModal.classList.add('opacity-0');
    profileModal.querySelector('div').classList.add('scale-95');
    setTimeout(() => profileModal.classList.add('hidden'), 200);

    saveProfileBtn.textContent = "Save Profile";
    saveProfileBtn.disabled = false;
});

// ================== SECURITY & EMAIL SETTINGS ==================
const securityEmailInput = document.getElementById('security-email-input');
const securityPasswordInput = document.getElementById('security-password-input');
const updateSecurityBtn = document.getElementById('update-security-btn');

// 1. Pre-fill their current email when they open the modal
document.getElementById('menu-email-btn')?.addEventListener('click', () => {
    if (currentUser) {
        securityEmailInput.value = currentUser.email;
    }
    // Always clear the password field for safety
    securityPasswordInput.value = ''; 
});

// 3. Process the Security Update
updateSecurityBtn?.addEventListener('click', async () => {
    if (!currentUser) return showToast("You must be signed in.");

    const newEmail = securityEmailInput.value.trim();
    const newPassword = securityPasswordInput.value;

    // Check what the user is actually trying to change
    const isEmailChanged = newEmail && newEmail !== currentUser.email;
    const isPasswordChanged = newPassword.length > 0;

    if (!isEmailChanged && !isPasswordChanged) {
        return showToast("No changes were made.");
    }

    if (isPasswordChanged && newPassword.length < 6) {
        return showToast("New password must be at least 6 characters.");
    }

    updateSecurityBtn.textContent = "Updating...";
    updateSecurityBtn.disabled = true;

    // Package the updates for Supabase
    let updates = {};
    if (isEmailChanged) updates.email = newEmail;
    if (isPasswordChanged) updates.password = newPassword;

    // Tell Supabase to securely update the user
    const { data, error } = await supabaseClient.auth.updateUser(updates);

    if (error) {
        showToast(error.message);
    } else {
        // Success Handling
        if (isEmailChanged) {
            showToast("Security links sent to both old and new emails!");
        } else if (isPasswordChanged) {
            showToast("Password updated successfully!");
        }
        
        // Smoothly close the modal
        const emailModal = document.getElementById('email-settings-modal');
        emailModal.classList.add('opacity-0');
        emailModal.querySelector('div').classList.add('scale-95');
        setTimeout(() => emailModal.classList.add('hidden'), 200);
    }

    // Reset button
    updateSecurityBtn.textContent = "Update Security";
    updateSecurityBtn.disabled = false;
});

// ================== DELETE ACCOUNT LOGIC ==================
const initiateDeleteBtn = document.getElementById('initiate-delete-btn');
const deleteVerifyModal = document.getElementById('delete-verify-modal');
const closeDeleteModalBtns = document.querySelectorAll('.close-delete-modal');
const sendDeleteOtpBtn = document.getElementById('send-delete-otp-btn');
const confirmFinalDeleteBtn = document.getElementById('confirm-final-delete-btn');
const deleteOtpInput = document.getElementById('delete-otp-input');

// 1. Open the verification modal
initiateDeleteBtn?.addEventListener('click', () => {
    closeMenuModals(); // Close settings modal
    deleteVerifyModal.classList.remove('hidden');
    setTimeout(() => {
        deleteVerifyModal.classList.remove('opacity-0');
        deleteVerifyModal.querySelector('div').classList.remove('scale-95');
    }, 10);
});

// 2. Close the modal
const closeAccountDeleteModal = () => {
    deleteVerifyModal.classList.add('opacity-0');
    deleteVerifyModal.querySelector('div').classList.add('scale-95');
    setTimeout(() => {
        deleteVerifyModal.classList.add('hidden');
        deleteOtpInput.value = ''; // Clear input for security
    }, 200);
};

closeDeleteModalBtns.forEach(btn => btn.addEventListener('click', closeAccountDeleteModal));

// 3. Send OTP to user's email
sendDeleteOtpBtn?.addEventListener('click', async () => {
    if (!currentUser) return;
    
    sendDeleteOtpBtn.textContent = "Sending...";
    sendDeleteOtpBtn.disabled = true;

    // Use Supabase OTP to verify they own the email
    const { error } = await supabaseClient.auth.signInWithOtp({
        email: currentUser.email
    });

    if (error) {
        showToast(error.message);
        sendDeleteOtpBtn.textContent = "Send Code to Email";
    } else {
        showToast("Verification code sent to your email!");
        sendDeleteOtpBtn.textContent = "Code Sent (Check Inbox)";
    }
    
    setTimeout(() => {
        sendDeleteOtpBtn.disabled = false;
    }, 5000);
});

// 4. Verify OTP and Execute Deletion
confirmFinalDeleteBtn?.addEventListener('click', async () => {
    const otp = deleteOtpInput.value.trim();
    if (otp.length !== 6) return showToast("Please enter the 6-digit code.");

    confirmFinalDeleteBtn.textContent = "Verifying...";
    confirmFinalDeleteBtn.disabled = true;

    // Step A: Verify the OTP is correct
    const { data, error: verifyError } = await supabaseClient.auth.verifyOtp({
        email: currentUser.email,
        token: otp,
        type: 'email'
    });

    if (verifyError) {
        showToast("Invalid or expired code.");
        confirmFinalDeleteBtn.textContent = "Permanently Delete";
        confirmFinalDeleteBtn.disabled = false;
        return;
    }

    // Step B: OTP is correct! Now call our secure database function to wipe the user.
    showToast("Code verified. Deleting account...");
    
    const { error: deleteError } = await supabaseClient.rpc('delete_user');

    if (deleteError) {
        console.error("Deletion Failed:", deleteError);
        showToast("Failed to delete account. Server error.");
        confirmFinalDeleteBtn.textContent = "Permanently Delete";
        confirmFinalDeleteBtn.disabled = false;
    } else {
        // Step C: Success! Clean up the UI and log them out
        await supabaseClient.auth.signOut();
        currentUser = null;
        closeAccountDeleteModal();
        showToast("Your account has been permanently deleted.");
        updateAuthUI();
        showHome();
    }
});

// ================== TWO-FACTOR AUTHENTICATION (MFA) ==================
const enable2faBtn = document.getElementById('enable-2fa-btn');
const mfaEnrollModal = document.getElementById('mfa-enroll-modal');
const closeMfaModalBtn = document.getElementById('close-mfa-modal-btn');
const qrCodeContainer = document.getElementById('qr-code-container');
const verifyMfaBtn = document.getElementById('verify-mfa-btn');
const mfaCodeInput = document.getElementById('mfa-code-input');

let currentFactorId = null; // Stores the unique ID of the authenticator connection

// 1. Generate the QR Code and Open the Modal
enable2faBtn?.addEventListener('click', async () => {
    if (!currentUser) return;
    
    enable2faBtn.textContent = "Loading...";
    enable2faBtn.disabled = true;

    try {
        // Ask Supabase to start an Authenticator (TOTP) enrollment
        const { data, error } = await supabaseClient.auth.mfa.enroll({
            factorType: 'totp'
        });

        if (error) throw error;

        // Save the ID and inject the generated SVG image into our HTML
        currentFactorId = data.id;
        qrCodeContainer.innerHTML = data.totp.qr_code;

        // Close the settings modal and open the MFA modal
        closeMenuModals(); 
        mfaEnrollModal.classList.remove('hidden');
        setTimeout(() => {
            mfaEnrollModal.classList.remove('opacity-0');
            mfaEnrollModal.querySelector('div').classList.remove('scale-95');
        }, 10);

    } catch (err) {
        showToast(err.message);
    } finally {
        enable2faBtn.textContent = "Enable";
        enable2faBtn.disabled = false;
    }
});

// 2. Verify the 6-digit code to finalize enrollment
verifyMfaBtn?.addEventListener('click', async () => {
    const code = mfaCodeInput.value.trim();
    if (code.length !== 6) return showToast("Please enter the 6-digit code.");

    verifyMfaBtn.textContent = "Verifying...";
    verifyMfaBtn.disabled = true;

    try {
        // Step A: Create a verification challenge
        const challenge = await supabaseClient.auth.mfa.challenge({ factorId: currentFactorId });
        if (challenge.error) throw challenge.error;

        // Step B: Verify the code against the challenge
        const verify = await supabaseClient.auth.mfa.verify({
            factorId: currentFactorId,
            challengeId: challenge.data.id,
            code: code
        });

        if (verify.error) throw verify.error;

        showToast("Two-Factor Authentication Successfully Enabled!");
        
        // Cleanup UI
        mfaEnrollModal.classList.add('opacity-0');
        mfaEnrollModal.querySelector('div').classList.add('scale-95');
        setTimeout(() => {
            mfaEnrollModal.classList.add('hidden');
            mfaCodeInput.value = '';
            qrCodeContainer.innerHTML = ''; // Clear QR code for security
        }, 200);

    } catch (err) {
        showToast("Invalid code. Please try again.");
    } finally {
        verifyMfaBtn.textContent = "Verify & Enable";
        verifyMfaBtn.disabled = false;
    }
});

// 3. Close Modal Handler
closeMfaModalBtn?.addEventListener('click', () => {
    mfaEnrollModal.classList.add('opacity-0');
    mfaEnrollModal.querySelector('div').classList.add('scale-95');
    setTimeout(() => {
        mfaEnrollModal.classList.add('hidden');
        mfaCodeInput.value = '';
    }, 200);
});

// ================== FINAL INITIALIZATION ==================
async function startAura() {
    // Fallback: If Supabase takes too long, we manually check the URL for the recovery token
    if (window.location.hash.includes('type=recovery')) {
        closeAuthModal();
        const updateModal = document.getElementById('update-password-modal');
        updateModal.classList.remove('hidden');
        setTimeout(() => {
            updateModal.classList.remove('opacity-0');
            updateModal.querySelector('div').classList.remove('scale-95');
        }, 10);
    }

    // Load the app strictly in order so the database doesn't crash!
    await loadAppState();
    await checkAccess();
    
    // Only automatically show the Home screen if the password reset modal ISN'T open
    if (document.getElementById('update-password-modal').classList.contains('hidden')) {
        showHome();
    }
}


// Start the engine!
startAura();