// // التحقق من وجود Logger
// if (typeof Logger === 'undefined') {
//     console.error('Logger is not defined. Make sure logger.js is loaded first');
//     window.Logger = {
//         info: console.log,
//         error: console.error,
//         warn: console.warn,
//         debug: console.debug
//     };
// }

const utils = {
    toggleLoading: function(show, buttonSelector = 'button[type="submit"]') {
        const submitButton = document.querySelector(buttonSelector);
        if (!submitButton) {
            console.error('Submit button not found');
            return;
        }

        if (show) {
            submitButton.disabled = true;
            const originalText = submitButton.innerHTML;
            if (!submitButton.getAttribute('data-original-text')) {
                submitButton.setAttribute('data-original-text', originalText);
            }
            submitButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> جاري التحميل...';
        } else {
            submitButton.disabled = false;
            submitButton.innerHTML = submitButton.getAttribute('data-original-text') || 'تأكيد';
        }
    },

    showToast: function(message, isError = false) {
        Toastify({
            text: message,
            duration: 3000,
            gravity: "top",
            position: 'left',
            style: {
                background: isError ? "#ff0000" : "#4CAF50"
            },
            stopOnFocus: true
        }).showToast();
    },

    validateInput: function(input, type) {
        const validations = {
            email: {
                pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: "بريد إلكتروني غير صالح"
            },
            password: {
                pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                message: "كلمة المرور يجب أن تحتوي على 8 أحرف على الأقل، حرف كبير، حرف صغير، رقم وعلامة خاصة"
            },
            name: {
                pattern: /^[\u0600-\u06FFa-zA-Z\s]{3,}$/,
                message: "الاسم يجب أن يكون 3 أحرف على الأقل"
            }
        };

        if (!validations[type]) {
            return { isValid: false, message: "نوع تحقق غير معروف" };
        }

        const isValid = validations[type].pattern.test(input);
        return {
            isValid,
            message: isValid ? "" : validations[type].message
        };
    },

    handleApiError: function(error) {
        console.error('API Error:', error);
        
        if (error.response) {
            return error.response.data.message || "حدث خطأ في الخادم";
        }
        if (error.request) {
            return "لا يمكن الاتصال بالخادم";
        }
        return "حدث خطأ غير متوقع";
    },

    isAuthenticated: function() {
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');
        return !!(token && user);
    },

    handleApiResponse: async function(response) {
        console.log('Handling API response:', {
            status: response.status,
            statusText: response.statusText,
            headers: Object.fromEntries(response.headers.entries())
        });

        let data;
        try {
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
                console.log('Response data:', data);
            } else {
                const text = await response.text();
                console.warn('Non-JSON response:', { text });
                data = { message: text };
            }
        } catch (error) {
            console.error('Error parsing response:', error);
            throw new Error('Failed to parse server response');
        }

        if (!response.ok) {
            console.warn('API error response:', {
                status: response.status,
                data
            });
            throw new Error(data.message || 'Server error');
        }

        return data;
    },

    logout: function() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = './index.html';
    }
};

// تصدير الدوال للاستخدام في الملفات الأخرى
window.utils = utils; 