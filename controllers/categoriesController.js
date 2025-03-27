const { Categories, CategoriesData } = require('../models/models');

exports.createCategory = async (req, res) => {
  try {
    const { name, customFields } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: 'Icon is required' });
    }
    const iconPath = '/static/' + req.file.filename;

    // Создаем категорию с указанными данными
    const category = await Categories.create({ name, icon: iconPath });

    // Обработка дополнительных полей, если они переданы в виде JSON-строки
    let parsedFields = [];
    if (customFields) {
      try {
        parsedFields = JSON.parse(customFields);
      } catch (err) {
        return res.status(400).json({ error: 'customFields must be a valid JSON string' });
      }
    }

    if (Array.isArray(parsedFields)) {
      for (const field of parsedFields) {
        const categoryField = await CategoriesData.create({
          name: field.name,
          type: field.type,
          min_size: field.minSize,
          max_size: field.maxSize,
          icon: field.icon
        });
        await category.addCustomField(categoryField);
      }
    }

    // Загружаем категорию с ассоциированными кастомными полями для возврата клиенту
    const updatedCategory = await Categories.findOne({
      where: { id: category.id },
      include: [{ model: CategoriesData, as: 'customFields' }]
    });

    return res.status(201).json(updatedCategory);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Categories.findAll({
      include: [{ model: CategoriesData, as: 'customFields' }]
    });
    return res.status(200).json(categories);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Categories.findByPk(id);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    await category.destroy();
    return res.status(200).json({ message: 'Category deleted successfully' });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, customFields } = req.body;
    let updatedData = {};

    if (name) {
      updatedData.name = name;
    }

    if (req.file) {
      updatedData.icon = '/static/' + req.file.filename;
    }

    const category = await Categories.findByPk(id);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    await category.update(updatedData);

    // Если переданы кастомные поля – обновляем их (удаляем старые связи и создаем новые)
    if (customFields) {
      await category.setCustomFields([]);
      let parsedFields = [];
      try {
        parsedFields = JSON.parse(customFields);
      } catch (err) {
        return res.status(400).json({ error: 'customFields must be a valid JSON string' });
      }
      if (Array.isArray(parsedFields)) {
        for (const field of parsedFields) {
          const categoryField = await CategoriesData.create({
            name: field.name,
            type: field.type,
            min_size: field.minSize,
            max_size: field.maxSize,
            icon: field.icon
          });
          await category.addCustomField(categoryField);
        }
      }
    }

    const updatedCategory = await Categories.findOne({
      where: { id: category.id },
      include: [{ model: CategoriesData, as: 'customFields' }]
    });

    return res.status(200).json(updatedCategory);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

exports.lockCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Categories.findByPk(id);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    await category.update({ isLocked: true });
    return res.status(200).json({ message: 'Category locked successfully', category });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

exports.unlockCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Categories.findByPk(id);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    await category.update({ isLocked: false });
    return res.status(200).json({ message: 'Category unlocked successfully', category });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};
