const CartModel = require('../models/cart.model');

const placeOrder = async (req,res) => {
    try {
        const userId = req.user._id;
    
        // Empty the cart (but keep the document)
        const updatedCart = await CartModel.findOneAndUpdate(
          { userId },
          { $set: { items: [] } },
          { new: true }
        );
    
        if (!updatedCart) {
          return res.status(404).json({ message: 'Cart not found' });
        }
        
        let totalQuantity = 0;
        let totalPrice = 0;
    
        for (const item of updatedCart.items) {
          const quantity = item.quantity;
          const product = item.productId;
    
          totalQuantity += quantity;
          totalPrice += product.price * quantity;
        }

        res.status(200).json({ message: 'Order placed successfully',
             cart: updatedCart , totalQuantity , totalPrice
             });
      } catch (err) {
        console.error('Error placing order:', err);
        res.status(500).json({ message: 'Internal server error' });
      }
}

module.exports = { placeOrder }