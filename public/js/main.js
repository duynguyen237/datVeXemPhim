function checkLogin() {
    const userData = localStorage.getItem('user');
    const userInfoDiv = document.getElementById('user-info');
    if (!userInfoDiv) return;

    if (userData) {
        try {
            const user = JSON.parse(userData);

            // DÒNG NÀY ĐỂ DEBUG: Bấm F12 mở tab Console lên sẽ thấy thông tin user
            console.log("Thông tin user đang đăng nhập:", user);

            let actionButton = '';

            // ĐÃ THÊM Number() ĐỂ ÉP KIỂU CHUẨN XÁC
            if (Number(user.MA_VAI_TRO) === 1) {
                // Nếu là ADMIN -> Hiện nút vào Trang Quản Trị (Màu đỏ nổi bật)
                actionButton = `<a href="/admin" class="btn btn-sm btn-danger ms-2 fw-bold"><i class="bi bi-shield-lock-fill"></i> Trang Quản Trị</a>`;
            } else {
                // Nếu là KHÁCH HÀNG -> Hiện nút Vé của tôi
                actionButton = `<a href="/lich-su?maND=${user.MA_NGUOI_DUNG}" class="btn btn-sm btn-outline-info ms-2">Vé của tôi</a>`;
            }

            userInfoDiv.innerHTML = `
                <div class="d-flex align-items-center">
                    <span class="text-white me-3">Chào, <strong class="text-warning">${user.HO_TEN}</strong></span>
                    <button onclick="logout()" class="btn btn-sm btn-outline-light">Thoát</button>
                    ${actionButton}
                </div>
            `;
        } catch (e) {
            localStorage.removeItem('user');
        }
    }
}

// Xử lý Đăng xuất dùng SweetAlert2
window.logout = function () {
    Swal.fire({
        title: 'Bạn muốn đăng xuất?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Đăng xuất',
        cancelButtonText: 'Hủy'
    }).then((result) => {
        if (result.isConfirmed) {
            localStorage.removeItem('user');
            window.location.href = '/';
        }
    });
};

// Chạy tự động khi load trang
// Thay thế đoạn cuối cùng trong file main.js bằng đoạn này:
if (document.readyState === 'loading') {  // Loading hasn't finished yet
    document.addEventListener('DOMContentLoaded', checkLogin);
} else {  // `DOMContentLoaded` has already fired
    checkLogin();
}