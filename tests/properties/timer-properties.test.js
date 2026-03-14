import { describe, test, expect, beforeEach } from 'vitest';
import fc from 'fast-check';

// FocusTimer implementation for testing
class FocusTimer {
    constructor() {
        this.remainingSeconds = 1500; // 25 minutes in seconds
        this.isRunning = false;
        this.intervalId = null;
    }

    start() {
        if (this.isRunning) {
            return; // Already running
        }

        this.isRunning = true;
        this.intervalId = setInterval(() => this.tick(), 1000);
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
    }

    reset() {
        this.stop();
        this.remainingSeconds = 1500;
    }

    tick() {
        if (this.remainingSeconds > 0) {
            this.remainingSeconds--;
            // Clamp to ensure we don't go below 0
            if (this.remainingSeconds < 0) {
                this.remainingSeconds = 0;
            }

            if (this.remainingSeconds === 0) {
                this.stop();
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
}

describe('Focus Timer Properties', () => {
    let timer;

    beforeEach(() => {
        timer = new FocusTimer();
    });

    /**
     * **Validates: Requirements 2.4**
     * 
     * Property 4: Timer Reset Idempotence
     * 
     * For any timer state (any number of remaining seconds, running or stopped),
     * calling reset should set the remaining seconds to 1500 (25 minutes) and stop the timer.
     */
    test('Property 4: Timer reset always returns to 1500 seconds and stops', () => {
        fc.assert(
            fc.property(
                fc.integer({ min: 0, max: 3000 }), // Generate random remaining seconds (including beyond normal range)
                fc.boolean(), // Generate random running state
                (remainingSeconds, isRunning) => {
                    // Set up timer in random state
                    timer.remainingSeconds = remainingSeconds;
                    timer.isRunning = isRunning;
                    
                    // If timer is supposed to be running, set up the interval
                    if (isRunning) {
                        timer.intervalId = 12345; // Mock interval ID
                    } else {
                        timer.intervalId = null;
                    }
                    
                    // Call reset
                    timer.reset();
                    
                    // Verify timer is reset to 1500 seconds (25 minutes)
                    expect(timer.remainingSeconds).toBe(1500);
                    
                    // Verify timer is stopped
                    expect(timer.isRunning).toBe(false);
                    
                    // Verify interval is cleared
                    expect(timer.intervalId).toBeNull();
                }
            ),
            { numRuns: 100 }
        );
    });

    /**
     * **Validates: Requirements 2.6**
     * 
     * Property 5: Timer Format Correctness
     * 
     * For any number of seconds between 0 and 1500, the formatted timer display
     * should be in MM:SS format where MM is zero-padded minutes (00-25) and SS
     * is zero-padded seconds (00-59).
     */
    test('Property 5: Timer format is always MM:SS with correct zero-padding', () => {
        fc.assert(
            fc.property(
                fc.integer({ min: 0, max: 1500 }), // Generate random seconds in valid range
                (seconds) => {
                    // Set timer to the generated seconds value
                    timer.remainingSeconds = seconds;
                    
                    // Get the formatted time
                    const formatted = timer.formatTime();
                    
                    // Verify format matches MM:SS pattern (2 digits : 2 digits)
                    const formatRegex = /^\d{2}:\d{2}$/;
                    expect(formatted).toMatch(formatRegex);
                    
                    // Parse the formatted string
                    const [minutesStr, secondsStr] = formatted.split(':');
                    const minutes = parseInt(minutesStr, 10);
                    const secs = parseInt(secondsStr, 10);
                    
                    // Verify minutes are in valid range (00-25)
                    expect(minutes).toBeGreaterThanOrEqual(0);
                    expect(minutes).toBeLessThanOrEqual(25);
                    
                    // Verify seconds are in valid range (00-59)
                    expect(secs).toBeGreaterThanOrEqual(0);
                    expect(secs).toBeLessThanOrEqual(59);
                    
                    // Verify the conversion is mathematically correct
                    const reconstructedSeconds = minutes * 60 + secs;
                    expect(reconstructedSeconds).toBe(seconds);
                    
                    // Verify zero-padding is correct
                    expect(minutesStr).toBe(minutes.toString().padStart(2, '0'));
                    expect(secondsStr).toBe(secs.toString().padStart(2, '0'));
                }
            ),
            { numRuns: 100 }
        );
    });
});
