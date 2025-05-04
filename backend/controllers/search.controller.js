const ProductModel = require('../models/product.model')

const searchProducts = async (req, res) => {
  try {
    const { keyword, category } = req.query;

    const query = {};

    if (keyword && keyword.trim() !== '') {
      query.name = new RegExp(keyword, 'i'); 
    }

    if (category) {
      query.category = category;
    }

    const products = await ProductModel.find(query);
 
    if (keyword && keyword.trim() !== '' && products.length === 0) {
      return res.status(404).json({ success: false, message: 'No products found' });
    }

    return res.status(200).json({ success: true, data: products });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};


module.exports = { searchProducts }