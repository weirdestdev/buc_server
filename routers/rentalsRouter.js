const Router = require('express');
const router = new Router();
const path = require('path');
const multer = require('multer');

const rentalsController = require('../controllers/rentalsController');
const authMiddleware = require('../middleware/AuthMiddleware');

// Настройка хранилища multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Папка для сохранения файлов (относительный путь от корня проекта)
    cb(null, path.join(__dirname, '..', 'static'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({ storage });

/**
 * @swagger
 * tags:
 *   name: Rent Time
 *   description: Управление временем аренды
 */

/**
 * @swagger
 * /rentals/renttime:
 *   post:
 *     summary: Добавление нового времени аренды
 *     tags: [Rent Time]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Hourly"
 *     responses:
 *       201:
 *         description: Время аренды успешно добавлено
 *       400:
 *         description: Ошибка валидации
 *       500:
 *         description: Внутренняя ошибка сервера
 */
router.post('/renttime', rentalsController.addRentTime);

/**
 * @swagger
 * /rentals/renttime:
 *   get:
 *     summary: Получение списка всех времен аренды
 *     tags: [Rent Time]
 *     responses:
 *       200:
 *         description: Список всех времен аренды
 *       500:
 *         description: Внутренняя ошибка сервера
 */
router.get('/renttime', rentalsController.getAllRentTimes);

/**
 * @swagger
 * /rentals/renttime/{id}:
 *   get:
 *     summary: Получение конкретного времени аренды по ID
 *     tags: [Rent Time]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Найденное время аренды
 *       404:
 *         description: Время аренды не найдено
 *       500:
 *         description: Внутренняя ошибка сервера
 */
router.get('/renttime/:id', rentalsController.getRentTime);

/**
 * @swagger
 * /rentals/renttime/{id}:
 *   put:
 *     summary: Обновление времени аренды по ID
 *     tags: [Rent Time]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Daily"
 *     responses:
 *       200:
 *         description: Время аренды успешно обновлено
 *       400:
 *         description: Ошибка валидации
 *       404:
 *         description: Время аренды не найдено
 *       500:
 *         description: Внутренняя ошибка сервера
 */
router.put('/renttime/:id', rentalsController.updateRentTime);

/**
 * @swagger
 * /rentals/renttime/{id}:
 *   delete:
 *     summary: Удаление времени аренды по ID
 *     tags: [Rent Time]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Время аренды успешно удалено
 *       404:
 *         description: Время аренды не найдено
 *       500:
 *         description: Внутренняя ошибка сервера
 */
router.delete('/renttime/:id', rentalsController.deleteRentTime);

/**
 * @swagger
 * tags:
 *   name: Rentals
 *   description: Управление объявлениями аренды
 */

/**
 * @swagger
 * /rentals:
 *   post:
 *     summary: Создание нового объявления
 *     tags: [Rentals]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *               - unit_of_numeration
 *               - categoryId
 *               - rentTimeId
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Luxury Villa"
 *               description:
 *                 type: string
 *                 example: "Spacious villa with sea view"
 *               address:
 *                 type: string
 *                 example: "123 Beach Avenue"
 *               price:
 *                 type: number
 *                 example: 1200000
 *               unit_of_numeration:
 *                 type: string
 *                 example: "€"
 *               status:
 *                 type: string
 *                 enum: [pending, approved, blocked]
 *                 example: "pending"
 *               featured:
 *                 type: boolean
 *                 example: true
 *               categoryId:
 *                 type: integer
 *                 example: 2
 *               rentTimeId:
 *                 type: integer
 *                 example: 1
 *               customData:
 *                 type: string
 *                 description: JSON-строка с массивом объектов кастомных полей. Пример: [{"categoriesDataId":1,"value":"Value 1"}]
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Объявление успешно создано
 *       400:
 *         description: Ошибка валидации
 *       500:
 *         description: Внутренняя ошибка сервера
 */
router.post('/', upload.array('images'), rentalsController.createRental);

/**
 * @swagger
 * /rentals:
 *   get:
 *     summary: Получение всех объявлений аренды с кастомными полями
 *     tags: [Rentals]
 *     responses:
 *       200:
 *         description: Список всех объявлений
 *       500:
 *         description: Внутренняя ошибка сервера
 */
router.get('/', rentalsController.getAllRentals);

/**
 * @swagger
 * /rentals/featured:
 *   get:
 *     summary: Получение избранных объявлений (featured = true)
 *     tags: [Rentals]
 *     responses:
 *       200:
 *         description: Список избранных объявлений
 *       500:
 *         description: Внутренняя ошибка сервера
 */
router.get('/featured', rentalsController.getFeaturedRentals);

/**
 * @swagger
 * /rentals/category/{categoryId}:
 *   get:
 *     summary: Получение объявлений по категории
 *     tags: [Rentals]
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: integer
 *         example: 2
 *     responses:
 *       200:
 *         description: Список объявлений по категории
 *       500:
 *         description: Внутренняя ошибка сервера
 */
router.get('/category/:categoryId', rentalsController.getRentalsByCategory);

/**
 * @swagger
 * /rentals/{id}:
 *   put:
 *     summary: Обновление объявления аренды по ID
 *     tags: [Rentals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 5
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Updated Luxury Villa"
 *               description:
 *                 type: string
 *                 example: "Updated description"
 *               address:
 *                 type: string
 *                 example: "123 Updated Avenue"
 *               price:
 *                 type: number
 *                 example: 1300000
 *               unit_of_numeration:
 *                 type: string
 *                 example: "€"
 *               status:
 *                 type: string
 *                 enum: [pending, approved, blocked]
 *                 example: "approved"
 *               featured:
 *                 type: boolean
 *                 example: false
 *               categoryId:
 *                 type: integer
 *                 example: 3
 *               rentTimeId:
 *                 type: integer
 *                 example: 2
 *               customData:
 *                 type: string
 *                 description: JSON-строка с массивом объектов кастомных полей.
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Объявление успешно обновлено
 *       400:
 *         description: Ошибка валидации
 *       404:
 *         description: Объявление не найдено
 *       500:
 *         description: Внутренняя ошибка сервера
 */
router.put('/:id', upload.array('images'), rentalsController.updateRental);

/**
 * @swagger
 * /rentals/{id}:
 *   delete:
 *     summary: Удаление объявления аренды по ID
 *     tags: [Rentals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 5
 *     responses:
 *       200:
 *         description: Объявление успешно удалено
 *       404:
 *         description: Объявление не найдено
 *       500:
 *         description: Внутренняя ошибка сервера
 */
router.delete('/:id', rentalsController.deleteRental);

module.exports = router;
