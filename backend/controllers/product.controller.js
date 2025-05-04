const ProductModel = require('../models/product.model')

const getAllProducts = async (req,res) => {
    try {
        const { category } = req.query;

        if (category && typeof category !== 'string') {
          console.log('Invalid category format')
          return res.status(400).json({ success: false, message: 'Invalid category format' });
        }

        const filter = category ? { category } : {};
        const products = await ProductModel.find(filter);

        if (products.length === 0) {
          return res.status(404).json({ success: false, message: 'No products found' });
        }

        return res.status(200).json({success : true , data : products});
      } catch (err) {
        return res.status(500).json({success : false , message: 'Internal Server error' });
      }
}

module.exports = { getAllProducts }