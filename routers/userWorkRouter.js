const Router = require('express');
const router = new Router();
const userWorkController = require('../controllers/userWorkController');
const checkRoleMiddleware = require('../middleware/CheckRoleMiddleware');

/**
 * @swagger
 * tags:
 *   name: Работа с пользователями
 *   description: Работа с пользователями
 */

/**
 * @swagger
 * /user-work/count:
 *   get:
 *     summary: Получение общего количества пользователей
 *     tags: [Работа с пользователями]
 *     responses:
 *       200:
 *         description: Общее количество пользователей
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count:
 *                   type: integer
 *                   example: 100
 */
router.get('/count', checkRoleMiddleware((['admin', 'moderator'])), userWorkController.getAllCount);

/**
 * @swagger
 * /user-work/count/pending:
 *   get:
 *     summary: Получение количества пользователей со статусом pending
 *     tags: [Работа с пользователями]
 *     responses:
 *       200:
 *         description: Количество пользователей со статусом pending
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count:
 *                   type: integer
 *                   example: 10
 */
router.get('/count/pending', checkRoleMiddleware((['admin', 'moderator'])), userWorkController.getPendingCount);

/**
 * @swagger
 * /user-work/count/approved:
 *   get:
 *     summary: Получение количества пользователей со статусом approved
 *     tags: [Работа с пользователями]
 *     responses:
 *       200:
 *         description: Количество пользователей со статусом approved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count:
 *                   type: integer
 *                   example: 70
 */
router.get('/count/approved', checkRoleMiddleware((['admin', 'moderator'])), userWorkController.getApprovedCount);

/**
 * @swagger
 * /user-work/count/blocked:
 *   get:
 *     summary: Получение количества пользователей со статусом blocked
 *     tags: [Работа с пользователями]
 *     responses:
 *       200:
 *         description: Количество пользователей со статусом blocked
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count:
 *                   type: integer
 *                   example: 5
 */
router.get('/count/blocked', checkRoleMiddleware((['admin', 'moderator'])), userWorkController.getBlockedCount);

/**
 * @swagger
 * /user-work:
 *   get:
 *     summary: Получение списка пользователей с пагинацией, поиском и фильтрацией по статусу
 *     tags: [Работа с пользователями]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           example: 10
 *       - in: query
 *         name: searchQuery
 *         schema:
 *           type: string
 *           example: "John"
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           example: "approved"
 *         description: Фильтрация пользователей по статусу (pending, approved, blocked). Если не указан, возвращаются все пользователи.
 *     responses:
 *       200:
 *         description: Список пользователей
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       email:
 *                         type: string
 *                         example: user@example.com
 *                       fullname:
 *                         type: string
 *                         example: John Doe
 *                       phone:
 *                         type: string
 *                         example: 123456789
 *                       status:
 *                         type: string
 *                         example: approved
 *                       role:
 *                         type: string
 *                         example: user
 *                 totalCount:
 *                   type: integer
 *                   example: 100
 */
router.get('/', checkRoleMiddleware(['admin', 'moderator']), userWorkController.getAllUsers);

/**
 * @swagger
 * /user-work/{id}/approve:
 *   patch:
 *     summary: Одобрение пользователя (изменение статуса на approved)
 *     tags: [Работа с пользователями]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Статус пользователя обновлен на approved
 *       400:
 *         description: Ошибка при обновлении статуса
 */
router.patch('/:id/approve', checkRoleMiddleware(['admin', 'moderator']), userWorkController.approveUser);

/**
 * @swagger
 * /user-work/{id}/block:
 *   patch:
 *     summary: Блокировка пользователя (изменение статуса на blocked)
 *     tags: [Работа с пользователями]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Статус пользователя обновлен на blocked
 *       400:
 *         description: Ошибка при обновлении статуса
 */
router.patch('/:id/block', checkRoleMiddleware(['admin', 'moderator']), userWorkController.blockUser);

/**
 * @swagger
 * /user-work/{id}/unblock:
 *   patch:
 *     summary: Разблокировка пользователя (изменение blocked на approved)
 *     tags: [Работа с пользователями]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Если пользователь был заблокирован, статус изменен на approved
 *       400:
 *         description: Ошибка при обновлении статуса или пользователь не был заблокирован
 */
router.patch('/:id/unblock', checkRoleMiddleware(['admin', 'moderator']), userWorkController.unblockUser);

module.exports = router;
