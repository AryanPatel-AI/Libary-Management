const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { protect, adminOrLibrarian } = require('../middleware/authMiddleware');

const fs = require('fs');

const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage engine
const storage = multer.diskStorage({
  destination(req, file, cb) {
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
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
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded or file type not allowed.' });
  }
  res.json({
    success: true,
    url: `/uploads/${req.file.filename}`
  });
});

module.exports = router;
