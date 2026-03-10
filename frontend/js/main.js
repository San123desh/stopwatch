import { auth } from './auth.js';
import { timer } from './timer.js';
import { grid } from './grid.js';

document.addEventListener('DOMContentLoaded', () => {
    // Cache Global DOM used by modules
    const dom = {
        timerDisplay: document.getElementById('timer'),
        authBanner: document.getElementById('auth-banner'),
        loginLink: document.getElementById('login-link'),
        authModal: document.getElementById('auth-modal'),
        closeModal: document.querySelector('.close-modal'),
        authForm: document.getElementById('auth-form'),
        toggleAuth: document.getElementById('toggle-auth'),
        appContainer: document.getElementById('app'),
        trackerGrid: document.getElementById('tracker-grid'),
        resetBtn: document.getElementById('reset-btn'),
        fullscreenBtn: document.getElementById('fullscreen-btn'),
        modalTitle: document.getElementById('modal-title'),
        emailInput: document.getElementById('email'),
        authSubmit: document.getElementById('auth-submit'),
    };

    // Initialize Modules
    timer.init(dom);

    // Auth Callbacks to update other modules
    auth.init(dom, {
        onLogin: (user) => {
            timer.isLoggedIn = true;
            grid.isLoggedIn = true;
            grid.fetchData();
        },
        onLogout: () => {
            timer.isLoggedIn = false;
            grid.isLoggedIn = false;
            grid.render(null); // Revert to guest
        }
    });

    // Pass timer state to grid for Guest Mode visualization
    grid.init(dom, timer.state);
});
