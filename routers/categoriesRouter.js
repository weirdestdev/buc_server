const { Router } = require('express');
const multer = require('multer');
const path = require('path');
const {
  createCategory,
  getAllCategories,
  deleteCategory,
  updateCategory,
  lockCategory,
  unlockCategory
} = require('../controllers/categoriesController');

const router = Router();

// Настройка хранилища для multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../static'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({ storage });

/**
 * @swagger
 * /categories/create:
 *   post:
 *     summary: Создание новой категории с загрузкой изображения
 *     tags: [Categories]
 *     consumes:
 *       - multipart/form-data
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Название категории.
 *               icon:
 *                 type: string
 *                 format: binary
 *                 description: Файл изображения для категории.
 *               customFields:
 *                 type: string
 *                 description: JSON-строка с дополнительными полями для категории.
 *             example:
 *               name: "Недвижимость"
 *               icon: (binary file)
 *               customFields: '[{"name":"Площадь","type":"int","minSize":10,"maxSize":1000,"icon":"area.png"}]'
 *     responses:
 *       201:
 *         description: Категория успешно создана.
 *       400:
 *         description: Неверные данные запроса.
 */
router.post('/create', upload.single('icon'), createCategory);

/**
 * @swagger
 * /categories:
 *   get:
 *     summary: Получение списка всех категорий с их дополнительными полями
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: Список категорий успешно получен.
 *       400:
 *         description: Ошибка при получении списка категорий.
 */
router.get('/', getAllCategories);

/**
 * @swagger
 * /categories/{id}:
 *   delete:
 *     summary: Удаление категории по идентификатору
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Идентификатор категории
 *     responses:
 *       200:
 *         description: Категория успешно удалена.
 *       404:
 *         description: Категория не найдена.
 */
router.delete('/:id', deleteCategory);

/**
 * @swagger
 * /categories/{id}:
 *   put:
 *     summary: Обновление данных категории по идентификатору
 *     tags: [Categories]
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Идентификатор категории
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               icon:
 *                 type: string
 *                 format: binary
 *               customFields:
 *                 type: string
 *                 description: JSON-строка с дополнительными полями для категории
 *             example:
 *               name: "Обновленная Категория"
 *               icon: (binary file)
 *               customFields: '[{"name":"НовоеПоле","type":"string","minSize":1,"maxSize":50,"icon":"new.png"}]'
 *     responses:
 *       200:
 *         description: Категория успешно обновлена.
 *       400:
 *         description: Неверные данные запроса.
 */
router.put('/:id', upload.single('icon'), updateCategory);

/**
 * @swagger
 * /categories/{id}/lock:
 *   patch:
 *     summary: Установить флаг isLocked = true для категории
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Идентификатор категории
 *     responses:
 *       200:
 *         description: Категория успешно заблокирована.
 *       404:
 *         description: Категория не найдена.
 */
router.patch('/:id/lock', lockCategory);

/**
 * @swagger
 * /categories/{id}/unlock:
 *   patch:
 *     summary: Установить флаг isLocked = false для категории
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Идентификатор категории
 *     responses:
 *       200:
 *         description: Категория успешно разблокирована.
 *       404:
 *         description: Категория не найдена.
 */
router.patch('/:id/unlock', unlockCategory);

module.exports = router;
