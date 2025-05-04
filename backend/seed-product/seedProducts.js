const mongoose = require('mongoose');

const ProductModel = require('../models/product.model'); 
const productData = require('../data/productData.json'); 
const connectDB = require("../config/db");
require('dotenv').config();

// Connect to MongoDB
connectDB().then(seedProducts); 

async function seedProducts() {
  try {
    await ProductModel.deleteMany({});
    const products = Object.values(productData).flat();
    await ProductModel.insertMany(products);
    console.log('Products have been seeded successfully');
  } catch (error) {
    console.error('Error seeding products:', error);
  } finally {
    mongoose.connection.close();
  }
}

