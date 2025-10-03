document.addEventListener('DOMContentLoaded', () => {
    Logger.info('Redirect page loaded');

    if (!utils.isAuthenticated()) {
        Logger.warn('User not authenticated, redirecting to login');
        window.location.href = './login.html';
        return;
    }

    try {
        const user = JSON.parse(localStorage.getItem('user'));
        const welcomeMessage = document.getElementById('welcomeMessage');
        if (welcomeMessage) {
            welcomeMessage.textContent = `مرحباً بك، ${user.name || 'مستخدم'}!`;
        }

        const progressBar = document.querySelector('.progress-bar');
        if (!progressBar) {
            Logger.error('Progress bar not found');
            return;
        }

        let width = 0;
        const interval = setInterval(() => {
            if (width >= 100) {
                clearInterval(interval);
                Logger.info('Redirect animation completed');
                window.location.href = './dashboard.html';
            } else {
                width += 2;
                progressBar.style.width = width + '%';
                progressBar.setAttribute('aria-valuenow', width);
            }
        }, 20);
    } catch (error) {
        Logger.error('Error in redirect page', error);
        utils.showToast('حدث خطأ أثناء التوجيه', true);
        setTimeout(() => {
            window.location.href = './login.html';
        }, 2000);
    }
}); 