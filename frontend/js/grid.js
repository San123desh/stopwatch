export const grid = {
    dom: {},
    timerState: null, 
    data: {}, // Local progress data { "YYYY-MM-DD": { total_seconds: X, status: 'red'|'green' } }

    init(domElements, timerState) {
        this.dom = domElements;
        this.timerState = timerState;
        this.loadFromLocalStorage();
        this.createGlobalTooltip();
        this.render(); 
        this.bindTooltipEvents();
        
        // Refresh grid every minute to handle day transitions or guest updates
        setInterval(() => this.render(), 60000);
    },

    loadFromLocalStorage() {
        const saved = localStorage.getItem('stopwatch_grid_data');
        this.data = saved ? JSON.parse(saved) : {};
    },

    saveToLocalStorage() {
        localStorage.setItem('stopwatch_grid_data', JSON.stringify(this.data));
    },

    updateProgress(dateStr, sessionSeconds) {
        if (!this.data[dateStr]) {
            this.data[dateStr] = { total_seconds: 0, status: 'red' };
        }
        this.data[dateStr].total_seconds += sessionSeconds;
        
        // Completion threshold (2 hours = 7200s)
        if (this.data[dateStr].total_seconds >= 7200) {
            this.data[dateStr].status = 'green';
        }
        
        this.saveToLocalStorage();
        this.render();
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
        const gridContainer = document.getElementById('tracker-grid');
        const tooltip = document.getElementById('global-tooltip');

        gridContainer.addEventListener('mouseover', (e) => {
            if (e.target.classList.contains('day-box')) {
                const text = e.target.getAttribute('data-tooltip');
                if (text) {
                    tooltip.textContent = text;
                    tooltip.classList.remove('hidden');

                    const rect = e.target.getBoundingClientRect();
                    tooltip.style.left = `${rect.left + window.scrollX + (rect.width / 2)}px`;
                    tooltip.style.top = `${rect.top + window.scrollY - 10}px`;
                }
            }
        });

        gridContainer.addEventListener('mouseout', (e) => {
            if (e.target.classList.contains('day-box')) {
                tooltip.classList.add('hidden');
            }
        });
    },

    render() {
        let container = this.dom.trackerGrid;
        if (!container) {
            container = document.getElementById('tracker-grid');
            this.dom.trackerGrid = container;
        }
        if (!container) return;

        container.innerHTML = '';

        const now = new Date();
        const year = now.getFullYear();
        const daysInYear = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0) ? 366 : 365;
        const startDate = new Date(Date.UTC(year, 0, 1));
        const todayStr = new Date().toISOString().split('T')[0];

        for (let i = 0; i < daysInYear; i++) {
            const date = new Date(startDate);
            date.setUTCDate(startDate.getUTCDate() + i);
            const dateStr = date.toISOString().split('T')[0];

            const el = document.createElement('div');
            el.className = 'day-box';

            let status = 'neutral';
            let seconds = 0;

            if (this.data[dateStr]) {
                const item = this.data[dateStr];
                seconds = item.total_seconds;
                status = (item.status === 'green') ? 'green' : 'red';
            } else if (dateStr < todayStr) {
                status = 'red';
            } else if (dateStr > todayStr) {
                status = 'future';
            }

            // Real-time guest feedback for "today"
            if (dateStr === todayStr && this.timerState) {
                const liveSecs = Math.floor(this.timerState.elapsedTime / 1000);
                const totalToday = seconds + liveSecs;
                if (totalToday >= 7200) status = 'green';
                seconds = totalToday;
                el.classList.add('current');
            }

            if (status === 'green') el.classList.add('status-green');
            else if (status === 'red') el.classList.add('status-red');

            const h = Math.floor(seconds / 3600);
            const m = Math.floor((seconds % 3600) / 60);

            el.setAttribute('data-tooltip', `${dateStr}\nFocus: ${h}h ${m}m`);
            container.appendChild(el);
        }
    }
};
