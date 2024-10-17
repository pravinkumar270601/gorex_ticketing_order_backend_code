// const multer = require("multer");
// const path = require("path");
// const RESPONSE = require("../constants/response");
// const { MESSAGE } = require("../constants/message");
// const { StatusCode } = require("../constants/HttpStatusCode");

// // Set up storage for audio files
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "uploads/audios/"); // specify the folder for storing audio files
//   },
//   filename: function (req, file, cb) {
//     const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
//     cb(null, uniqueSuffix + path.extname(file.originalname)); // unique name with the original file extension
//   },
// });

// // Set up multer for handling audio uploads
// const upload = multer({
//   storage: storage,
//   limits: { fileSize: 10000000 }, // limit file size to 10MB
//   fileFilter: function (req, file, cb) {
//     const filetypes = /mp3|wav|ogg|m4a|mpeg|webm/;
//     const mimetype = filetypes.test(file.mimetype);
//     const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
//     if (mimetype && extname) {
//       return cb(null, true);
//     } else {
//       cb("Error: Audio files only!");
//     }
//   },
// }).single("audio");

// // Upload Audio
// exports.uploadAudio = (req, res) => {
//   upload(req, res, function (err) {
//     if (err) {
//       RESPONSE.Failure.Message = err.message;
//       return res.status(StatusCode.BAD_REQUEST.code).send(RESPONSE.Failure);
//     }

//     if (!req.file) {
//       RESPONSE.Failure.Message = "No file uploaded";
//       return res.status(StatusCode.OK.code).send(RESPONSE.Failure);
//     }

//     RESPONSE.Success.Message = "Audio uploaded successfully";
//     RESPONSE.Success.data = { audioUrl: `uploads/audios/${req.file.filename}` };
//     res.status(StatusCode.CREATED.code).send(RESPONSE.Success);
//   });
// };
 

const multer = require("multer");
const path = require("path");
const RESPONSE = require("../constants/response");
const { StatusCode } = require("../constants/HttpStatusCode");

// Set up storage for audio files
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/audios/"); // Specify the folder for storing audio files
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname)); // Unique name with the original file extension
  },
});

// Set up multer for handling audio uploads
const upload = multer({
  storage: storage,
  limits: { fileSize: 10000000 }, // Limit file size to 10MB
  fileFilter: function (req, file, cb) {
    // Accept all audio file types
    const mimetype = file.mimetype.startsWith('audio/');
    
    if (mimetype) {
      return cb(null, true);
    } else {
      cb("Error: Audio files only!");
    }
  },
}).single("audio");

// Upload Audio
exports.uploadAudio = (req, res) => {
  upload(req, res, function (err) {
    if (err) {
      RESPONSE.Failure.Message = err.message;
      return res.status(StatusCode.BAD_REQUEST.code).send(RESPONSE.Failure);
    }

    if (!req.file) {
      RESPONSE.Failure.Message = "No file uploaded";
      return res.status(StatusCode.OK.code).send(RESPONSE.Failure);
    }

    RESPONSE.Success.Message = "Audio uploaded successfully";
    RESPONSE.Success.data = { audioUrl: `uploads/audios/${req.file.filename}` };
    res.status(StatusCode.CREATED.code).send(RESPONSE.Success);
  });
};
