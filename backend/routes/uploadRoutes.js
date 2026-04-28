const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { protect, adminOrLibrarian } = require('../middleware/authMiddleware');

// Storage engine
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename(req, file, cb) {
    cb(
      null,
      `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
    );
  }
});

function checkFileType(file, cb) {
  const filetypes = /pdf|jpg|jpeg|png/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb('Error: Only PDFs and Images are allowed!');
  }
}

const upload = multer({
  storage,
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  }
});

// @desc    Upload a file (Image or PDF)
// @route   POST /api/upload
// @access  Admin/Librarian
router.post('/', protect, adminOrLibrarian, upload.single('file'), (req, res) => {
  res.json({
    success: true,
    url: `/${req.file.path.replace(/\\/g, '/')}`
  });
});

module.exports = router;
