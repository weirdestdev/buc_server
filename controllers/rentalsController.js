const { Rentals, RentalsImages, RentTime, Categories, RentalCustomData, CategoriesData } = require('../models/models');
const path = require('path');

// *************************** RentTime методы *************************** //

const addRentTime = async (req, res) => {
  try {
    const { name } = req.body;
    const rentTime = await RentTime.create({ name });
    res.status(201).json(rentTime);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при добавлении времени аренды', error });
  }
};

const getAllRentTimes = async (req, res) => {
  try {
    const rentTimes = await RentTime.findAll();
    res.status(200).json(rentTimes);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при получении времен аренды', error });
  }
};

const getRentTime = async (req, res) => {
  try {
    const { id } = req.params;
    const rentTime = await RentTime.findByPk(id);
    if (!rentTime) {
      return res.status(404).json({ message: 'Время аренды не найдено' });
    }
    res.status(200).json(rentTime);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при получении времени аренды', error });
  }
};

const updateRentTime = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const rentTime = await RentTime.findByPk(id);
    if (!rentTime) {
      return res.status(404).json({ message: 'Время аренды не найдено' });
    }
    rentTime.name = name;
    await rentTime.save();
    res.status(200).json(rentTime);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при обновлении времени аренды', error });
  }
};

const deleteRentTime = async (req, res) => {
  try {
    const { id } = req.params;
    const rentTime = await RentTime.findByPk(id);
    if (!rentTime) {
      return res.status(404).json({ message: 'Время аренды не найдено' });
    }
    await rentTime.destroy();
    res.status(200).json({ message: 'Время аренды успешно удалено' });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при удалении времени аренды', error });
  }
};

// *************************** Rentals методы *************************** //

/**
 * Создание нового объявления.
 * Ожидается, что в теле запроса придут поля:
 * name, description, address, price, unit_of_numeration, status, featured,
 * categoryId, rentTimeId, а также (опционально) customData для кастомных полей,
 * и файлы (images).
 *
 * Обратите внимание: теперь status должен быть одним из: "our portfolio", "leisure", "rentals".
 */
const createRental = async (req, res) => {
  try {
    const { name, description, address, price, unit_of_numeration, status, featured, categoryId, rentTimeId } = req.body;
    
    // Создаем основное объявление
    const rental = await Rentals.create({
      name,
      description,
      address,
      price,
      unit_of_numeration,
      status,
      featured,
      categoryId,
      rentTimeId
    });
    
    // Если файлы были загружены, формируем URL для каждого файла
    if (req.files && req.files.length > 0) {
      const rentalImages = req.files.map(file => {
        const imageUrl = `${req.protocol}://${req.get('host')}/static/${file.filename}`;
        return { rentalId: rental.id, image: imageUrl };
      });
      await RentalsImages.bulkCreate(rentalImages);
    }
    
    // Обработка кастомных полей, если они переданы
    if (req.body.customData) {
      let customData = req.body.customData;
      if (typeof customData === 'string') {
        try {
          customData = JSON.parse(customData);
        } catch (parseError) {
          return res.status(400).json({ message: 'Неверный формат customData', error: parseError });
        }
      }
      
      if (Array.isArray(customData)) {
        const customDataRecords = customData.map(item => ({
          rentalId: rental.id,
          categoriesDataId: item.categoriesDataId,
          value: item.value
        }));
        await RentalCustomData.bulkCreate(customDataRecords);
      }
    }
    
    res.status(201).json(rental);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при создании объявления', error });
  }
};

/**
 * Обновление объявления по ID.
 * При обновлении можно передавать новые данные, новый массив изображений и новые значения кастомных полей.
 * Если кастомные данные переданы, старые записи удаляются и заменяются новыми.
 */
const updateRental = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, address, price, unit_of_numeration, status, featured, categoryId, rentTimeId } = req.body;
    const rental = await Rentals.findByPk(id);
    if (!rental) {
      return res.status(404).json({ message: 'Объявление не найдено' });
    }

    // Обновление основных полей объявления
    rental.name = name || rental.name;
    rental.description = description || rental.description;
    rental.address = address || rental.address;
    rental.price = price || rental.price;
    rental.unit_of_numeration = unit_of_numeration || rental.unit_of_numeration;
    rental.status = status || rental.status;
    rental.featured = featured !== undefined ? featured : rental.featured;
    rental.categoryId = categoryId || rental.categoryId;
    rental.rentTimeId = rentTimeId || rental.rentTimeId;
    await rental.save();

    // Если передан новый порядок существующих изображений,
    // просто очищаем их и вставляем заново в указанном порядке.
    if (req.body.existingImagesOrder) {
      // newOrder ожидается как JSON-строка массива id изображений, например: "[3,1,5]"
      const newOrder = JSON.parse(req.body.existingImagesOrder);
      // Получаем текущие изображения объявления
      const currentImages = await RentalsImages.findAll({ where: { rentalId: id } });
      // Создаем словарь: id -> image url
      const imageMap = {};
      currentImages.forEach(img => {
        imageMap[img.id] = img.image;
      });
      // Формируем массив изображений в новом порядке, пропуская несуществующие id
      const orderedImages = newOrder
        .map(imageId => imageMap[imageId])
        .filter(url => url !== undefined)
        .map(url => ({ rentalId: id, image: url }));

      // Удаляем все существующие изображения
      await RentalsImages.destroy({ where: { rentalId: id } });
      // Если в новом порядке есть изображения — добавляем их
      if (orderedImages.length > 0) {
        await RentalsImages.bulkCreate(orderedImages);
      }
    }

    // Если загружены новые файлы, обрабатываем их отдельно:
    // удаляем старые изображения и вставляем новые.
    if (req.files && req.files.length > 0) {
      await RentalsImages.destroy({ where: { rentalId: id } });
      const rentalImages = req.files.map(file => ({
        rentalId: rental.id,
        image: `${req.protocol}://${req.get('host')}/static/${file.filename}`
      }));
      await RentalsImages.bulkCreate(rentalImages);
    }

    // Обработка кастомных данных
    if (req.body.customData) {
      let customData = req.body.customData;
      if (typeof customData === 'string') {
        try {
          customData = JSON.parse(customData);
        } catch (parseError) {
          return res.status(400).json({ message: 'Неверный формат customData', error: parseError });
        }
      }
      await RentalCustomData.destroy({ where: { rentalId: id } });
      if (Array.isArray(customData)) {
        const customDataRecords = customData.map(item => ({
          rentalId: rental.id,
          categoriesDataId: item.categoriesDataId,
          value: item.value
        }));
        await RentalCustomData.bulkCreate(customDataRecords);
      }
    }

    res.status(200).json(rental);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при обновлении объявления', error });
  }
};


/**
 * Удаление объявления по ID.
 */
const deleteRental = async (req, res) => {
  try {
    const { id } = req.params;
    const rental = await Rentals.findByPk(id);
    if (!rental) {
      return res.status(404).json({ message: 'Объявление не найдено' });
    }
    await rental.destroy();
    res.status(200).json({ message: 'Объявление успешно удалено' });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при удалении объявления', error });
  }
};

/**
 * Получение всех объявлений с включенными изображениями, временем аренды, категорией и кастомными полями.
 */
const getAllRentals = async (req, res) => {
  try {
    const rentals = await Rentals.findAll({
      include: [
        { model: RentalsImages },
        { model: RentTime },
        { model: Categories },
        {
          model: RentalCustomData,
          include: [{ model: CategoriesData }]
        }
      ]
    });
    res.status(200).json(rentals);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при получении объявлений', error });
  }
};

/**
 * Получение только избранных объявлений (featured = true) с включенными данными.
 */
const getFeaturedRentals = async (req, res) => {
  try {
    const rentals = await Rentals.findAll({
      where: { featured: true },
      include: [
        { model: RentalsImages },
        { model: RentTime },
        { model: Categories },
        {
          model: RentalCustomData,
          include: [{ model: CategoriesData }]
        }
      ]
    });
    res.status(200).json(rentals);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при получении избранных объявлений', error });
  }
};

/**
 * Получение объявлений по ID категории с включенными данными.
 */
const getRentalsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const rentals = await Rentals.findAll({
      where: { categoryId },
      include: [
        { model: RentalsImages },
        { model: RentTime },
        { model: Categories },
        {
          model: RentalCustomData,
          include: [{ model: CategoriesData }]
        }
      ]
    });
    res.status(200).json(rentals);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при получении объявлений по категории', error });
  }
};

/**
 * Получение объявлений по статусу с включенными данными.
 */
const getRentalsByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const rentals = await Rentals.findAll({
      where: { status },
      include: [
        { model: RentalsImages },
        { model: RentTime },
        { model: Categories },
        {
          model: RentalCustomData,
          include: [{ model: CategoriesData }]
        }
      ]
    });
    res.status(200).json(rentals);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при получении объявлений по статусу', error });
  }
};

module.exports = {
  // RentTime методы
  addRentTime,
  getAllRentTimes,
  getRentTime,
  updateRentTime,
  deleteRentTime,
  // Rentals методы
  createRental,
  updateRental,
  deleteRental,
  getAllRentals,
  getFeaturedRentals,
  getRentalsByCategory,
  getRentalsByStatus
};
