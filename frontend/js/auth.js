import { API_URL, getFetchOptions } from './api.js';

export const auth = {
    dom: {},
    state: {
        isLoggedIn: false,
        user: null,
        tempUsername: null
    },

    init(domElements, callbacks) {
        this.dom = domElements;
        this.callbacks = callbacks; // { onLogin, onLogout }
        this.bindEvents();
        this.checkAuth();
    },

    bindEvents() {
        this.dom.loginLink.addEventListener('click', () => this.openModal());
        this.dom.closeModal.addEventListener('click', () => this.closeModal());
        this.dom.authBanner.addEventListener('click', () => this.openModal());

        this.dom.toggleAuth.addEventListener('click', () => this.toggleAuthMode());
        this.dom.authForm.addEventListener('submit', (e) => this.handleAuth(e));

        // Logout button is dynamic, so we delegate or handle in addLogoutButton
    },

    async checkAuth() {
        const token = localStorage.getItem('auth_token');
        if (!token) {
            this.logoutLocal();
            return;
        }

        try {
            const response = await fetch(`${API_URL}/auth/me/`, getFetchOptions('GET'));
            if (response.ok) {
                const data = await response.json();
                this.loginSuccess(data, token);
            } else {
                this.logoutLocal();
            }
        } catch (e) {
            console.error(e);
            this.logoutLocal();
        }
    },

    logoutLocal() {
        localStorage.removeItem('auth_token');
        this.state.isLoggedIn = false;
        this.state.user = null;
        this.dom.authBanner.classList.remove('hidden');

        const btn = document.getElementById('logout-btn');
        if (btn) btn.remove();

        if (this.callbacks.onLogout) this.callbacks.onLogout();
    },

    loginSuccess(user, token) {
        this.state.isLoggedIn = true;
        this.state.user = user;
        if (token) localStorage.setItem('auth_token', token);

        this.dom.authBanner.classList.add('hidden');
        this.addLogoutButton();
        this.closeModal();

        if (this.callbacks.onLogin) this.callbacks.onLogin(user);
    },

    async handleAuth(e) {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const email = document.getElementById('email').value;
        const otpInput = document.getElementById('otp-input');

        // OTP Phase
        if (otpInput && !otpInput.classList.contains('hidden') && this.state.tempUsername) {
            await this.verifyOtp(otpInput.value);
            return;
        }

        // Login/Register Phase
        const isRegister = !this.dom.emailInput.classList.contains('hidden');
        const endpoint = isRegister ? 'register' : 'login';
        const body = { username, password };
        if (isRegister) {
            body.email = email;
            body.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        }

        try {
            const res = await fetch(`${API_URL}/auth/${endpoint}/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            if (res.ok) {
                const data = await res.json();
                if (data.token) {
                    this.loginSuccess(data.user || { username }, data.token);
                } else if (data.otp_needed) {
                    this.state.tempUsername = username;
                    this.switchToOtpMode(data.detail);
                }
            } else {
                const err = await res.json();
                alert(err.detail || 'Auth failed');
            }
        } catch (err) {
            console.error(err);
            alert('Error connecting to server');
        }
    },

    async verifyOtp(otp) {
        try {
            const res = await fetch(`${API_URL}/auth/verify_otp/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: this.state.tempUsername, otp })
            });
            if (res.ok) {
                const data = await res.json();
                this.loginSuccess(data.user, data.token);
                this.resetFormUI();
            } else {
                alert('Invalid OTP');
            }
        } catch (e) { console.error(e); }
    },

    switchToOtpMode(msg) {
        document.getElementById('username').classList.add('hidden');
        document.getElementById('password').classList.add('hidden');
        this.dom.emailInput.classList.add('hidden');
        document.getElementById('otp-input').classList.remove('hidden');
        this.dom.modalTitle.textContent = 'Verify OTP';
        this.dom.authSubmit.textContent = 'Verify';
        this.dom.toggleAuth.classList.add('hidden');
        alert(`OTP Sent! Check console: ${msg}`);
    },

    resetFormUI() {
        document.getElementById('otp-input').classList.add('hidden');
        document.getElementById('username').classList.remove('hidden');
        document.getElementById('password').classList.remove('hidden');
        this.dom.authSubmit.textContent = 'Login';
        this.dom.toggleAuth.classList.remove('hidden');
        this.state.tempUsername = null;
    },

    toggleAuthMode() {
        // Toggle UI logic (simplified)
        const isRegister = this.dom.emailInput.classList.contains('hidden');
        if (isRegister) {
            this.dom.emailInput.classList.remove('hidden');
            this.dom.modalTitle.textContent = 'Register';
            this.dom.authSubmit.textContent = 'Register';
            this.dom.toggleAuth.textContent = 'Login instead';
        } else {
            this.dom.emailInput.classList.add('hidden');
            this.dom.modalTitle.textContent = 'Login';
            this.dom.authSubmit.textContent = 'Login';
            this.dom.toggleAuth.textContent = 'Register new account';
        }
    },

    addLogoutButton() {
        if (document.getElementById('logout-btn')) return;
        const btn = document.createElement('button');
        btn.id = 'logout-btn';
        btn.textContent = 'Logout';
        btn.className = 'btn-secondary';
        Object.assign(btn.style, { position: 'absolute', top: '20px', right: '20px', zIndex: 2000 });
        btn.onclick = () => this.logoutLocal();
        document.querySelector('.container').appendChild(btn);
    },

    openModal() {
        this.dom.authModal.classList.remove('hidden');
        this.dom.authModal.classList.add('active');
    },

    closeModal() {
        this.dom.authModal.classList.add('hidden');
        this.dom.authModal.classList.remove('active');
    }
};
