// config/multer.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const UPLOADS = process.env.TMP_UPLOADS;
const uploadDir = path.join(__dirname, UPLOADS);
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png/;
    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimeType = fileTypes.test(file.mimetype);

    if (extname && mimeType) {
      return cb(null, true);
    } else {
      cb(new Error('Somente arquivos de imagem são permitidos.'));
    }
  },
});

module.exports = upload;
