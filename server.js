const express = require('express');
const axios = require('axios');
const fs = require('fs');
const { exec } = require('child_process');
const path = require('path');

const app = express();
const PORT = 3000;

const DOWNLOAD_FOLDER = path.join(__dirname, 'downloads');
// const MERGED_TS = path.join(__dirname, 'merged.ts');
// const OUTPUT_MP4 = path.join(__dirname, 'output.mp4');

if (!fs.existsSync(DOWNLOAD_FOLDER)) fs.mkdirSync(DOWNLOAD_FOLDER);

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

// Endpoint to start download & conversion
app.post('/download', async (req, res) => {
    console.log("Received download request");
    console.log(req.body);
    const { baseUrl, episodeId } = req.body;
    if (!baseUrl) return res.send("Base URL is required");


    // Clean previous downloads
    fs.rmSync(DOWNLOAD_FOLDER, { recursive: true, force: true });
    fs.mkdirSync(DOWNLOAD_FOLDER);
    const MERGED_TS = path.join(__dirname,'output', `merged_${episodeId}.ts`);
    const OUTPUT_MP4 = path.join(__dirname,'output', `output_${episodeId}.mp4`);
    if (fs.existsSync(MERGED_TS)) fs.unlinkSync(MERGED_TS);
    if (fs.existsSync(OUTPUT_MP4)) fs.unlinkSync(OUTPUT_MP4);

    let i = 1;
    const mergedStream = fs.createWriteStream(MERGED_TS);

    res.write("Starting download...\n");

    while (true) {
        const tsNumber = i.toString().padStart(5, '0');
        const tsUrl = baseUrl.replace('{num}', tsNumber);
        const localFile = path.join(DOWNLOAD_FOLDER, `${tsNumber}.ts`);

        try {
            const response = await axios.get(tsUrl, { responseType: 'stream' });
            await new Promise((resolve, reject) => {
                const writer = fs.createWriteStream(localFile);
                response.data.pipe(writer);
                writer.on('finish', resolve);
                writer.on('error', reject);
            });

            // Append to merged TS
            const data = fs.readFileSync(localFile);
            mergedStream.write(data);

            res.write(`Downloaded ${tsNumber}.ts\n`);
        } catch (err) {
            res.write(`No more segments found. Stopping.\n`);
            break;
        }

        i++;
    }

    mergedStream.close();

    res.write("Converting merged TS to MP4 with audio preserved...\n");

    exec(`ffmpeg -y -i "${MERGED_TS}" -c:v copy -c:a aac -b:a 128k "${OUTPUT_MP4}"`, (err, stdout, stderr) => {
        if (err) {
            console.error(err);
            res.write("Error during conversion\n");
            res.end();
            return;
        }
        console.log("Conversion complete!");
        res.write("Conversion complete! Video ready to play.\n");
        res.write(`<a href="/output.mp4" target="_blank">Play Video</a>\n`);
        res.end();
    });
});

// Serve the output MP4 directly
app.get('/output_video', (req, res) => {
    const OUTPUT_MP4 = path.join(__dirname, 'output',`output_${req.query.episodeId}.mp4`);
    if (fs.existsSync(OUTPUT_MP4)) {
        res.sendFile(OUTPUT_MP4);
    } else {
        res.status(404).send("Video not ready yet");
    }
});

app.get('/cleanup', (req, res) => {
    console.log("Received cleanup request");
    fs.rmSync(DOWNLOAD_FOLDER, { recursive: true, force: true });
    // clean all merged and output files

    const outputFolder = path.join(__dirname, 'output');
    if (fs.existsSync(outputFolder)) {
        fs.readdirSync(outputFolder).forEach(file => {
            const filePath = path.join(outputFolder, file);
            if (file.endsWith('.ts') || file.endsWith('.mp4')) {
                fs.unlinkSync(filePath);
            }
        });
    }
    res.send("Cleanup complete");
});

app.get('/folder-size', (req, res) => {
    const folderPath = path.join(__dirname,'output');
    let totalSize = 0;

    if (fs.existsSync(folderPath)) {
        const files = fs.readdirSync(folderPath);
        files.forEach(file => {
            const filePath = path.join(folderPath, file);
            const stats = fs.statSync(filePath);
            totalSize += stats.size;
        });
    }

    res.json({ size: totalSize });
});

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));