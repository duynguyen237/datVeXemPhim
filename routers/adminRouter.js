const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const statisticController = require('../controllers/statisticController');

// --- Quản lý Phim ---
router.get('/phim', adminController.listPhim);
router.post('/phim/add', adminController.addPhim);
router.delete('/phim/delete/:id', adminController.deletePhim);
router.get('/thong-ke', statisticController.getRevenueStatistics);
// --- Quản lý Suất chiếu ---
router.get('/suat-chieu', adminController.listSuatChieu);
router.post('/suat-chieu/add', adminController.addSuatChieu);

// --- Quản lý Phòng & Ghế ---
router.post('/phong/add', adminController.addPhongVaGhe); // Thêm dòng này
router.get('/doanh-thu', adminController.getDashboard);

router.get('/users', adminController.listUsers);

router.get('/hoa-don', adminController.listHoaDon);
// Bạn nhớ require adminController vào nhé
router.get('/tool-cao-phim', adminController.autoImportPhim);
// --- Quản lý Phòng & Ghế ---
router.get('/phong', adminController.listPhong);
router.post('/phong/add', adminController.addPhongVaGhe);

router.get('/phong/:id/ghe', adminController.getSoDoGhe);

module.exports = router;