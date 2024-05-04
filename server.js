// backend/server.js
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const fs = require('fs');

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Sample video file path
const videoFilePath = './video/video.mp4';

// Serve video file
app.get('/video', (req, res) => {
    const stat = fs.statSync(videoFilePath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        const chunksize = (end - start) + 1;
        const file = fs.createReadStream(videoFilePath, { start, end });
        const head = {
            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunksize,
            'Content-Type': 'video/mp4',
        };
        res.writeHead(206, head);
        file.pipe(res);
    } else {
        const head = {
            'Content-Length': fileSize,
            'Content-Type': 'video/mp4',
        };
        res.writeHead(200, head);
        const fileStream = fs.createReadStream(videoFilePath);
        fileStream.on('open', () => {
            fileStream.pipe(res);
        });
        fileStream.on('error', (err) => {
            res.end(err);
        });
    }
});

// Simple tracking endpoint
app.post('/track', (req, res) => {
    const { userId, videoId, watchedTime } = req.body;
    // Here you can save this information to your database
    console.log(`User ${userId} watched ${watchedTime} seconds of video ${videoId}`);
    res.sendStatus(200);
});

// Render the EJS view
app.get('/', (req, res) => {
    // Pass the video source and video ID to the view
    res.render('index', { videoSource: '/video', videoId: "videoId"});
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
