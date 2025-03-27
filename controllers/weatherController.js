const fetch = require('node-fetch');

class WeatherController {
    async getWeather(req, res) {
        try {
            const city = req.query.q || 'Palma de Mallorca';
            const response = await fetch(`https://api.weatherapi.com/v1/current.json?key=9ef44812e32745a4838171922252703&q=${city}&aqi=no`);
            
            if (!response.ok) {
                throw new Error(`Ошибка запроса: ${response.statusText}`);
            }

            const data = await response.json();
            res.json(data);
        } catch (error) {
            console.error('Ошибка получения данных о погоде:', error);
            res.status(500).json({ error: 'Не удалось получить данные о погоде' });
        }
    }
}

module.exports = new WeatherController();
