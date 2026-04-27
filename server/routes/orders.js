const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const { Cart } = require('../models/CartAndReview');
const Vendor = require('../models/Vendor');
const { protect, authorize } = require('../middleware/auth');

// @POST /api/orders - Place order
router.post('/', protect, authorize('customer'), async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'No items in order.' });
    }

    // Validate products and calculate totals
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product).populate('vendor');
      if (!product || !product.isActive) {
        return res.status(400).json({ success: false, message: `Product ${item.product} not found.` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ success: false, message: `Insufficient stock for ${product.name}.` });
      }

      const price = product.discountPrice || product.price;
      subtotal += price * item.quantity;
      orderItems.push({
        product: product._id,
        vendor: product.vendor._id,
        name: product.name,
        image: product.images[0] || '',
        price,
        quantity: item.quantity
      });

      // Reduce stock
      await Product.findByIdAndUpdate(product._id, {
        $inc: { stock: -item.quantity, totalSold: item.quantity }
      });
    }

    const shippingCost = subtotal > 500 ? 0 : 50;
    const total = subtotal + shippingCost;

    const order = await Order.create({
      customer: req.user._id,
      items: orderItems,
      shippingAddress,
      paymentMethod,
      subtotal,
      shippingCost,
      total
    });

    // Clear cart
    await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });

    // Update vendor sales stats
    const vendorRevenues = {};
    for (const item of orderItems) {
      const vid = item.vendor.toString();
      vendorRevenues[vid] = (vendorRevenues[vid] || 0) + item.price * item.quantity;
    }
    for (const [vid, revenue] of Object.entries(vendorRevenues)) {
      await Vendor.findByIdAndUpdate(vid, {
        $inc: { totalSales: 1, totalRevenue: revenue }
      });
    }

    const populated = await Order.findById(order._id)
      .populate('customer', 'name email')
      .populate('items.product', 'name images');

    res.status(201).json({ success: true, message: 'Order placed successfully!', order: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @GET /api/orders/my - Customer's orders
router.get('/my', protect, authorize('customer'), async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.user._id })
      .populate('items.product', 'name images')
      .sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @GET /api/orders/vendor - Vendor's received orders
router.get('/vendor', protect, authorize('vendor'), async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ user: req.user._id });
    if (!vendor) return res.status(404).json({ success: false, message: 'Vendor profile not found.' });

    const orders = await Order.find({ 'items.vendor': vendor._id })
      .populate('customer', 'name email phone')
      .populate('items.product', 'name images')
      .sort({ createdAt: -1 });

    // Filter items per vendor
    const filteredOrders = orders.map(order => ({
      ...order.toObject(),
      items: order.items.filter(item => item.vendor.toString() === vendor._id.toString())
    }));

    res.json({ success: true, orders: filteredOrders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @GET /api/orders/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customer', 'name email phone')
      .populate('items.product', 'name images price')
      .populate('items.vendor', 'shopName');

    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

    // Allow only the customer, vendor, or admin
    if (req.user.role === 'customer' && order.customer._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @PUT /api/orders/:id/status - Update item status (vendor)
router.put('/:id/status', protect, authorize('vendor', 'admin'), async (req, res) => {
  try {
    const { status, itemId } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

    if (itemId) {
      const item = order.items.id(itemId);
      if (item) item.status = status;
    } else {
      order.orderStatus = status;
      if (status === 'delivered') order.deliveredAt = new Date();
      if (status === 'cancelled') {
        order.cancelledAt = new Date();
        order.cancellationReason = req.body.reason || '';
      }
    }

    await order.save();
    res.json({ success: true, message: 'Status updated', order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
