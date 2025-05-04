const express = require("express");
const cors = require('cors'); 
const cookieParser = require("cookie-parser");
const authRouter = require('./routes/auth.routes');
const productRouter = require('./routes/product.routes')
const searchRouter = require('./routes/search.routes')
const  protectedRoute  = require("./routes/protectedRoute.routes");
const  cartRoute  = require("./routes/cart.routes");
const  ordersRoute  = require("./routes/orders.route");
const connectDB = require("./config/db");
require('./cron/cleanupUnverifiedUsers'); 
const app = express();

const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: 'http://localhost:4200', // Your frontend URL
  credentials: true
}));
app.use(cookieParser());

app.use(express.json()); 

connectDB()
  
app.use('/api/auth' , authRouter)
app.use('/api/products' , productRouter)
app.use('/api/search' , searchRouter )
app.use('/api/protectedRoute' , protectedRoute )
app.use('/api/cart' , cartRoute )
app.use('/api/orders' , ordersRoute )

app.listen(PORT, () => {
  console.log(`Server is running on Port ${PORT}...`);
});
