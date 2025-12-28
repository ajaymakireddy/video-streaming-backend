const Video = require("../models/Video");
const fs = require("fs");
const path = require("path");

// 🔹 Upload video
exports.uploadVideo = async (req, res) => {
  try {
    const { title } = req.body;
    const io = req.app.get("io");

    const video = await Video.create({
      title,
      filePath: req.file.path,
      userId: req.user.id,
      tenantId: req.user.tenantId,
      status: "processing",
      progress: 0,
    });

    simulateProcessing(video.id, io);

    res.status(201).json({ message: "Video uploaded", video });
  } catch (err) {
    res.status(500).json({ message: "Upload failed" });
  }
};

// 🔹 Get videos for logged-in user
exports.getVideos = async (req, res) => {
  try {
    const videos = await Video.findAll({
      where: {
        tenantId: req.user.tenantId,
      },
      order: [["createdAt", "DESC"]],
    });

    res.json(videos);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch videos" });
  }
};

exports.streamVideo = async (req, res) => {
  try {
    const videoId = req.params.id;

    // Fetch video metadata
    const video = await Video.findByPk(videoId);

    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    const videoPath = path.resolve(video.filePath);

    if (!fs.existsSync(videoPath)) {
      return res.status(404).json({ message: "Video file missing" });
    }

    const videoSize = fs.statSync(videoPath).size;
    const range = req.headers.range;

    if (!range) {
      return res.status(416).send("Range header required");
    }

    const CHUNK_SIZE = 10 ** 6; // 1MB
    const start = Number(range.replace(/\D/g, ""));
    const end = Math.min(start + CHUNK_SIZE, videoSize - 1);

    const contentLength = end - start + 1;

    const headers = {
      "Content-Range": `bytes ${start}-${end}/${videoSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": contentLength,
      "Content-Type": "video/mp4",
    };

    res.writeHead(206, headers);

    const stream = fs.createReadStream(videoPath, { start, end });
    stream.pipe(res);
  } catch (error) {
    res.status(500).json({ message: "Video streaming failed" });
  }
};

const simulateProcessing = (videoId, io) => {
  let progress = 0;

  const interval = setInterval(async () => {
    progress += 10;

    if (progress >= 100) {
      clearInterval(interval);

      const finalStatus = Math.random() > 0.5 ? "safe" : "flagged";

      await Video.update(
        { progress: 100, status: finalStatus },
        { where: { id: videoId } }
      );

      // emit final update
      io.emit("video-progress", {
        videoId,
        progress: 100,
        status: finalStatus,
      });
    } else {
      await Video.update({ progress }, { where: { id: videoId } });

      // emit progress update
      io.emit("video-progress", {
        videoId,
        progress,
        status: "processing",
      });
    }
  }, 1000);
};
