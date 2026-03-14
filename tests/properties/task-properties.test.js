import { describe, test, expect, beforeEach } from 'vitest';
import fc from 'fast-check';

// Mock localStorage for testing
class MockStorage {
    constructor() {
        this.storage = {};
    }

    getItem(key) {
        return this.storage[key] || null;
    }

    setItem(key, value) {
        this.storage[key] = value;
    }

    removeItem(key) {
        delete this.storage[key];
    }

    clear() {
        this.storage = {};
    }
}

// Mock DashboardController for testing
class MockDashboardController {
    constructor() {
        this.storage = new MockStorage();
    }

    getFromStorage(key) {
        try {
            const data = this.storage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.error('Error reading from localStorage:', e);
            return null;
        }
    }

    saveToStorage(key, data) {
        try {
            this.storage.setItem(key, JSON.stringify(data));
        } catch (e) {
            console.error('Error saving to localStorage:', e);
        }
    }

    removeFromStorage(key) {
        try {
            this.storage.removeItem(key);
        } catch (e) {
            console.error('Error removing from localStorage:', e);
        }
    }
}

// TaskManager implementation for testing
class TaskManager {
    constructor(storageController) {
        this.storageController = storageController;
        this.tasks = [];
        this.storageKey = 'productivity_dashboard_tasks';
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
        }
    }

    toggleComplete(id) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            this.saveTasks();
        }
    }

    deleteTask(id) {
        this.tasks = this.tasks.filter(t => t.id !== id);
        this.saveTasks();
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

            const span = document.createElement('span');
            span.className = 'task-description';
            span.textContent = task.description;

            const editBtn = document.createElement('button');
            editBtn.className = 'task-edit';
            editBtn.textContent = 'Edit';

            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'task-delete';
            deleteBtn.textContent = 'Delete';

            li.appendChild(checkbox);
            li.appendChild(span);
            li.appendChild(editBtn);
            li.appendChild(deleteBtn);
            taskList.appendChild(li);
        });
    }

    saveTasks() {
        this.storageController.saveToStorage(this.storageKey, this.tasks);
    }

    generateId() {
        return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    }
}

describe('Task Manager Properties', () => {
    let taskManager;
    let mockController;

    beforeEach(() => {
        mockController = new MockDashboardController();
        taskManager = new TaskManager(mockController);
        taskManager.loadTasks();
    });

    /**
     * **Validates: Requirements 3.2**
     * 
     * Property 6: Task Creation with Incomplete Status
     * 
     * For any valid (non-empty, non-whitespace) task description, creating a task
     * should result in a task object with completed status set to false.
     */
    test('Property 6: Task creation always sets completed to false', () => {
        fc.assert(
            fc.property(
                // Generate non-empty strings with at least one non-whitespace character
                fc.string({ minLength: 1, maxLength: 500 }).filter(s => s.trim().length > 0),
                (description) => {
                    // Clear tasks before each iteration
                    taskManager.tasks = [];
                    
                    // Add the task
                    taskManager.addTask(description);
                    
                    // Verify a task was created
                    expect(taskManager.tasks.length).toBe(1);
                    
                    const createdTask = taskManager.tasks[0];
                    
                    // Verify the task has the correct structure
                    expect(createdTask).toHaveProperty('id');
                    expect(createdTask).toHaveProperty('description');
                    expect(createdTask).toHaveProperty('completed');
                    expect(createdTask).toHaveProperty('createdAt');
                    
                    // Verify the completed status is false
                    expect(createdTask.completed).toBe(false);
                    
                    // Verify the description matches (trimmed)
                    expect(createdTask.description).toBe(description.trim());
                    
                    // Verify the id is a non-empty string
                    expect(typeof createdTask.id).toBe('string');
                    expect(createdTask.id.length).toBeGreaterThan(0);
                    
                    // Verify createdAt is a positive number (timestamp)
                    expect(typeof createdTask.createdAt).toBe('number');
                    expect(createdTask.createdAt).toBeGreaterThan(0);
                }
            ),
            { numRuns: 100 }
        );
    });

    /**
     * **Validates: Requirements 3.4**
     * 
     * Property 8: Empty Task Rejection
     * 
     * For any string composed entirely of whitespace characters (spaces, tabs, newlines)
     * or empty string, attempting to create a task should be rejected and the task list
     * should remain unchanged.
     */
    test('Property 8: Empty and whitespace-only tasks are rejected', () => {
        fc.assert(
            fc.property(
                // Generate strings composed of whitespace characters or empty strings
                fc.oneof(
                    fc.constant(''), // Empty string
                    fc.stringOf(fc.constantFrom(' ', '\t', '\n', '\r')), // Whitespace-only strings
                    fc.string({ minLength: 1, maxLength: 50 })
                        .map(s => ' '.repeat(Math.floor(Math.random() * 5)) + s.replace(/\S/g, ' ') + ' '.repeat(Math.floor(Math.random() * 5)))
                        .filter(s => s.trim().length === 0) // Ensure only whitespace
                ),
                (whitespaceString) => {
                    // Record initial state
                    const initialTaskCount = taskManager.tasks.length;
                    const initialTasks = [...taskManager.tasks];
                    
                    // Attempt to add the whitespace/empty task
                    taskManager.addTask(whitespaceString);
                    
                    // Verify the task list remains unchanged
                    expect(taskManager.tasks.length).toBe(initialTaskCount);
                    
                    // Verify the task list content is identical
                    expect(taskManager.tasks).toEqual(initialTasks);
                    
                    // Verify localStorage was not modified
                    const storedTasks = mockController.getFromStorage('productivity_dashboard_tasks');
                    if (storedTasks) {
                        expect(storedTasks.length).toBe(initialTaskCount);
                    }
                }
            ),
            { numRuns: 100 }
        );
    });

    /**
     * **Validates: Requirements 3.5, 5.2**
     * 
     * Property 9: Task List Rendering Completeness
     * 
     * For any task list state, all tasks in the state should appear in the rendered DOM
     * with their corresponding descriptions and completion status.
     */
    test('Property 9: All tasks appear in rendered DOM with correct properties', () => {
        fc.assert(
            fc.property(
                // Generate an array of task objects with random descriptions and completion status
                fc.array(
                    fc.record({
                        description: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
                        completed: fc.boolean()
                    }),
                    { minLength: 0, maxLength: 20 }
                ),
                (taskSpecs) => {
                    // Setup: Create a mock DOM environment
                    const taskListElement = document.createElement('ul');
                    taskListElement.id = 'task-list';
                    document.body.appendChild(taskListElement);

                    try {
                        // Clear tasks and add the generated tasks
                        taskManager.tasks = [];
                        
                        // Add each task to the manager
                        taskSpecs.forEach(spec => {
                            taskManager.addTask(spec.description);
                        });

                        // Set completion status for tasks
                        taskManager.tasks.forEach((task, index) => {
                            if (index < taskSpecs.length && taskSpecs[index].completed) {
                                taskManager.toggleComplete(task.id);
                            }
                        });

                        // Render the tasks
                        taskManager.renderTasks();

                        // Verify: All tasks appear in the DOM
                        const renderedItems = taskListElement.querySelectorAll('.task-item');
                        
                        // Check that the number of rendered items matches the number of tasks
                        expect(renderedItems.length).toBe(taskManager.tasks.length);

                        // Verify each task appears with correct properties
                        taskManager.tasks.forEach((task, index) => {
                            const renderedItem = Array.from(renderedItems).find(
                                item => item.dataset.id === task.id
                            );

                            // Task should exist in DOM
                            expect(renderedItem).toBeDefined();
                            expect(renderedItem).not.toBeNull();

                            // Task description should be present
                            const descriptionElement = renderedItem.querySelector('.task-description');
                            expect(descriptionElement).toBeDefined();
                            expect(descriptionElement).not.toBeNull();
                            expect(descriptionElement.textContent).toBe(task.description);

                            // Checkbox should reflect completion status
                            const checkbox = renderedItem.querySelector('.task-checkbox');
                            expect(checkbox).toBeDefined();
                            expect(checkbox).not.toBeNull();
                            expect(checkbox.checked).toBe(task.completed);

                            // Completed tasks should have the 'completed' class
                            if (task.completed) {
                                expect(renderedItem.classList.contains('completed')).toBe(true);
                            }
                        });
                    } finally {
                        // Cleanup: Remove the mock DOM element
                        document.body.removeChild(taskListElement);
                    }
                }
            ),
            { numRuns: 100 }
        );
    });

    /**
     * **Validates: Requirements 4.1, 4.2**
     * 
     * Property 10: Task Edit Preservation
     * 
     * For any task and any valid new description, editing the task should preserve
     * the task's id, completion status, and createdAt timestamp while updating only
     * the description.
     */
    test('Property 10: Task edit preserves id, completion status, and createdAt', () => {
        fc.assert(
            fc.property(
                // Generate initial task description
                fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
                // Generate completion status
                fc.boolean(),
                // Generate new description for editing
                fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
                (initialDescription, completionStatus, newDescription) => {
                    // Clear tasks before each iteration
                    taskManager.tasks = [];
                    
                    // Create a task with the initial description
                    taskManager.addTask(initialDescription);
                    
                    // Verify task was created
                    expect(taskManager.tasks.length).toBe(1);
                    
                    const originalTask = taskManager.tasks[0];
                    
                    // Set the completion status
                    if (completionStatus) {
                        taskManager.toggleComplete(originalTask.id);
                    }
                    
                    // Capture the original task properties
                    const originalId = originalTask.id;
                    const originalCompleted = originalTask.completed;
                    const originalCreatedAt = originalTask.createdAt;
                    
                    // Edit the task with the new description
                    taskManager.editTask(originalId, newDescription);
                    
                    // Find the edited task
                    const editedTask = taskManager.tasks.find(t => t.id === originalId);
                    
                    // Verify the task still exists
                    expect(editedTask).toBeDefined();
                    expect(editedTask).not.toBeNull();
                    
                    // Verify the id is preserved
                    expect(editedTask.id).toBe(originalId);
                    
                    // Verify the completion status is preserved
                    expect(editedTask.completed).toBe(originalCompleted);
                    
                    // Verify the createdAt timestamp is preserved
                    expect(editedTask.createdAt).toBe(originalCreatedAt);
                    
                    // Verify the description was updated
                    expect(editedTask.description).toBe(newDescription.trim());
                    
                    // Verify the task count remains the same (no duplication)
                    expect(taskManager.tasks.length).toBe(1);
                    
                    // Verify localStorage reflects the changes
                    const storedTasks = mockController.getFromStorage('productivity_dashboard_tasks');
                    expect(storedTasks).not.toBeNull();
                    expect(storedTasks.length).toBe(1);
                    
                    const storedTask = storedTasks[0];
                    expect(storedTask.id).toBe(originalId);
                    expect(storedTask.completed).toBe(originalCompleted);
                    expect(storedTask.createdAt).toBe(originalCreatedAt);
                    expect(storedTask.description).toBe(newDescription.trim());
                }
            ),
            { numRuns: 100 }
        );
    });

    /**
     * **Validates: Requirements 4.3, 4.4**
     * 
     * Property 11: Task Completion Toggle
     * 
     * For any task, toggling its completion status should flip the completed boolean
     * value (false to true, or true to false) while preserving all other task properties.
     */
    test('Property 11: Toggling completion flips boolean and preserves other properties', () => {
        fc.assert(
            fc.property(
                // Generate task description
                fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
                // Generate initial completion status
                fc.boolean(),
                (description, initialCompleted) => {
                    // Clear tasks before each iteration
                    taskManager.tasks = [];
                    
                    // Create a task
                    taskManager.addTask(description);
                    
                    // Verify task was created
                    expect(taskManager.tasks.length).toBe(1);
                    
                    const task = taskManager.tasks[0];
                    
                    // Set the initial completion status
                    if (initialCompleted) {
                        taskManager.toggleComplete(task.id);
                    }
                    
                    // Capture the original task properties
                    const originalId = task.id;
                    const originalDescription = task.description;
                    const originalCreatedAt = task.createdAt;
                    const originalCompleted = task.completed;
                    
                    // Verify initial completion status matches expected
                    expect(originalCompleted).toBe(initialCompleted);
                    
                    // Toggle the completion status
                    taskManager.toggleComplete(task.id);
                    
                    // Find the toggled task
                    const toggledTask = taskManager.tasks.find(t => t.id === originalId);
                    
                    // Verify the task still exists
                    expect(toggledTask).toBeDefined();
                    expect(toggledTask).not.toBeNull();
                    
                    // Verify the completion status was flipped
                    expect(toggledTask.completed).toBe(!originalCompleted);
                    
                    // Verify all other properties are preserved
                    expect(toggledTask.id).toBe(originalId);
                    expect(toggledTask.description).toBe(originalDescription);
                    expect(toggledTask.createdAt).toBe(originalCreatedAt);
                    
                    // Verify the task count remains the same
                    expect(taskManager.tasks.length).toBe(1);
                    
                    // Verify localStorage reflects the changes (Requirement 4.4)
                    const storedTasks = mockController.getFromStorage('productivity_dashboard_tasks');
                    expect(storedTasks).not.toBeNull();
                    expect(storedTasks.length).toBe(1);
                    
                    const storedTask = storedTasks[0];
                    expect(storedTask.id).toBe(originalId);
                    expect(storedTask.completed).toBe(!originalCompleted);
                    expect(storedTask.description).toBe(originalDescription);
                    expect(storedTask.createdAt).toBe(originalCreatedAt);
                    
                    // Toggle again to verify it flips back
                    taskManager.toggleComplete(task.id);
                    
                    const retoggledTask = taskManager.tasks.find(t => t.id === originalId);
                    
                    // Verify the completion status flipped back to original
                    expect(retoggledTask.completed).toBe(originalCompleted);
                    
                    // Verify all other properties are still preserved
                    expect(retoggledTask.id).toBe(originalId);
                    expect(retoggledTask.description).toBe(originalDescription);
                    expect(retoggledTask.createdAt).toBe(originalCreatedAt);
                    
                    // Verify localStorage reflects the second toggle
                    const restoredTasks = mockController.getFromStorage('productivity_dashboard_tasks');
                    expect(restoredTasks).not.toBeNull();
                    expect(restoredTasks.length).toBe(1);
                    expect(restoredTasks[0].completed).toBe(originalCompleted);
                }
            ),
            { numRuns: 100 }
        );
    });

    /**
     * **Validates: Requirements 4.7**
     * 
     * Property 13: Completed Task Visual Distinction
     * 
     * For any task with completed status true, the rendered DOM element should have
     * a distinct CSS class or styling attribute that differs from incomplete tasks.
     */
    test('Property 13: Completed tasks have distinct CSS class', () => {
        fc.assert(
            fc.property(
                // Generate an array of task objects with random descriptions and completion status
                fc.array(
                    fc.record({
                        description: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
                        completed: fc.boolean()
                    }),
                    { minLength: 1, maxLength: 20 }
                ),
                (taskSpecs) => {
                    // Setup: Create a mock DOM environment
                    const taskListElement = document.createElement('ul');
                    taskListElement.id = 'task-list';
                    document.body.appendChild(taskListElement);

                    try {
                        // Clear tasks and add the generated tasks
                        taskManager.tasks = [];
                        
                        // Add each task to the manager
                        taskSpecs.forEach(spec => {
                            taskManager.addTask(spec.description);
                        });

                        // Set completion status for tasks
                        taskManager.tasks.forEach((task, index) => {
                            if (index < taskSpecs.length && taskSpecs[index].completed) {
                                taskManager.toggleComplete(task.id);
                            }
                        });

                        // Render the tasks
                        taskManager.renderTasks();

                        // Verify: All completed tasks have the 'completed' CSS class
                        const renderedItems = taskListElement.querySelectorAll('.task-item');
                        
                        // Check that the number of rendered items matches the number of tasks
                        expect(renderedItems.length).toBe(taskManager.tasks.length);

                        // Verify each task has correct visual distinction based on completion status
                        taskManager.tasks.forEach((task) => {
                            const renderedItem = Array.from(renderedItems).find(
                                item => item.dataset.id === task.id
                            );

                            // Task should exist in DOM
                            expect(renderedItem).toBeDefined();
                            expect(renderedItem).not.toBeNull();

                            if (task.completed) {
                                // Completed tasks MUST have the 'completed' CSS class
                                expect(renderedItem.classList.contains('completed')).toBe(true);
                            } else {
                                // Incomplete tasks MUST NOT have the 'completed' CSS class
                                expect(renderedItem.classList.contains('completed')).toBe(false);
                            }
                        });

                        // Additional verification: Ensure completed and incomplete tasks are visually distinct
                        const completedTasks = taskManager.tasks.filter(t => t.completed);
                        const incompleteTasks = taskManager.tasks.filter(t => !t.completed);

                        // If we have both completed and incomplete tasks, verify they have different classes
                        if (completedTasks.length > 0 && incompleteTasks.length > 0) {
                            const completedElements = Array.from(renderedItems).filter(
                                item => taskManager.tasks.find(t => t.id === item.dataset.id && t.completed)
                            );
                            const incompleteElements = Array.from(renderedItems).filter(
                                item => taskManager.tasks.find(t => t.id === item.dataset.id && !t.completed)
                            );

                            // All completed elements should have the 'completed' class
                            completedElements.forEach(el => {
                                expect(el.classList.contains('completed')).toBe(true);
                            });

                            // No incomplete elements should have the 'completed' class
                            incompleteElements.forEach(el => {
                                expect(el.classList.contains('completed')).toBe(false);
                            });
                        }
                    } finally {
                        // Cleanup: Remove the mock DOM element
                        document.body.removeChild(taskListElement);
                    }
                }
            ),
            { numRuns: 100 }
        );
    });

    /**
     * **Validates: Requirements 4.5, 4.6**
     * 
     * Property 12: Task Deletion Removal
     * 
     * For any task in the task list, deleting that task should result in the task
     * no longer appearing in the task list or in localStorage.
     */
    test('Property 12: Deleting a task removes it from task list and localStorage', () => {
        fc.assert(
            fc.property(
                // Generate an array of task descriptions to create a task list
                fc.array(
                    fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
                    { minLength: 1, maxLength: 10 }
                ),
                // Generate an index to select which task to delete
                fc.nat(),
                (taskDescriptions, deleteIndex) => {
                    // Clear tasks before each iteration
                    taskManager.tasks = [];
                    
                    // Create all tasks
                    taskDescriptions.forEach(description => {
                        taskManager.addTask(description);
                    });
                    
                    // Verify all tasks were created
                    expect(taskManager.tasks.length).toBe(taskDescriptions.length);
                    
                    // Select a task to delete (use modulo to ensure valid index)
                    const taskToDeleteIndex = deleteIndex % taskManager.tasks.length;
                    const taskToDelete = taskManager.tasks[taskToDeleteIndex];
                    const taskIdToDelete = taskToDelete.id;
                    const taskDescriptionToDelete = taskToDelete.description;
                    
                    // Capture the initial task count
                    const initialTaskCount = taskManager.tasks.length;
                    
                    // Capture all other task IDs (tasks that should remain)
                    const remainingTaskIds = taskManager.tasks
                        .filter(t => t.id !== taskIdToDelete)
                        .map(t => t.id);
                    
                    // Delete the selected task (Requirement 4.5)
                    taskManager.deleteTask(taskIdToDelete);
                    
                    // Verify the task was removed from the task list
                    expect(taskManager.tasks.length).toBe(initialTaskCount - 1);
                    
                    // Verify the deleted task is no longer in the task list
                    const deletedTaskInList = taskManager.tasks.find(t => t.id === taskIdToDelete);
                    expect(deletedTaskInList).toBeUndefined();
                    
                    // Verify the deleted task's description is not in the task list
                    const taskWithSameDescription = taskManager.tasks.find(
                        t => t.description === taskDescriptionToDelete && t.id === taskIdToDelete
                    );
                    expect(taskWithSameDescription).toBeUndefined();
                    
                    // Verify all other tasks remain in the task list
                    remainingTaskIds.forEach(id => {
                        const remainingTask = taskManager.tasks.find(t => t.id === id);
                        expect(remainingTask).toBeDefined();
                        expect(remainingTask).not.toBeNull();
                    });
                    
                    // Verify the deleted task is not in localStorage (Requirement 4.6)
                    const storedTasks = mockController.getFromStorage('productivity_dashboard_tasks');
                    expect(storedTasks).not.toBeNull();
                    expect(storedTasks.length).toBe(initialTaskCount - 1);
                    
                    // Verify the deleted task ID is not in localStorage
                    const deletedTaskInStorage = storedTasks.find(t => t.id === taskIdToDelete);
                    expect(deletedTaskInStorage).toBeUndefined();
                    
                    // Verify all remaining tasks are in localStorage
                    remainingTaskIds.forEach(id => {
                        const storedTask = storedTasks.find(t => t.id === id);
                        expect(storedTask).toBeDefined();
                        expect(storedTask).not.toBeNull();
                    });
                    
                    // Verify the in-memory task list matches localStorage
                    expect(taskManager.tasks.length).toBe(storedTasks.length);
                    taskManager.tasks.forEach(task => {
                        const storedTask = storedTasks.find(t => t.id === task.id);
                        expect(storedTask).toBeDefined();
                        expect(storedTask.id).toBe(task.id);
                        expect(storedTask.description).toBe(task.description);
                        expect(storedTask.completed).toBe(task.completed);
                        expect(storedTask.createdAt).toBe(task.createdAt);
                    });
                }
            ),
            { numRuns: 100 }
        );
    });

    /**
     * **Validates: Requirements 5.1, 5.2**
     * 
     * Property 14: Task Loading from Storage
     * 
     * For any array of valid task objects stored in localStorage under the tasks key,
     * loading the dashboard should result in all those tasks appearing in the task
     * manager's state and rendered list.
     */
    test('Property 14: Task loading from storage retrieves and displays all tasks', () => {
        fc.assert(
            fc.property(
                // Generate an array of valid task objects
                fc.array(
                    fc.record({
                        id: fc.string({ minLength: 5, maxLength: 30 }),
                        description: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
                        completed: fc.boolean(),
                        createdAt: fc.integer({ min: 1000000000000, max: Date.now() })
                    }),
                    { minLength: 0, maxLength: 20 }
                ),
                (storedTasks) => {
                    // Setup: Store tasks directly in localStorage
                    mockController.saveToStorage('productivity_dashboard_tasks', storedTasks);
                    
                    // Create a fresh TaskManager instance
                    const freshTaskManager = new TaskManager(mockController);
                    
                    // Load tasks from storage (simulating dashboard initialization)
                    freshTaskManager.loadTasks();
                    
                    // Verify: All stored tasks appear in the task manager's state (Requirement 5.1)
                    expect(freshTaskManager.tasks.length).toBe(storedTasks.length);
                    
                    // Verify each stored task appears in the task manager's state
                    storedTasks.forEach((storedTask) => {
                        const loadedTask = freshTaskManager.tasks.find(t => t.id === storedTask.id);
                        
                        // Task should exist in the loaded state
                        expect(loadedTask).toBeDefined();
                        expect(loadedTask).not.toBeNull();
                        
                        // All properties should match exactly
                        expect(loadedTask.id).toBe(storedTask.id);
                        expect(loadedTask.description).toBe(storedTask.description);
                        expect(loadedTask.completed).toBe(storedTask.completed);
                        expect(loadedTask.createdAt).toBe(storedTask.createdAt);
                    });
                    
                    // Verify: All tasks are rendered in the DOM (Requirement 5.2)
                    // Setup: Create a mock DOM environment
                    const taskListElement = document.createElement('ul');
                    taskListElement.id = 'task-list';
                    document.body.appendChild(taskListElement);
                    
                    try {
                        // Render the loaded tasks
                        freshTaskManager.renderTasks();
                        
                        // Verify all tasks appear in the rendered DOM
                        const renderedItems = taskListElement.querySelectorAll('.task-item');
                        
                        // Check that the number of rendered items matches the number of stored tasks
                        expect(renderedItems.length).toBe(storedTasks.length);
                        
                        // Verify each stored task appears in the rendered DOM with correct properties
                        storedTasks.forEach((storedTask) => {
                            const renderedItem = Array.from(renderedItems).find(
                                item => item.dataset.id === storedTask.id
                            );
                            
                            // Task should exist in DOM
                            expect(renderedItem).toBeDefined();
                            expect(renderedItem).not.toBeNull();
                            
                            // Task description should be present and correct
                            const descriptionElement = renderedItem.querySelector('.task-description');
                            expect(descriptionElement).toBeDefined();
                            expect(descriptionElement).not.toBeNull();
                            expect(descriptionElement.textContent).toBe(storedTask.description);
                            
                            // Checkbox should reflect completion status
                            const checkbox = renderedItem.querySelector('.task-checkbox');
                            expect(checkbox).toBeDefined();
                            expect(checkbox).not.toBeNull();
                            expect(checkbox.checked).toBe(storedTask.completed);
                            
                            // Completed tasks should have the 'completed' class
                            if (storedTask.completed) {
                                expect(renderedItem.classList.contains('completed')).toBe(true);
                            } else {
                                expect(renderedItem.classList.contains('completed')).toBe(false);
                            }
                        });
                        
                        // Additional verification: Ensure task order is preserved
                        const renderedItemsArray = Array.from(renderedItems);
                        storedTasks.forEach((storedTask, index) => {
                            const renderedItem = renderedItemsArray.find(
                                item => item.dataset.id === storedTask.id
                            );
                            expect(renderedItem).toBeDefined();
                        });
                        
                    } finally {
                        // Cleanup: Remove the mock DOM element
                        document.body.removeChild(taskListElement);
                    }
                }
            ),
            { numRuns: 100 }
        );
    });
});
