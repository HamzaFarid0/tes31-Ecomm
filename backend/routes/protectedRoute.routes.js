const express = require('express')
const router = express.Router()
const { protectedRoute } = require('../controllers/protectedRoute')
const authenticateUser = require('../middlewares/authenticate.user')

router.get('/' , authenticateUser ,protectedRoute)

module.exports = router