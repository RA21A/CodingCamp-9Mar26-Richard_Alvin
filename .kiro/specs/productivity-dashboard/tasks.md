# Implementation Plan: Productivity Dashboard

## Overview

This plan implements a single-page productivity dashboard with vanilla JavaScript, HTML, and CSS. The implementation follows a component-based architecture with localStorage persistence, no build process required. The plan progresses from basic structure through individual components to integration and testing.

## Tasks

- [x] 1. Set up project structure and HTML foundation
  - Create root directory with index.html
  - Create css/ directory with styles.css
  - Create js/ directory with dashboard.js
  - Set up basic HTML structure with all required sections (greeting, timer, tasks, links)
  - Link CSS and JavaScript files
  - Add meta tags for responsive viewport
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 8.3_

- [x] 2. Implement Dashboard Controller and localStorage utilities
  - [x] 2.1 Create DashboardController class with initialization
    - Implement init() method to initialize on DOMContentLoaded
    - Create getFromStorage(), saveToStorage(), removeFromStorage() utility methods
    - Add error handling for localStorage unavailability
    - _Requirements: 5.3, 5.4, 7.3, 7.4_
  
  - [x] 2.2 Write property test for localStorage round-trip
    - **Property 7: Task Persistence Round-Trip**
    - **Validates: Requirements 3.3, 4.2, 4.4, 4.6, 5.4**
  
  - [x] 2.3 Write property test for quick links persistence
    - **Property 16: Quick Link Persistence Round-Trip**
    - **Validates: Requirements 6.3, 6.7, 7.4**

- [x] 3. Implement Greeting Display Component
  - [x] 3.1 Create GreetingDisplay class with time/date formatting
    - Implement formatTime() for 12-hour format with AM/PM
    - Implement formatDate() for readable date format
    - Implement getGreeting() with hour-based logic (5-11: Morning, 12-16: Afternoon, 17-20: Evening, 21-4: Night)
    - Create updateDisplay() method to update DOM elements
    - Set up setInterval to update every second
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7_
  
  - [x] 3.2 Write property tests for greeting component
    - **Property 1: Time Format Correctness**
    - **Validates: Requirements 1.1**
  
  - [x] 3.3 Write property test for date formatting
    - **Property 2: Date Format Readability**
    - **Validates: Requirements 1.2**
  
  - [x] 3.4 Write property test for greeting correctness
    - **Property 3: Greeting Correctness by Hour**
    - **Validates: Requirements 1.3, 1.4, 1.5, 1.6**

- [x] 4. Implement Focus Timer Component
  - [x] 4.1 Create FocusTimer class with state management
    - Initialize state with remainingSeconds (1500), isRunning (false), intervalId (null)
    - Implement start() method to begin countdown
    - Implement stop() method to pause countdown
    - Implement reset() method to return to 25 minutes
    - Implement tick() method to decrement time and handle zero
    - Implement formatTime() to convert seconds to MM:SS format
    - Implement showCompletionNotification() for timer completion
    - Add event listeners for start/stop/reset buttons
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7_
  
  - [x] 4.2 Write property test for timer reset
    - **Property 4: Timer Reset Idempotence**
    - **Validates: Requirements 2.4**
  
  - [x] 4.3 Write property test for timer format
    - **Property 5: Timer Format Correctness**
    - **Validates: Requirements 2.6**

- [x] 5. Checkpoint - Verify greeting and timer functionality
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Implement Task Manager Component
  - [x] 6.1 Create TaskManager class with CRUD operations
    - Initialize tasks array state
    - Implement loadTasks() to retrieve from localStorage
    - Implement addTask() with validation (non-empty, max 500 chars)
    - Implement editTask() to modify task description
    - Implement toggleComplete() to flip completion status
    - Implement deleteTask() to remove task
    - Implement renderTasks() to update DOM with task list
    - Implement saveTasks() to persist to localStorage
    - Add event listeners for form submission and task controls
    - Generate unique IDs using timestamp or UUID
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 5.1, 5.2, 5.3, 5.4_
  
  - [x] 6.2 Write property test for task creation
    - **Property 6: Task Creation with Incomplete Status**
    - **Validates: Requirements 3.2**
  
  - [x] 6.3 Write property test for empty task rejection
    - **Property 8: Empty Task Rejection**
    - **Validates: Requirements 3.4**
  
  - [x] 6.4 Write property test for task list rendering
    - **Property 9: Task List Rendering Completeness**
    - **Validates: Requirements 3.5, 5.2**
  
  - [x] 6.5 Write property test for task edit preservation
    - **Property 10: Task Edit Preservation**
    - **Validates: Requirements 4.1, 4.2**
  
  - [x] 6.6 Write property test for task completion toggle
    - **Property 11: Task Completion Toggle**
    - **Validates: Requirements 4.3, 4.4**
  
  - [x] 6.7 Write property test for task deletion
    - **Property 12: Task Deletion Removal**
    - **Validates: Requirements 4.5, 4.6**
  
  - [x] 6.8 Write property test for completed task styling
    - **Property 13: Completed Task Visual Distinction**
    - **Validates: Requirements 4.7**
  
  - [x] 6.9 Write property test for task loading
    - **Property 14: Task Loading from Storage**
    - **Validates: Requirements 5.1, 5.2**

- [x] 7. Implement Quick Links Panel Component
  - [x] 7.1 Create QuickLinksPanel class with link management
    - Initialize links array state
    - Implement loadLinks() to retrieve from localStorage
    - Implement addLink() with validation (non-empty name/URL, http/https protocol)
    - Implement validateUrl() to check URL format
    - Implement deleteLink() to remove link
    - Implement openLink() to open URL in new tab
    - Implement renderLinks() to update DOM with links list
    - Implement saveLinks() to persist to localStorage
    - Add event listeners for form submission and delete controls
    - Generate unique IDs using timestamp or UUID
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 7.1, 7.2, 7.3, 7.4_
  
  - [x] 7.2 Write property test for quick link creation
    - **Property 15: Quick Link Creation**
    - **Validates: Requirements 6.2**
  
  - [x] 7.3 Write property test for invalid link rejection
    - **Property 17: Invalid Quick Link Rejection**
    - **Validates: Requirements 6.4**
  
  - [x] 7.4 Write property test for link deletion
    - **Property 18: Quick Link Deletion Removal**
    - **Validates: Requirements 6.6, 6.7**
  
  - [x] 7.5 Write property test for link loading
    - **Property 19: Quick Link Loading from Storage**
    - **Validates: Requirements 7.1, 7.2**

- [x] 8. Checkpoint - Verify task and links functionality
  - Ensure all tests pass, ask the user if questions arise.

- [x] 9. Implement CSS styling and responsive layout
  - [x] 9.1 Create base styles and layout
    - Define CSS variables for colors, spacing, and typography
    - Implement grid or flexbox layout for component sections
    - Style greeting section with prominent time/date display
    - Style timer section with large countdown display and button controls
    - Style task section with form, list, and task item controls
    - Style links section with form and link items
    - Add visual distinction for completed tasks (strikethrough, opacity, color)
    - _Requirements: 4.7, 8.5_
  
  - [x] 9.2 Implement responsive breakpoints
    - Add media queries for mobile (320px-767px)
    - Add media queries for tablet (768px-1023px)
    - Add media queries for desktop (1024px-1919px)
    - Add media queries for large desktop (1920px-2560px)
    - Ensure readable text and accessible controls at all sizes
    - _Requirements: 8.3, 8.4_

- [x] 10. Wire components together and finalize integration
  - [x] 10.1 Initialize all components in DashboardController
    - Instantiate GreetingDisplay, FocusTimer, TaskManager, QuickLinksPanel
    - Call init() on each component after DOMContentLoaded
    - Add storage event listener for cross-tab synchronization
    - Implement error handling for component initialization failures
    - _Requirements: 8.1, 8.2_
  
  - [x] 10.2 Write integration tests for component interaction
    - Test dashboard initialization sequence
    - Test localStorage synchronization across components
    - Test error handling scenarios
    - _Requirements: 8.1, 8.2, 5.4, 7.4_

- [x] 11. Final checkpoint - Complete testing and validation
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Property tests should use fast-check library with minimum 100 iterations
- Unit tests should use Jest or Vitest with jsdom for DOM testing
- All localStorage operations must include try-catch error handling
- Component initialization must wait for DOMContentLoaded event
- IDs can be generated using Date.now() + Math.random() or a UUID library
- The application must work by opening index.html directly in a browser
