const swaggerUi = require('swagger-ui-express');
const swaggerJSDoc = require('swagger-jsdoc');

// Конфигурация Swagger
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Документация API BUC',
    version: '1.0.0',
    description: 'Документация для API сайта Business Unit Club',
  },
  servers: [
    {
      url: 'http://localhost:3000/api', // Укажите реальный порт
      description: 'Локальный сервер',
    },
    {
      url: 'https://api.businessunit.club/api', // Укажите реальный порт
      description: 'Рабочий сервер',
    },
  ],
  apis: ['./routers/*.js']
};

const options = {
  swaggerDefinition,
  apis: ['./routers/*.js'] // Укажите путь к файлам с описанием API
};

const swaggerSpec = swaggerJSDoc(options);

// Экспорт middleware для подключения в `index.js`
module.exports = (app) => {
  app.use('/api', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};
