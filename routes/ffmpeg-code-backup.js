const { resolveNaptr } = require('dns');
var express = require('express');
const fs = require('fs')
const youtubedl = require('youtube-dl-exec');
const ytdl = require('ytdl-core');
const httpsObj = require('https');
const requestObj = require('request');

const cp = require('child_process');
const ffmpeg = require('ffmpeg-static');
const path = require('path');
const readline = require('readline');


var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Download You Tube Videos', videoData: '', url: '', mimeTypes: [], audio: '' });
});

function bytesToSize(bytes) {
  var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  if (bytes == 0) return '0 Byte';
  var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
  return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
}

function randomString() {
  return Math.random().toString(36).substring(7);
}
function readAndWriteFile(data, newPath) {
  // const data = fs.readFileSync(singleImg.path)
  return fs.writeFileSync(newPath, data);
}

router.post('/', async function (req, res, next) {
  if (ytdl.validateURL(req.body.url)) {
    try {
      const result = await ytdl.getBasicInfo(req.body.url);
      const mimeTypes = [];
      const allMimeTypes = ['mp4', 'webm'];
      audioItag = '';
      if (result &&
        result.player_response &&
        result.player_response.streamingData &&
        result.player_response.streamingData.adaptiveFormats) {
        result.player_response.streamingData.adaptiveFormats.forEach((f, index) => {
          let mimeType = '';
          if (!f.mimeType.includes('audio')) {
            mimeTypes.push({
              qualityLabel: f.qualityLabel,
              mimeType: (f.mimeType.includes('mp4')) ? 'mp4' : 'webm',
              length: bytesToSize(f.contentLength),
              recordIndex: index
            });
          } else {
            if (audioItag === '') {
              audioItag = f.itag;
            }
          }
        })
      }
      res.render('index', {
        title: 'Download You Tube Video',
        videoData: result,
        url: req.body.url,
        mimeTypes: mimeTypes,
        audio: audioItag
      });
    } catch (e) {
      console.error(e);
    }
  } else {
    res.render('index', { title: 'Download You Tube Videos', videoData: '', url: '', mimeTypes: [], audio: '' });
  }

});

router.post('/download', async function (req, res, next) {
  // res.send(req.body);
  req.body.format = JSON.parse(req.body.format);
  let mimeType = '';
  const mimeTypes = ['mp4', 'webm'];
  mimeTypes.forEach(mt => {
    if (req.body.format.mimeType.includes(mt)) {
      mimeType = mt;
    }
  });
  // res.send(req.body.format);
  try {
    const fileName = `${req.body.title}-${req.body.format.qualityLabel}.${mimeType}`;
    let info = await ytdl.getInfo(req.body.videoId);
    let formatVideo = ytdl.chooseFormat(info.formats, { quality: req.body.format.itag, filter: 'videoonly' });
    let formatAudio = ytdl.chooseFormat(info.formats, { quality: req.body.audioTag });
    // res.json({video: formatVideo, audio: formatAudio});
    // const tracker = {
    //   start: Date.now(),
    //   audio: { downloaded: 0, total: Infinity },
    //   video: { downloaded: 0, total: Infinity },
    //   merged: { frame: 0, speed: '0x', fps: 0 },
    // };
    res.header('Content-Disposition', `attachment; filename=${fileName}`);
    const audioStream = await requestObj.get(formatAudio.url);
    const videoStream = await requestObj.get(formatVideo.url);
    audioName = randomString();
    videoName = randomString();
    const uploadsPath = 'public/uploads/';
    console.log(`${uploadsPath}/${audioName}.${mimeType}`);
    readAndWriteFile(audioStream, `${uploadsPath}/${audioName}.${mimeType}`);
    // cp.exec(`ffmpeg -i ${videoStream} -i ${audioStream} -c copy ${fileName}`, (error, success) => {
    //   if (!error) {
    //     console.log(success);
    //   } else {
    //     console.log(error);
    //   }
    // });
    // // Prepare the progress bar
    // let progressbarHandle = null;
    // const progressbarInterval = 1000;
    // const showProgress = () => {
    //   console.log('test');
    //   readline.cursorTo(process.stdout, 0);
    //   const toMB = i => (i / 1024 / 1024).toFixed(2);

    //   process.stdout.write(`Audio  | ${(tracker.audio.downloaded / tracker.audio.total * 100).toFixed(2)}% processed `);
    //   process.stdout.write(`(${toMB(tracker.audio.downloaded)}MB of ${toMB(tracker.audio.total)}MB).${' '.repeat(10)}\n`);

    //   process.stdout.write(`Video  | ${(tracker.video.downloaded / tracker.video.total * 100).toFixed(2)}% processed `);
    //   process.stdout.write(`(${toMB(tracker.video.downloaded)}MB of ${toMB(tracker.video.total)}MB).${' '.repeat(10)}\n`);

    //   process.stdout.write(`Merged | processing frame ${tracker.merged.frame} `);
    //   process.stdout.write(`(at ${tracker.merged.fps} fps => ${tracker.merged.speed}).${' '.repeat(10)}\n`);

    //   process.stdout.write(`running for: ${((Date.now() - tracker.start) / 1000 / 60).toFixed(2)} Minutes.`);
    //   readline.moveCursor(process.stdout, 0, -3);
    // };

    // // Start the ffmpeg child process
    // const ffmpegProcess = cp.spawn(ffmpeg, [
    //   // Remove ffmpeg's console spamming
    //   '-loglevel', '8', '-hide_banner',
    //   // Redirect/Enable progress messages
    //   '-progress', 'pipe:3',
    //   // Set inputs
    //   '-i', 'pipe:4',
    //   '-i', 'pipe:5',
    //   // Map audio & video from streams
    //   '-map', '0:a',
    //   '-map', '1:v',
    //   // Keep encoding
    //   '-c:v', 'copy',
    //   // Define output file
    //   `${fileName}`,
    // ], {
    //   windowsHide: true,
    //   stdio: [
    //     /* Standard: stdin, stdout, stderr */
    //     'inherit', 'inherit', 'inherit',
    //     /* Custom: pipe:3, pipe:4, pipe:5 */
    //     'pipe', 'pipe', 'pipe', 'pipe'
    //   ],
    // });
    // ffmpegProcess.on('close', () => {
    //   console.log('done');
    //   // Cleanup
    //   process.stdout.write('\n\n\n\n');
    //   clearInterval(progressbarHandle);
    //   console.log(tracker, '146');
    // });

    // // Link streams
    // // FFmpeg creates the transformer streams and we just have to insert / read data
    // ffmpegProcess.stdio[3].on('data', chunk => {
    //   console.log(chunk, '152');
    //   // Start the progress bar
    //   if (!progressbarHandle) progressbarHandle = setInterval(showProgress, progressbarInterval);
    //   // Parse the param=value list returned by ffmpeg
    //   const lines = chunk.toString().trim().split('\n');
    //   const args = {};
    //   for (const l of lines) {
    //     const [key, value] = l.split('=');
    //     args[key.trim()] = value.trim();
    //   }
    //   tracker.merged = args;
    //   // console.log(tracker.merged, '162');
    // });
    // // audio.pipe(ffmpegProcess.stdio[4]);
    // // video.pipe(ffmpegProcess.stdio[5]);
    // const audioStream = await requestObj.get(formatAudio.url);
    // const videoStream = await requestObj.get(formatVideo.url);
    // audioStream.pipe(ffmpegProcess.stdio[4]);
    // videoStream.pipe(ffmpegProcess.stdio[5]);
    // ffmpegProcess.stdio[6].pipe(res);
  } catch (e) {
    console.log(e);
  }

});

router.post('/downloadvideo', function (req, res, next) {
  // res.header('Content-Disposition', 'attachment; filename="video.mp4"');
  // ytdl(req.body.url, {
  //   format: 'mp4'
  //   }).pipe(res);
  // res.header('Content-Disposition', 'attachment; filename="video.mp4"');
  // const info = {
  //   vid: '',
  //   uid: ''
  // };
  // const options = {
  //   quality: 'highest',
  //   filter: 'audioandvideo',
  //   format: {
  //     itag: req.body.itag,
  //     url: ''
  //   }
  // };

});

module.exports = router;
