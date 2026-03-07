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
// 2. CLOUD-SMART STREAM API (ROBUST PROXY BYPASS)
// ==========================================
// A list of reliable public Piped instances
const PIPED_INSTANCES = [
    'https://pipedapi.kavin.rocks',
    'https://pipedapi.tokhmi.xyz',
    'https://api.piped.projectsegfau.lt',
    'https://pipedapi.smnz.de'
];

app.get('/api/stream', async (req, res) => {
    const videoId = req.query.videoId;
    if (!videoId) return res.status(400).json({ error: 'No videoId' });

    // Check Cache
    const cached = streamCache.get(videoId);
    if (cached && Date.now() - cached.timestamp < 60 * 60 * 1000) {
        return res.json({ url: cached.url });
    }

    let bestAudioUrl = null;

    // Try each proxy server one by one until one works!
    for (const instance of PIPED_INSTANCES) {
        try {
            const response = await fetch(`${instance}/streams/${videoId}`);
            if (!response.ok) continue; // If this server is down, instantly skip to the next one
            
            const data = await response.json();
            const audioStreams = data.audioStreams || [];
            if (audioStreams.length === 0) continue; // If no audio, skip
            
            // Grab the high-quality M4A format
            const bestAudio = audioStreams.find(s => s.mimeType.includes('audio/mp4')) || audioStreams[0];
            bestAudioUrl = bestAudio.url;
            
            console.log(`Successfully fetched from: ${instance}`);
            break; // We found the song! Stop the loop.

        } catch (error) {
            console.log(`Proxy ${instance} failed, trying next...`);
        }
    }

    // Did we find a working URL from any of the proxies?
    if (bestAudioUrl) {
        streamCache.set(videoId, { url: bestAudioUrl, timestamp: Date.now() });
        res.json({ url: bestAudioUrl });
    } else {
        console.error('All proxies failed for video:', videoId);
        res.status(500).json({ error: 'All proxy servers are currently overloaded. Please try again in a moment.' });
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
    
    const command = `"${ytDlpPath}" --force-ipv4 --no-warnings --extractor-args "youtube:player_client=web_safari" -g -f "140/bestaudio/best" "https://www.youtube.com/watch?v=${videoId}"`;

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