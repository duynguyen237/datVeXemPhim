// public/js/app.js

// 1. Cấu hình các biến hằng số
const API_URL = '/api';

/**
 * --- PHẦN 2: LOAD DANH SÁCH PHIM (TRANG CHỦ) ---
 * Chức năng: Gọi API lấy toàn bộ phim và render ra giao diện theo phong cách MoMo Cinema
 */
async function loadMovies() {
    const movieGrid = document.getElementById('movie-grid');
    if (!movieGrid) return;

    // Hiển thị trạng thái đang tải (Loading)
    movieGrid.innerHTML = `
        <div class="col-12 text-center py-5">
            <div class="spinner-border text-danger" role="status"></div>
            <p class="mt-2 text-muted">Đang tải danh sách siêu phẩm...</p>
        </div>`;

    try {
        const response = await fetch(`${API_URL}/phim/all`);
        const result = await response.json();

        if (result.success && result.data.length > 0) {
            const movies = result.data;
            movieGrid.innerHTML = ''; // Xóa trạng thái loading

            movies.forEach(phim => {
                // Tạo cấu trúc thẻ phim hiện đại (Movie Card)
                movieGrid.innerHTML += `
                <div class="col">
                    <div class="movie-item-wrapper animate__animated animate__fadeIn" onclick="viewDetail(${phim.MA_PHIM})">
                        <div class="movie-poster-container">
                            <img src="${phim.HINH_ANH_POSTER}" 
                                 class="w-100" 
                                 style="height: 380px; object-fit: cover;" 
                                 alt="${phim.TEN_PHIM}"
                                 onerror="this.src='/images/default-poster.jpg'">
                            
                            <div class="rating-badge">
                                <i class="bi bi-star-fill me-1"></i>8.9
                            </div>
                            
                            <div class="age-label-wrapper">
                                <span class="badge bg-danger rounded-1">${phim.GIOI_HAN_TUOI || 'P'}</span>
                            </div>
                        </div>

                        <div class="mt-3">
                            <h6 class="fw-bold text-white text-truncate mb-1" title="${phim.TEN_PHIM}">
                                ${phim.TEN_PHIM}
                            </h6>
                            <p class="text-secondary small mb-2">
                                ${phim.TEN_THE_LOAI || 'Hành động, Phiêu lưu'}
                            </p>
                            
                            <div class="d-grid">
                                <button class="btn btn-outline-danger btn-sm rounded-pill fw-bold py-2">
                                    CHI TIẾT
                                </button>
                            </div>
                        </div>
                    </div>
                </div>`;
            });
        } else {
            movieGrid.innerHTML = `
                <div class="col-12 text-center py-5">
                    <p class="text-muted">Hiện tại chưa có phim nào đang chiếu.</p>
                </div>`;
        }
    } catch (error) {
        console.error("Lỗi khi tải danh sách phim:", error);
        movieGrid.innerHTML = `
            <div class="col-12 text-center py-5">
                <p class="text-danger">Không thể kết nối đến máy chủ. Vui lòng thử lại sau!</p>
            </div>`;
    }
}

/**
 * --- PHẦN 3: XỬ LÝ CHUYỂN TRANG ---
 */
window.viewDetail = function (maPhim) {
    window.location.href = `/chitietphim?id=${maPhim}`;
};

/**
 * --- PHẦN 4: TÌM KIẾM PHIM (Bổ sung tính năng MoMo) ---
 */
const searchInput = document.getElementById('movie-search');
if (searchInput) {
    searchInput.addEventListener('input', function (e) {
        const keyword = e.target.value.toLowerCase().trim();
        const movieCards = document.querySelectorAll('.movie-item-wrapper');

        movieCards.forEach(card => {
            const title = card.querySelector('h6').innerText.toLowerCase();
            if (title.includes(keyword)) {
                card.closest('.col').style.display = 'block';
            } else {
                card.closest('.col').style.display = 'none';
            }
        });
    });
}

/**
 * --- PHẦN 5: KHỞI TẠO ---
 */
document.addEventListener('DOMContentLoaded', () => {
    console.log("🎬 Duy Movie App - Hệ thống đặt vé đã sẵn sàng!");
    loadMovies();
});