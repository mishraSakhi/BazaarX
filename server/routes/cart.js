// cart.js
const express = require('express');
const router = express.Router();
const { Cart } = require('../models/CartAndReview');
const Product = require('../models/Product');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, authorize('customer'), async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate('items.product', 'name price discountPrice images stock vendor isActive');
    if (!cart) cart = await Cart.create({ user: req.user._id, items: [] });
    const total = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    res.json({ success: true, cart, total });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/add', protect, authorize('customer'), async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const product = await Product.findById(productId);
    if (!product || !product.isActive) return res.status(404).json({ success: false, message: 'Product not found.' });
    if (product.stock < quantity) return res.status(400).json({ success: false, message: 'Insufficient stock.' });

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) cart = new Cart({ user: req.user._id, items: [] });

    const price = product.discountPrice || product.price;
    const existingItem = cart.items.find(i => i.product.toString() === productId);
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({ product: productId, quantity, price });
    }
    await cart.save();
    res.json({ success: true, message: 'Added to cart', cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/update/:productId', protect, authorize('customer'), async (req, res) => {
  try {
    const { quantity } = req.body;
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ success: false, message: 'Cart not found.' });

    const item = cart.items.find(i => i.product.toString() === req.params.productId);
    if (!item) return res.status(404).json({ success: false, message: 'Item not in cart.' });

    if (quantity <= 0) {
      cart.items = cart.items.filter(i => i.product.toString() !== req.params.productId);
    } else {
      item.quantity = quantity;
    }
    await cart.save();
    res.json({ success: true, cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/remove/:productId', protect, authorize('customer'), async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (cart) {
      cart.items = cart.items.filter(i => i.product.toString() !== req.params.productId);
      await cart.save();
    }
    res.json({ success: true, message: 'Item removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/clear', protect, async (req, res) => {
  try {
    await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });
    res.json({ success: true, message: 'Cart cleared' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
