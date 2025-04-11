const { Rentals, RentalsImages, RentTime, Categories, RentalCustomData, CategoriesData } = require('../models/models');
const path = require('path');
const fs = require('fs');
const HummusRecipe = require('hummus-recipe');

// Функция для сжатия PDF-файла с использованием hummus-recipe
// Параметры: inputPath – исходный файл, outputPath – сжатый файл.
const compressPDF = (inputPath, outputPath, callback) => {
  try {
    console.log(`Начало сжатия PDF: inputPath=${inputPath}, outputPath=${outputPath}`);
    const pdfDoc = new HummusRecipe(inputPath, outputPath, { compress: true });
    pdfDoc.endPDF(() => {
      console.log(`PDF успешно сжат и сохранён: ${outputPath}`);
      callback(null);
    });
  } catch (error) {
    console.error('Ошибка в compressPDF:', error);
    callback(error);
  }
};

// *************************** RentTime методы *************************** //

const addRentTime = async (req, res) => {
  try {
    const { name } = req.body;
    console.log('Добавление времени аренды:', name);
    const rentTime = await RentTime.create({ name });
    console.log('Время аренды добавлено:', rentTime);
    res.status(201).json(rentTime);
  } catch (error) {
    console.error('Ошибка при добавлении времени аренды:', error);
    res.status(500).json({ message: 'Ошибка при добавлении времени аренды', error });
  }
};

const getAllRentTimes = async (req, res) => {
  try {
    console.log('Получение всех времен аренды');
    const rentTimes = await RentTime.findAll();
    res.status(200).json(rentTimes);
  } catch (error) {
    console.error('Ошибка при получении времен аренды:', error);
    res.status(500).json({ message: 'Ошибка при получении времен аренды', error });
  }
};

const getRentTime = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Получение времени аренды с ID: ${id}`);
    const rentTime = await RentTime.findByPk(id);
    if (!rentTime) {
      console.log('Время аренды не найдено:', id);
      return res.status(404).json({ message: 'Время аренды не найдено' });
    }
    res.status(200).json(rentTime);
  } catch (error) {
    console.error('Ошибка при получении времени аренды:', error);
    res.status(500).json({ message: 'Ошибка при получении времени аренды', error });
  }
};

const updateRentTime = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    console.log(`Обновление времени аренды с ID: ${id} новыми данными: ${name}`);
    const rentTime = await RentTime.findByPk(id);
    if (!rentTime) {
      console.log('Время аренды не найдено для обновления:', id);
      return res.status(404).json({ message: 'Время аренды не найдено' });
    }
    rentTime.name = name;
    await rentTime.save();
    console.log('Время аренды успешно обновлено:', rentTime);
    res.status(200).json(rentTime);
  } catch (error) {
    console.error('Ошибка при обновлении времени аренды:', error);
    res.status(500).json({ message: 'Ошибка при обновлении времени аренды', error });
  }
};

const deleteRentTime = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Удаление времени аренды с ID: ${id}`);
    const rentTime = await RentTime.findByPk(id);
    if (!rentTime) {
      console.log('Время аренды не найдено для удаления:', id);
      return res.status(404).json({ message: 'Время аренды не найдено' });
    }
    await rentTime.destroy();
    console.log('Время аренды успешно удалено:', id);
    res.status(200).json({ message: 'Время аренды успешно удалено' });
  } catch (error) {
    console.error('Ошибка при удалении времени аренды:', error);
    res.status(500).json({ message: 'Ошибка при удалении времени аренды', error });
  }
};

// *************************** Rentals методы *************************** //

/**
 * Создание нового объявления.
 * Поля в теле запроса: name, description, address, price, unit_of_numeration, status, featured,
 * categoryId, rentTimeId, (опционально) customData, изображения (images) и PDF-файл (pdf).
 */
const createRental = async (req, res) => {
  try {
    console.log('Создание нового объявления с данными:', req.body);
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
      rentTimeId: rentTimeId && rentTimeId !== "null" ? rentTimeId : null,
      pdfLink: null // Изначально поле pdfLink пустое
    };

    const rental = await Rentals.create(rentalData);
    console.log('Объявление создано:', rental.id);

    // Обработка изображений – без изменений.
    if (req.files && req.files.images && req.files.images.length > 0) {
      console.log('Обработка изображений, количество:', req.files.images.length);
      const rentalImages = req.files.images.map(file => {
        const imageUrl = `${req.protocol}://${req.get('host')}/static/${file.filename}`;
        console.log('Добавлена картинка:', imageUrl);
        return { rentalId: rental.id, image: imageUrl };
      });
      await RentalsImages.bulkCreate(rentalImages);
    }

    // Обработка PDF-файла.
    if (req.files && req.files.pdf && req.files.pdf.length > 0) {
      console.log('Обработка PDF-файла');
      const pdfFile = req.files.pdf[0];
      const inputPath = pdfFile.path; // Multer сохраняет временный файл
      const outputFilename = pdfFile.filename; // Можно добавить префикс/слаг по необходимости
      const outputPath = path.join(__dirname, '..', 'static', 'pdf', outputFilename);
      console.log(`PDF: inputPath=${inputPath}, outputPath=${outputPath}`);

      // Сжимаем PDF и после успешного сжатия сохраняем ссылку в базе.
      compressPDF(inputPath, outputPath, async (err) => {
        if (err) {
          console.error('Ошибка при сжатии PDF:', err);
          return res.status(500).json({ message: 'Ошибка при сжатии PDF', err });
        }
        // Удаляем исходный (несжатый) файл
        fs.unlinkSync(inputPath);
        console.log('Исходный PDF удалён:', inputPath);
        // Обновляем поле pdfLink с формированием URL
        rental.pdfLink = `https://api.businessunit.club/static/pdf/${outputFilename}`;
        await rental.save();
        console.log('PDF ссылка обновлена:', rental.pdfLink);
      });
    }

    if (req.body.customData) {
      let customData = req.body.customData;
      console.log('Обработка customData:', customData);
      if (typeof customData === 'string') {
        try {
          customData = JSON.parse(customData);
        } catch (parseError) {
          console.error('Ошибка парсинга customData:', parseError);
          return res.status(400).json({ message: 'Неверный формат customData', error: parseError });
        }
      }

      if (Array.isArray(customData)) {
        const customDataRecords = customData.map(item => {
          console.log('Обработка customData item:', item);
          return {
            rentalId: rental.id,
            categoriesDataId: item.categoriesDataId,
            value: item.value
          };
        });
        await RentalCustomData.bulkCreate(customDataRecords);
        console.log('CustomData успешно сохранены');
      }
    }

    res.status(201).json(rental);
  } catch (error) {
    console.error('Ошибка при создании объявления:', error);
    res.status(500).json({ message: 'Ошибка при создании объявления', error });
  }
};

/**
 * Обновление объявления по ID.
 * Можно обновлять данные, изображения, кастомные поля и PDF-файл.
 * При обновлении PDF: если передан новый файл, старый (если есть) удаляется.
 */
const updateRental = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Обновление объявления ID: ${id} с данными:`, req.body);
    const { name, description, address, price, unit_of_numeration, status, featured, categoryId, rentTimeId } = req.body;
    const rental = await Rentals.findByPk(id);
    if (!rental) {
      console.log('Объявление не найдено для обновления:', id);
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
    console.log('Основные поля объявления обновлены');

    // Обработка изображений
    if (req.files && req.files.images && req.files.images.length > 0) {
      console.log('Получены новые изображения, количество:', req.files.images.length);
      const currentImages = await RentalsImages.findAll({ where: { rentalId: id } });
      currentImages.forEach(img => {
        try {
          const filePath = path.join(__dirname, '..', 'static', path.basename(img.image));
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log('Удалено старое изображение:', filePath);
          }
        } catch (err) {
          console.error('Ошибка при удалении файла изображения', err);
        }
      });
      await RentalsImages.destroy({ where: { rentalId: id } });
      const rentalImages = req.files.images.map(file => {
        const imageUrl = `${req.protocol}://${req.get('host')}/static/${file.filename}`;
        console.log('Добавлено новое изображение:', imageUrl);
        return { rentalId: rental.id, image: imageUrl };
      });
      await RentalsImages.bulkCreate(rentalImages);
      console.log('Новые изображения успешно обработаны');
    } else if (req.body.updatedImages) {
      console.log('Обновление изображений через updatedImages');
      let updatedImages;
      try {
        updatedImages = JSON.parse(req.body.updatedImages);
      } catch (parseError) {
        console.error('Ошибка парсинга updatedImages:', parseError);
        return res.status(400).json({ message: 'Неверный формат updatedImages', error: parseError });
      }
      const currentImages = await RentalsImages.findAll({ where: { rentalId: id } });
      currentImages.forEach(img => {
        try {
          const filePath = path.join(__dirname, '..', 'static', path.basename(img.image));
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log('Удалено старое изображение (updatedImages):', filePath);
          }
        } catch (err) {
          console.error('Ошибка при удалении файла изображения', err);
        }
      });
      await RentalsImages.destroy({ where: { rentalId: id } });
      if (updatedImages.length > 0) {
        const newImages = updatedImages.map(item => {
          console.log('Добавление обновлённого изображения:', item.image);
          return { rentalId: rental.id, image: item.image };
        });
        await RentalsImages.bulkCreate(newImages);
        console.log('Обновлённые изображения успешно сохранены');
      }
    }

    // Обработка обновления PDF-файла.
    if (req.files && req.files.pdf && req.files.pdf.length > 0) {
      console.log('Получен новый PDF для обновления');
      // Удаляем старый PDF, если он существует.
      if (rental.pdfLink) {
        const oldPdfFileName = path.basename(rental.pdfLink);
        const oldPdfFilePath = path.join(__dirname, '..', 'static', 'pdf', oldPdfFileName);
        if (fs.existsSync(oldPdfFilePath)) {
          fs.unlinkSync(oldPdfFilePath);
          console.log('Удалён старый PDF:', oldPdfFilePath);
        }
      }
      const pdfFile = req.files.pdf[0];
      const inputPath = pdfFile.path;
      const outputFilename = pdfFile.filename;
      const outputPath = path.join(__dirname, '..', 'static', 'pdf', outputFilename);
      console.log(`Новый PDF: inputPath=${inputPath}, outputPath=${outputPath}`);

      await new Promise((resolve, reject) => {
        compressPDF(inputPath, outputPath, async (err) => {
          if (err) {
            console.error('Ошибка при сжатии PDF в updateRental:', err);
            return reject(err);
          }
          fs.unlinkSync(inputPath);
          console.log('Исходный PDF (updateRental) удалён:', inputPath);
          rental.pdfLink = `https://api.businessunit.club/static/pdf/${outputFilename}`;
          await rental.save();
          console.log('PDF ссылка обновлена (updateRental):', rental.pdfLink);
          resolve();
        });
      });
    }

    // Обработка кастомных данных
    if (req.body.customData) {
      let customData = req.body.customData;
      console.log('Обработка customData при обновлении:', customData);
      if (typeof customData === 'string') {
        try {
          customData = JSON.parse(customData);
        } catch (parseError) {
          console.error('Ошибка парсинга customData при обновлении:', parseError);
          return res.status(400).json({ message: 'Неверный формат customData', error: parseError });
        }
      }
      await RentalCustomData.destroy({ where: { rentalId: id } });
      if (Array.isArray(customData)) {
        const customDataRecords = customData.map(item => {
          console.log('Обработка customData item при обновлении:', item);
          return {
            rentalId: rental.id,
            categoriesDataId: item.categoriesDataId,
            value: item.value
          };
        });
        await RentalCustomData.bulkCreate(customDataRecords);
        console.log('CustomData обновлены');
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
 * Если у объявления есть PDF-файл, он также будет удалён из папки static/pdf.
 */
const deleteRental = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Удаление объявления с ID: ${id}`);
    const rental = await Rentals.findByPk(id);
    if (!rental) {
      console.log('Объявление не найдено для удаления:', id);
      return res.status(404).json({ message: 'Объявление не найдено' });
    }
    // Удаляем PDF, если он имеется
    if (rental.pdfLink) {
      const pdfFilename = path.basename(rental.pdfLink);
      const pdfFilePath = path.join(__dirname, '..', 'static', 'pdf', pdfFilename);
      if (fs.existsSync(pdfFilePath)) {
        fs.unlinkSync(pdfFilePath);
        console.log('PDF удалён при удалении объявления:', pdfFilePath);
      }
    }
    await rental.destroy();
    console.log('Объявление успешно удалено:', id);
    res.status(200).json({ message: 'Объявление успешно удалено' });
  } catch (error) {
    console.error('Ошибка при удалении объявления:', error);
    res.status(500).json({ message: 'Ошибка при удалении объявления', error });
  }
};

/**
 * Получение всех объявлений с включёнными изображениями, временем аренды, категорией и кастомными полями.
 */
const getAllRentals = async (req, res) => {
  try {
    console.log('Получение всех объявлений');
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
    console.error('Ошибка при получении объявлений:', error);
    res.status(500).json({ message: 'Ошибка при получении объявлений', error });
  }
};

/**
 * Получение избранных объявлений.
 */
const getFeaturedRentals = async (req, res) => {
  try {
    console.log('Получение избранных объявлений');
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
    console.error('Ошибка при получении избранных объявлений:', error);
    res.status(500).json({ message: 'Ошибка при получении избранных объявлений', error });
  }
};

/**
 * Получение объявлений по ID категории.
 */
const getRentalsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    console.log(`Получение объявлений по категории с ID: ${categoryId}`);
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
    console.error('Ошибка при получении объявлений по категории:', error);
    res.status(500).json({ message: 'Ошибка при получении объявлений по категории', error });
  }
};

/**
 * Получение объявлений по статусу.
 */
const getRentalsByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    console.log(`Получение объявлений по статусу: ${status}`);
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
    console.error('Ошибка при получении объявлений по статусу:', error);
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
