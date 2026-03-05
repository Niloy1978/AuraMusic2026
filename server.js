const express = require('express');
const cors = require('cors');
const path = require('path');
const { exec } = require('child_process'); // Brought back child_process

const app = express();
const PORT = 3000; 

app.use(cors());
app.use(express.static(path.join(__dirname)));

const streamCache = new Map();

// ==========================================
// 1. SEARCH API
// ==========================================
app.get('/api/search', async (req, res) => {
    const query = req.query.query?.trim();
    if (!query) return res.status(400).json({ error: 'Query required' });

    try {
        const results = await require('yt-search')(query);
        
        // TITLE CLEANER: Scrubs messy YouTube text
        const cleanText = (text) => {
            if (!text) return '';
            return text.replace(/\[.*?\]/g, '') // Removes [Official Video], [4K], etc.
                       .replace(/\(.*?(video|audio|lyric|visualizer).*?\)/gi, '') // Removes (Official Music Video)
                       .replace(/\|.*/g, '') // Removes weird trailing pipe text
                       .replace(/- official.*/gi, '') // Removes "- Official..."
                       .replace(/ - Topic/gi, '') // Cleans up artist topics
                       .trim();
        };

        // 1. Get Songs
        const songs = results.videos
            .filter(v => v.seconds > 60 && !v.title.toLowerCase().includes('short'))
            .slice(0, 15)
            .map(v => ({
                videoId: v.videoId,
                title: cleanText(v.title),
                artist: cleanText(v.author.name) || 'Unknown',
                cover: v.thumbnail,
                duration: v.seconds
            }));

        // 2. Get Artists (Channels)
        const artists = (results.channels || results.accounts || [])
            .slice(0, 6)
            .map(c => ({
                id: c.url,
                name: cleanText(c.name),
                cover: c.thumbnail || c.image || 'https://picsum.photos/100',
                subscribers: c.subCountLabel || 'Artist'
            }));

        // 3. Get Albums (Playlists)
        const albums = (results.playlists || results.lists || [])
            .slice(0, 6)
            .map(p => ({
                listId: p.listId,
                title: cleanText(p.title),
                artist: cleanText(p.author.name) || 'Various Artists',
                cover: p.thumbnail || p.image || 'https://picsum.photos/200',
                songCount: p.videoCount
            }));

        res.json({ songs, artists, albums });
    } catch (err) {
        console.error("Search Error:", err.message);
        res.status(500).json({ error: 'Search failed' });
    }
});

// ==========================================
// 2. LOCAL YT-DLP EXECUTION
// ==========================================
app.get('/api/stream', (req, res) => {
    const videoId = req.query.videoId;
    if (!videoId) return res.status(400).json({ error: 'No videoId' });

    // Check Cache
    const cached = streamCache.get(videoId);
    if (cached && Date.now() - cached.timestamp < 60 * 60 * 1000) {
        return res.json({ url: cached.url });
    }

// Automatically detect if we are on your Windows PC or the Linux Cloud Server
    const isWindows = process.platform === 'win32';
    const ytDlpPath = isWindows ? path.join(__dirname, 'yt-dlp.exe') : path.join(__dirname, 'yt-dlp');
    
    const command = `"${ytDlpPath}" -g -f "140/bestaudio/best" "https://www.youtube.com/watch?v=${videoId}"`;

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
app.use(express.json()); 

app.post('/api/autoplay/queue', async (req, res) => {
    const { seedTitle, seedArtist, historyArtists = [], playedVideoIds = [], playedTitles = [] } = req.body;

    if (!seedTitle) return res.status(400).json({ error: 'Seed song info required' });

    try {
        const query = `${seedArtist} hit songs mix`;
        const results = await require('yt-search')(query);
        let candidates = results.videos.slice(0, 30); 

        const scoredCandidates = candidates.map((video, index) => {
            let score = 0;
            const videoArtist = video.author.name.toLowerCase();
            const searchArtist = seedArtist.toLowerCase();
            const cleanCandidateTitle = video.title.toLowerCase();
            const cleanSeedTitle = seedTitle.toLowerCase();

            // A. Artist & History Affinity
            if (videoArtist.includes(searchArtist)) score += 20; 
            else if (historyArtists.some(a => videoArtist.includes(a.toLowerCase()))) score += 10; 

            // B. Organic Relevance
            score += (30 - index) * 0.5; 

            // C. POPULARITY BOOST (NEW!)
            // We use view counts to guarantee you get the highest quality, most famous version
            const views = video.views || 0;
            if (views > 100000000) {
                score += 15; // Mega Hit (> 100M views)
            } else if (views > 10000000) {
                score += 10; // Huge Hit (> 10M views)
            } else if (views > 1000000) {
                score += 5;  // Popular (> 1M views)
            } else if (views < 50000) {
                score -= 15; // Obscure video/cover penalty (< 50k views)
            }

            // D. STRICT REPETITION PENALTY
            if (playedVideoIds.includes(video.videoId)) score -= 1000; 
            if (cleanCandidateTitle.includes(cleanSeedTitle) || cleanSeedTitle.includes(cleanCandidateTitle)) score -= 1000; 
            if (playedTitles.some(t => cleanCandidateTitle.includes(t.toLowerCase()))) score -= 1000;

            // E. Format Filtering
            if (video.seconds > 420) score -= 50; 
            if (cleanCandidateTitle.includes('live')) score -= 15; 
            if (cleanCandidateTitle.includes('karaoke') || cleanCandidateTitle.includes('instrumental')) score -= 50;

            return { ...video, score };
        });

        // Sort and pick winners
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