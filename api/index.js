const { Bot, webhookCallback } = require('grammy');
const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());

// Initialize Telegram Bot
const bot = new Bot(process.env.BOT_TOKEN || '');

// OpenWeatherMap API configuration
const WEATHER_API_KEY = process.env.WEATHER_API_KEY || '';
const WEATHER_API_URL = 'http://api.openweathermap.org/data/2.5/weather';

// Handle /start command
bot.command('start', (ctx) => {
  ctx.reply('Welcome to the Weather Bot! Use /weather <city> to get the current weather. Example: /weather London');
});

// Handle /weather command
bot.command('weather', async (ctx) => {
  const city = ctx.match.trim();
  if (!city) {
    return ctx.reply('Please provide a city name. Example: /weather London');
  }

  try {
    const response = await axios.get(WEATHER_API_URL, {
      params: {
        q: city,
        appid: WEATHER_API_KEY,
        units: 'metric', // Use Celsius
      },
    });

    const data = response.data;
    const weather = data.weather[0].description;
    const temp = data.main.temp;
    const humidity = data.main.humidity;
    const pressure = Math.round(data.main.pressure / 10.13); // Convert hPa to atm
    const sunrise = new Date(data.sys.sunrise * 1000).toLocaleTimeString();
    const sunset = new Date(data.sys.sunset * 1000).toLocaleTimeString();

    const message = `
🌤️ Weather in ${data.name}, ${data.sys.country} 🌤️
Description: ${weather}
Temperature: ${temp}°C
Humidity: ${humidity}%
Pressure: ${pressure} atm
Sunrise: ${sunrise}
Sunset: ${sunset}
    `;

    ctx.reply(message);
  } catch (error) {
    console.error('Error fetching weather:', error.response?.data || error.message);
    ctx.reply('Sorry, I couldn’t fetch the weather for that city. Please check the city name and try again.');
  }
});

// Handle errors
bot.catch((err) => {
  console.error('Bot error:', err);
});

// Vercel serverless function handler
module.exports = webhookCallback(bot, 'express');
