// file: routes/homeRouter.js
const express = require('express');
const router = express.Router();
const homeController = require('../controllers/homeController');

// Trang chủ
router.get('/', homeController.getHomePage);

// Trang Rạp chiếu
router.get('/rap-chieu', homeController.getRapChieuPage);

// Trang Review phim
router.get('/review-phim', homeController.getReviewPage);

router.post('/review-phim/submit', homeController.submitReview);

module.exports = router;