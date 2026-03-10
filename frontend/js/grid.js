import { API_URL, getFetchOptions } from './api.js';

export const grid = {
    dom: {},
    isLoggedIn: false,
    timerState: null, // Reference to timer state for guest mode
    polling: null,

    init(domElements, timerState) {
        this.dom = domElements;
        this.timerState = timerState;
        this.createGlobalTooltip();
        this.render(null); // Initial Guest Render
        this.startPolling();
        this.bindTooltipEvents();
    },

    createGlobalTooltip() {
        if (!document.getElementById('global-tooltip')) {
            const tip = document.createElement('div');
            tip.id = 'global-tooltip';
            tip.className = 'global-tooltip hidden';
            document.body.appendChild(tip);
        }
    },

    bindTooltipEvents() {
        const grid = document.getElementById('tracker-grid'); // Direct reference for safety
        const tooltip = document.getElementById('global-tooltip');

        grid.addEventListener('mouseover', (e) => {
            if (e.target.classList.contains('day-box')) {
                const text = e.target.getAttribute('data-tooltip');
                if (text) {
                    tooltip.textContent = text;
                    tooltip.classList.remove('hidden');

                    // Position
                    const rect = e.target.getBoundingClientRect();
                    tooltip.style.left = `${rect.left + window.scrollX + (rect.width / 2)}px`;
                    tooltip.style.top = `${rect.top + window.scrollY - 10}px`;
                }
            }
        });

        grid.addEventListener('mouseout', (e) => {
            if (e.target.classList.contains('day-box')) {
                tooltip.classList.add('hidden');
            }
        });
    },

    startPolling() {
        setInterval(() => this.fetchData(), 5000);
    },

    async fetchData() {
        if (!this.isLoggedIn) {
            this.render(null);
            return;
        }
        try {
            const res = await fetch(`${API_URL}/grid-data/`, getFetchOptions('GET'));
            if (res.ok) {
                const data = await res.json();
                this.render(data);
            }
        } catch (e) {
            // console.error(e); 
        }
    },

    render(data) {
        // Robustness fix: Ensure container exists
        let container = this.dom.trackerGrid;
        if (!container) {
            container = document.getElementById('tracker-grid');
            this.dom.trackerGrid = container;
        }
        if (!container) return; // Should not happen

        container.innerHTML = '';

        const progressMap = {};
        if (data && data.grid) {
            data.grid.forEach(item => progressMap[item.date] = item);
        }

        const now = new Date();
        const year = now.getFullYear();
        const daysInYear = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0) ? 366 : 365;
        const startDate = new Date(Date.UTC(year, 0, 1));
        const currentDateStr = new Date().toISOString().split('T')[0];

        for (let i = 0; i < daysInYear; i++) {
            const date = new Date(startDate);
            date.setUTCDate(startDate.getUTCDate() + i);
            const dateStr = date.toISOString().split('T')[0];

            const el = document.createElement('div');
            el.className = 'day-box';

            let status = 'neutral';
            let seconds = 0;

            if (progressMap[dateStr]) {
                const item = progressMap[dateStr];
                status = item.status === 'green' ? 'green' : (dateStr === currentDateStr ? 'neutral' : 'red');
                seconds = item.total_seconds;
            } else {
                if (dateStr > currentDateStr) status = 'future';
                else if (dateStr === currentDateStr) {
                    // Check local guest progress or just neutral
                    const guestSecs = this.timerState.elapsedTime / 1000;
                    if (!this.isLoggedIn && guestSecs >= 7200) status = 'green';
                    else status = 'neutral';
                    seconds = guestSecs;
                } else status = 'red';
            }

            if (status === 'green') el.classList.add('status-green');
            else if (status === 'red') el.classList.add('status-red');
            if (dateStr === currentDateStr) el.classList.add('current');

            const h = Math.floor(seconds / 3600);
            const m = Math.floor((seconds % 3600) / 60);

            el.setAttribute('data-tooltip', `Day (${i + 1}) - ${dateStr}\nActivity: ${h}h ${m}m`);
            container.appendChild(el);
        }
    }
};
