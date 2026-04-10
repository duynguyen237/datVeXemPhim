// public/js/app.js

// 1. Cấu hình các biến hằng số
const API_URL = '/api';

/**
 * --- PHẦN 2: LOAD DANH SÁCH PHIM TỪ API ---
 */
async function loadMovies() {
    const movieGrid = document.getElementById('movie-grid');
    if (!movieGrid) return;

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
            movieGrid.innerHTML = '';

            movies.forEach(phim => {
                movieGrid.innerHTML += `
    <div class="col">
        <div class="movie-item-wrapper animate__animated animate__fadeIn" 
             style="cursor: pointer;"
             data-id="${phim.MA_PHIM}"
             data-title="${phim.TEN_PHIM}"
             data-poster="${phim.HINH_ANH_POSTER}"
             data-desc="${phim.NOI_DUNG_PHIM}"
             data-trailer="${phim.DUONG_DAN_TRAILER}" 
             onclick="openTrailerModal(this)">
             
            <div class="movie-poster-container position-relative">
                <img src="${phim.HINH_ANH_POSTER}" 
                     class="w-100 rounded-3 shadow-sm" 
                     style="height: 380px; object-fit: cover;" 
                     alt="${phim.TEN_PHIM}"
                     onerror="this.src='/images/default-poster.jpg'">
                
                <div class="movie-overlay position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style="background: rgba(0,0,0,0.3); opacity: 0; transition: 0.3s;">
                    <i class="bi bi-play-circle text-white shadow-sm" style="font-size: 3.5rem;"></i>
                </div>

                <div class="rating-badge position-absolute bottom-0 end-0 m-2 bg-dark text-warning px-2 py-1 rounded">
                    <i class="bi bi-star-fill me-1"></i>8.9
                </div>
                
                <div class="age-label-wrapper position-absolute top-0 start-0 m-2">
                    <span class="badge bg-danger rounded-1">${phim.GIOI_HAN_TUOI || 'P'}+</span>
                </div>
            </div>

            <div class="mt-3 text-start">
                <h6 class="fw-bold text-dark text-truncate mb-1" title="${phim.TEN_PHIM}">
                    ${phim.TEN_PHIM}
                </h6>
                <p class="text-secondary small mb-2 text-truncate">
                    ${phim.TEN_THE_LOAI || 'Đang cập nhật'}
                </p>
                
                <div class="d-grid">
                    <button onclick="event.stopPropagation(); window.location.href='/chitietphim?id=${phim.MA_PHIM}'" class="btn btn-outline-danger btn-sm rounded-pill fw-bold py-2">
                        ĐẶT VÉ
                    </button>
                </div>
            </div>
        </div>
    </div>`;
            });
        } else {
            movieGrid.innerHTML = `<div class="col-12 text-center py-5"><p class="text-muted">Hiện tại chưa có phim nào.</p></div>`;
        }
    } catch (error) {
        console.error("Lỗi khi tải danh sách phim:", error);
        movieGrid.innerHTML = `<div class="col-12 text-center py-5"><p class="text-danger">Lỗi kết nối máy chủ!</p></div>`;
    }
}

/**
 * --- PHẦN 3: XỬ LÝ CHUYỂN TRANG ---
 */
window.viewDetail = function (maPhim) {
    window.location.href = `/chitietphim?id=${maPhim}`;
};

/**
 * --- PHẦN 4: TÌM KIẾM PHIM ---
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
 * --- PHẦN 5: XỬ LÝ MODAL TRAILER CHUẨN XÁC ---
 */
function openTrailerModal(element) {
    const id = element.getAttribute('data-id');
    const title = element.getAttribute('data-title');
    const poster = element.getAttribute('data-poster');
    const desc = element.getAttribute('data-desc');
    let rawUrl = element.getAttribute('data-trailer');

    console.log("Link lấy từ HTML là:", rawUrl);

    let embedUrl = "";

    // 1. KIỂM TRA VÀ ÉP KIỂU LINK YOUTUBE
    if (rawUrl && rawUrl !== "null" && rawUrl !== "") {
        let videoId = "";

        // Bắt mọi trường hợp link watch?v=
        if (rawUrl.indexOf("v=") !== -1) {
            videoId = rawUrl.split("v=")[1].split("&")[0];
        }
        // Bắt link dạng youtu.be/
        else if (rawUrl.indexOf("youtu.be/") !== -1) {
            videoId = rawUrl.split("youtu.be/")[1].split("?")[0];
        }
        // Bắt link dạng embed sẵn
        else if (rawUrl.indexOf("embed/") !== -1) {
            videoId = rawUrl.split("embed/")[1].split("?")[0];
        }

        // Tạo link nhúng cuối cùng
        if (videoId) {
            embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
        }
    }

    // 2. GẮN DỮ LIỆU VÀO MODAL
    document.getElementById('trailer-title').innerText = title || 'Phim rạp';
    document.getElementById('trailer-desc').innerText = (desc && desc !== 'null') ? desc : 'Đang cập nhật nội dung...';

    if (poster && poster !== 'null') {
        document.getElementById('trailer-poster').src = poster;
    }

    if (id && id !== 'null') {
        document.getElementById('trailer-book-btn').href = `/chitietphim?id=${id}`;
    }

    // 3. NHÉT LINK VÀO IFRAME (BƯỚC QUAN TRỌNG NHẤT)
    if (embedUrl !== "") {
        document.getElementById('trailer-iframe').src = embedUrl;
    } else {
        // Nếu không có link, dùng tạm trailer phim Inception để xem có chạy không
        console.warn("Phim này không có link trailer, dùng link dự phòng!");
        document.getElementById('trailer-iframe').src = "https://www.youtube.com/embed/YoHD9XEInc0?autoplay=1";
    }

    // 4. HIỂN THỊ MODAL
    const myModal = new bootstrap.Modal(document.getElementById('trailerModal'));
    myModal.show();
}
/**
 * --- PHẦN 6: KHỞI TẠO VÀ DỌN DẸP ---
 */
document.addEventListener('DOMContentLoaded', () => {
    console.log("🎬 Duy Movie App - Sẵn sàng!");
    loadMovies();

    // Lắng nghe sự kiện ĐÓNG Modal để tắt âm thanh Video
    const trailerModalEl = document.getElementById('trailerModal');
    if (trailerModalEl) {
        trailerModalEl.addEventListener('hidden.bs.modal', function () {
            document.getElementById('trailer-iframe').src = '';
        });
    }
});