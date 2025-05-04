const mongoose = require('mongoose');
const CartSchema = require('../schemas/cart.schema')

const CartModel = mongoose.model("Cart", CartSchema);

module.exports = CartModel;
