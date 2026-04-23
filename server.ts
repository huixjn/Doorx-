import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Razorpay from 'razorpay';
import crypto from 'crypto';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI;
if (MONGODB_URI && (MONGODB_URI.startsWith('mongodb://') || MONGODB_URI.startsWith('mongodb+srv://'))) {
  mongoose.connect(MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => {
      console.error('MongoDB connection error:', err.message);
      if (err.message.includes('Invalid scheme')) {
        console.error('Please ensure MONGODB_URI starts with "mongodb://" or "mongodb+srv://" in your Secrets panel.');
      }
    });
} else if (MONGODB_URI) {
  console.error('Invalid MONGODB_URI: Connection string must start with "mongodb://" or "mongodb+srv://". Please check your environment variables.');
} else {
  console.warn('MONGODB_URI not found. Database features will be unavailable. Please set MONGODB_URI in the Secrets panel.');
}

// Razorpay Setup
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || '',
  key_secret: process.env.RAZORPAY_KEY_SECRET || '',
});

// Models
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  role: { type: String, enum: ['creator', 'buyer', 'admin'], default: 'buyer' },
  mobileNumber: { type: String },
  address: { type: String },
  displayName: { type: String },
  isConfigured: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});
const User = mongoose.model('User', UserSchema);

const ProductSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  category: { type: String, default: 'All' },
  price: { type: Number, required: true },
  imageUrl: { type: String, required: true },
  fileUrl: { type: String, required: true },
  videoUrl: { type: String },
  creatorEmail: { type: String, required: true },
  wishlistedBy: [{ type: String }],
  reviews: [{
    user: { type: String, required: true },
    rating: { type: Number, required: true },
    comment: { type: String },
    createdAt: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now },
});
const Product = mongoose.model('Product', ProductSchema);

const OrderSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  razorpayOrderId: { type: String, required: true },
  status: { type: String, default: 'pending' },
  createdAt: { type: Date, default: Date.now },
});
const Order = mongoose.model('Order', OrderSchema);

// Middleware to check database connection
const checkDbConnection = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ 
      error: 'Database not connected', 
      message: 'The server is not connected to the database. Please ensure MONGODB_URI is correctly configured in the Secrets panel.' 
    });
  }
  next();
};

// Admin Middleware
const isAdmin = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const adminEmail = req.headers['x-admin-email'] as string;
  if (!adminEmail) return res.status(401).json({ error: 'Auth required' });
  
  try {
    const user = await User.findOne({ email: adminEmail });
    if (user?.role === 'admin') {
      next();
    } else {
      res.status(403).json({ error: 'Admin access required' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// API Routes
app.post('/api/users/sync', checkDbConnection, async (req, res) => {
  const { email, displayName } = req.body;
  try {
    let user = await User.findOne({ email });
    if (!user) {
      // Automatically make suvhobouri@gmail.com an admin
      const role = email === 'suvhobouri@gmail.com' ? 'admin' : 'buyer';
      const isConfigured = email === 'suvhobouri@gmail.com'; // Admin is pre-configured
      user = new User({ email, displayName, role, isConfigured });
      await user.save();
    }
    res.json(user);
  } catch (error: any) {
    console.error('Sync user error:', error);
    res.status(500).json({ error: 'Failed to sync user', details: error.message });
  }
});

app.post('/api/users/update', checkDbConnection, async (req, res) => {
  const { email, role, mobileNumber, address } = req.body;
  try {
    const user = await User.findOneAndUpdate(
      { email },
      { role, mobileNumber, address, isConfigured: true },
      { new: true }
    );
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error: any) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update user', details: error.message });
  }
});

app.post('/api/products/create', checkDbConnection, async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.json(product);
  } catch (error: any) {
    console.error('Create product error:', error);
    res.status(500).json({ error: 'Failed to create product', details: error.message });
  }
});

app.get('/api/products', checkDbConnection, async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (error: any) {
    console.error('Fetch products error:', error);
    res.status(500).json({ error: 'Failed to fetch products', details: error.message });
  }
});

app.get('/api/products/:id', checkDbConnection, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (error: any) {
    console.error('Fetch product by ID error:', error);
    res.status(500).json({ error: 'Failed to fetch product', details: error.message });
  }
});

// Wishlist Endpoints
app.post('/api/products/:id/wishlist', checkDbConnection, async (req, res) => {
  try {
    const { email } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    const index = product.wishlistedBy.indexOf(email);
    if (index === -1) {
      product.wishlistedBy.push(email);
    } else {
      product.wishlistedBy.splice(index, 1);
    }
    await product.save();
    res.json(product);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/wishlist/:email', checkDbConnection, async (req, res) => {
  try {
    const products = await Product.find({ wishlistedBy: req.params.email });
    res.json(products);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Review Endpoints
app.post('/api/products/:id/reviews', checkDbConnection, async (req, res) => {
  try {
    const { userEmail, rating, comment } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    product.reviews.push({ user: userEmail, rating, comment });
    await product.save();
    res.json(product);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/payment/create', checkDbConnection, async (req, res) => {
  const { productId, userId, amount } = req.body;
  try {
    const options = {
      amount: Math.round(amount * 100), // amount in the smallest currency unit
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };
    const razorpayOrder = await razorpay.orders.create(options);
    
    const order = new Order({
      userId,
      productId,
      razorpayOrderId: razorpayOrder.id,
    });
    await order.save();

    res.json({
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
    });
  } catch (error: any) {
    console.error('Razorpay order creation error:', error);
    res.status(500).json({ error: 'Failed to create payment order', details: error.message });
  }
});

app.post('/api/payment/verify', checkDbConnection, async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  const secret = process.env.RAZORPAY_KEY_SECRET || '';
  
  try {
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
    const generated_signature = hmac.digest('hex');

    if (generated_signature === razorpay_signature) {
      await Order.findOneAndUpdate({ razorpayOrderId: razorpay_order_id }, { status: 'completed' });
      res.json({ status: 'success' });
    } else {
      res.status(400).json({ status: 'failure', message: 'Invalid payment signature' });
    }
  } catch (error: any) {
    console.error('Payment verification error:', error);
    res.status(500).json({ error: 'Payment verification failed', details: error.message });
  }
});

app.get('/api/orders/user/:email', checkDbConnection, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.email, status: 'completed' }).populate('productId');
    res.json(orders);
  } catch (error: any) {
    console.error('Fetch user orders error:', error);
    res.status(500).json({ error: 'Failed to fetch orders', details: error.message });
  }
});

app.get('/api/orders/creator/:email', checkDbConnection, async (req, res) => {
  try {
    // Find products by creator
    const products = await Product.find({ creatorEmail: req.params.email });
    const productIds = products.map(p => p._id);
    
    // Find completed orders for these products
    const orders = await Order.find({ 
      productId: { $in: productIds }, 
      status: 'completed' 
    }).populate('productId');
    
    res.json(orders);
  } catch (error: any) {
    console.error('Fetch creator orders error:', error);
    res.status(500).json({ error: 'Failed to fetch sales', details: error.message });
  }
});

// Admin Routes
app.get('/api/admin/users', [checkDbConnection, isAdmin], async (req: any, res: any) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/admin/orders', [checkDbConnection, isAdmin], async (req: any, res: any) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 }).populate('productId');
    res.json(orders);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/admin/products/:id', [checkDbConnection, isAdmin], async (req: any, res: any) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product deleted' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/admin/users/:id', [checkDbConnection, isAdmin], async (req: any, res: any) => {
  try {
    const userToDelete = await User.findById(req.params.id);
    if (userToDelete?.email === 'suvhobouri@gmail.com') {
      return res.status(403).json({ error: 'Cannot delete super admin' });
    }
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Vite middleware setup
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  startServer();
}

export default app;
