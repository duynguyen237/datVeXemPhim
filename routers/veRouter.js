const express = require('express');
const router = express.Router();
const veController = require('../controllers/veController');

// Xử lý đặt vé (Tạo link thanh toán)
router.post('/dat-ve', veController.datVe);

// SỬA TẠI ĐÂY: Đổi vnpay_return thành vnpay-return
router.get('/vnpay-return', veController.vnpayReturn); 

// Xem lịch sử đặt vé
router.get('/lich-su', veController.lichSuDatVe);

module.exports = router;