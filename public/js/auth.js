async function handleAuth() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Hiện loading xịn sò
    Swal.fire({
        title: 'Đang xử lý...',
        text: 'Vui lòng chờ trong giây lát',
        allowOutsideClick: false,
        didOpen: () => { Swal.showLoading(); }
    });

    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const result = await response.json();

        if (result.success) {
            localStorage.setItem('user', JSON.stringify(result.user));
            
            // Thông báo thành công và chuyển trang
            Swal.fire({
                icon: 'success',
                title: 'Đăng nhập thành công!',
                text: `Chào mừng ${result.user.HO_TEN} trở lại`,
                timer: 1500,
                showConfirmButton: false
            }).then(() => {
                window.location.href = '/'; 
            });
        } else {
            Swal.fire({ icon: 'error', title: 'Lỗi!', text: result.message || 'Đăng nhập thất bại!' });
        }
    } catch (error) {
        Swal.fire({ icon: 'error', title: 'Oops...', text: 'Lỗi kết nối server!' });
    }
}

document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            await handleAuth();
        });
    }
});
window.handleAuth = handleAuth;
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