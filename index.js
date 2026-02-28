const fs = require('fs');
const axios = require('axios');
const { exec } = require('child_process');
const baseUrl = 'https://hwzthls.dramaboxdb.com/79/9x8/98x6/986x2/98622100014/602244897_2/m3u8/602244897.720p-{num}.ts'; // Replace with actual URL pattern
const downloadFolder = './downloads';
const mergedFile = 'merged.ts';
const outputMp4 = 'output.mp4';

if (!fs.existsSync(downloadFolder)) fs.mkdirSync(downloadFolder);

(async () => {
    let i = 1;
    const mergedStream = fs.createWriteStream(mergedFile);

    console.log('Downloading TS segments...');
    while (true) {
        const tsNumber = i.toString().padStart(5, '0');
        const tsUrl = baseUrl.replace('{num}', tsNumber);
        const localFile = `${downloadFolder}/${tsNumber}.ts`;

        try {
            const res = await axios.get(tsUrl, { responseType: 'stream' });
            await new Promise((resolve, reject) => {
                const writer = fs.createWriteStream(localFile);
                res.data.pipe(writer);
                writer.on('finish', resolve);
                writer.on('error', reject);
            });
            console.log(`Downloaded ${tsNumber}.ts`);

            const data = fs.readFileSync(localFile);
            mergedStream.write(data);
        } catch (err) {
            console.log(`No more segments at ${tsUrl}, stopping.`);
            break;
        }
        i++;
    }

    mergedStream.close();
    console.log('TS segments merged into merged.ts');

    // Convert TS → MP4
    console.log('Converting merged.ts to MP4...');

    exec(`ffmpeg -y -i ${mergedFile} -c copy ${outputMp4}`, (err, stdout, stderr) => {
        if (err) {
            console.error('Error converting to MP4:', err);
            return;
        }
        console.log('Conversion complete! Saved as', outputMp4);
    });
})();