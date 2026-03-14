import { describe, test, expect } from 'vitest';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe('Responsive Design Breakpoints', () => {
    let cssContent;

    beforeAll(() => {
        // Read the CSS file
        const cssPath = join(__dirname, '../../css/styles.css');
        cssContent = readFileSync(cssPath, 'utf-8');
    });

    describe('Media Query Breakpoints', () => {
        test('contains mobile breakpoint (320px-767px)', () => {
            expect(cssContent).toContain('@media (max-width: 767px)');
        });

        test('contains tablet breakpoint (768px-1023px)', () => {
            expect(cssContent).toContain('@media (min-width: 768px) and (max-width: 1023px)');
        });

        test('contains desktop breakpoint (1024px-1919px)', () => {
            expect(cssContent).toContain('@media (min-width: 1024px) and (max-width: 1919px)');
        });

        test('contains large desktop breakpoint (1920px-2560px)', () => {
            expect(cssContent).toContain('@media (min-width: 1920px) and (max-width: 2560px)');
        });
    });

    describe('Accessible Touch Targets (Mobile)', () => {
        test('mobile buttons have minimum 44px height for accessibility', () => {
            const mobileSection = cssContent.match(/@media \(max-width: 767px\) \{[\s\S]*?\n\}/);
            expect(mobileSection).toBeTruthy();
            expect(mobileSection[0]).toContain('min-height: 44px');
        });

        test('mobile form inputs have minimum 44px height for accessibility', () => {
            const mobileSection = cssContent.match(/@media \(max-width: 767px\) \{[\s\S]*?\n\}/);
            expect(mobileSection).toBeTruthy();
            expect(mobileSection[0]).toContain('min-height: 44px');
        });
    });

    describe('Readable Text Sizes', () => {
        test('mobile has appropriate font sizes', () => {
            const mobileSection = cssContent.match(/@media \(max-width: 767px\) \{[\s\S]*?\n\}/);
            expect(mobileSection).toBeTruthy();
            // Check that font sizes are defined for mobile
            expect(mobileSection[0]).toContain('font-size');
        });

        test('tablet has appropriate font sizes', () => {
            const tabletSection = cssContent.match(/@media \(min-width: 768px\) and \(max-width: 1023px\) \{[\s\S]*?\n\}/);
            expect(tabletSection).toBeTruthy();
            expect(tabletSection[0]).toContain('font-size');
        });

        test('desktop has appropriate font sizes', () => {
            const desktopSection = cssContent.match(/@media \(min-width: 1024px\) and \(max-width: 1919px\) \{[\s\S]*?\n\}/);
            expect(desktopSection).toBeTruthy();
            expect(desktopSection[0]).toContain('font-size');
        });

        test('large desktop has appropriate font sizes', () => {
            const largeDesktopSection = cssContent.match(/@media \(min-width: 1920px\) and \(max-width: 2560px\) \{[\s\S]*?\n\}/);
            expect(largeDesktopSection).toBeTruthy();
            expect(largeDesktopSection[0]).toContain('font-size');
        });
    });

    describe('Responsive Layout Adjustments', () => {
        test('mobile uses single column layout for links', () => {
            const mobileSection = cssContent.match(/@media \(max-width: 767px\) \{[\s\S]*?\n\}/);
            expect(mobileSection).toBeTruthy();
            expect(mobileSection[0]).toContain('grid-template-columns: 1fr');
        });

        test('tablet uses 2-column layout for links', () => {
            const tabletSection = cssContent.match(/@media \(min-width: 768px\) and \(max-width: 1023px\) \{[\s\S]*?\n\}/);
            expect(tabletSection).toBeTruthy();
            expect(tabletSection[0]).toContain('grid-template-columns: repeat(2, 1fr)');
        });

        test('desktop uses 3-column layout for links', () => {
            const desktopSection = cssContent.match(/@media \(min-width: 1024px\) and \(max-width: 1919px\) \{[\s\S]*?\n\}/);
            expect(desktopSection).toBeTruthy();
            expect(desktopSection[0]).toContain('grid-template-columns: repeat(3, 1fr)');
        });

        test('large desktop uses 4-column layout for links', () => {
            const largeDesktopSection = cssContent.match(/@media \(min-width: 1920px\) and \(max-width: 2560px\) \{[\s\S]*?\n\}/);
            expect(largeDesktopSection).toBeTruthy();
            expect(largeDesktopSection[0]).toContain('grid-template-columns: repeat(4, 1fr)');
        });

        test('mobile timer controls stack vertically', () => {
            const mobileSection = cssContent.match(/@media \(max-width: 767px\) \{[\s\S]*?\n\}/);
            expect(mobileSection).toBeTruthy();
            expect(mobileSection[0]).toContain('flex-direction: column');
        });

        test('mobile forms stack vertically', () => {
            const mobileSection = cssContent.match(/@media \(max-width: 767px\) \{[\s\S]*?\n\}/);
            expect(mobileSection).toBeTruthy();
            expect(mobileSection[0]).toMatch(/form[\s\S]*?flex-direction: column/);
        });
    });

    describe('Container Max-Width Constraints', () => {
        test('tablet container has max-width constraint', () => {
            const tabletSection = cssContent.match(/@media \(min-width: 768px\) and \(max-width: 1023px\) \{[\s\S]*?\n\}/);
            expect(tabletSection).toBeTruthy();
            expect(tabletSection[0]).toContain('max-width: 768px');
        });

        test('desktop container has max-width constraint', () => {
            const desktopSection = cssContent.match(/@media \(min-width: 1024px\) and \(max-width: 1919px\) \{[\s\S]*?\n\}/);
            expect(desktopSection).toBeTruthy();
            expect(desktopSection[0]).toContain('max-width: 1024px');
        });

        test('large desktop container has max-width constraint', () => {
            const largeDesktopSection = cssContent.match(/@media \(min-width: 1920px\) and \(max-width: 2560px\) \{[\s\S]*?\n\}/);
            expect(largeDesktopSection).toBeTruthy();
            expect(largeDesktopSection[0]).toContain('max-width');
        });
    });

    describe('Viewport Meta Tag', () => {
        test('HTML file contains viewport meta tag', () => {
            const htmlPath = join(__dirname, '../../index.html');
            const htmlContent = readFileSync(htmlPath, 'utf-8');
            expect(htmlContent).toContain('<meta name="viewport" content="width=device-width, initial-scale=1.0">');
        });
    });
});
