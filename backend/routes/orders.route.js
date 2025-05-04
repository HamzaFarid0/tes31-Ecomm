const express = require('express')
const router = express.Router()
const { placeOrder} = require('../controllers/orders.contoller')
const authenticateUser = require('../middlewares/authenticate.user')

router.post('/' , authenticateUser , placeOrder )

module.exports = router