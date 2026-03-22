// --- 1. Database & Initialization ---
function initDB() {
    if (!localStorage.getItem('sysDB')) {
        const initialData = {
            users: [
                { username: 'admin', password: 'admin123', name: 'System Admin', role: 'admin' }
            ],
            studentData: {} // maps username -> { attendance, math, science, english }
        };
        localStorage.setItem('sysDB', JSON.stringify(initialData));
    }
}

function getDB() { return JSON.parse(localStorage.getItem('sysDB')); }
function saveDB(db) { localStorage.setItem('sysDB', JSON.stringify(db)); }

let currentUser = null;

// --- 2. UI Navigation ---
function showView(viewId) {
    document.getElementById('view-login').classList.add('hidden');
    document.getElementById('view-admin').classList.add('hidden');
    document.getElementById('view-faculty').classList.add('hidden');
    document.getElementById('view-student').classList.add('hidden');
    
    if(viewId !== 'view-login') {
        document.getElementById('app-header').classList.remove('hidden');
        document.getElementById('current-user-name').innerText = currentUser.name;
        document.getElementById('current-user-role').innerText = currentUser.role.toUpperCase();
    } else {
        document.getElementById('app-header').classList.add('hidden');
    }

    document.getElementById(viewId).classList.remove('hidden');
}

function toggleModal(show) {
    const modal = document.getElementById('evaluator-modal');
    if(show) modal.classList.remove('hidden');
    else modal.classList.add('hidden');
}

// --- 3. Authentication ---
function handleLogin(e) {
    e.preventDefault();
    const un = document.getElementById('login-username').value;
    const pw = document.getElementById('login-password').value;
    const db = getDB();

    const user = db.users.find(u => u.username === un && u.password === pw);
    if (user) {
        currentUser = user;
        document.getElementById('login-form').reset();
        routeUser();
    } else {
        alert('Invalid credentials!');
    }
}

function logout() {
    currentUser = null;
    showView('view-login');
}

function routeUser() {
    if (currentUser.role === 'admin') {
        renderAdminView();
        showView('view-admin');
    } else if (currentUser.role === 'faculty') {
        renderFacultyView();
        showView('view-faculty');
    } else if (currentUser.role === 'student') {
        renderStudentView();
        showView('view-student');
    }
}

// --- 4. Admin Logic ---
function handleAddUser(e) {
    e.preventDefault();
    const role = document.getElementById('new-role').value;
    const name = document.getElementById('new-name').value;
    const username = document.getElementById('new-username').value;
    const password = document.getElementById('new-password').value;

    const db = getDB();
    if(db.users.some(u => u.username === username)) {
        alert('Username already exists!');
        return;
    }

    db.users.push({ role, name, username, password });
    if(role === 'student') {
        db.studentData[username] = { attendance: '', math: '', science: '', english: '' };
    }
    
    saveDB(db);
    document.getElementById('add-user-form').reset();
    renderAdminView();
    alert(`${role} added successfully!`);
}

function renderAdminView() {
    const db = getDB();
    const tbody = document.getElementById('admin-users-table');
    tbody.innerHTML = '';
    db.users.forEach(u => {
        if(u.role !== 'admin') {
            tbody.innerHTML += `<tr>
                <td>${u.name}</td>
                <td>${u.username}</td>
                <td style="text-transform: capitalize;">${u.role}</td>
            </tr>`;
        }
    });
}

// --- 5. Faculty Logic ---
function renderFacultyView() {
    const db = getDB();
    const container = document.getElementById('faculty-students-list');
    container.innerHTML = '';

    const students = db.users.filter(u => u.role === 'student');
    
    if(students.length === 0) {
        container.innerHTML = '<p>No students found. Admin needs to add students first.</p>';
        return;
    }

    students.forEach(student => {
        const data = db.studentData[student.username] || { attendance: '', math: '', science: '', english: '' };
        
        const formHtml = `
            <div style="background: var(--bg); padding: 1rem; border-radius: 4px; margin-bottom: 1rem;">
                <h4 style="margin-top: 0;">${student.name} (@${student.username})</h4>
                <div style="display: flex; gap: 1rem; flex-wrap: wrap; margin-bottom: 1rem;">
                    <div class="form-group" style="margin-bottom: 0;">
                        <label>Attendance %</label>
                        <input type="number" id="att-${student.username}" value="${data.attendance}">
                    </div>
                    <div class="form-group" style="margin-bottom: 0;">
                        <label>Math</label>
                        <input type="number" id="math-${student.username}" value="${data.math}">
                    </div>
                    <div class="form-group" style="margin-bottom: 0;">
                        <label>Science</label>
                        <input type="number" id="sci-${student.username}" value="${data.science}">
                    </div>
                    <div class="form-group" style="margin-bottom: 0;">
                        <label>English</label>
                        <input type="number" id="eng-${student.username}" value="${data.english}">
                    </div>
                </div>
                <button onclick="updateStudent('${student.username}')">Update Profile</button>
            </div>
        `;
        container.innerHTML += formHtml;
    });
}

function updateStudent(username) {
    const db = getDB();
    db.studentData[username] = {
        attendance: document.getElementById(`att-${username}`).value,
        math: document.getElementById(`math-${username}`).value,
        science: document.getElementById(`sci-${username}`).value,
        english: document.getElementById(`eng-${username}`).value
    };
    saveDB(db);
    alert(`Profile for ${username} updated!`);
}

// --- 6. Student Logic ---
function renderStudentView() {
    const db = getDB();
    const data = db.studentData[currentUser.username] || { attendance: 'N/A', math: 'N/A', science: 'N/A', english: 'N/A' };
    
    document.getElementById('student-attendance').innerText = data.attendance ? data.attendance + '%' : 'Not updated yet';
    document.getElementById('student-math').innerText = data.math || 'Not updated yet';
    document.getElementById('student-science').innerText = data.science || 'Not updated yet';
    document.getElementById('student-english').innerText = data.english || 'Not updated yet';
}

// Initialize App
initDB();