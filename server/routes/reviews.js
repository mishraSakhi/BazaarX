const express = require('express');
const router = express.Router();
const { Review } = require('../models/CartAndReview');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { protect, authorize } = require('../middleware/auth');

// @GET /api/reviews/:productId
router.get('/:productId', async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 });
    res.json({ success: true, reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @POST /api/reviews/:productId
router.post('/:productId', protect, authorize('customer'), async (req, res) => {
  try {
    const { rating, title, comment } = req.body;

    // Check verified purchase
    const order = await Order.findOne({
      customer: req.user._id,
      'items.product': req.params.productId,
      orderStatus: 'delivered'
    });

    const existing = await Review.findOne({ product: req.params.productId, user: req.user._id });
    if (existing) return res.status(400).json({ success: false, message: 'You already reviewed this product.' });

    const review = await Review.create({
      product: req.params.productId,
      user: req.user._id,
      rating,
      title,
      comment,
      isVerifiedPurchase: !!order
    });

    // Update product rating
    const reviews = await Review.find({ product: req.params.productId });
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    await Product.findByIdAndUpdate(req.params.productId, {
      rating: Math.round(avgRating * 10) / 10,
      numReviews: reviews.length
    });

    const populated = await Review.findById(review._id).populate('user', 'name avatar');
    res.status(201).json({ success: true, message: 'Review submitted!', review: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @DELETE /api/reviews/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found.' });
    if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }
    await Review.findByIdAndDelete(req.params.id);

    const reviews = await Review.find({ product: review.product });
    const avgRating = reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;
    await Product.findByIdAndUpdate(review.product, { rating: Math.round(avgRating * 10) / 10, numReviews: reviews.length });

    res.json({ success: true, message: 'Review deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
