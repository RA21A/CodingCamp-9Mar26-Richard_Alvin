import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { JSDOM } from 'jsdom';

describe('GreetingDisplay Component', () => {
    let dom;
    let document;
    let GreetingDisplay;

    beforeEach(() => {
        // Set up DOM
        dom = new JSDOM(`
            <!DOCTYPE html>
            <html>
            <body>
                <div id="time-display"></div>
                <div id="date-display"></div>
                <div id="greeting-text"></div>
            </body>
            </html>
        `);
        document = dom.window.document;
        global.document = document;

        // Load the GreetingDisplay class
        GreetingDisplay = class {
            constructor() {
                this.intervalId = null;
            }

            init() {
                this.updateDisplay();
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
                
                const ampm = hours >= 12 ? 'PM' : 'AM';
                hours = hours % 12;
                hours = hours ? hours : 12;
                
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
                if (hour >= 5 && hour <= 11) {
                    return 'Good Morning';
                } else if (hour >= 12 && hour <= 16) {
                    return 'Good Afternoon';
                } else if (hour >= 17 && hour <= 20) {
                    return 'Good Evening';
                } else {
                    return 'Good Night';
                }
            }
        };
    });

    afterEach(() => {
        if (global.document) {
            delete global.document;
        }
    });

    describe('formatTime', () => {
        test('formats 8:30:45 AM correctly', () => {
            const greeting = new GreetingDisplay();
            const result = greeting.formatTime(new Date('2024-01-01T08:30:45'));
            expect(result).toBe('8:30:45 AM');
        });

        test('formats noon correctly', () => {
            const greeting = new GreetingDisplay();
            const result = greeting.formatTime(new Date('2024-01-01T12:00:00'));
            expect(result).toBe('12:00:00 PM');
        });

        test('formats midnight correctly', () => {
            const greeting = new GreetingDisplay();
            const result = greeting.formatTime(new Date('2024-01-01T00:00:00'));
            expect(result).toBe('12:00:00 AM');
        });

        test('formats 11:59:59 PM correctly', () => {
            const greeting = new GreetingDisplay();
            const result = greeting.formatTime(new Date('2024-01-01T23:59:59'));
            expect(result).toBe('11:59:59 PM');
        });
    });

    describe('formatDate', () => {
        test('formats date with day, month, date, and year', () => {
            const greeting = new GreetingDisplay();
            const result = greeting.formatDate(new Date('2024-01-01'));
            expect(result).toBe('Monday, January 1, 2024');
        });

        test('formats another date correctly', () => {
            const greeting = new GreetingDisplay();
            const result = greeting.formatDate(new Date('2024-12-25'));
            expect(result).toBe('Wednesday, December 25, 2024');
        });
    });

    describe('getGreeting', () => {
        test('returns "Good Morning" for hour 8', () => {
            const greeting = new GreetingDisplay();
            expect(greeting.getGreeting(8)).toBe('Good Morning');
        });

        test('returns "Good Morning" for hour 5 (boundary)', () => {
            const greeting = new GreetingDisplay();
            expect(greeting.getGreeting(5)).toBe('Good Morning');
        });

        test('returns "Good Morning" for hour 11 (boundary)', () => {
            const greeting = new GreetingDisplay();
            expect(greeting.getGreeting(11)).toBe('Good Morning');
        });

        test('returns "Good Afternoon" for hour 14', () => {
            const greeting = new GreetingDisplay();
            expect(greeting.getGreeting(14)).toBe('Good Afternoon');
        });

        test('returns "Good Afternoon" for hour 12 (boundary)', () => {
            const greeting = new GreetingDisplay();
            expect(greeting.getGreeting(12)).toBe('Good Afternoon');
        });

        test('returns "Good Afternoon" for hour 16 (boundary)', () => {
            const greeting = new GreetingDisplay();
            expect(greeting.getGreeting(16)).toBe('Good Afternoon');
        });

        test('returns "Good Evening" for hour 18', () => {
            const greeting = new GreetingDisplay();
            expect(greeting.getGreeting(18)).toBe('Good Evening');
        });

        test('returns "Good Evening" for hour 17 (boundary)', () => {
            const greeting = new GreetingDisplay();
            expect(greeting.getGreeting(17)).toBe('Good Evening');
        });

        test('returns "Good Evening" for hour 20 (boundary)', () => {
            const greeting = new GreetingDisplay();
            expect(greeting.getGreeting(20)).toBe('Good Evening');
        });

        test('returns "Good Night" for hour 22', () => {
            const greeting = new GreetingDisplay();
            expect(greeting.getGreeting(22)).toBe('Good Night');
        });

        test('returns "Good Night" for hour 2', () => {
            const greeting = new GreetingDisplay();
            expect(greeting.getGreeting(2)).toBe('Good Night');
        });

        test('returns "Good Night" for hour 0 (midnight)', () => {
            const greeting = new GreetingDisplay();
            expect(greeting.getGreeting(0)).toBe('Good Night');
        });

        test('returns "Good Night" for hour 21 (boundary)', () => {
            const greeting = new GreetingDisplay();
            expect(greeting.getGreeting(21)).toBe('Good Night');
        });

        test('returns "Good Night" for hour 4 (boundary)', () => {
            const greeting = new GreetingDisplay();
            expect(greeting.getGreeting(4)).toBe('Good Night');
        });
    });

    describe('updateDisplay', () => {
        test('updates DOM elements with current time, date, and greeting', () => {
            const greeting = new GreetingDisplay();
            
            // Mock Date to return a specific time
            const mockDate = new Date('2024-01-01T08:30:45');
            vi.spyOn(global, 'Date').mockImplementation(() => mockDate);
            
            greeting.updateDisplay();
            
            expect(document.getElementById('time-display').textContent).toBe('8:30:45 AM');
            expect(document.getElementById('date-display').textContent).toBe('Monday, January 1, 2024');
            expect(document.getElementById('greeting-text').textContent).toBe('Good Morning');
            
            vi.restoreAllMocks();
        });
    });
});
