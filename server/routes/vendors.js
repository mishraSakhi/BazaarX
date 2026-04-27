const express = require('express');
const router = express.Router();
const Vendor = require('../models/Vendor');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { protect, authorize } = require('../middleware/auth');

// @GET /api/vendors - Public: list all approved vendors
router.get('/', async (req, res) => {
  try {
    const vendors = await Vendor.find({ isApproved: true, isActive: true })
      .populate('user', 'name email avatar')
      .sort({ rating: -1 });
    res.json({ success: true, vendors });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @GET /api/vendors/:id - Public vendor profile
router.get('/:id', async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id).populate('user', 'name email avatar');
    if (!vendor) return res.status(404).json({ success: false, message: 'Vendor not found.' });
    const products = await Product.find({ vendor: vendor._id, isActive: true }).limit(20);
    res.json({ success: true, vendor, products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @GET /api/vendors/dashboard/stats - Vendor stats
router.get('/dashboard/stats', protect, authorize('vendor'), async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ user: req.user._id });
    if (!vendor) return res.status(404).json({ success: false, message: 'Vendor profile not found.' });

    const totalProducts = await Product.countDocuments({ vendor: vendor._id, isActive: true });
    const orders = await Order.find({ 'items.vendor': vendor._id });
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(o => o.orderStatus === 'pending').length;
    const revenue = vendor.totalRevenue;

    // Recent orders
    const recentOrders = await Order.find({ 'items.vendor': vendor._id })
      .populate('customer', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);

    // Top products
    const topProducts = await Product.find({ vendor: vendor._id, isActive: true })
      .sort({ totalSold: -1 })
      .limit(5);

    res.json({
      success: true,
      stats: { totalProducts, totalOrders, pendingOrders, revenue, rating: vendor.rating },
      recentOrders,
      topProducts,
      vendor
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @PUT /api/vendors/profile - Update vendor profile
router.put('/profile/update', protect, authorize('vendor'), async (req, res) => {
  try {
    const { shopName, shopDescription, category, address } = req.body;
    const vendor = await Vendor.findOneAndUpdate(
      { user: req.user._id },
      { shopName, shopDescription, category, address },
      { new: true, runValidators: true }
    );
    if (!vendor) return res.status(404).json({ success: false, message: 'Vendor profile not found.' });
    res.json({ success: true, message: 'Profile updated', vendor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
