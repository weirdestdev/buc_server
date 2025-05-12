const { Rentals, RentalsImages, RentTime, Categories, RentalCustomData, CategoriesData } = require('../models/models');
const path = require('path');
const fs = require('fs');

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
 * categoryId, rentTimeId, а также (опционально) customData для кастомных полей.
 *
 * Кроме того, через Multer должны быть загружены:
 * - изображения (поле "images")
 * - PDF файл (поле "pdf")
 */
const createRental = async (req, res) => {
  try {
    const {
      name,
      description,
      address,
      price,
      unit_of_numeration,
      status,
      featured,
      categoryId,
      rentTimeId
    } = req.body;
    
    // Формируем объект данных для создания объявления.
    const rentalData = {
      name,
      description,
      address,
      price,
      unit_of_numeration,
      status,
      featured,
      categoryId,
      rentTimeId: rentTimeId && rentTimeId !== "null" ? rentTimeId : null
    };
    
    const rental = await Rentals.create(rentalData);
    
    // Обработка изображений (ожидается, что они передаются в req.files.images)
    if (req.files && req.files.images && req.files.images.length > 0) {
      const rentalImages = req.files.images.map(file => {
        const imageUrl = `${req.protocol}://${req.get('host')}/static/${file.filename}`;
        return { rentalId: rental.id, image: imageUrl };
      });
      await RentalsImages.bulkCreate(rentalImages);
    }
    
    // Обработка PDF файла (поле "pdf")
    if (req.files && req.files.pdf && req.files.pdf.length > 0) {
      const pdfFile = req.files.pdf[0];
      const pdfFileName = `${Date.now()}-${pdfFile.originalname}`;
      const pdfDestination = path.join(__dirname, '..', 'static', 'pdf', pdfFileName);
      
      // Перемещаем загруженный файл из временной директории в /static/pdf
      fs.renameSync(pdfFile.path, pdfDestination);
      
      // Формируем ссылку вида:
      // https://api.businessunit.club/static/pdf/имя_файла.pdf
      rental.pdfLink = `https://api.businessunit.club/static/pdf/${pdfFileName}`;
      await rental.save();
    }
    
    // Обработка кастомных данных (customData)
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
 * Можно передавать новые данные, новые изображения, новый PDF файл и новые кастомные данные.
 * Если PDF файл загружается вновь, старый файл удаляется.
 */
const updateRental = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, address, price, unit_of_numeration, status, featured, categoryId, rentTimeId } = req.body;
    const rental = await Rentals.findByPk(id);
    if (!rental) {
      return res.status(404).json({ message: 'Объявление не найдено' });
    }

    // Обновляем основные поля объявления
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

    // Обработка обновления изображений, если загружены новые (поле "images")
    if (req.files && req.files.images && req.files.images.length > 0) {
      // Удаляем старые изображения
      const currentImages = await RentalsImages.findAll({ where: { rentalId: id } });
      currentImages.forEach(img => {
        try {
          const filePath = path.join(__dirname, '..', 'static', path.basename(img.image));
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        } catch (err) {
          console.error('Ошибка при удалении файла изображения', err);
        }
      });
      await RentalsImages.destroy({ where: { rentalId: id } });
      // Добавляем новые изображения
      const rentalImages = req.files.images.map(file => ({
        rentalId: rental.id,
        image: `${req.protocol}://${req.get('host')}/static/${file.filename}`
      }));
      await RentalsImages.bulkCreate(rentalImages);
    } else if (req.body.updatedImages) {
      // Парсим входящий массив updatedImages — ожидаем [{ id, order }, …]
      let updatedImages;
      try {
        updatedImages = JSON.parse(req.body.updatedImages);
      } catch (parseError) {
        return res.status(400).json({ message: 'Неверный формат updatedImages', error: parseError });
      }
      
      if (Array.isArray(updatedImages) && updatedImages.length > 0) {
        // Пробегаем по каждому элементу и обновляем только поле order
        await Promise.all(updatedImages.map(img => {
          // img.id — это id записи в RentalsImages; img.order — новый порядок
          return RentalsImages.update(
            { order: img.order },
            { where: { id: img.id } }
          );
        }));
      }
    }

    // Обработка обновления PDF файла (поле "pdf")
    if (req.files && req.files.pdf && req.files.pdf.length > 0) {
      // Если ранее был PDF файл, удаляем его
      if (rental.pdfLink) {
        const oldFileName = path.basename(rental.pdfLink);
        const oldFilePath = path.join(__dirname, '..', 'static', 'pdf', oldFileName);
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }
      const pdfFile = req.files.pdf[0];
      const pdfFileName = `${Date.now()}-${pdfFile.originalname}`;
      const pdfDestination = path.join(__dirname, '..', 'static', 'pdf', pdfFileName);
      fs.renameSync(pdfFile.path, pdfDestination);
      rental.pdfLink = `https://api.businessunit.club/static/pdf/${pdfFileName}`;
      await rental.save();
    }

    // Обработка кастомных данных (customData)
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
    console.error('Ошибка при обновлении объявления:', error);
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
    
    // Удаляем PDF файл, если он есть
    if (rental.pdfLink) {
      const pdfFileName = path.basename(rental.pdfLink);
      const pdfFilePath = path.join(__dirname, '..', 'static', 'pdf', pdfFileName);
      if (fs.existsSync(pdfFilePath)) {
        fs.unlinkSync(pdfFilePath);
      }
    }
    
    await rental.destroy();
    res.status(200).json({ message: 'Объявление успешно удалено' });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при удалении объявления', error });
  }
};

/**
 * Получение всех объявлений с включенными изображениями, временем аренды, категорией и кастомными данными.
 */
const getAllRentals = async (req, res) => {
  try {
    const rentals = await Rentals.findAll({
      include: [
        {
          model: RentalsImages,
          separate: true,
          order: [['order', 'ASC']]
        },
        RentTime,
        Categories,
        {
          model: RentalCustomData,
          include: [ CategoriesData ]
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
        {
          model: RentalsImages,
          separate: true,
          order: [['order', 'ASC']]
        },
        RentTime,
        Categories,
        {
          model: RentalCustomData,
          include: [ CategoriesData ]
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
        {
          model: RentalsImages,
          separate: true,
          order: [['order', 'ASC']]
        },
        RentTime,
        Categories,
        {
          model: RentalCustomData,
          include: [ CategoriesData ]
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
