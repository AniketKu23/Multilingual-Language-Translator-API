const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },

  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  if (path.extname(file.originalname) !== ".json") {
    return cb(new Error("Only JSON files are allowed"));
  }

  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
});

module.exports = upload;
