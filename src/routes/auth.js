const express = require('express')
const authControlller = require('../controllers/authController.js')
const router = express.Router()

router.post('/login', authControlller.login)

module.exports = router