// config/cloudinary.js
const cloudinary = require('cloudinary').v2;
require('dotenv').config();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME, // Substitua pelo seu nome de nuvem
  api_key: process.env.CLOUD_API_KEY,       // Substitua pela sua API Key
  api_secret: process.env.CLOUD_API_SECRET, // Substitua pelo seu API Secret
});
module.exports = cloudinary;
