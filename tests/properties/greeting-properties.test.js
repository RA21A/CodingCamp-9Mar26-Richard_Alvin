import { describe, test, expect, beforeEach } from 'vitest';
import fc from 'fast-check';

// GreetingDisplay implementation for testing
class GreetingDisplay {
    constructor() {
        this.intervalId = null;
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

describe('Greeting Display Properties', () => {
    let greetingDisplay;

    beforeEach(() => {
        greetingDisplay = new GreetingDisplay();
    });

    /**
     * **Validates: Requirements 1.1**
     * 
     * Property 1: Time Format Correctness
     * 
     * For any Date object, the formatted time output should be in 12-hour format
     * with hours (1-12), minutes (00-59), seconds (00-59), and AM/PM designation.
     */
    test('Property 1: Time format is always 12-hour with AM/PM', () => {
        fc.assert(
            fc.property(
                fc.date(),
                (date) => {
                    const formatted = greetingDisplay.formatTime(date);
                    
                    // Verify format matches: H:MM:SS AM/PM or HH:MM:SS AM/PM
                    const regex = /^(1[0-2]|[1-9]):[0-5][0-9]:[0-5][0-9] (AM|PM)$/;
                    expect(formatted).toMatch(regex);
                    
                    // Parse the formatted string to verify correctness
                    const parts = formatted.split(' ');
                    const timeParts = parts[0].split(':');
                    const ampm = parts[1];
                    
                    const formattedHours = parseInt(timeParts[0], 10);
                    const formattedMinutes = parseInt(timeParts[1], 10);
                    const formattedSeconds = parseInt(timeParts[2], 10);
                    
                    // Verify hours are in range 1-12
                    expect(formattedHours).toBeGreaterThanOrEqual(1);
                    expect(formattedHours).toBeLessThanOrEqual(12);
                    
                    // Verify minutes are in range 0-59
                    expect(formattedMinutes).toBeGreaterThanOrEqual(0);
                    expect(formattedMinutes).toBeLessThanOrEqual(59);
                    
                    // Verify seconds are in range 0-59
                    expect(formattedSeconds).toBeGreaterThanOrEqual(0);
                    expect(formattedSeconds).toBeLessThanOrEqual(59);
                    
                    // Verify AM/PM is correct
                    expect(['AM', 'PM']).toContain(ampm);
                    
                    // Verify the conversion is correct
                    const originalHours = date.getHours();
                    const originalMinutes = date.getMinutes();
                    const originalSeconds = date.getSeconds();
                    
                    // Check AM/PM correctness
                    if (originalHours >= 12) {
                        expect(ampm).toBe('PM');
                    } else {
                        expect(ampm).toBe('AM');
                    }
                    
                    // Check hour conversion correctness
                    let expectedHour = originalHours % 12;
                    expectedHour = expectedHour === 0 ? 12 : expectedHour;
                    expect(formattedHours).toBe(expectedHour);
                    
                    // Check minutes and seconds match
                    expect(formattedMinutes).toBe(originalMinutes);
                    expect(formattedSeconds).toBe(originalSeconds);
                    
                    // Verify zero-padding for minutes and seconds
                    expect(timeParts[1]).toHaveLength(2);
                    expect(timeParts[2]).toHaveLength(2);
                }
            ),
            { numRuns: 100 }
        );
    });

    /**
     * **Validates: Requirements 1.2**
     * 
     * Property 2: Date Format Readability
     * 
     * For any Date object, the formatted date output should include the day of week,
     * month name, day of month, and full year in a human-readable format.
     */
    test('Property 2: Date format includes day of week, month name, day, and year', () => {
        fc.assert(
            fc.property(
                fc.date(),
                (date) => {
                    const formatted = greetingDisplay.formatDate(date);
                    
                    // Define expected values
                    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                    const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                                   'July', 'August', 'September', 'October', 'November', 'December'];
                    
                    const expectedDayName = days[date.getDay()];
                    const expectedMonthName = months[date.getMonth()];
                    const expectedDayOfMonth = date.getDate();
                    const expectedYear = date.getFullYear();
                    
                    // Verify the format matches: "DayName, MonthName Day, Year"
                    const regex = /^(Sunday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday), (January|February|March|April|May|June|July|August|September|October|November|December) \d{1,2}, -?\d+$/;
                    expect(formatted).toMatch(regex);
                    
                    // Verify the formatted string contains all required components
                    expect(formatted).toContain(expectedDayName);
                    expect(formatted).toContain(expectedMonthName);
                    expect(formatted).toContain(expectedDayOfMonth.toString());
                    expect(formatted).toContain(expectedYear.toString());
                    
                    // Parse and verify exact format
                    const expectedFormat = `${expectedDayName}, ${expectedMonthName} ${expectedDayOfMonth}, ${expectedYear}`;
                    expect(formatted).toBe(expectedFormat);
                    
                    // Verify readability: should have commas in correct positions
                    const parts = formatted.split(', ');
                    expect(parts).toHaveLength(3);
                    expect(parts[0]).toBe(expectedDayName);
                    expect(parts[1]).toContain(expectedMonthName);
                    expect(parts[2]).toBe(expectedYear.toString());
                }
            ),
            { numRuns: 100 }
        );
    });

    /**
     * **Validates: Requirements 1.3, 1.4, 1.5, 1.6**
     * 
     * Property 3: Greeting Correctness by Hour
     * 
     * For any hour (0-23), the greeting function should return the correct greeting:
     * "Good Morning" for hours 5-11, "Good Afternoon" for hours 12-16,
     * "Good Evening" for hours 17-20, and "Good Night" for hours 21-23 and 0-4.
     */
    test('Property 3: Greeting matches hour range correctly', () => {
        fc.assert(
            fc.property(
                fc.integer({ min: 0, max: 23 }),
                (hour) => {
                    const greeting = greetingDisplay.getGreeting(hour);
                    
                    // Verify greeting matches the expected value based on hour
                    if (hour >= 5 && hour <= 11) {
                        expect(greeting).toBe('Good Morning');
                    } else if (hour >= 12 && hour <= 16) {
                        expect(greeting).toBe('Good Afternoon');
                    } else if (hour >= 17 && hour <= 20) {
                        expect(greeting).toBe('Good Evening');
                    } else {
                        // Hours 21-23 and 0-4
                        expect(greeting).toBe('Good Night');
                    }
                    
                    // Verify the greeting is one of the valid values
                    const validGreetings = ['Good Morning', 'Good Afternoon', 'Good Evening', 'Good Night'];
                    expect(validGreetings).toContain(greeting);
                }
            ),
            { numRuns: 100 }
        );
    });
});
