const Router = require('express');
const router = new Router();
const weatherController = require('../controllers/weatherController');

/**
 * @swagger
 * tags:
 *   name: Погода
 *   description: Получение данных о текущей погоде
 */

/**
 * @swagger
 * /weather:
 *   get:
 *     summary: Получить текущую погоду по городу
 *     tags: [Погода]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         required: false
 *         description: Название города (по умолчанию Palma de Mallorca)
 *     responses:
 *       200:
 *         description: Успешный ответ с данными о погоде
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 location:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     region:
 *                       type: string
 *                     country:
 *                       type: string
 *                 current:
 *                   type: object
 *                   properties:
 *                     temp_c:
 *                       type: number
 *                       description: Температура в градусах Цельсия
 *                     condition:
 *                       type: object
 *                       properties:
 *                         text:
 *                           type: string
 *                           description: Описание погодных условий
 *                         icon:
 *                           type: string
 *                           description: URL иконки погоды
 *       400:
 *         description: Ошибка запроса, например, если город не найден
 *       500:
 *         description: Внутренняя ошибка сервера
 */

router.get('/', weatherController.getWeather);

module.exports = router;
