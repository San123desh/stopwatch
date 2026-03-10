# Stopwatch & Focus Tracker

A professional, Dockerized focus application designed to help you track your deep work sessions with a 365-day consistency grid.

## 🚀 Features

- **High-Precision Stopwatch**: Start, stop, and reset your focus sessions with ease.
- **Consistency Tracker**: A GitHub-style 365-day grid that visualizes your daily progress.
- **Automated Storage**: Integrates with a Django/Postgres backend to persist your focus milestones.
- **One-Click Launch**: Includes a convenient setup script for Windows.

## 🛠️ Tech Stack

- **Frontend**: Vanilla JavaScript (ES6 Modules), CSS3, HTML5.
- **Backend**: Django (Python 3.11), Django Rest Framework.
- **Database**: PostgreSQL 16.
- **Deployment**: Docker & Docker Compose.

## 🏁 Quick Start

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.

### Launching the Application
1. Clone the repository to your local machine.
2. Double-click the `start_app.bat` file in the root directory.
   - *This will automatically build the containers, start the services, and open the app in your browser.*
3. Alternatively, run via terminal:
   ```bash
   docker compose -f deploy/docker-compose.yml up -d --build
   ```
4. Access the app at: **[http://localhost:8000](http://localhost:8000)**

## 📖 Usage Guide

- **Timer**: Press **Spacebar** to start or stop the timer. Focus for at least 2 hours to mark a day as "Green" (Successful) in your tracker.
- **Authentication**: Log in or Register via the top banner to sync your progress across sessions.
- **Cleanup**: To stop the services, run `docker compose -f deploy/docker-compose.yml down`.

---
*Created for deep-focus enthusiasts.*
