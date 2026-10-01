const API_BASE = window.location.origin;

// State
let currentUser = localStorage.getItem('journal_user');
let currentPassword = localStorage.getItem('journal_password');
let isLoginMode = true;

// DOM Elements
const authView = document.getElementById('auth-view');
const dashboardView = document.getElementById('dashboard-view');

const tabLogin = document.getElementById('tab-login');
const tabRegister = document.getElementById('tab-register');
const authForm = document.getElementById('auth-form');
const authSubmitBtn = document.getElementById('auth-submit-btn');
const authError = document.getElementById('auth-error');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');

const welcomeMsg = document.getElementById('welcome-msg');
const logoutBtn = document.getElementById('logout-btn');
const journalList = document.getElementById('journal-list');
const newJournalBtn = document.getElementById('new-journal-btn');

const journalModal = document.getElementById('journal-modal');
const journalForm = document.getElementById('journal-form');
const modalTitle = document.getElementById('modal-title');
const journalIdInput = document.getElementById('journal-id');
const journalTitleInput = document.getElementById('journal-title-input');
const journalContentInput = document.getElementById('journal-content-input');
const cancelJournalBtn = document.getElementById('cancel-journal-btn');

// Initialization
function init() {
    if (currentUser && currentPassword) {
        showDashboard();
    } else {
        showAuth();
    }
}

// UI Switching
function showAuth() {
    authView.classList.add('active');
    dashboardView.classList.remove('active');
}

function showDashboard() {
    authView.classList.remove('active');
    dashboardView.classList.add('active');
    welcomeMsg.textContent = `Welcome, ${currentUser}!`;
    loadJournals();
}

// Auth Handlers
tabLogin.addEventListener('click', () => {
    isLoginMode = true;
    tabLogin.classList.add('active');
    tabRegister.classList.remove('active');
    authSubmitBtn.textContent = 'Login';
    authError.textContent = '';
});

tabRegister.addEventListener('click', () => {
    isLoginMode = false;
    tabRegister.classList.add('active');
    tabLogin.classList.remove('active');
    authSubmitBtn.textContent = 'Register';
    authError.textContent = '';
});

authForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = usernameInput.value.trim();
    const password = passwordInput.value;
    authError.textContent = '';
    authSubmitBtn.disabled = true;

    if (isLoginMode) {
        // Login by attempting to fetch journals
        try {
            const res = await fetch(`${API_BASE}/journal`, {
                headers: {
                    'Authorization': 'Basic ' + btoa(`${username}:${password}`)
                }
            });
            if (res.ok) {
                currentUser = username;
                currentPassword = password;
                localStorage.setItem('journal_user', username);
                localStorage.setItem('journal_password', password);
                showDashboard();
                usernameInput.value = '';
                passwordInput.value = '';
            } else {
                authError.textContent = 'Invalid credentials';
            }
        } catch (err) {
            authError.textContent = 'Error connecting to server';
        }
    } else {
        // Register
        try {
            const res = await fetch(`${API_BASE}/public/create-user`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userName: username, password })
            });
            if (res.ok) {
                // Auto login
                currentUser = username;
                currentPassword = password;
                localStorage.setItem('journal_user', username);
                localStorage.setItem('journal_password', password);
                showDashboard();
                usernameInput.value = '';
                passwordInput.value = '';
            } else {
                authError.textContent = 'Failed to register. Username might exist.';
            }
        } catch (err) {
            authError.textContent = 'Error connecting to server';
        }
    }
    authSubmitBtn.disabled = false;
});

logoutBtn.addEventListener('click', () => {
    currentUser = null;
    currentPassword = null;
    localStorage.removeItem('journal_user');
    localStorage.removeItem('journal_password');
    showAuth();
});

// API Helpers
function getAuthHeaders() {
    return {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + btoa(`${currentUser}:${currentPassword}`)
    };
}

// Journal Handlers
async function loadJournals() {
    journalList.innerHTML = '<p>Loading...</p>';
    try {
        const res = await fetch(`${API_BASE}/journal`, { headers: getAuthHeaders() });
        if (res.ok) {
            const journals = await res.json();
            renderJournals(journals);
        } else if (res.status === 401) {
            logoutBtn.click();
        } else {
            journalList.innerHTML = '<p class="error-msg">Failed to load journals.</p>';
        }
    } catch (err) {
        journalList.innerHTML = '<p class="error-msg">Error connecting to server.</p>';
    }
}

function renderJournals(journals) {
    if (!journals || journals.length === 0) {
        journalList.innerHTML = '<p>No journal entries yet. Create one!</p>';
        return;
    }

    journalList.innerHTML = journals.map(j => `
        <div class="journal-card">
            <h3>${escapeHtml(j.title)}</h3>
            <div class="date">${j.date ? new Date(j.date).toLocaleDateString() : new Date().toLocaleDateString()}</div>
            <div class="content-preview">${escapeHtml(j.content)}</div>
            <div class="card-actions">
                <button class="card-btn" onclick="editJournal('${j.id}', '${escapeHtml(j.title.replace(/'/g, "\\'"))}', '${escapeHtml(j.content.replace(/'/g, "\\'"))}')">Edit</button>
                <button class="card-btn delete-btn" onclick="deleteJournal('${j.id}')">Delete</button>
            </div>
        </div>
    `).join('');
}

// Modal Handlers
newJournalBtn.addEventListener('click', () => {
    modalTitle.textContent = 'New Journal Entry';
    journalIdInput.value = '';
    journalTitleInput.value = '';
    journalContentInput.value = '';
    journalModal.classList.add('active');
});

cancelJournalBtn.addEventListener('click', () => {
    journalModal.classList.remove('active');
});

journalForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = journalIdInput.value;
    const title = journalTitleInput.value.trim();
    const content = journalContentInput.value.trim();
    
    const method = id ? 'PUT' : 'POST';
    const url = id ? `${API_BASE}/journal/id/${id}` : `${API_BASE}/journal`;

    try {
        const res = await fetch(url, {
            method,
            headers: getAuthHeaders(),
            body: JSON.stringify({ title, content })
        });

        if (res.ok) {
            journalModal.classList.remove('active');
            loadJournals();
        } else {
            alert('Failed to save journal entry');
        }
    } catch (err) {
        alert('Error connecting to server');
    }
});

// Global functions for inline handlers
window.editJournal = (id, title, content) => {
    modalTitle.textContent = 'Edit Journal Entry';
    journalIdInput.value = id;
    journalTitleInput.value = title;
    journalContentInput.value = content;
    journalModal.classList.add('active');
};

window.deleteJournal = async (id) => {
    if (!confirm('Are you sure you want to delete this entry?')) return;
    
    try {
        const res = await fetch(`${API_BASE}/journal/id/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        if (res.ok) {
            loadJournals();
        } else {
            alert('Failed to delete entry');
        }
    } catch (err) {
        alert('Error connecting to server');
    }
};

// Utils
function escapeHtml(unsafe) {
    return (unsafe || '').toString()
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
}

init();
