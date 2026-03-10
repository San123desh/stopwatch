import { timer } from './timer.js';
import { grid } from './grid.js';

document.addEventListener('DOMContentLoaded', () => {
    // Cache Global DOM used by modules
    const dom = {
        timerDisplay: document.getElementById('timer'),
        appContainer: document.getElementById('app'),
        trackerGrid: document.getElementById('tracker-grid'),
        resetBtn: document.getElementById('reset-btn'),
        fullscreenBtn: document.getElementById('fullscreen-btn'),
    };

    // Initialize Modules
    grid.init(dom, timer.state);
    timer.init(dom);
});
