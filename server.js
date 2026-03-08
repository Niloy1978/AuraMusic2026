const express = require('express');
const cors = require('cors');
const path = require('path');
const { exec } = require('child_process');
const ytSearch = require('yt-search'); // Required for searching

const app = express();
const PORT = 3000; 

app.use(cors());
app.use(express.json()); 
app.use(express.static(path.join(__dirname)));

const streamCache = new Map();

// ==========================================
// 1. SEARCH API (THE MISSING PIECE!)
// ==========================================
app.get('/api/search', async (req, res) => {
    const query = req.query.query;
    if (!query) return res.status(400).json({ error: 'Query is required' });

    try {
        const results = await ytSearch(query);
        
        // Format the results exactly how your frontend expects them
        const songs = results.videos.slice(0, 15).map(v => ({
            title: v.title.replace(/\[.*?\]/g, '').trim(),
            artist: v.author.name,
            cover: v.thumbnail,
            videoId: v.videoId,
            duration: v.seconds
        }));

        // Return empty arrays for artists/albums to prevent frontend crashes
        res.json({ songs: songs, artists: [], albums: [] });

    } catch (error) {
        console.error('Search error:', error.message);
        res.status(500).json({ error: 'Search failed' });
    }
});

// ==========================================
// 2. CLEAN & SOLID STREAM API (FOR VPS)
// ==========================================
app.get('/api/stream', (req, res) => {
    const videoId = req.query.videoId;
    if (!videoId) return res.status(400).json({ error: 'No videoId' });

    const cached = streamCache.get(videoId);
    if (cached && Date.now() - cached.timestamp < 60 * 60 * 1000) {
        return res.json({ url: cached.url });
    }

    const isWindows = process.platform === 'win32';
    const ytDlpPath = isWindows ? path.join(__dirname, 'yt-dlp.exe') : path.join(__dirname, 'yt-dlp');
    
    const command = `"${ytDlpPath}" --force-ipv4 --no-warnings -g -f "140/bestaudio/best" "https://www.youtube.com/watch?v=${videoId}"`;

    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error('yt-dlp error:', error.message);
            return res.status(500).json({ error: 'Failed to load song.' });
        }
        
        if (stdout) {
            const url = stdout.trim();
            streamCache.set(videoId, { url: url, timestamp: Date.now() });
            res.json({ url: url });
        } else {
            res.status(500).json({ error: 'No URL returned.' });
        }
    });
});

// ==========================================
// 3. INFINITE SMART AUTOPLAY ENGINE
// ==========================================
app.post('/api/autoplay/queue', async (req, res) => {
    const { seedTitle, seedArtist, historyArtists = [], playedVideoIds = [], playedTitles = [] } = req.body;
    if (!seedTitle) return res.status(400).json({ error: 'Seed song info required' });

    try {
        const query = `${seedArtist} hit songs mix`;
        const results = await ytSearch(query);
        let candidates = results.videos.slice(0, 30); 

        const scoredCandidates = candidates.map((video, index) => {
            let score = 0;
            const videoArtist = video.author.name.toLowerCase();
            const searchArtist = seedArtist.toLowerCase();
            const cleanCandidateTitle = video.title.toLowerCase();
            const cleanSeedTitle = seedTitle.toLowerCase();

            if (videoArtist.includes(searchArtist)) score += 20; 
            else if (historyArtists.some(a => videoArtist.includes(a.toLowerCase()))) score += 10; 

            score += (30 - index) * 0.5; 

            const views = video.views || 0;
            if (views > 100000000) score += 15; 
            else if (views > 10000000) score += 10; 
            else if (views > 1000000) score += 5;  
            else if (views < 50000) score -= 15; 

            if (playedVideoIds.includes(video.videoId)) score -= 1000; 
            if (cleanCandidateTitle.includes(cleanSeedTitle) || cleanSeedTitle.includes(cleanCandidateTitle)) score -= 1000; 
            if (playedTitles.some(t => cleanCandidateTitle.includes(t.toLowerCase()))) score -= 1000;

            if (video.seconds > 420) score -= 50; 
            if (cleanCandidateTitle.includes('live')) score -= 15; 
            if (cleanCandidateTitle.includes('karaoke') || cleanCandidateTitle.includes('instrumental')) score -= 50;

            return { ...video, score };
        });

        scoredCandidates.sort((a, b) => b.score - a.score);
        const winners = scoredCandidates.filter(c => c.score > 0).slice(0, 5);

        if (winners.length === 0) return res.status(404).json({ error: 'Queue exhausted.' });

        const batch = winners.map(winner => ({
            videoId: winner.videoId,
            title: winner.title.replace(/\[.*?\]/g, '').replace(/\(.*?(video|audio|lyric).*?\)/gi, '').trim(),
            artist: winner.author.name,
            cover: winner.thumbnail,
            duration: winner.seconds
        }));

        res.json({ queue: batch });
    } catch (err) {
        console.error("Autoplay Gen Error:", err.message);
        res.status(500).json({ error: 'Failed to generate queue' });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Aura2026 running at http://localhost:${PORT}`);
});