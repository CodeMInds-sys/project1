document.addEventListener('DOMContentLoaded', () => {
    console.log('Login page loaded');

    // التحقق من حالة تسجيل الدخول
    if (utils.isAuthenticated()) {
        const user = JSON.parse(localStorage.getItem('user'));
        redirectBasedOnRole(user);
        return;
    }
    
    const form = document.getElementById('loginForm');
    if (!form) {
        console.error('Login form not found');
        return;
    }

    // منع السلوك الافتراضي للنموذج
    form.onsubmit = async (e) => {
        e.preventDefault(); // منع إعادة تحميل الصفحة
        console.log('Form submitted');
        
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;

        if (!email || !password) {
            utils.showToast("جميع الحقول مطلوبة", true);
            return false; // منع إرسال النموذج
        }

        utils.toggleLoading(true);

        try {
            const response = await fetch('../../api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));

                utils.showToast("تم تسجيل الدخول بنجاح");
                redirectBasedOnRole(data.user);
            } else {
                throw new Error(data.message || "فشل تسجيل الدخول");
            }
        } catch (error) {
            console.error('Login error:', error);
            utils.showToast(error.message || "حدث خطأ في الاتصال بالخادم", true);
        } finally {
            utils.toggleLoading(false);
        }

        return false; // منع إرسال النموذج
    };
});

// دالة مساعدة للتوجيه حسب دور المستخدم
function redirectBasedOnRole(user) {
    switch(user.role) {
        case 'manager':
            window.location.href = './manager-dashboard.html';
            break;
        case 'instructor':
            window.location.href = './instructor-dashboard.html';
            break;
        case 'admin':
            window.location.href = './admin-dashboard.html';
            break;
        default:
            window.location.href = './profile.html';
    }
} 