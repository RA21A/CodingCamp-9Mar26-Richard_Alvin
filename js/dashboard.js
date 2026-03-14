// Productivity Dashboard - Main JavaScript File

// Dashboard Controller
// Main controller that manages all dashboard components and coordinates their interactions
class DashboardController {
    constructor() {
        this.greetingDisplay = null;
        this.focusTimer = null;
        this.taskManager = null;
        this.quickLinksPanel = null;
        this.themeManager = null; // NEW: Manages light/dark theme switching
        this.settingsManager = null; // NEW: Manages user settings (name, timer duration)
    }

    init() {
        console.log('Dashboard initializing...');
        
        try {
            // NEW: Initialize Theme Manager first to apply saved theme immediately
            // Handles light/dark mode toggle and persists user preference
            this.themeManager = new ThemeManager(this);
            this.themeManager.init();
        } catch (e) {
            console.error('Failed to initialize Theme Manager:', e);
        }

        try {
            // NEW: Initialize Settings Manager for user customization
            // Manages custom name and Pomodoro timer duration settings
            this.settingsManager = new SettingsManager(this);
            this.settingsManager.init();
        } catch (e) {
            console.error('Failed to initialize Settings Manager:', e);
        }

        try {
            // Initialize Greeting Display with storage controller for custom name support
            // UPDATED: Now accepts storageController to access custom user name
            this.greetingDisplay = new GreetingDisplay(this);
            this.greetingDisplay.init();
        } catch (e) {
            console.error('Failed to initialize Greeting Display:', e);
            this.showWarning('Greeting display unavailable');
        }

        try {
            // Initialize Focus Timer with storage controller for custom duration support
            // UPDATED: Now accepts storageController to load custom Pomodoro duration
            this.focusTimer = new FocusTimer(this);
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
// Displays current time, date, and personalized greeting message
class GreetingDisplay {
    constructor(storageController) {
        this.storageController = storageController; // UPDATED: Added to access custom user name
        this.intervalId = null;
    }

    init() {
        this.updateDisplay();
        // Update every second to keep time accurate
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
            // NEW: Load custom user name from localStorage
            // If name is set, greeting will include it (e.g., "Good Morning, John")
            const userName = this.storageController.getFromStorage('productivity_dashboard_username');
            greetingElement.textContent = this.getGreeting(now.getHours(), userName);
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

    getGreeting(hour, userName) {
        let greeting;
        // Determine greeting based on time of day
        // 5-11: Morning, 12-16: Afternoon, 17-20: Evening, 21-4: Night
        if (hour >= 5 && hour <= 11) {
            greeting = 'Good Morning';
        } else if (hour >= 12 && hour <= 16) {
            greeting = 'Good Afternoon';
        } else if (hour >= 17 && hour <= 20) {
            greeting = 'Good Evening';
        } else {
            // 21-23 and 0-4
            greeting = 'Good Night';
        }
        
        // NEW: Personalize greeting with user's name if set
        // Example: "Good Morning" becomes "Good Morning, John"
        if (userName) {
            greeting += `, ${userName}`;
        }
        
        return greeting;
    }
}

// Focus Timer Component
// Pomodoro-style timer with customizable duration
class FocusTimer {
    constructor(storageController) {
        this.storageController = storageController; // UPDATED: Added to access custom timer duration
        
        // NEW: Load custom timer duration from localStorage (default: 25 minutes)
        // Users can set duration between 1-60 minutes via settings
        const duration = this.storageController.getFromStorage('productivity_dashboard_timer_duration') || 25;
        this.defaultDuration = duration * 60; // Convert minutes to seconds
        this.remainingSeconds = this.defaultDuration;
        this.isRunning = false;
        this.intervalId = null;
    }

    init() {
        this.setupEventListeners();
        this.updateDisplay();
    }

    // NEW: Update timer duration when user changes it in settings
    // Only updates display if timer is not currently running
    updateDuration(minutes) {
        this.defaultDuration = minutes * 60;
        if (!this.isRunning) {
            this.remainingSeconds = this.defaultDuration;
            this.updateDisplay();
        }
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
        // UPDATED: Reset to custom duration instead of hardcoded 1500 seconds
        this.remainingSeconds = this.defaultDuration;
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
        // UPDATED: Clamp to custom duration instead of hardcoded 1500
        // Ensures time display stays within valid range [0, defaultDuration]
        const seconds = Math.max(0, Math.min(this.defaultDuration, this.remainingSeconds));
        
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
    // NEW: Store dashboard instance globally so settings can access timer
    // This allows SettingsManager to update timer duration dynamically
    window.dashboardInstance = dashboard;
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

// Theme Manager Component
// NEW FEATURE: Manages light/dark theme switching with localStorage persistence
// Provides toggle button to switch between themes and remembers user preference
class ThemeManager {
    constructor(storageController) {
        this.storageController = storageController;
        this.storageKey = 'productivity_dashboard_theme';
    }

    init() {
        // Load saved theme preference on startup
        this.loadTheme();
        this.setupEventListeners();
    }

    // Load theme from localStorage (defaults to 'light' if not set)
    loadTheme() {
        const theme = this.storageController.getFromStorage(this.storageKey) || 'light';
        this.applyTheme(theme);
    }

    // Toggle between light and dark themes
    toggleTheme() {
        const currentTheme = document.body.classList.contains('dark-theme') ? 'dark' : 'light';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme(newTheme);
        // Save preference to localStorage for persistence
        this.storageController.saveToStorage(this.storageKey, newTheme);
    }

    // Apply theme by adding/removing CSS class and updating button icon
    applyTheme(theme) {
        const toggleBtn = document.getElementById('theme-toggle');
        if (theme === 'dark') {
            document.body.classList.add('dark-theme');
            // Show sun icon when in dark mode (click to go light)
            if (toggleBtn) toggleBtn.textContent = '☀️';
        } else {
            document.body.classList.remove('dark-theme');
            // Show moon icon when in light mode (click to go dark)
            if (toggleBtn) toggleBtn.textContent = '🌙';
        }
    }

    // Set up click handler for theme toggle button
    setupEventListeners() {
        const toggleBtn = document.getElementById('theme-toggle');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => this.toggleTheme());
        }
    }
}

// Settings Manager Component
// NEW FEATURE: Manages user customization settings via modal dialog
// Handles custom name for greeting and Pomodoro timer duration
class SettingsManager {
    constructor(storageController) {
        this.storageController = storageController;
    }

    init() {
        this.setupEventListeners();
        // Load existing settings into form fields
        this.loadSettings();
    }

    // Load saved settings from localStorage and populate form fields
    loadSettings() {
        const userName = this.storageController.getFromStorage('productivity_dashboard_username');
        const timerDuration = this.storageController.getFromStorage('productivity_dashboard_timer_duration') || 25;
        
        const nameInput = document.getElementById('user-name-input');
        const timerInput = document.getElementById('timer-duration-input');
        
        // Pre-fill name input if user has saved a name
        if (nameInput && userName) {
            nameInput.value = userName;
        }
        
        // Pre-fill timer duration (default: 25 minutes)
        if (timerInput) {
            timerInput.value = timerDuration;
        }
    }

    // Show settings modal dialog
    openModal() {
        const modal = document.getElementById('settings-modal');
        if (modal) {
            modal.classList.remove('hidden');
        }
    }

    // Hide settings modal dialog
    closeModal() {
        const modal = document.getElementById('settings-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    // Save custom user name to localStorage
    // Name is used to personalize greeting (e.g., "Good Morning, John")
    saveName() {
        const nameInput = document.getElementById('user-name-input');
        if (nameInput) {
            const name = nameInput.value.trim();
            if (name.length > 0 && name.length <= 50) {
                // Save valid name (1-50 characters)
                this.storageController.saveToStorage('productivity_dashboard_username', name);
                alert('Name saved successfully!');
            } else if (name.length === 0) {
                // Clear name if input is empty
                this.storageController.removeFromStorage('productivity_dashboard_username');
                alert('Name cleared!');
            } else {
                // Reject names over 50 characters
                alert('Name must be 50 characters or less');
            }
        }
    }

    // Save custom Pomodoro timer duration to localStorage
    // Duration must be between 1-60 minutes
    saveTimerDuration() {
        const timerInput = document.getElementById('timer-duration-input');
        if (timerInput) {
            const duration = parseInt(timerInput.value);
            if (duration >= 1 && duration <= 60) {
                // Save valid duration
                this.storageController.saveToStorage('productivity_dashboard_timer_duration', duration);
                
                // Immediately update the timer display with new duration
                const dashboard = window.dashboardInstance;
                if (dashboard && dashboard.focusTimer) {
                    dashboard.focusTimer.updateDuration(duration);
                }
                
                alert('Timer duration saved successfully!');
            } else {
                // Reject invalid durations
                alert('Duration must be between 1 and 60 minutes');
            }
        }
    }

    // Set up event listeners for settings modal interactions
    setupEventListeners() {
        const settingsBtn = document.getElementById('settings-btn');
        const closeBtn = document.querySelector('.close');
        const saveNameBtn = document.getElementById('save-name-btn');
        const saveTimerBtn = document.getElementById('save-timer-btn');
        const modal = document.getElementById('settings-modal');

        // Open modal when settings button clicked
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => this.openModal());
        }

        // Close modal when X button clicked
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeModal());
        }

        // Save name when save button clicked
        if (saveNameBtn) {
            saveNameBtn.addEventListener('click', () => this.saveName());
        }

        // Save timer duration when save button clicked
        if (saveTimerBtn) {
            saveTimerBtn.addEventListener('click', () => this.saveTimerDuration());
        }

        // Close modal when clicking outside of it (on backdrop)
        if (modal) {
            window.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal();
                }
            });
        }
    }
}
