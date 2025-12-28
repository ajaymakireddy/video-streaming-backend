const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth.middleware");
const upload = require("../middleware/upload.middleware");
const { uploadVideo, getVideos , streamVideo} = require("../controllers/video.controller");
const role = require("../middleware/role.middleware");


router.post("/upload", auth, upload.single("video"), uploadVideo);
router.get("/", auth, getVideos);

router.get("/stream/:id", streamVideo);
router.post(
  "/upload",
  auth,
  role(["editor", "admin"]),
  upload.single("video"),
  uploadVideo
);
router.get(
  "/",
  auth,
  role(["viewer", "editor", "admin"]),
  getVideos
);


module.exports = router;
