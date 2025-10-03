let currentUser = null;

document.addEventListener('DOMContentLoaded', () => {
    initializeProfile();
    setupEventListeners();
});

async function initializeProfile() {
    const token = localStorage.getItem('token');
    if (!token) {
        console.warn('No token found, redirecting to login');
        window.location.href = './login.html';
        return;
    }

    try {
        // جلب بيانات المستخدم من السيرفر
        const response = await fetch('/api/user/profile', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        currentUser = await response.json();
        displayUserData(currentUser);
    } catch (error) {
        console.error('Error fetching user data:', error);
        utils.showError('حدث خطأ في تحميل البيانات');
    }
}

function setupEventListeners() {
    // مستمعات التبويبات
    document.querySelectorAll('.tab-btn').forEach(button => {
        button.addEventListener('click', (e) => switchTab(e.target.dataset.tab));
    });

    // مستمعات أزرار التعديل
    document.querySelectorAll('.edit-btn').forEach(button => {
        button.addEventListener('click', handleEdit);
    });

    // مستمع التحقق بخطوتين
    // document.getElementById('twoFactorAuth').addEventListener('change', toggleTwoFactor);

    // مستمع تغيير اللغة
    document.getElementById('preferredLanguage').addEventListener('change', updateLanguagePreference);
}

function displayUserData(user) {
    document.getElementById('loading').style.display = 'none';
    document.getElementById('profileContent').style.display = 'block';

    // تحديث البيانات الشخصية
    document.getElementById('userNameHeader').textContent = user.name;
    document.getElementById('userName').textContent = user.name;
    document.getElementById('userEmail').textContent = user.email;
    document.getElementById('userPhone').textContent = user.phone || 'لم يتم الإضافة';
    document.getElementById('userAddress').textContent = user.address || 'لم يتم الإضافة';
    
    // تحديث الصورة الشخصية
    if (user.avatar) {
        document.getElementById('userAvatar').src = user.avatar;
    }

    // تحديث حالة التحقق من البريد
    updateEmailVerificationStatus(user.isEmailVerified);

    // تحديث إعدادات الأمان
    document.getElementById('twoFactorAuth').checked = user.twoFactorEnabled;

    // تحديث التفضيلات
    document.getElementById('preferredLanguage').value = user.preferredLanguage || 'ar';
    document.getElementById('emailNotifications').checked = user.emailNotificationsEnabled;
    document.getElementById('pushNotifications').checked = user.pushNotificationsEnabled;
}

async function handleEdit(e) {
    const field = e.target.previousElementSibling;
    const currentValue = field.textContent;
    const newValue = prompt('أدخل القيمة الجديدة:', currentValue);
    
    if (newValue && newValue !== currentValue) {
        try {
            // تحديث البيانات على السيرفر
            await updateUserField(field.id, newValue);
            field.textContent = newValue;
            utils.showSuccess('تم التحديث بنجاح');
        } catch (error) {
            utils.showError('فشل التحديث');
        }
    }
}

function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.style.display = 'none';
    });
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    document.getElementById(tabId).style.display = 'block';
    document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');
}

async function changePassword() {
    const currentPassword = prompt('أدخل كلمة المرور الحالية:');
    const newPassword = prompt('أدخل كلمة المرور الجديدة:');
    const confirmPassword = prompt('أكد كلمة المرور الجديدة:');

    if (newPassword !== confirmPassword) {
        utils.showError('كلمات المرور غير متطابقة');
        return;
    }

    try {
        await updatePassword(currentPassword, newPassword);
        utils.showSuccess('تم تغيير كلمة المرور بنجاح');
    } catch (error) {
        utils.showError('فشل تغيير كلمة المرور');
    }
}

async function changeAvatar() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
        const file = e.target.files[0];
        try {
            const formData = new FormData();
            formData.append('avatar', file);
            await uploadAvatar(formData);
            utils.showSuccess('تم تحديث الصورة الشخصية بنجاح');
        } catch (error) {
            utils.showError('فشل تحديث الصورة الشخصية');
        }
    };
    input.click();
}

// ... باقي الدوال المساعدة للتعامل مع API