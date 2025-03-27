const Router = require('express');
const router = new Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/AuthMiddleware'); 
const checkRoleMiddleware = require('../middleware/CheckRoleMiddleware');

/**
 * @swagger
 * tags:
 *   name: Пользователь
 *   description: Пользовательские маршруты
 */

/**
 * @swagger
 * /user/registration:
 *   post:
 *     summary: Регистрация пользователя
 *     tags: [Пользователь]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - fullname
 *               - phone
 *               - purpose
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: password123
 *               fullname:
 *                 type: string
 *                 example: Иван Иванов
 *               phone:
 *                 type: string
 *                 example: "+79991234567"
 *               purpose:
 *                 type: string
 *                 enum: [buy, sell, rent, collaborate, curious]
 *                 example: buy
 *     responses:
 *       200:
 *         description: Возвращает токен для авторизации
 *       400:
 *         description: Ошибка регистрации
 */
router.post('/registration', userController.registration);

/**
 * @swagger
 * /user/login:
 *   post:
 *     summary: Вход пользователя
 *     tags: [Пользователь]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       200:
 *         description: Возвращает токен для авторизации
 *       401:
 *         description: Неверные учетные данные
 */
router.post('/login', userController.login);

/**
 * @swagger
 * /user/adminLogin:
 *   post:
 *     summary: Вход в админ-панель
 *     tags: [Пользователь]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       200:
 *         description: Возвращает токен для авторизации в админ-панель
 *       401:
 *         description: Неверные учетные данные
 */
router.post('/adminLogin', userController.adminLogin);

/**
 * @swagger
 * /user/auth:
 *   get:
 *     summary: Проверка авторизации пользователя
 *     tags: [Пользователь]
 *     responses:
 *       200:
 *         description: Возвращает токен для авторизации
 *       401:
 *         description: Пользователь не авторизован
 */
router.get('/auth', authMiddleware, userController.auth);

module.exports = router;