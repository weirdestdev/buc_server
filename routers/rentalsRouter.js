// routes/rentalsRoutes.js
const Router = require('express');
const router = new Router();
const rentalsController = require('../controllers/rentalsController');
const authMiddleware = require('../middleware/AuthMiddleware'); // Если требуется авторизация

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
router.post('/renttime', authMiddleware, rentalsController.addRentTime);

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
router.put('/renttime/:id', authMiddleware, rentalsController.updateRentTime);

/**
 * @swagger
 * /rentals/renttime/{id}:
 *   delete:
 *     summary: Удаление времени аренды по ID
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
 *         description: Время аренды успешно удалено
 *       404:
 *         description: Время аренды не найдено
 *       500:
 *         description: Внутренняя ошибка сервера
 */
router.delete('/renttime/:id', authMiddleware, rentalsController.deleteRentTime);

module.exports = router;
