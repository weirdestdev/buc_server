const Router = require('express');
const router = new Router();
const path = require('path');
const multer = require('multer');
const docsController = require('../controllers/docsController');

// Настройка Multer для сохранения файлов в папку static/docs
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../static/docs'));
  },
  filename: function (req, file, cb) {
    const docType = req.body.docType;
    const ext = path.extname(file.originalname);
    cb(null, `${docType}${ext}`);
  },
});

const upload = multer({ storage });

// Эндпоинт для загрузки документа
router.post('/', upload.single('file'), docsController.uploadDoc);

module.exports = router;
