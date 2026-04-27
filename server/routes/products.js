const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Vendor = require('../models/Vendor');
const { protect, authorize } = require('../middleware/auth');

// @GET /api/products - Get all products with filters
router.get('/', async (req, res) => {
  try {
    const { category, minPrice, maxPrice, search, sort, vendor, featured, page = 1, limit = 12 } = req.query;
    const query = { isActive: true };

    if (category) query.category = category;
    if (vendor) query.vendor = vendor;
    if (featured === 'true') query.isFeatured = true;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    if (search) {
      query.$text = { $search: search };
    }

    const sortOptions = {
      'price-asc': { price: 1 },
      'price-desc': { price: -1 },
      'rating': { rating: -1 },
      'newest': { createdAt: -1 },
      'popular': { totalSold: -1 }
    };
    const sortBy = sortOptions[sort] || { createdAt: -1 };

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate('vendor', 'shopName shopLogo rating')
      .sort(sortBy)
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      products,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
        limit: Number(limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @GET /api/products/:id
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('vendor', 'shopName shopLogo rating shopDescription user');
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });
    res.json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @POST /api/products - Vendor creates product
router.post('/', protect, authorize('vendor', 'admin'), async (req, res) => {
  try {
    let vendorId;
    if (req.user.role === 'vendor') {
      const vendor = await Vendor.findOne({ user: req.user._id, isApproved: true });
      if (!vendor) return res.status(403).json({ success: false, message: 'Vendor account not approved yet.' });
      vendorId = vendor._id;
    } else {
      vendorId = req.body.vendor;
    }

    const product = await Product.create({ ...req.body, vendor: vendorId });
    res.status(201).json({ success: true, message: 'Product created', product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @PUT /api/products/:id
router.put('/:id', protect, authorize('vendor', 'admin'), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('vendor');
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });

    if (req.user.role === 'vendor') {
      const vendor = await Vendor.findOne({ user: req.user._id });
      if (!vendor || product.vendor._id.toString() !== vendor._id.toString()) {
        return res.status(403).json({ success: false, message: 'Not authorized to edit this product.' });
      }
    }

    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json({ success: true, message: 'Product updated', product: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @DELETE /api/products/:id
router.delete('/:id', protect, authorize('vendor', 'admin'), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('vendor');
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });

    if (req.user.role === 'vendor') {
      const vendor = await Vendor.findOne({ user: req.user._id });
      if (!vendor || product.vendor._id.toString() !== vendor._id.toString()) {
        return res.status(403).json({ success: false, message: 'Not authorized.' });
      }
    }

    await Product.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: 'Product removed.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
