const { resolveNaptr } = require("dns");
var express = require("express");
const fs = require("fs");
const youtubedl = require("youtube-dl-exec");
const ytdl = require("ytdl-core");
const httpsObj = require("https");
const requestObj = require("request");

const cp = require("child_process");
const ffmpeg = require("ffmpeg-static");
const fluentFfmpeg = require("fluent-ffmpeg");
const path = require("path");
const readline = require("readline");

var router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", {
    title: "Download You Tube Videos",
    videoData: "",
    url: "",
    mimeTypes: [],
    audio: "",
  });
});

function bytesToSize(bytes) {
  var sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  if (bytes == 0) return "0 Byte";
  var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
  return Math.round(bytes / Math.pow(1024, i), 2) + " " + sizes[i];
}

function randomString() {
  return Math.random().toString(36).substring(7);
}
function readAndWriteFile(data, newPath) {
  // const data = fs.readFileSync(singleImg.path)
  return fs.writeFileSync(newPath, data);
}

router.post("/", async function (req, res, next) {
  if (ytdl.validateURL(req.body.url)) {
    try {
      const result = await ytdl.getBasicInfo(req.body.url);
      const mimeTypes = [];
      const allMimeTypes = ["mp4", "webm"];
      audioItag = "";
      if (
        result &&
        result.player_response &&
        result.player_response.streamingData &&
        result.player_response.streamingData.adaptiveFormats
      ) {
        result.player_response.streamingData.adaptiveFormats.forEach(
          (f, index) => {
            let mimeType = "";
            if (!f.mimeType.includes("audio")) {
              mimeTypes.push({
                qualityLabel: f.qualityLabel,
                mimeType: f.mimeType.includes("mp4") ? "mp4" : "webm",
                length: bytesToSize(f.contentLength),
                recordIndex: index,
              });
            } else {
              if (audioItag === "") {
                audioItag = f.itag;
              }
            }
          }
        );
      }
      res.render("index", {
        title: "Download You Tube Video",
        videoData: result,
        url: req.body.url,
        mimeTypes: mimeTypes,
        audio: audioItag,
      });
    } catch (e) {
      console.error(e);
    }
  } else {
    res.render("index", {
      title: "Download You Tube Videos",
      videoData: "",
      url: "",
      mimeTypes: [],
      audio: "",
    });
  }
});

router.post("/downloadvideo", async function (req, res, next) {
  req.body.format = JSON.parse(req.body.format);
  let mimeType = "";
  const mimeTypes = ["mp4", "webm"];
  mimeTypes.forEach((mt) => {
    if (req.body.format.mimeType.includes(mt)) {
      mimeType = mt;
    }
  });
  const fileName = `video.${mimeType}`;
  res.header("Content-Disposition", `attachment; filename=${fileName}`);
  await ytdl(req.body.url).pipe(fs.createWriteStream(fileName));
});

router.post("/download", async function (req, res, next) {
  req.body.format = JSON.parse(req.body.format);
  let mimeType = "";
  const mimeTypes = ["mp4", "webm"];
  mimeTypes.forEach((mt) => {
    if (req.body.format.mimeType.includes(mt)) {
      mimeType = mt;
    }
  });
  console.log(
    "video details",
    mimeType,
    req.body.url,
    req.body.format.qualityLabel,
    req.body.format.width,
    req.body.format.height,
    req.body.format.bitrate,
    req.body.format.itag
  );
  try {
    // const fileName = `${req.body.title}-${req.body.format.qualityLabel}.${mimeType}`;
    const fileName = `video.${mimeType}`;
    res.header("Content-Disposition", `attachment; filename=${fileName}`);
    await ytdl(req.body.url, {
      filter: "audioandvideo",
      qualityLabel: req.body.format.qualityLabel,
      width: req.body.format.width,
      height: req.body.format.height,
      bitrate: req.body.format.bitrate,
      itag: req.body.format.itag,
      container: mimeType,
    }).pipe(res);
  } catch (e) {
    console.log(e);
  }
});

module.exports = router;
