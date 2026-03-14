// Productivity Dashboard - Main JavaScript File

// Dashboard Controller
class DashboardController {
    constructor() {
        this.greetingDisplay = null;
        this.focusTimer = null;
        this.taskManager = null;
        this.quickLinksPanel = null;
    }

    init() {
        console.log('Dashboard initializing...');
        
        try {
            // Initialize Greeting Display
            this.greetingDisplay = new GreetingDisplay();
            this.greetingDisplay.init();
        } catch (e) {
            console.error('Failed to initialize Greeting Display:', e);
            this.showWarning('Greeting display unavailable');
        }

        try {
            // Initialize Focus Timer
            this.focusTimer = new FocusTimer();
            this.focusTimer.init();
        } catch (e) {
            console.error('Failed to initialize Focus Timer:', e);
            this.showWarning('Focus timer unavailable');
        }

        try {
            // Initialize Task Manager
            this.taskManager = new TaskManager(this);
            this.taskManager.init();
        } catch (e) {
            console.error('Failed to initialize Task Manager:', e);
            this.showWarning('Task manager unavailable');
        }

        try {
            // Initialize Quick Links Panel
            this.quickLinksPanel = new QuickLinksPanel(this);
            this.quickLinksPanel.init();
        } catch (e) {
            console.error('Failed to initialize Quick Links Panel:', e);
            this.showWarning('Quick links panel unavailable');
        }

        // Set up cross-tab synchronization
        this.setupStorageListener();
    }

    setupStorageListener() {
        window.addEventListener('storage', (e) => {
            try {
                // Handle task storage changes from other tabs
                if (e.key === 'productivity_dashboard_tasks' && this.taskManager) {
                    console.log('Tasks updated in another tab, reloading...');
                    this.taskManager.loadTasks();
                    this.taskManager.renderTasks();
                }

                // Handle quick links storage changes from other tabs
                if (e.key === 'productivity_dashboard_links' && this.quickLinksPanel) {
                    console.log('Quick links updated in another tab, reloading...');
                    this.quickLinksPanel.loadLinks();
                    this.quickLinksPanel.renderLinks();
                }
            } catch (e) {
                console.error('Error handling storage event:', e);
            }
        });
    }

    // localStorage utility methods
    getFromStorage(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.error('Error reading from localStorage:', e);
            return null;
        }
    }

    saveToStorage(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (e) {
            console.error('Error saving to localStorage:', e);
            this.showWarning('Unable to save data. Changes may not persist.');
        }
    }

    removeFromStorage(key) {
        try {
            localStorage.removeItem(key);
        } catch (e) {
            console.error('Error removing from localStorage:', e);
        }
    }

    showWarning(message) {
        console.warn(message);
        // Warning display implementation will be added if needed
    }
}

// Greeting Display Component
class GreetingDisplay {
    constructor() {
        this.intervalId = null;
    }

    init() {
        this.updateDisplay();
        // Update every second
        this.intervalId = setInterval(() => this.updateDisplay(), 1000);
    }

    updateDisplay() {
        const now = new Date();
        
        const timeElement = document.getElementById('time-display');
        const dateElement = document.getElementById('date-display');
        const greetingElement = document.getElementById('greeting-text');

        if (timeElement) {
            timeElement.textContent = this.formatTime(now);
        }

        if (dateElement) {
            dateElement.textContent = this.formatDate(now);
        }

        if (greetingElement) {
            greetingElement.textContent = this.getGreeting(now.getHours());
        }
    }

    formatTime(date) {
        let hours = date.getHours();
        const minutes = date.getMinutes();
        const seconds = date.getSeconds();
        
        // Determine AM/PM
        const ampm = hours >= 12 ? 'PM' : 'AM';
        
        // Convert to 12-hour format
        hours = hours % 12;
        hours = hours ? hours : 12; // 0 should be 12
        
        // Pad with zeros
        const minutesStr = minutes.toString().padStart(2, '0');
        const secondsStr = seconds.toString().padStart(2, '0');
        
        return `${hours}:${minutesStr}:${secondsStr} ${ampm}`;
    }

    formatDate(date) {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                       'July', 'August', 'September', 'October', 'November', 'December'];
        
        const dayName = days[date.getDay()];
        const monthName = months[date.getMonth()];
        const dayOfMonth = date.getDate();
        const year = date.getFullYear();
        
        return `${dayName}, ${monthName} ${dayOfMonth}, ${year}`;
    }

    getGreeting(hour) {
        // 5-11: Morning, 12-16: Afternoon, 17-20: Evening, 21-4: Night
        if (hour >= 5 && hour <= 11) {
            return 'Good Morning';
        } else if (hour >= 12 && hour <= 16) {
            return 'Good Afternoon';
        } else if (hour >= 17 && hour <= 20) {
            return 'Good Evening';
        } else {
            // 21-23 and 0-4
            return 'Good Night';
        }
    }
}

// Focus Timer Component
class FocusTimer {
    constructor() {
        this.remainingSeconds = 1500; // 25 minutes in seconds
        this.isRunning = false;
        this.intervalId = null;
    }

    init() {
        this.setupEventListeners();
        this.updateDisplay();
    }

    start() {
        if (this.isRunning) {
            return; // Already running
        }

        this.isRunning = true;
        this.intervalId = setInterval(() => this.tick(), 1000);
        this.updateDisplay();
    }

    stop() {
        if (!this.isRunning) {
            return; // Already stopped
        }

        this.isRunning = false;
        if (this.intervalId !== null) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        this.updateDisplay();
    }

    reset() {
        this.stop();
        this.remainingSeconds = 1500;
        this.updateDisplay();
    }

    tick() {
        if (this.remainingSeconds > 0) {
            this.remainingSeconds--;
            // Clamp to ensure we don't go below 0
            if (this.remainingSeconds < 0) {
                this.remainingSeconds = 0;
            }
            this.updateDisplay();

            if (this.remainingSeconds === 0) {
                this.stop();
                this.showCompletionNotification();
            }
        }
    }

    formatTime() {
        // Clamp remainingSeconds to valid range [0, 1500]
        const seconds = Math.max(0, Math.min(1500, this.remainingSeconds));
        
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        
        // Zero-pad to MM:SS format
        const minutesStr = minutes.toString().padStart(2, '0');
        const secondsStr = secs.toString().padStart(2, '0');
        
        return `${minutesStr}:${secondsStr}`;
    }

    showCompletionNotification() {
        // Display completion notification
        alert('Focus Timer Complete! Time for a break.');
    }

    updateDisplay() {
        const timerDisplay = document.getElementById('timer-display');
        if (timerDisplay) {
            timerDisplay.textContent = this.formatTime();
        }
    }

    setupEventListeners() {
        const startBtn = document.getElementById('timer-start');
        const stopBtn = document.getElementById('timer-stop');
        const resetBtn = document.getElementById('timer-reset');

        if (startBtn) {
            startBtn.addEventListener('click', () => this.start());
        }

        if (stopBtn) {
            stopBtn.addEventListener('click', () => this.stop());
        }

        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.reset());
        }
    }
}

// Initialize dashboard when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const dashboard = new DashboardController();
    dashboard.init();
});

// Task Manager Component
class TaskManager {
    constructor(storageController) {
        this.storageController = storageController;
        this.tasks = [];
        this.storageKey = 'productivity_dashboard_tasks';
    }

    init() {
        this.loadTasks();
        this.setupEventListeners();
        this.renderTasks();
    }

    loadTasks() {
        const stored = this.storageController.getFromStorage(this.storageKey);
        this.tasks = stored || [];
    }

    addTask(description) {
        const trimmed = description.trim();
        if (!trimmed || trimmed.length === 0) {
            return; // Reject empty or whitespace-only tasks
        }
        
        if (trimmed.length > 500) {
            console.warn('Task description exceeds 500 characters');
            return;
        }

        const task = {
            id: this.generateId(),
            description: trimmed,
            completed: false,
            createdAt: Date.now()
        };

        this.tasks.push(task);
        this.saveTasks();
        this.renderTasks();
    }

    editTask(id, newDescription) {
        const trimmed = newDescription.trim();
        if (!trimmed || trimmed.length === 0) {
            return;
        }

        const task = this.tasks.find(t => t.id === id);
        if (task) {
            task.description = trimmed;
            this.saveTasks();
            this.renderTasks();
        }
    }

    toggleComplete(id) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            this.saveTasks();
            this.renderTasks();
        }
    }

    deleteTask(id) {
        this.tasks = this.tasks.filter(t => t.id !== id);
        this.saveTasks();
        this.renderTasks();
    }

    saveTasks() {
        this.storageController.saveToStorage(this.storageKey, this.tasks);
    }

    renderTasks() {
        const taskList = document.getElementById('task-list');
        if (!taskList) {
            console.error('Task list element not found');
            return;
        }

        taskList.innerHTML = '';
        
        this.tasks.forEach(task => {
            const li = document.createElement('li');
            li.className = 'task-item';
            if (task.completed) {
                li.classList.add('completed');
            }
            li.dataset.id = task.id;

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.className = 'task-checkbox';
            checkbox.checked = task.completed;
            checkbox.addEventListener('change', () => this.toggleComplete(task.id));

            const span = document.createElement('span');
            span.className = 'task-description';
            span.textContent = task.description;

            const editBtn = document.createElement('button');
            editBtn.className = 'task-edit';
            editBtn.textContent = 'Edit';
            editBtn.addEventListener('click', () => this.handleEdit(task.id));

            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'task-delete';
            deleteBtn.textContent = 'Delete';
            deleteBtn.addEventListener('click', () => this.deleteTask(task.id));

            li.appendChild(checkbox);
            li.appendChild(span);
            li.appendChild(editBtn);
            li.appendChild(deleteBtn);
            taskList.appendChild(li);
        });
    }

    handleEdit(id) {
        const task = this.tasks.find(t => t.id === id);
        if (!task) return;

        const newDescription = prompt('Edit task:', task.description);
        if (newDescription !== null) {
            this.editTask(id, newDescription);
        }
    }

    setupEventListeners() {
        const form = document.getElementById('task-form');
        const input = document.getElementById('task-input');

        if (form && input) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.addTask(input.value);
                input.value = '';
            });
        }
    }

    generateId() {
        return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    }
}

// Quick Links Panel Component
class QuickLinksPanel {
    constructor(storageController) {
        this.storageController = storageController;
        this.links = [];
        this.storageKey = 'productivity_dashboard_links';
    }

    init() {
        this.loadLinks();
        this.setupEventListeners();
        this.renderLinks();
    }

    loadLinks() {
        const stored = this.storageController.getFromStorage(this.storageKey);
        this.links = stored || [];
    }

    addLink(name, url) {
        const trimmedName = name.trim();
        const trimmedUrl = url.trim();

        // Validate non-empty name and URL
        if (!trimmedName || trimmedName.length === 0) {
            return; // Reject empty name
        }

        if (!trimmedUrl || trimmedUrl.length === 0) {
            return; // Reject empty URL
        }

        // Validate URL protocol (http:// or https://)
        if (!this.validateUrl(trimmedUrl)) {
            console.warn('Invalid URL: must start with http:// or https://');
            return;
        }

        // Check length constraints
        if (trimmedName.length > 100) {
            console.warn('Link name exceeds 100 characters');
            return;
        }

        const link = {
            id: this.generateId(),
            name: trimmedName,
            url: trimmedUrl,
            createdAt: Date.now()
        };

        this.links.push(link);
        this.saveLinks();
        this.renderLinks();
    }

    validateUrl(url) {
        // Check if URL starts with http:// or https://
        return url.startsWith('http://') || url.startsWith('https://');
    }

    deleteLink(id) {
        this.links = this.links.filter(link => link.id !== id);
        this.saveLinks();
        this.renderLinks();
    }

    openLink(url) {
        // Open URL in new tab
        window.open(url, '_blank');
    }

    saveLinks() {
        this.storageController.saveToStorage(this.storageKey, this.links);
    }

    renderLinks() {
        const linksContainer = document.getElementById('links-container');
        if (!linksContainer) {
            console.error('Links container element not found');
            return;
        }

        linksContainer.innerHTML = '';

        this.links.forEach(link => {
            const linkItem = document.createElement('div');
            linkItem.className = 'link-item';
            linkItem.dataset.id = link.id;

            const anchor = document.createElement('a');
            anchor.href = link.url;
            anchor.target = '_blank';
            anchor.className = 'link-anchor';
            anchor.textContent = link.name;
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                this.openLink(link.url);
            });

            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'link-delete';
            deleteBtn.textContent = 'Delete';
            deleteBtn.addEventListener('click', () => this.deleteLink(link.id));

            linkItem.appendChild(anchor);
            linkItem.appendChild(deleteBtn);
            linksContainer.appendChild(linkItem);
        });
    }

    setupEventListeners() {
        const form = document.getElementById('link-form');
        const nameInput = document.getElementById('link-name');
        const urlInput = document.getElementById('link-url');

        if (form && nameInput && urlInput) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.addLink(nameInput.value, urlInput.value);
                nameInput.value = '';
                urlInput.value = '';
            });
        }
    }

    generateId() {
        return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    }
}
