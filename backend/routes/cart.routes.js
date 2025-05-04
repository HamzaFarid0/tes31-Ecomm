const express = require('express')
const router = express.Router()
const { addItem , getCart , updateCartItemQuantity , deleteItem} = require('../controllers/cart.controller')
const authenticateUser = require('../middlewares/authenticate.user')

router.get('/' , authenticateUser ,getCart )
router.post('/add' , authenticateUser , addItem)
router.post('/update-quantity' , authenticateUser , updateCartItemQuantity)
router.delete('/deleteItem/:productId' , authenticateUser , deleteItem)

module.exports = router