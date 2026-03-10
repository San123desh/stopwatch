import { grid } from './grid.js';

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
        this.saveProgress(this.state.unsavedSeconds); // Final sync
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

        // Instant Grid Feedback
        grid.render();
    },

    startAutoSaveLoop() {
        setInterval(() => {
            if (this.state.running) {
                this.state.unsavedSeconds++;
                if (this.state.unsavedSeconds >= 5) {
                    this.saveProgress(this.state.unsavedSeconds);
                    this.state.unsavedSeconds = 0;
                }
            }
        }, 1000);
    },

    saveProgress(duration) {
        if (duration <= 0) return;
        const today = new Date().toISOString().split('T')[0];
        grid.updateProgress(today, duration);
    }
};
