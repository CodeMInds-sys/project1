// التحقق من حالة تسجيل الدخول


console.log('Home page loaded');

document.addEventListener('DOMContentLoaded', () => {
    console.log('Home page loaded');
    
    const authButtons = document.getElementById('authButtons');
    const userMenu = document.getElementById('userMenu');
    const userName = document.getElementById('userName');
    renderCourses();
    console.log('Rendered courses call');
    
    // التحقق من حالة تسجيل الدخول
    if (utils.isAuthenticated()) {
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            console.log('User is authenticated:', user);
            
            if (authButtons) authButtons.style.display = 'none';
            if (userMenu) {
                userMenu.style.display = 'flex';
                if (userName) {
                    userName.textContent = user.name || user.email;
                }
            }
        } catch (error) {
            console.error('Error parsing user data:', error);
            handleLogout();
        }
    } else {
        console.log('No authenticated user');
        if (authButtons) authButtons.style.display = 'flex';
        if (userMenu) userMenu.style.display = 'none';
    }
});

// إضافة التحقق من وجود Toastify
if (typeof Toastify === 'undefined') {
    console.error('Toastify library is not loaded');
}

// تحسين دالة logout
async function handleLogout() {
    console.log('Logout initiated');
    
    utils.toggleLoading(true, '#logoutButton');

    try {
        const token = localStorage.getItem('token');
        console.log('Sending logout request:', token ? 'exists' : 'missing');

        const response = await fetch('/api/auth/logout', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();
        console.log('Logout response:', {
            status: response.status,
            ok: response.ok,
            data
        });

        if (response.ok) {
            utils.showToast("تم تسجيل الخروج بنجاح");
        } else {
            throw new Error(data.message || 'Logout failed');
        }
    } catch (error) {
        console.error('Logout error:', {
            message: error.message,
            stack: error.stack,
            response: error.response
        });
        utils.showToast("حدث خطأ أثناء تسجيل الخروج", true);
    } finally {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        utils.toggleLoading(false, '#logoutButton');
        window.location.href = './index.html';
    }
}

// انيميشن سلس للتنقل
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
}); 










// render courses

async function renderCourses() {
    try {
        const response = await fetch('../../api/courses');
        if (!response.ok) {
            throw new Error('Failed to fetch courses');
        }
        utils.showToast('render courses');
        console.log("render courses");
        
        const data = await response.json();
        const courses = data.data;
        const coursesGrid = document.querySelector('.courses-grid');
        coursesGrid.innerHTML = '';
        courses.forEach(course => {
            const courseElement = document.createElement('div');
            courseElement.className = 'course-card';
            courseElement.innerHTML = `
                <img src="${course.image || './images/default-course.png'}" alt="${course.name}">
                <h3>${course.name}</h3>
                <p>${course.description}</p>
                <div class="price">${course.price} جنيه</div>
                <div class="actions">
                    <button onclick="enrollCourse('${course._id}')" class="btn btn-primary">اشترك</button>
                </div>
            `;
            coursesGrid.appendChild(courseElement);
        });
    } catch (error) {
        console.error('Error rendering courses:', error);
        utils.showToast(error.message || 'Failed to render courses', true);
    }
}
renderCourses();