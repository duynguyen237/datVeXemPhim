const express = require('express');
const router = express.Router();
const SanPhamModel = require('../models/sanpham'); 

// SỬA TẠI ĐÂY: Bỏ /api, chỉ để /san-pham
router.get('/san-pham', async (req, res) => {
    try {
        const products = await SanPhamModel.getAll();
        res.json({
            success: true,
            data: products
        });
    } catch (error) {
        console.error("Lỗi API sản phẩm:", error);
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;