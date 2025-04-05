const { MemberRequest } = require('../models/models'); // Убедитесь, что путь корректный

// Контроллер для создания запроса пользователя
exports.createRequest = async (req, res) => {
  try {
    // Извлекаем поле rentalName вместе с другими
    const { memberName, rentalName, email, message } = req.body;
    
    // Проверка обязательных полей
    if (!memberName || !rentalName || !email || !message) {
      return res.status(400).json({ error: 'Missing required fields: memberName, rentalName, email, and message are required.' });
    }
    
    // Проверка ограничения по длине сообщения
    if (message.length > 200) {
      return res.status(400).json({ error: 'Message exceeds 200 characters.' });
    }
    
    // Создаем новый запрос с дефолтным статусом "new"
    const request = await MemberRequest.create({
      memberName,
      rentalName,  // Передаем имя объявления
      email,
      message,
      status: 'new',
    });
    
    return res.status(201).json({ message: 'Member request created successfully', request });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Server error' });
  }
};

// Контроллер для получения списка запросов пользователей
exports.getRequests = async (req, res) => {
  try {
    // Получаем все запросы, сортируя по дате создания (сначала новые)
    const requests = await MemberRequest.findAll({ order: [['createdAt', 'DESC']] });
    return res.status(200).json({ requests });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Server error' });
  }
};

// Контроллер для обновления запроса пользователя (изменение статуса)
exports.updateRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    // Проверка, что статус указан и соответствует допустимым значениям
    if (!status || !['new', 'viewed', 'completed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid or missing status. Allowed values: new, viewed, completed.' });
    }
    
    // Находим запрос по ID
    const request = await MemberRequest.findByPk(id);
    if (!request) {
      return res.status(404).json({ error: 'Member request not found.' });
    }
    
    // Обновляем статус и сохраняем изменения
    request.status = status;
    await request.save();
    
    return res.status(200).json({ message: 'Member request updated successfully', request });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Server error' });
  }
};
