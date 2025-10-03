document.addEventListener('DOMContentLoaded', () => {
    console.log('Manager dashboard loaded');
    
    // التحقق من تسجيل الدخول والصلاحيات
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !localStorage.getItem('token')) {
        window.location.href = './login.html';
        return;
    }

    // التحقق من صلاحيات المدير
    if (user.role !== 'manager') {
        window.location.href = './profile.html';
        utils.showToast('عذراً، ليس لديك صلاحية الوصول للوحة التحكم', true);
        return;
    }

    // عرض اسم المستخدم
    document.getElementById('userName').textContent = user.name;

    // إخفاء شاشة التحميل
    document.getElementById('loading').style.display = 'none';
    
    // تحميل الكورسات
    loadCourses();

    // إضافة المستمعين للأحداث
    setupEventListeners();
});

async function loadCourses() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('../../api/courses', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'فشل في تحميل الكورسات');
        }

        const data = await response.json();
        displayCourses(data.data);
    } catch (error) {
        console.error('Error loading courses:', error);
        utils.showToast(error.message, true);
    }
}

function displayCourses(courses) {
    const coursesList = document.getElementById('coursesList');
    coursesList.innerHTML = '';

    if (courses.length === 0) {
        coursesList.innerHTML = '<p class="no-courses">لا توجد كورسات متاحة حالياً</p>';
        return;
    }

    courses.forEach(course => {
        const courseElement = document.createElement('div');
        courseElement.className = 'course-card';
        courseElement.innerHTML = `
            <img src="${course.image || './images/default-course.png'}" alt="${course.name}">
            <h3>${course.name}</h3>
            <p>${course.description}</p>
            <div class="price">${course.price} جنيه</div>
            <div class="actions">
                <button onclick="editCourse('${course._id}')" class="btn btn-secondary">تعديل</button>
                <button onclick="deleteCourse('${course._id}')" class="btn btn-danger">حذف</button>
            </div>
        `;
        coursesList.appendChild(courseElement);
    });
}

function setupEventListeners() {
    // أحداث القائمة الجانبية
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            const sectionId = e.currentTarget.dataset.section;
            switchSection(sectionId);
        });
    });

    // زر القائمة للموبايل
    document.getElementById('toggleSidebar')?.addEventListener('click', toggleSidebar);

    // زر تسجيل الخروج
    document.getElementById('logoutBtn').addEventListener('click', utils.logout);

    // زر إضافة كورس جديد
    document.getElementById('addCourseBtn').addEventListener('click', () => {
        document.getElementById('addCourseModal').style.display = 'block';
    });

    // نموذج إضافة كورس
    document.getElementById('addCourseForm').addEventListener('submit', handleAddCourse);

    // نموذج تعديل كورس
    document.getElementById('editCourseForm').addEventListener('submit', handleEditCourse);
}

function closeModal() {
    document.getElementById('addCourseModal').style.display = 'none';
    document.getElementById('addCourseForm').reset();
}

function closeEditModal() {
    document.getElementById('editCourseModal').style.display = 'none';
    document.getElementById('editCourseForm').reset();
}

function openAddModal() {
    document.getElementById('addCourseModal').style.display = 'block';
}

function openEditModal(courseId) {
    // تحميل بيانات الكورس قبل فتح النافذة
    loadCourseForEdit(courseId);
}

async function loadCourseForEdit(courseId) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`../../api/courses/${courseId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'فشل في تحميل بيانات الكورس');
        }

        // تعبئة النموذج ببيانات الكورس
        document.getElementById('editCourseId').value = data._id;
        document.getElementById('editCourseName').value = data.name;
        document.getElementById('editCourseDescription').value = data.description;
        document.getElementById('editCoursePrice').value = data.price;

        // عرض النافذة المنبثقة
        document.getElementById('editCourseModal').style.display = 'block';
    } catch (error) {
        console.error('Error loading course for edit:', error);
        utils.showToast(error.message || 'حدث خطأ في تحميل بيانات الكورس', true);
    }
}

async function editCourse(courseId) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`../../api/courses/${courseId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) throw new Error('فشل في تحميل بيانات الكورس');

        const course = await response.json();
        // هنا يمكن إضافة منطق فتح نموذج التعديل وملئه بالبيانات
        console.log('Edit course:', course);
    } catch (error) {
        console.error('Error loading course for edit:', error);
        utils.showToast(error.message, true);
    }
}

async function deleteCourse(courseId) {
    if (!confirm('هل أنت متأكد من حذف هذا الكورس؟')) return;
    
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`../../api/courses/${courseId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'فشل في حذف الكورس');
        }

        utils.showToast('تم حذف الكورس بنجاح');
        loadCourses();
    } catch (error) {
        console.error('Error deleting course:', error);
        utils.showToast(error.message || 'حدث خطأ في حذف الكورس', true);
    }
}

function switchSection(sectionId) {
    // إزالة الكلاس النشط من جميع الأقسام والروابط
    document.querySelectorAll('.dashboard-section').forEach(section => {
        section.classList.remove('active');
    });
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });

    // تفعيل القسم والرابط المحدد
    document.getElementById(`${sectionId}-section`).classList.add('active');
    document.querySelector(`[data-section="${sectionId}"]`).classList.add('active');

    // تحميل محتوى القسم
    loadSectionContent(sectionId);
}

function loadSectionContent(sectionId) {
    switch(sectionId) {
        case 'courses':
            loadCourses();
            break;
        case 'students':
            loadStudents();
            break;
        case 'instructors':
            loadInstructors();
            break;
        case 'statistics':
            loadStatistics();
            break;
    }
}

function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('active');
}

// تحميل محتوى الأقسام
async function loadStudents() {
    const studentsList = document.getElementById('studentsList');
    studentsList.innerHTML = '<p>قريباً - إدارة الطلاب</p>';
}

async function loadInstructors() {
    const instructorsList = document.getElementById('instructorsList');
    instructorsList.innerHTML = '<p>قريباً - إدارة المحاضرين</p>';
}

async function loadStatistics() {
    const statisticsContainer = document.querySelector('.statistics-container');
    statisticsContainer.innerHTML = '<p>قريباً - الإحصائيات</p>';
}

// معالجة نماذج الكورسات
async function handleAddCourse(e) {
    e.preventDefault();
    
    try {
        const formData = new FormData(e.target);
        const token = localStorage.getItem('token');
        
        // إضافة الهيدرز المطلوبة للتحقق من الصلاحيات
        const response = await fetch('../../api/courses', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                // لا نضيف Content-Type لأن FormData سيقوم بإضافته تلقائياً
            },
            body: formData // FormData يدعم الملفات والبيانات معاً
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'فشل في إضافة الكورس');
        }

        utils.showToast('تم إضافة الكورس بنجاح');
        closeModal(); // إغلاق النافذة المنبثقة
        loadCourses(); // إعادة تحميل قائمة الكورسات
    } catch (error) {
        console.error('Error adding course:', error);
        utils.showToast(error.message || 'حدث خطأ في إضافة الكورس', true);
    }
}

async function handleEditCourse(e) {
    e.preventDefault();
    
    try {
        const courseId = document.getElementById('editCourseId').value;
        const formData = new FormData(e.target);
        const token = localStorage.getItem('token');

        const response = await fetch(`../../api/courses/${courseId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            body: formData
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'فشل في تحديث الكورس');
        }

        utils.showToast('تم تحديث الكورس بنجاح');
        closeEditModal();
        loadCourses();
    } catch (error) {
        console.error('Error updating course:', error);
        utils.showToast(error.message || 'حدث خطأ في تحديث الكورس', true);
    }
} 