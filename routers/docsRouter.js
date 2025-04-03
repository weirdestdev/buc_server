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

/**
 * @swagger
 * /docs:
 *   post:
 *     summary: Upload a document file
 *     description: Uploads a TXT document file for a given document type (terms, privacy, or cookie) and saves it.
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: formData
 *         name: docType
 *         type: string
 *         required: true
 *         description: Document type. Allowed values: "terms", "privacy", "cookie".
 *       - in: formData
 *         name: file
 *         type: file
 *         required: true
 *         description: The TXT file to upload.
 *     responses:
 *       200:
 *         description: Document saved successfully.
 *         schema:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 *             doc:
 *               type: object
 *       400:
 *         description: Bad request. Invalid docType or missing file.
 *       500:
 *         description: Server error.
 */
router.post('/', upload.single('file'), docsController.uploadDoc);

module.exports = router;
