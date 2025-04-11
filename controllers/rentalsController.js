const { Rentals, RentalsImages, RentTime, Categories, RentalCustomData, CategoriesData } = require('../models/models');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');

// Функция для сжатия PDF-файла через Ghostscript.
// Параметры: inputPath – исходный файл, outputPath – сжатый файл.
const compressPDF = (inputPath, outputPath, callback) => {
  // Параметры Ghostscript для сжатия PDF (настройте по необходимости)
  const gsCommand = `gs -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 -dPDFSETTINGS=/ebook -dNOPAUSE -dQUIET -dBATCH -sOutputFile="${outputPath}" "${inputPath}"`;
  exec(gsCommand, (error, stdout, stderr) => {
    if (error) return callback(error);
    callback(null);
  });
};

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
 * Поля в теле запроса: name, description, address, price, unit_of_numeration, status, featured,
 * categoryId, rentTimeId, (опционально) customData, изображения (images) и PDF-файл (pdf).
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
      rentTimeId: rentTimeId && rentTimeId !== "null" ? rentTimeId : null,
      pdfLink: null // Изначально поле pdfLink пустое
    };

    const rental = await Rentals.create(rentalData);

    // Обработка изображений – без изменений.
    if (req.files && req.files.images && req.files.images.length > 0) {
      const rentalImages = req.files.images.map(file => {
        const imageUrl = `${req.protocol}://${req.get('host')}/static/${file.filename}`;
        return { rentalId: rental.id, image: imageUrl };
      });
      await RentalsImages.bulkCreate(rentalImages);
    }

    // Обработка PDF-файла.
    if (req.files && req.files.pdf && req.files.pdf.length > 0) {
      const pdfFile = req.files.pdf[0];
      // Пути к исходному файлу и к сжатому файлу
      const inputPath = pdfFile.path; // Multer сохраняет временный файл
      const outputFilename = pdfFile.filename; // Можно добавить префикс/слаг по необходимости
      const outputPath = path.join(__dirname, '..', 'static', 'pdf', outputFilename);

      // Сжимаем PDF и после успешного сжатия сохраняем ссылку в базе.
      compressPDF(inputPath, outputPath, async (err) => {
        if (err) {
          console.error('Ошибка при сжатии PDF:', err);
          // В случае ошибки можно либо отправить ответ об ошибке, либо продолжить с оригинальным файлом.
          // Здесь отправляем ошибку.
          return res.status(500).json({ message: 'Ошибка при сжатии PDF', err });
        }
        // Удаляем исходный (несжатый) файл
        fs.unlinkSync(inputPath);
        // Обновляем поле pdfLink с формированием URL
        rental.pdfLink = `https://api.businessunit.club/static/pdf/${outputFilename}`;
        await rental.save();
      });
    }

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
 * Можно обновлять данные, изображения, кастомные поля и PDF-файл.
 * При обновлении PDF: если передан новый файл, старый (если есть) удаляется.
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

    // Если загружены новые изображения – удаляем старые и добавляем новые
    if (req.files && req.files.images && req.files.images.length > 0) {
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
      const rentalImages = req.files.images.map(file => ({
        rentalId: rental.id,
        image: `${req.protocol}://${req.get('host')}/static/${file.filename}`
      }));
      await RentalsImages.bulkCreate(rentalImages);
    } else if (req.body.updatedImages) {
      let updatedImages;
      try {
        updatedImages = JSON.parse(req.body.updatedImages);
      } catch (parseError) {
        return res.status(400).json({ message: 'Неверный формат updatedImages', error: parseError });
      }
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
      if (updatedImages.length > 0) {
        const newImages = updatedImages.map(item => ({
          rentalId: rental.id,
          image: item.image
        }));
        await RentalsImages.bulkCreate(newImages);
      }
    }

    // Обработка обновления PDF-файла.
    if (req.files && req.files.pdf && req.files.pdf.length > 0) {
      // Удаляем старый PDF, если он существует.
      if (rental.pdfLink) {
        const oldPdfFileName = path.basename(rental.pdfLink);
        const oldPdfFilePath = path.join(__dirname, '..', 'static', 'pdf', oldPdfFileName);
        if (fs.existsSync(oldPdfFilePath)) {
          fs.unlinkSync(oldPdfFilePath);
        }
      }
      const pdfFile = req.files.pdf[0];
      const inputPath = pdfFile.path;
      const outputFilename = pdfFile.filename;
      const outputPath = path.join(__dirname, '..', 'static', 'pdf', outputFilename);

      // Оборачиваем compressPDF в Promise, чтобы можно было использовать await.
      await new Promise((resolve, reject) => {
        compressPDF(inputPath, outputPath, async (err) => {
          if (err) {
            console.error('Ошибка при сжатии PDF:', err);
            return reject(err);
          }
          // Удаляем исходный (несжатый) файл.
          fs.unlinkSync(inputPath);
          // Обновляем поле pdfLink с формированием URL.
          rental.pdfLink = `https://api.businessunit.club/static/pdf/${outputFilename}`;
          await rental.save();
          resolve();
        });
      });
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
    const rental = await Rentals.findByPk(id);
    if (!rental) {
      return res.status(404).json({ message: 'Объявление не найдено' });
    }
    // Удаляем PDF, если он имеется
    if (rental.pdfLink) {
      const pdfFilename = path.basename(rental.pdfLink);
      const pdfFilePath = path.join(__dirname, '..', 'static', 'pdf', pdfFilename);
      if (fs.existsSync(pdfFilePath)) {
        fs.unlinkSync(pdfFilePath);
      }
    }
    // Можно также добавить удаление связанных изображений и кастомных данных, если они не удаляются каскадно.
    await rental.destroy();
    res.status(200).json({ message: 'Объявление успешно удалено' });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при удалении объявления', error });
  }
};

/**
 * Получение всех объявлений с включёнными изображениями, временем аренды, категорией и кастомными полями.
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
 * Получение избранных объявлений.
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
 * Получение объявлений по ID категории.
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
 * Получение объявлений по статусу.
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
