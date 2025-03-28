// controllers/rentalsController.js
const { RentTime } = require('../models/models');

class RentalsController {
  // Добавление нового времени аренды
  async addRentTime(req, res) {
    try {
      const { name } = req.body;
      if (!name) {
        return res.status(400).json({ message: "Name is required" });
      }
      const rentTime = await RentTime.create({ name });
      return res.status(201).json(rentTime);
    } catch (error) {
      console.error("Error creating RentTime:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  // Получение всех времен аренды
  async getAllRentTimes(req, res) {
    try {
      const rentTimes = await RentTime.findAll();
      return res.json(rentTimes);
    } catch (error) {
      console.error("Error fetching RentTimes:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  // Получение конкретного времени аренды по ID
  async getRentTime(req, res) {
    try {
      const { id } = req.params;
      const rentTime = await RentTime.findByPk(id);
      if (!rentTime) {
        return res.status(404).json({ message: "Rent time not found" });
      }
      return res.json(rentTime);
    } catch (error) {
      console.error("Error fetching RentTime:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  // Обновление времени аренды по ID
  async updateRentTime(req, res) {
    try {
      const { id } = req.params;
      const { name } = req.body;
      if (!name) {
        return res.status(400).json({ message: "Name is required" });
      }

      const rentTime = await RentTime.findByPk(id);
      if (!rentTime) {
        return res.status(404).json({ message: "Rent time not found" });
      }

      rentTime.name = name;
      await rentTime.save();

      return res.json(rentTime);
    } catch (error) {
      console.error("Error updating RentTime:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  // Удаление времени аренды по ID
  async deleteRentTime(req, res) {
    try {
      const { id } = req.params;
      const rentTime = await RentTime.findByPk(id);
      if (!rentTime) {
        return res.status(404).json({ message: "Rent time not found" });
      }

      await rentTime.destroy();
      return res.json({ message: "Rent time deleted successfully" });
    } catch (error) {
      console.error("Error deleting RentTime:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
}

module.exports = new RentalsController();
