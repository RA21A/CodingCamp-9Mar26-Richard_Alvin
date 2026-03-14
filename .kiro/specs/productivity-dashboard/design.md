# Design Document: Productivity Dashboard

## Overview

The Productivity Dashboard is a single-page web application built with vanilla JavaScript that provides four core productivity features: a time-based greeting display, a Pomodoro focus timer, a to-do list manager, and a quick links panel. The application runs entirely in the browser with no backend dependencies, using localStorage for data persistence.

The design emphasizes simplicity and maintainability with a minimal file structure (one HTML, one CSS, one JS file) and no build process. The application follows a component-based architecture where each feature is encapsulated in its own module with clear responsibilities and interfaces.

Key design principles:
- Client-side only architecture with localStorage persistence
- Component-based modular design for maintainability
- Event-driven communication between components
- Responsive layout supporting 320px to 2560px viewports
- Progressive enhancement with graceful degradation

## Architecture

### System Architecture

The application follows a modular component architecture with a central controller coordinating between independent feature modules:

```
┌─────────────────────────────────────────────────────────┐
│                     index.html                          │
│  ┌───────────────────────────────────────────────────┐ │
│  │              Dashboard Controller                  │ │
│  │  - Initializes components                         │ │
│  │  - Manages component lifecycle                    │ │
│  │  - Coordinates localStorage access                │ │
│  └───────────────────────────────────────────────────┘ │
│         │           │           │           │           │
│         ▼           ▼           ▼           ▼           │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ │
│  │ Greeting │ │  Focus   │ │   Task   │ │  Quick   │ │
│  │ Display  │ │  Timer   │ │ Manager  │ │  Links   │ │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ │
│         │           │           │           │           │
│         └───────────┴───────────┴───────────┘           │
│                         │                                │
│                         ▼                                │
│              ┌──────────────────────┐                   │
│              │  localStorage API    │                   │
│              └──────────────────────┘                   │
└─────────────────────────────────────────────────────────┘
```

### Component Responsibilities

1. **Dashboard Controller**: Entry point that initializes all components, manages the application lifecycle, and provides shared utilities for localStorage access.

2. **Greeting Display Component**: Manages time/date display and contextual greeting. Updates every second using setInterval.

3. **Focus Timer Component**: Implements 25-minute Pomodoro timer with start/stop/reset controls. Manages countdown state and displays completion notifications.

4. **Task Manager Component**: Handles CRUD operations for tasks, manages task state (complete/incomplete), and synchronizes with localStorage.

5. **Quick Links Panel Component**: Manages favorite website links with add/delete operations and localStorage synchronization.

### Data Flow

1. **Initialization Flow**:
   - Dashboard Controller loads
   - Each component initializes and registers event listeners
   - Components load persisted data from localStorage
   - Components render initial UI state

2. **User Interaction Flow**:
   - User triggers UI event (click, submit, etc.)
   - Component handles event and updates internal state
   - Component persists state changes to localStorage
   - Component updates DOM to reflect new state

3. **Timer Update Flow**:
   - setInterval triggers every second
   - Greeting Display updates time/date/greeting
   - Focus Timer (if running) decrements countdown and updates display

## Components and Interfaces

### Dashboard Controller

**Responsibilities**:
- Initialize all components on DOMContentLoaded
- Provide shared localStorage utility functions
- Handle global error scenarios

**Public Interface**:
```javascript
class DashboardController {
  init(): void
  getFromStorage(key: string): any
  saveToStorage(key: string, data: any): void
  removeFromStorage(key: string): void
}
```

### Greeting Display Component

**Responsibilities**:
- Display current time in 12-hour format with AM/PM
- Display current date in readable format
- Show contextual greeting based on time of day
- Update display every second

**Public Interface**:
```javascript
class GreetingDisplay {
  init(): void
  updateDisplay(): void
  getGreeting(hour: number): string
  formatTime(date: Date): string
  formatDate(date: Date): string
}
```

**DOM Structure**:
```html
<div id="greeting-section">
  <div id="time-display">HH:MM:SS AM/PM</div>
  <div id="date-display">Day, Month Date, Year</div>
  <div id="greeting-text">Good Morning/Afternoon/Evening/Night</div>
</div>
```

### Focus Timer Component

**Responsibilities**:
- Manage 25-minute countdown timer
- Handle start/stop/reset controls
- Display time in MM:SS format
- Show completion notification when timer reaches zero

**Public Interface**:
```javascript
class FocusTimer {
  init(): void
  start(): void
  stop(): void
  reset(): void
  tick(): void
  formatTime(seconds: number): string
  showCompletionNotification(): void
}
```

**State**:
```javascript
{
  remainingSeconds: number,  // 0 to 1500 (25 minutes)
  isRunning: boolean,
  intervalId: number | null
}
```

**DOM Structure**:
```html
<div id="timer-section">
  <h2>Focus Timer</h2>
  <div id="timer-display">25:00</div>
  <div id="timer-controls">
    <button id="timer-start">Start</button>
    <button id="timer-stop">Stop</button>
    <button id="timer-reset">Reset</button>
  </div>
  <div id="timer-notification" class="hidden"></div>
</div>
```

### Task Manager Component

**Responsibilities**:
- Create, read, update, delete tasks
- Toggle task completion status
- Persist tasks to localStorage
- Render task list with visual distinction for completed tasks

**Public Interface**:
```javascript
class TaskManager {
  init(): void
  loadTasks(): void
  addTask(description: string): void
  editTask(id: string, newDescription: string): void
  toggleComplete(id: string): void
  deleteTask(id: string): void
  renderTasks(): void
  saveTasks(): void
}
```

**State**:
```javascript
{
  tasks: Array<{
    id: string,
    description: string,
    completed: boolean,
    createdAt: number
  }>
}
```

**DOM Structure**:
```html
<div id="task-section">
  <h2>To-Do List</h2>
  <form id="task-form">
    <input type="text" id="task-input" placeholder="Add a new task..." />
    <button type="submit">Add</button>
  </form>
  <ul id="task-list">
    <!-- Task items rendered here -->
    <li class="task-item" data-id="...">
      <input type="checkbox" class="task-checkbox" />
      <span class="task-description">Task text</span>
      <button class="task-edit">Edit</button>
      <button class="task-delete">Delete</button>
    </li>
  </ul>
</div>
```

### Quick Links Panel Component

**Responsibilities**:
- Add and delete quick links
- Open links in new tabs
- Persist links to localStorage
- Validate URL and name inputs

**Public Interface**:
```javascript
class QuickLinksPanel {
  init(): void
  loadLinks(): void
  addLink(name: string, url: string): void
  deleteLink(id: string): void
  openLink(url: string): void
  renderLinks(): void
  saveLinks(): void
  validateUrl(url: string): boolean
}
```

**State**:
```javascript
{
  links: Array<{
    id: string,
    name: string,
    url: string,
    createdAt: number
  }>
}
```

**DOM Structure**:
```html
<div id="links-section">
  <h2>Quick Links</h2>
  <form id="link-form">
    <input type="text" id="link-name" placeholder="Website name..." />
    <input type="url" id="link-url" placeholder="https://..." />
    <button type="submit">Add</button>
  </form>
  <div id="links-container">
    <!-- Link items rendered here -->
    <div class="link-item" data-id="...">
      <a href="..." target="_blank" class="link-anchor">Name</a>
      <button class="link-delete">Delete</button>
    </div>
  </div>
</div>
```

## Data Models

### Task Model

```javascript
{
  id: string,           // UUID v4 or timestamp-based unique identifier
  description: string,  // Task description text (1-500 characters)
  completed: boolean,   // Completion status
  createdAt: number     // Unix timestamp in milliseconds
}
```

**Validation Rules**:
- `id`: Must be unique, non-empty string
- `description`: Must be non-empty after trimming whitespace, max 500 characters
- `completed`: Must be boolean
- `createdAt`: Must be positive number

**localStorage Key**: `productivity_dashboard_tasks`

**Storage Format**: JSON array of task objects

### Quick Link Model

```javascript
{
  id: string,           // UUID v4 or timestamp-based unique identifier
  name: string,         // Display name for the link (1-100 characters)
  url: string,          // Valid URL starting with http:// or https://
  createdAt: number     // Unix timestamp in milliseconds
}
```

**Validation Rules**:
- `id`: Must be unique, non-empty string
- `name`: Must be non-empty after trimming whitespace, max 100 characters
- `url`: Must be valid URL format with http:// or https:// protocol
- `createdAt`: Must be positive number

**localStorage Key**: `productivity_dashboard_links`

**Storage Format**: JSON array of link objects

### Timer State Model

The timer state is ephemeral (not persisted) and exists only in memory:

```javascript
{
  remainingSeconds: number,  // 0 to 1500 (25 minutes = 1500 seconds)
  isRunning: boolean,        // Whether timer is actively counting down
  intervalId: number | null  // setInterval ID for cleanup
}
```

### Greeting Time Ranges

The greeting display uses these time ranges (24-hour format):

```javascript
{
  "Good Morning": [5, 11],    // 5:00 AM to 11:59 AM
  "Good Afternoon": [12, 16], // 12:00 PM to 4:59 PM
  "Good Evening": [17, 20],   // 5:00 PM to 8:59 PM
  "Good Night": [21, 4]       // 9:00 PM to 4:59 AM
}
```

**Note**: The "Good Night" range wraps around midnight (21-23 and 0-4).


## Correctness Properties

A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.

### Property 1: Time Format Correctness

For any Date object, the formatted time output should be in 12-hour format with hours (1-12), minutes (00-59), seconds (00-59), and AM/PM designation.

**Validates: Requirements 1.1**

### Property 2: Date Format Readability

For any Date object, the formatted date output should include the day of week, month name, day of month, and full year in a human-readable format.

**Validates: Requirements 1.2**

### Property 3: Greeting Correctness by Hour

For any hour (0-23), the greeting function should return the correct greeting: "Good Morning" for hours 5-11, "Good Afternoon" for hours 12-16, "Good Evening" for hours 17-20, and "Good Night" for hours 21-23 and 0-4.

**Validates: Requirements 1.3, 1.4, 1.5, 1.6**

### Property 4: Timer Reset Idempotence

For any timer state (any number of remaining seconds, running or stopped), calling reset should set the remaining seconds to 1500 (25 minutes) and stop the timer.

**Validates: Requirements 2.4**

### Property 5: Timer Format Correctness

For any number of seconds between 0 and 1500, the formatted timer display should be in MM:SS format where MM is zero-padded minutes (00-25) and SS is zero-padded seconds (00-59).

**Validates: Requirements 2.6**

### Property 6: Task Creation with Incomplete Status

For any valid (non-empty, non-whitespace) task description, creating a task should result in a task object with completed status set to false.

**Validates: Requirements 3.2**

### Property 7: Task Persistence Round-Trip

For any sequence of task operations (create, edit, toggle complete, delete), the tasks in localStorage should exactly match the current task list state after each operation.

**Validates: Requirements 3.3, 4.2, 4.4, 4.6, 5.4**

### Property 8: Empty Task Rejection

For any string composed entirely of whitespace characters (spaces, tabs, newlines) or empty string, attempting to create a task should be rejected and the task list should remain unchanged.

**Validates: Requirements 3.4**

### Property 9: Task List Rendering Completeness

For any task list state, all tasks in the state should appear in the rendered DOM with their corresponding descriptions and completion status.

**Validates: Requirements 3.5, 5.2**

### Property 10: Task Edit Preservation

For any task and any valid new description, editing the task should preserve the task's id, completion status, and createdAt timestamp while updating only the description.

**Validates: Requirements 4.1, 4.2**

### Property 11: Task Completion Toggle

For any task, toggling its completion status should flip the completed boolean value (false to true, or true to false) while preserving all other task properties.

**Validates: Requirements 4.3, 4.4**

### Property 12: Task Deletion Removal

For any task in the task list, deleting that task should result in the task no longer appearing in the task list or in localStorage.

**Validates: Requirements 4.5, 4.6**

### Property 13: Completed Task Visual Distinction

For any task with completed status true, the rendered DOM element should have a distinct CSS class or styling attribute that differs from incomplete tasks.

**Validates: Requirements 4.7**

### Property 14: Task Loading from Storage

For any array of valid task objects stored in localStorage under the tasks key, loading the dashboard should result in all those tasks appearing in the task manager's state and rendered list.

**Validates: Requirements 5.1, 5.2**

### Property 15: Quick Link Creation

For any valid name (non-empty string) and valid URL (string starting with http:// or https://), creating a quick link should result in a link object with both properties stored correctly.

**Validates: Requirements 6.2**

### Property 16: Quick Link Persistence Round-Trip

For any sequence of quick link operations (create, delete), the links in localStorage should exactly match the current quick links state after each operation.

**Validates: Requirements 6.3, 6.7, 7.4**

### Property 17: Invalid Quick Link Rejection

For any input where the name is empty/whitespace-only OR the URL is empty/whitespace-only OR the URL does not start with http:// or https://, attempting to create a quick link should be rejected and the links list should remain unchanged.

**Validates: Requirements 6.4**

### Property 18: Quick Link Deletion Removal

For any quick link in the links list, deleting that link should result in the link no longer appearing in the links list or in localStorage.

**Validates: Requirements 6.6, 6.7**

### Property 19: Quick Link Loading from Storage

For any array of valid link objects stored in localStorage under the links key, loading the dashboard should result in all those links appearing in the quick links panel's state and rendered list.

**Validates: Requirements 7.1, 7.2**


## Error Handling

### localStorage Errors

**Scenario**: localStorage is unavailable (private browsing, quota exceeded, disabled)

**Handling Strategy**:
- Wrap all localStorage operations in try-catch blocks
- If localStorage is unavailable, display a warning message to the user
- Gracefully degrade to in-memory storage for the current session
- Log errors to console for debugging

**Implementation**:
```javascript
function safeStorageOperation(operation) {
  try {
    return operation();
  } catch (e) {
    console.error('localStorage error:', e);
    showWarning('Data persistence unavailable. Changes will not be saved.');
    return null;
  }
}
```

### Invalid Data in localStorage

**Scenario**: localStorage contains corrupted or invalid JSON data

**Handling Strategy**:
- Wrap JSON.parse operations in try-catch blocks
- If parsing fails, clear the corrupted data and start fresh
- Log the error for debugging
- Initialize with empty arrays

**Implementation**:
```javascript
function loadFromStorage(key, defaultValue) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch (e) {
    console.error('Failed to parse storage data:', e);
    localStorage.removeItem(key);
    return defaultValue;
  }
}
```

### Input Validation Errors

**Scenario**: User submits invalid input (empty task, invalid URL, etc.)

**Handling Strategy**:
- Validate all user inputs before processing
- Display inline error messages near the input field
- Prevent form submission for invalid inputs
- Clear error messages when user corrects input

**Validation Rules**:
- Task description: Must be non-empty after trimming, max 500 characters
- Link name: Must be non-empty after trimming, max 100 characters
- Link URL: Must match URL pattern with http:// or https:// protocol

### Timer Edge Cases

**Scenario**: Timer reaches zero or negative values

**Handling Strategy**:
- Clamp timer values to valid range (0-1500 seconds)
- Stop timer automatically when reaching zero
- Display completion notification
- Prevent negative values through validation

**Implementation**:
```javascript
function tick() {
  if (this.remainingSeconds <= 0) {
    this.remainingSeconds = 0;
    this.stop();
    this.showCompletionNotification();
    return;
  }
  this.remainingSeconds--;
  this.updateDisplay();
}
```

### DOM Manipulation Errors

**Scenario**: Required DOM elements are missing or not yet loaded

**Handling Strategy**:
- Initialize all components only after DOMContentLoaded event
- Check for element existence before manipulation
- Log errors if critical elements are missing
- Fail gracefully without breaking other components

**Implementation**:
```javascript
function init() {
  const element = document.getElementById('required-element');
  if (!element) {
    console.error('Required element not found');
    return;
  }
  // Proceed with initialization
}
```

### Concurrent Modification

**Scenario**: Multiple tabs modify localStorage simultaneously

**Handling Strategy**:
- Listen for storage events to detect external changes
- Reload data when storage event is detected
- Re-render affected components
- Maintain consistency across tabs

**Implementation**:
```javascript
window.addEventListener('storage', (e) => {
  if (e.key === 'productivity_dashboard_tasks') {
    this.loadTasks();
    this.renderTasks();
  }
});
```

## Testing Strategy

### Overview

The testing strategy employs a dual approach combining unit tests for specific examples and edge cases with property-based tests for universal correctness guarantees. This ensures both concrete behavior validation and comprehensive input coverage.

### Testing Framework Selection

**Unit Testing**: Jest (or Vitest for faster execution)
- Widely adopted, excellent documentation
- Built-in mocking and DOM testing support (jsdom)
- Snapshot testing for UI components

**Property-Based Testing**: fast-check
- Mature JavaScript property-based testing library
- Excellent TypeScript support
- Configurable generators for complex data types
- Shrinking support for minimal failing examples

### Unit Testing Approach

Unit tests focus on:
- Specific examples demonstrating correct behavior
- Edge cases and boundary conditions
- Error handling scenarios
- Component integration points

**Example Unit Tests**:

```javascript
describe('GreetingDisplay', () => {
  test('shows "Good Morning" at 8 AM', () => {
    const greeting = getGreeting(8);
    expect(greeting).toBe('Good Morning');
  });

  test('shows "Good Night" at midnight', () => {
    const greeting = getGreeting(0);
    expect(greeting).toBe('Good Night');
  });

  test('timer initializes to 25 minutes', () => {
    const timer = new FocusTimer();
    timer.init();
    expect(timer.remainingSeconds).toBe(1500);
  });

  test('timer shows notification at zero', () => {
    const timer = new FocusTimer();
    timer.remainingSeconds = 0;
    timer.tick();
    expect(document.querySelector('#timer-notification')).toBeVisible();
  });
});
```

### Property-Based Testing Approach

Property tests verify universal properties across randomized inputs with minimum 100 iterations per test. Each property test references its corresponding design document property.

**Configuration**:
```javascript
import fc from 'fast-check';

// Configure for minimum 100 runs
const testConfig = { numRuns: 100 };
```

**Example Property Tests**:

```javascript
describe('Correctness Properties', () => {
  // Feature: productivity-dashboard, Property 1: Time Format Correctness
  test('Property 1: Time format is always 12-hour with AM/PM', () => {
    fc.assert(
      fc.property(
        fc.date(), // Generate random dates
        (date) => {
          const formatted = formatTime(date);
          // Verify format: HH:MM:SS AM/PM
          const regex = /^(0?[1-9]|1[0-2]):[0-5][0-9]:[0-5][0-9] (AM|PM)$/;
          expect(formatted).toMatch(regex);
        }
      ),
      testConfig
    );
  });

  // Feature: productivity-dashboard, Property 3: Greeting Correctness by Hour
  test('Property 3: Greeting matches hour range', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 23 }), // Generate random hours
        (hour) => {
          const greeting = getGreeting(hour);
          if (hour >= 5 && hour <= 11) {
            expect(greeting).toBe('Good Morning');
          } else if (hour >= 12 && hour <= 16) {
            expect(greeting).toBe('Good Afternoon');
          } else if (hour >= 17 && hour <= 20) {
            expect(greeting).toBe('Good Evening');
          } else {
            expect(greeting).toBe('Good Night');
          }
        }
      ),
      testConfig
    );
  });

  // Feature: productivity-dashboard, Property 5: Timer Format Correctness
  test('Property 5: Timer format is always MM:SS', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 1500 }), // Generate random seconds
        (seconds) => {
          const formatted = formatTimerDisplay(seconds);
          const regex = /^[0-2][0-9]:[0-5][0-9]$/;
          expect(formatted).toMatch(regex);
          
          // Verify correctness
          const [mins, secs] = formatted.split(':').map(Number);
          expect(mins * 60 + secs).toBe(seconds);
        }
      ),
      testConfig
    );
  });

  // Feature: productivity-dashboard, Property 7: Task Persistence Round-Trip
  test('Property 7: Task operations persist correctly', () => {
    fc.assert(
      fc.property(
        fc.array(fc.record({
          description: fc.string({ minLength: 1, maxLength: 100 }),
          completed: fc.boolean()
        })),
        (tasks) => {
          // Create tasks
          const manager = new TaskManager();
          tasks.forEach(t => manager.addTask(t.description));
          
          // Verify localStorage matches state
          const stored = JSON.parse(localStorage.getItem('productivity_dashboard_tasks'));
          expect(stored.length).toBe(tasks.length);
          
          // Toggle some completions
          if (stored.length > 0) {
            manager.toggleComplete(stored[0].id);
            const updated = JSON.parse(localStorage.getItem('productivity_dashboard_tasks'));
            expect(updated[0].completed).toBe(!stored[0].completed);
          }
        }
      ),
      testConfig
    );
  });

  // Feature: productivity-dashboard, Property 8: Empty Task Rejection
  test('Property 8: Whitespace-only tasks are rejected', () => {
    fc.assert(
      fc.property(
        fc.stringOf(fc.constantFrom(' ', '\t', '\n')), // Generate whitespace strings
        (whitespace) => {
          const manager = new TaskManager();
          const initialLength = manager.tasks.length;
          manager.addTask(whitespace);
          expect(manager.tasks.length).toBe(initialLength);
        }
      ),
      testConfig
    );
  });

  // Feature: productivity-dashboard, Property 11: Task Completion Toggle
  test('Property 11: Toggling completion flips boolean', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 100 }),
        fc.boolean(),
        (description, initialCompleted) => {
          const manager = new TaskManager();
          const task = { id: '1', description, completed: initialCompleted };
          manager.tasks = [task];
          
          manager.toggleComplete('1');
          expect(manager.tasks[0].completed).toBe(!initialCompleted);
          
          manager.toggleComplete('1');
          expect(manager.tasks[0].completed).toBe(initialCompleted);
        }
      ),
      testConfig
    );
  });

  // Feature: productivity-dashboard, Property 17: Invalid Quick Link Rejection
  test('Property 17: Invalid URLs are rejected', () => {
    fc.assert(
      fc.property(
        fc.string(),
        fc.string(),
        (name, url) => {
          // Only test invalid URLs
          if (url.startsWith('http://') || url.startsWith('https://')) {
            return; // Skip valid URLs
          }
          
          const panel = new QuickLinksPanel();
          const initialLength = panel.links.length;
          panel.addLink(name, url);
          expect(panel.links.length).toBe(initialLength);
        }
      ),
      testConfig
    );
  });
});
```

### Test Organization

```
tests/
├── unit/
│   ├── greeting-display.test.js
│   ├── focus-timer.test.js
│   ├── task-manager.test.js
│   └── quick-links-panel.test.js
├── properties/
│   ├── greeting-properties.test.js
│   ├── timer-properties.test.js
│   ├── task-properties.test.js
│   └── links-properties.test.js
└── integration/
    └── dashboard.test.js
```

### Mocking Strategy

**localStorage Mocking**:
```javascript
beforeEach(() => {
  const storage = {};
  global.localStorage = {
    getItem: (key) => storage[key] || null,
    setItem: (key, value) => { storage[key] = value; },
    removeItem: (key) => { delete storage[key]; },
    clear: () => { Object.keys(storage).forEach(k => delete storage[k]); }
  };
});
```

**Timer Mocking**:
```javascript
beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});
```

### Coverage Goals

- Unit test coverage: 80%+ for all components
- Property test coverage: 100% of correctness properties
- Edge case coverage: All identified edge cases tested
- Error handling coverage: All error scenarios tested

### Continuous Integration

Tests should run on:
- Every commit (pre-commit hook)
- Every pull request
- Before deployment

**CI Configuration**:
- Run unit tests first (fast feedback)
- Run property tests with 100 iterations
- Fail build if any test fails
- Generate coverage reports

### Manual Testing Checklist

While automated tests cover functional correctness, manual testing should verify:
- Visual appearance across different screen sizes (320px, 768px, 1024px, 1920px, 2560px)
- Browser compatibility (Chrome 90+, Firefox 88+, Edge 90+, Safari 14+)
- Accessibility with keyboard navigation
- Accessibility with screen readers
- Performance on slower devices
- localStorage behavior in private browsing mode

