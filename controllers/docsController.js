const Docs = require('../models/Docs');
const fs = require('fs').promises;

// Контроллер для загрузки документа
exports.uploadDoc = async (req, res) => {
  try {
    const { docType } = req.body;
    if (!docType || !['terms', 'privacy', 'cookie'].includes(docType)) {
      return res.status(400).json({ error: 'Invalid docType' });
    }
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    const filePath = req.file.path;
    // Ищем существующую запись или создаём новую
    let doc = await Docs.findOne({ where: { docType } });
    if (doc) {
      doc.path = filePath;
      await doc.save();
    } else {
      doc = await Docs.create({ docType, path: filePath });
    }
    return res.json({ message: 'Document saved successfully', doc });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Server error' });
  }
};

// Контроллер для получения содержимого документа
exports.getDoc = async (req, res) => {
  try {
    const { docType } = req.query;
    if (!docType || !['terms', 'privacy', 'cookie'].includes(docType)) {
      return res.status(400).json({ error: 'Invalid docType' });
    }
    const doc = await Docs.findOne({ where: { docType } });
    if (!doc) {
      return res.status(404).json({ error: 'Document not found' });
    }
    // Читаем содержимое файла
    const content = await fs.readFile(doc.path, 'utf-8');
    return res.json({ docType, content, path: doc.path });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Server error' });
  }
};
