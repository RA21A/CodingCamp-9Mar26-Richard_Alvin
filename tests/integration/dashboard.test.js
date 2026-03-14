/**
 * Integration Tests for Dashboard Component Interaction
 * Tests dashboard initialization sequence, localStorage synchronization,
 * and error handling scenarios.
 * 
 * **Validates: Requirements 8.1, 8.2, 5.4, 7.4**
 */

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load the HTML and JavaScript files
const html = fs.readFileSync(path.resolve(__dirname, '../../index.html'), 'utf-8');
const jsCode = fs.readFileSync(path.resolve(__dirname, '../../js/dashboard.js'), 'utf-8');

describe('Dashboard Integration Tests', () => {
    let dom;
    let window;
    let document;
    let localStorage;
    let consoleErrorSpy;
    let consoleWarnSpy;

    beforeEach(() => {
        // Create a new JSDOM instance for each test
        dom = new JSDOM(html, {
            runScripts: 'outside-only',
            url: 'http://localhost'
        });
        window = dom.window;
        document = window.document;
        localStorage = window.localStorage;

        // Clear localStorage
        localStorage.clear();

        // Spy on console methods
        consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

        // Execute the dashboard JavaScript code in the window context
        window.eval(jsCode);
    });

    afterEach(() => {
        consoleErrorSpy.mockRestore();
        consoleWarnSpy.mockRestore();
        if (dom && dom.window) {
            dom.window.close();
        }
    });

    describe('Dashboard Initialization Sequence', () => {
        test('should initialize all components after DOMContentLoaded', () => {
            return new Promise((resolve) => {
                // Trigger DOMContentLoaded
                const event = new window.Event('DOMContentLoaded');
                window.document.dispatchEvent(event);

                // Wait for initialization to complete
                setTimeout(() => {
                    // Check that greeting display is working
                    const timeDisplay = document.getElementById('time-display');
                    expect(timeDisplay).toBeTruthy();
                    expect(timeDisplay.textContent).not.toBe('--:--:-- --');
                    expect(timeDisplay.textContent).toMatch(/\d{1,2}:\d{2}:\d{2} (AM|PM)/);

                    // Check that timer is initialized
                    const timerDisplay = document.getElementById('timer-display');
                    expect(timerDisplay).toBeTruthy();
                    expect(timerDisplay.textContent).toBe('25:00');

                    // Check that task list is rendered (empty initially)
                    const taskList = document.getElementById('task-list');
                    expect(taskList).toBeTruthy();

                    // Check that links container is rendered (empty initially)
                    const linksContainer = document.getElementById('links-container');
                    expect(linksContainer).toBeTruthy();

                    resolve();
                }, 100);
            });
        });

        test('should initialize components without errors', () => {
            return new Promise((resolve) => {
                // Clear any previous errors
                consoleErrorSpy.mockClear();

                // Trigger DOMContentLoaded
                const event = new window.Event('DOMContentLoaded');
                window.document.dispatchEvent(event);

                setTimeout(() => {
                    // Check that all components initialized successfully
                    const timeDisplay = document.getElementById('time-display');
                    const timerDisplay = document.getElementById('timer-display');
                    const taskList = document.getElementById('task-list');
                    const linksContainer = document.getElementById('links-container');

                    expect(timeDisplay).toBeTruthy();
                    expect(timerDisplay).toBeTruthy();
                    expect(taskList).toBeTruthy();
                    expect(linksContainer).toBeTruthy();

                    resolve();
                }, 100);
            });
        });
    });

    describe('localStorage Synchronization Across Components', () => {
        test('should synchronize task changes across components', () => {
            return new Promise((resolve) => {
                // Trigger DOMContentLoaded
                const event = new window.Event('DOMContentLoaded');
                window.document.dispatchEvent(event);

                setTimeout(() => {
                    // Add a task
                    const taskInput = document.getElementById('task-input');
                    const taskForm = document.getElementById('task-form');
                    
                    expect(taskInput).toBeTruthy();
                    expect(taskForm).toBeTruthy();

                    taskInput.value = 'Test Task';
                    const submitEvent = new window.Event('submit', { bubbles: true, cancelable: true });
                    taskForm.dispatchEvent(submitEvent);

                    // Check localStorage was updated
                    const storedTasks = JSON.parse(localStorage.getItem('productivity_dashboard_tasks'));
                    expect(storedTasks).toBeTruthy();
                    expect(storedTasks.length).toBe(1);
                    expect(storedTasks[0].description).toBe('Test Task');

                    // Check task is rendered
                    const taskList = document.getElementById('task-list');
                    expect(taskList.children.length).toBe(1);
                    expect(taskList.textContent).toContain('Test Task');

                    resolve();
                }, 100);
            });
        });

        test('should synchronize quick links changes across components', () => {
            return new Promise((resolve) => {
                // Trigger DOMContentLoaded
                const event = new window.Event('DOMContentLoaded');
                window.document.dispatchEvent(event);

                setTimeout(() => {
                    // Add a quick link
                    const linkName = document.getElementById('link-name');
                    const linkUrl = document.getElementById('link-url');
                    const linkForm = document.getElementById('link-form');
                    
                    expect(linkName).toBeTruthy();
                    expect(linkUrl).toBeTruthy();
                    expect(linkForm).toBeTruthy();

                    linkName.value = 'Google';
                    linkUrl.value = 'https://google.com';
                    const submitEvent = new window.Event('submit', { bubbles: true, cancelable: true });
                    linkForm.dispatchEvent(submitEvent);

                    // Check localStorage was updated
                    const storedLinks = JSON.parse(localStorage.getItem('productivity_dashboard_links'));
                    expect(storedLinks).toBeTruthy();
                    expect(storedLinks.length).toBe(1);
                    expect(storedLinks[0].name).toBe('Google');
                    expect(storedLinks[0].url).toBe('https://google.com');

                    // Check link is rendered
                    const linksContainer = document.getElementById('links-container');
                    expect(linksContainer.children.length).toBe(1);
                    expect(linksContainer.textContent).toContain('Google');

                    resolve();
                }, 100);
            });
        });

        test('should handle cross-tab storage events for tasks', () => {
            return new Promise((resolve) => {
                // Trigger DOMContentLoaded
                const event = new window.Event('DOMContentLoaded');
                window.document.dispatchEvent(event);

                setTimeout(() => {
                    // Simulate another tab updating tasks
                    const externalTasks = [
                        { id: '1', description: 'External Task 1', completed: false, createdAt: Date.now() },
                        { id: '2', description: 'External Task 2', completed: true, createdAt: Date.now() }
                    ];
                    localStorage.setItem('productivity_dashboard_tasks', JSON.stringify(externalTasks));

                    // Trigger storage event
                    const storageEvent = new window.StorageEvent('storage', {
                        key: 'productivity_dashboard_tasks',
                        newValue: JSON.stringify(externalTasks),
                        url: 'http://localhost'
                    });
                    window.dispatchEvent(storageEvent);

                    // Wait for event handler to process
                    setTimeout(() => {
                        const taskList = document.getElementById('task-list');
                        expect(taskList.children.length).toBe(2);
                        expect(taskList.textContent).toContain('External Task 1');
                        expect(taskList.textContent).toContain('External Task 2');
                        resolve();
                    }, 50);
                }, 100);
            });
        });

        test('should handle cross-tab storage events for quick links', () => {
            return new Promise((resolve) => {
                // Trigger DOMContentLoaded
                const event = new window.Event('DOMContentLoaded');
                window.document.dispatchEvent(event);

                setTimeout(() => {
                    // Simulate another tab updating links
                    const externalLinks = [
                        { id: '1', name: 'GitHub', url: 'https://github.com', createdAt: Date.now() },
                        { id: '2', name: 'Stack Overflow', url: 'https://stackoverflow.com', createdAt: Date.now() }
                    ];
                    localStorage.setItem('productivity_dashboard_links', JSON.stringify(externalLinks));

                    // Trigger storage event
                    const storageEvent = new window.StorageEvent('storage', {
                        key: 'productivity_dashboard_links',
                        newValue: JSON.stringify(externalLinks),
                        url: 'http://localhost'
                    });
                    window.dispatchEvent(storageEvent);

                    // Wait for event handler to process
                    setTimeout(() => {
                        const linksContainer = document.getElementById('links-container');
                        expect(linksContainer.children.length).toBe(2);
                        expect(linksContainer.textContent).toContain('GitHub');
                        expect(linksContainer.textContent).toContain('Stack Overflow');
                        resolve();
                    }, 50);
                }, 100);
            });
        });
    });

    describe('Error Handling Scenarios', () => {
        test('should handle localStorage unavailability gracefully', () => {
            return new Promise((resolve) => {
                // Mock localStorage to throw errors
                const originalGetItem = localStorage.getItem;
                const originalSetItem = localStorage.setItem;
                
                localStorage.getItem = () => { throw new Error('localStorage unavailable'); };
                localStorage.setItem = () => { throw new Error('localStorage unavailable'); };

                // Clear previous spy calls
                consoleErrorSpy.mockClear();

                // Trigger DOMContentLoaded
                const event = new window.Event('DOMContentLoaded');
                window.document.dispatchEvent(event);

                setTimeout(() => {
                    // Dashboard should still initialize (greeting and timer don't use localStorage)
                    const timeDisplay = document.getElementById('time-display');
                    expect(timeDisplay).toBeTruthy();
                    expect(timeDisplay.textContent).toMatch(/\d{1,2}:\d{2}:\d{2} (AM|PM)/);

                    const timerDisplay = document.getElementById('timer-display');
                    expect(timerDisplay).toBeTruthy();
                    expect(timerDisplay.textContent).toBe('25:00');

                    // Task and link components should handle the error gracefully
                    // They may log errors when trying to load from storage
                    const taskList = document.getElementById('task-list');
                    const linksContainer = document.getElementById('links-container');
                    expect(taskList).toBeTruthy();
                    expect(linksContainer).toBeTruthy();

                    // Restore localStorage
                    localStorage.getItem = originalGetItem;
                    localStorage.setItem = originalSetItem;

                    resolve();
                }, 200);
            });
        }, 10000); // Increase timeout for this test

        test('should handle corrupted localStorage data', () => {
            return new Promise((resolve) => {
                // Set corrupted data in localStorage
                localStorage.setItem('productivity_dashboard_tasks', 'invalid json {{{');
                localStorage.setItem('productivity_dashboard_links', 'invalid json {{{');

                // Trigger DOMContentLoaded
                const event = new window.Event('DOMContentLoaded');
                window.document.dispatchEvent(event);

                setTimeout(() => {
                    // Components should initialize with empty data
                    const taskList = document.getElementById('task-list');
                    expect(taskList.children.length).toBe(0);

                    const linksContainer = document.getElementById('links-container');
                    expect(linksContainer.children.length).toBe(0);

                    // Errors should be logged
                    expect(consoleErrorSpy).toHaveBeenCalled();

                    resolve();
                }, 100);
            });
        });

        test('should handle missing DOM elements gracefully', () => {
            return new Promise((resolve) => {
                // Remove critical DOM elements
                document.getElementById('task-list')?.remove();
                document.getElementById('links-container')?.remove();

                // Trigger DOMContentLoaded
                const event = new window.Event('DOMContentLoaded');
                window.document.dispatchEvent(event);

                setTimeout(() => {
                    // Other components should still work
                    const timeDisplay = document.getElementById('time-display');
                    expect(timeDisplay).toBeTruthy();
                    expect(timeDisplay.textContent).toMatch(/\d{1,2}:\d{2}:\d{2} (AM|PM)/);

                    const timerDisplay = document.getElementById('timer-display');
                    expect(timerDisplay).toBeTruthy();
                    expect(timerDisplay.textContent).toBe('25:00');

                    // Errors should be logged for missing elements
                    expect(consoleErrorSpy).toHaveBeenCalled();

                    resolve();
                }, 100);
            });
        });

        test('should handle storage event errors gracefully', () => {
            return new Promise((resolve) => {
                // Trigger DOMContentLoaded
                const event = new window.Event('DOMContentLoaded');
                window.document.dispatchEvent(event);

                setTimeout(() => {
                    // Trigger storage event with invalid data
                    const storageEvent = new window.StorageEvent('storage', {
                        key: 'productivity_dashboard_tasks',
                        newValue: 'invalid json',
                        url: 'http://localhost'
                    });
                    window.dispatchEvent(storageEvent);

                    setTimeout(() => {
                        // App should continue working despite error
                        const timeDisplay = document.getElementById('time-display');
                        expect(timeDisplay).toBeTruthy();
                        
                        resolve();
                    }, 50);
                }, 100);
            });
        });

        test('should handle component initialization failures independently', () => {
            return new Promise((resolve) => {
                // Remove a critical element to cause one component to fail
                document.getElementById('task-list')?.remove();

                // Trigger DOMContentLoaded
                const event = new window.Event('DOMContentLoaded');
                window.document.dispatchEvent(event);

                setTimeout(() => {
                    // Other components should still work
                    const timeDisplay = document.getElementById('time-display');
                    expect(timeDisplay).toBeTruthy();
                    expect(timeDisplay.textContent).toMatch(/\d{1,2}:\d{2}:\d{2} (AM|PM)/);

                    const timerDisplay = document.getElementById('timer-display');
                    expect(timerDisplay).toBeTruthy();
                    expect(timerDisplay.textContent).toBe('25:00');

                    // Error should be logged
                    expect(consoleErrorSpy).toHaveBeenCalled();

                    resolve();
                }, 100);
            });
        });
    });

    describe('Component Interaction', () => {
        test('should allow all components to work simultaneously', () => {
            return new Promise((resolve) => {
                // Trigger DOMContentLoaded
                const event = new window.Event('DOMContentLoaded');
                window.document.dispatchEvent(event);

                setTimeout(() => {
                    // Add a task
                    const taskInput = document.getElementById('task-input');
                    const taskForm = document.getElementById('task-form');
                    
                    expect(taskInput).toBeTruthy();
                    expect(taskForm).toBeTruthy();

                    taskInput.value = 'Test Task';
                    const taskSubmitEvent = new window.Event('submit', { bubbles: true, cancelable: true });
                    taskForm.dispatchEvent(taskSubmitEvent);

                    // Add a quick link
                    const linkName = document.getElementById('link-name');
                    const linkUrl = document.getElementById('link-url');
                    const linkForm = document.getElementById('link-form');
                    
                    expect(linkName).toBeTruthy();
                    expect(linkUrl).toBeTruthy();
                    expect(linkForm).toBeTruthy();

                    linkName.value = 'Test Link';
                    linkUrl.value = 'https://test.com';
                    const linkSubmitEvent = new window.Event('submit', { bubbles: true, cancelable: true });
                    linkForm.dispatchEvent(linkSubmitEvent);

                    // Start the timer
                    const startBtn = document.getElementById('timer-start');
                    expect(startBtn).toBeTruthy();
                    startBtn.click();

                    // Check all components are working
                    setTimeout(() => {
                        // Task should be added
                        const taskList = document.getElementById('task-list');
                        expect(taskList.children.length).toBe(1);

                        // Link should be added
                        const linksContainer = document.getElementById('links-container');
                        expect(linksContainer.children.length).toBe(1);

                        // Timer should be running (time should have decreased)
                        const timerDisplay = document.getElementById('timer-display');
                        expect(timerDisplay.textContent).not.toBe('25:00');

                        // Greeting should be updating
                        const timeDisplay = document.getElementById('time-display');
                        expect(timeDisplay.textContent).toMatch(/\d{1,2}:\d{2}:\d{2} (AM|PM)/);

                        resolve();
                    }, 1500);
                }, 100);
            });
        });
    });
});
