const multer = require("multer");
const path = require("path");
const RESPONSE = require("../constants/response");
const { MESSAGE } = require("../constants/message");
const { StatusCode } = require("../constants/HttpStatusCode");

// Set up storage for video files
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/videos/"); // specify the folder for storing video files
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname)); // unique name with the original file extension
  },
});

// Set up multer for handling video uploads
const upload = multer({
  storage: storage,
  limits: { fileSize: 50000000 }, // limit file size to 50MB
  fileFilter: function (req, file, cb) {
    const filetypes = /mp4|mkv|avi|mov/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb("Error: Video files only!");
    }
  },
}).single("video");

// Upload Video
exports.uploadVideo = (req, res) => {
  upload(req, res, function (err) {
    if (err) {
      RESPONSE.Failure.Message = err.message;
      return res.status(StatusCode.BAD_REQUEST.code).send(RESPONSE.Failure);
    }

    if (!req.file) {
      RESPONSE.Success.Message = "No file uploaded!";
      RESPONSE.Success.data = {};
      return res.status(StatusCode.OK.code).send(RESPONSE.Success);
    }

    RESPONSE.Success.Message = "Video uploaded successfully";
    RESPONSE.Success.data = { videoUrl: `uploads/videos/${req.file.filename}` };
    res.status(StatusCode.CREATED.code).send(RESPONSE.Success);
  });
};
