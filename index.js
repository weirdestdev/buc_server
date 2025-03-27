require('dotenv').config();
const express = require('express');
const sequelize = require('./db');
const models = require('./models/models');
const cors = require('cors');
const path = require('path');
const router = require('./routers/index');
const errorHanlder = require('./middleware/ErrorHandlingMiddleware');

const setupSwagger = require('./swagger');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/static', express.static(path.join(__dirname, 'static')));
app.use('/api', router);
app.use(errorHanlder);

const PORT = process.env.PORT || 3000;

const start = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    app.listen(PORT, () => {
      console.log(`Сервер запущен на http://localhost:${PORT}`);
      console.log(`Swagger UI доступен по адресу: http://localhost:${PORT}/api`);
    });    
  } catch (e) {
    console.log(e);
  }
}

start();
setupSwagger(app);