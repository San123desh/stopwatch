import { API_URL, getFetchOptions } from './api.js';

export const timer = {
    state: {
        running: false,
        startTime: null,
        elapsedTime: 0,
        interval: null,
        lastSaveTime: Date.now(),
        unsavedSeconds: 0
    },
    dom: {},
    isLoggedIn: false, // Updated by main

    init(domElements) {
        this.dom = domElements;
        this.bindEvents();
        this.updateDisplay();
        this.startAutoSaveLoop();
    },

    bindEvents() {
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && !document.querySelector('.modal.active')) {
                if (document.activeElement.tagName !== 'INPUT') {
                    e.preventDefault();
                    this.toggle();
                }
            }
        });
        this.dom.resetBtn.addEventListener('click', () => this.reset());
        this.dom.fullscreenBtn.addEventListener('click', () => document.body.classList.toggle('fullscreen'));
    },

    toggle() {
        this.state.running ? this.stop() : this.start();
    },

    start() {
        if (this.state.running) return;
        this.state.running = true;
        this.state.startTime = Date.now() - this.state.elapsedTime;
        this.state.interval = setInterval(() => {
            this.state.elapsedTime = Date.now() - this.state.startTime;
            this.updateDisplay();
        }, 100);
    },

    stop() {
        if (!this.state.running) return;
        this.state.running = false;
        clearInterval(this.state.interval);
        this.syncProgress(this.state.unsavedSeconds); // Final sync
        this.state.unsavedSeconds = 0;
    },

    reset() {
        this.stop();
        this.state.elapsedTime = 0;
        this.updateDisplay();
    },

    updateDisplay() {
        const totalSeconds = Math.floor(this.state.elapsedTime / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const mins = Math.floor((totalSeconds % 3600) / 60);
        const secs = totalSeconds % 60;
        const ms = Math.floor((this.state.elapsedTime % 1000) / 10);

        const pad = n => n.toString().padStart(2, '0');
        this.dom.timerDisplay.textContent = `${pad(hours)}:${pad(mins)}:${pad(secs)}:${pad(ms)}`;

        // Instant Green Feedback (2 hours = 7200000 ms)
        if (this.state.elapsedTime >= 7200000) {
            const currentBox = document.querySelector('.day-box.current');
            if (currentBox && !currentBox.classList.contains('status-green')) {
                currentBox.classList.add('status-green');
            }
        }
    },

    startAutoSaveLoop() {
        setInterval(() => {
            if (this.state.running) {
                this.state.unsavedSeconds++;
                if (this.state.unsavedSeconds >= 5) {
                    this.syncProgress(this.state.unsavedSeconds);
                    this.state.unsavedSeconds = 0;
                }
            }
        }, 1000);
    },

    async syncProgress(duration) {
        if (!this.isLoggedIn || duration <= 0) return;
        const today = new Date().toISOString().split('T')[0];
        try {
            await fetch(`${API_URL}/progress/update_progress/`, {
                ...getFetchOptions('POST'),
                body: JSON.stringify({ date: today, session_duration: duration })
            });
            // Trigger grid refresh? Handled by polling in grid.js
        } catch (e) {
            console.error("Save failed", e);
        }
    }
};
