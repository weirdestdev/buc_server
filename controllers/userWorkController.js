const { User } = require('../models/models'); // убедитесь, что путь корректный
const { Op } = require('sequelize');

class UserWorkController {
  async getAllCount(req, res, next) {
    try {
      const count = await User.count();
      return res.json({ count });
    } catch (error) {
      next(error);
    }
  }

  async getPendingCount(req, res, next) {
    try {
      const count = await User.count({ where: { status: 'pending' } });
      return res.json({ count });
    } catch (error) {
      next(error);
    }
  }

  async getApprovedCount(req, res, next) {
    try {
      const count = await User.count({ where: { status: 'approved' } });
      return res.json({ count });
    } catch (error) {
      next(error);
    }
  }

  async getBlockedCount(req, res, next) {
    try {
      const count = await User.count({ where: { status: 'blocked' } });
      return res.json({ count });
    } catch (error) {
      next(error);
    }
  }

  async getAllUsers(req, res, next) {
    const { page = 1, limit = 10, searchQuery = '', category = '' } = req.query; // получаем page, limit, searchQuery и category из query params

    try {
      // Преобразуем page и limit в числа
      const pageNumber = parseInt(page, 10);
      const limitNumber = parseInt(limit, 10);

      // Формируем базовое условие для поиска по запросу
      let whereCondition = {};
      if (searchQuery) {
        whereCondition = {
          [Op.or]: [
            { email: { [Op.iLike]: `%${searchQuery}%` } },
            { fullname: { [Op.iLike]: `%${searchQuery}%` } },
            { phone: { [Op.iLike]: `%${searchQuery}%` } },
          ],
        };
      }

      // Если передана категория – проверяем, что значение входит в допустимые enum'ы
      if (category) {
        // Список допустимых значений для поля status
        const allowedStatuses = ['pending', 'approved', 'blocked'];

        // Если переданное значение не входит в список, возвращаем ошибку
        if (!allowedStatuses.includes(category)) {
          return res.status(400).json({ message: `Invalid status value: "${category}"` });
        }

        whereCondition = {
          ...whereCondition,
          status: category,
        };
      }

      // Получаем пользователей с пагинацией и фильтрами
      const users = await User.findAll({
        where: whereCondition,
        limit: limitNumber,
        offset: (pageNumber - 1) * limitNumber,
      });

      // Получаем общее количество пользователей с учетом фильтрации
      const totalCount = await User.count({ where: whereCondition });

      return res.json({ users, totalCount });
    } catch (error) {
      // Возвращаем статус 500 и текст ошибки в ответе
      return res.status(500).json({ message: error.message });
    }
  }


  // Одобрение пользователя (установка статуса approved)
  async approveUser(req, res) {
    try {
      const { id } = req.params;
      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({ message: 'Пользователь не найден' });
      }

      user.status = 'approved';
      await user.save();

      return res.json({ message: 'Статус пользователя обновлен на approved', user });
    } catch (error) {
      return res.status(500).json({ message: 'Ошибка при обновлении статуса', error });
    }
  }

  // Блокировка пользователя (установка статуса blocked)
  async blockUser(req, res) {
    try {
      const { id } = req.params;
      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({ message: 'Пользователь не найден' });
      }

      user.status = 'blocked';
      await user.save();

      return res.json({ message: 'Статус пользователя обновлен на blocked', user });
    } catch (error) {
      return res.status(500).json({ message: 'Ошибка при обновлении статуса', error });
    }
  }

  // Разблокировка пользователя (изменение blocked → approved)
  async unblockUser(req, res) {
    try {
      const { id } = req.params;
      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({ message: 'Пользователь не найден' });
      }

      if (user.status !== 'blocked') {
        return res.status(400).json({ message: 'Пользователь не заблокирован, разблокировка невозможна' });
      }

      user.status = 'approved';
      await user.save();

      return res.json({ message: 'Пользователь разблокирован (статус изменен на approved)', user });
    } catch (error) {
      return res.status(500).json({ message: 'Ошибка при обновлении статуса', error });
    }
  }

}

module.exports = new UserWorkController();
