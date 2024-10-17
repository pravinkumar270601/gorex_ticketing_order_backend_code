const multer = require("multer");
const path = require("path");
const RESPONSE = require("../constants/response");
const { MESSAGE } = require("../constants/message");
const { StatusCode } = require("../constants/HttpStatusCode");

// Upload Image Controller

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/images/"); // Set the upload destination path
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

// Init upload
// Set up multer for handling image uploads
const upload = multer({
  storage: storage,
  limits: { fileSize: 5000000 }, // Limit file size to 5MB
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
}).single("uploadImage"); // 'image' is the field name in the form

// Check file type
function checkFileType(file, cb) {
  // Allowed ext
  const filetypes = /jpeg|jpg|png|gif/;
  // Check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb("Error: Images Only!");
  }
}

exports.uploadImage = (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      RESPONSE.Failure.Message = err.message;
      return res.status(StatusCode.BAD_REQUEST.code).send(RESPONSE.Failure);
      // return res.status(400).send({ message: err });
    }
    if (!req.file) {
      RESPONSE.Success.Message = "No file uploaded!";
      RESPONSE.Success.data = {};
      return res.status(StatusCode.OK.code).send(RESPONSE.Success);
      // return res.status(400).send({ message: "No file uploaded!" });
    }
    RESPONSE.Success.Message = "File uploaded successfully!";
    RESPONSE.Success.data = {
      imageUrl: `uploads/images/${req.file.filename}`,
    };
    res.status(StatusCode.CREATED.code).send(RESPONSE.Success);
    // res.status(200).send({
    //   imageUrl: `uploads/images/${req.file.filename}`,
    // });
  });
};
