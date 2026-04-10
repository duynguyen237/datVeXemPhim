function checkLogin() {
    const userData = localStorage.getItem('user');
    const userInfoDiv = document.getElementById('user-info');
    if (!userInfoDiv) return;

    if (userData) {
        try {
            const user = JSON.parse(userData);
            const isAdmin = Number(user.MA_VAI_TRO) === 1; // Kiểm tra role

            // 1. Dùng toán tử 3 ngôi (? :) để rút gọn việc chọn nút
            const actionBtn = isAdmin
                ? `<a href="/admin" class="btn btn-danger btn-sm rounded-pill px-3 fw-bold"><i class="bi bi-shield-lock-fill"></i> Trang Quản Trị</a>`
                : `<a href="/lich-su?maND=${user.MA_NGUOI_DUNG}" class="btn btn-outline-danger btn-sm rounded-pill px-3 fw-medium">Vé của tôi</a>`;

            // 2. Render giao diện hiện đại (Bo tròn, có icon Avatar)
            userInfoDiv.innerHTML = `
            <div class="d-flex align-items-center gap-3">
                ${actionBtn}
                <div class="d-flex align-items-center gap-2 py-1 px-2 rounded-pill bg-light border" title="${user.HO_TEN}">
                    <i class="bi bi-person-circle text-secondary fs-5 ms-1"></i>
                    <span class="text-dark fw-bold text-truncate me-1" style="max-width: 150px; font-size: 14px;">${user.HO_TEN}</span>
                </div>
                <button onclick="logout()" class="btn btn-light btn-sm rounded-pill px-3 text-secondary border fw-medium">
                    Thoát
                </button>
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