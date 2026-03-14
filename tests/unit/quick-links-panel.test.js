import { describe, test, expect, beforeEach } from 'vitest';

// Mock localStorage for testing
class MockLocalStorage {
    constructor() {
        this.store = {};
    }

    getItem(key) {
        return this.store[key] || null;
    }

    setItem(key, value) {
        this.store[key] = value;
    }

    removeItem(key) {
        delete this.store[key];
    }

    clear() {
        this.store = {};
    }
}

// Mock DashboardController for testing
class MockDashboardController {
    constructor(storage) {
        this.storage = storage;
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

// QuickLinksPanel implementation for testing
class QuickLinksPanel {
    constructor(storageController) {
        this.storageController = storageController;
        this.links = [];
        this.storageKey = 'productivity_dashboard_links';
    }

    loadLinks() {
        const stored = this.storageController.getFromStorage(this.storageKey);
        this.links = stored || [];
    }

    addLink(name, url) {
        const trimmedName = name.trim();
        const trimmedUrl = url.trim();

        if (!trimmedName || trimmedName.length === 0) {
            return;
        }

        if (!trimmedUrl || trimmedUrl.length === 0) {
            return;
        }

        if (!this.validateUrl(trimmedUrl)) {
            return;
        }

        if (trimmedName.length > 100) {
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
    }

    deleteLink(id) {
        this.links = this.links.filter(l => l.id !== id);
        this.saveLinks();
    }

    saveLinks() {
        this.storageController.saveToStorage(this.storageKey, this.links);
    }

    validateUrl(url) {
        return url.startsWith('http://') || url.startsWith('https://');
    }

    generateId() {
        return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    }
}

describe('QuickLinksPanel Unit Tests', () => {
    let storage;
    let controller;
    let panel;

    beforeEach(() => {
        storage = new MockLocalStorage();
        controller = new MockDashboardController(storage);
        panel = new QuickLinksPanel(controller);
    });

    test('initializes with empty links array', () => {
        expect(panel.links).toEqual([]);
        expect(panel.storageKey).toBe('productivity_dashboard_links');
    });

    test('adds valid link with http:// protocol', () => {
        panel.addLink('Example', 'http://example.com');
        
        expect(panel.links.length).toBe(1);
        expect(panel.links[0].name).toBe('Example');
        expect(panel.links[0].url).toBe('http://example.com');
        expect(panel.links[0].id).toBeDefined();
        expect(panel.links[0].createdAt).toBeDefined();
    });

    test('adds valid link with https:// protocol', () => {
        panel.addLink('Secure Site', 'https://secure.com');
        
        expect(panel.links.length).toBe(1);
        expect(panel.links[0].name).toBe('Secure Site');
        expect(panel.links[0].url).toBe('https://secure.com');
    });

    test('rejects link with empty name', () => {
        panel.addLink('', 'http://example.com');
        expect(panel.links.length).toBe(0);
    });

    test('rejects link with whitespace-only name', () => {
        panel.addLink('   ', 'http://example.com');
        expect(panel.links.length).toBe(0);
    });

    test('rejects link with empty URL', () => {
        panel.addLink('Example', '');
        expect(panel.links.length).toBe(0);
    });

    test('rejects link with whitespace-only URL', () => {
        panel.addLink('Example', '   ');
        expect(panel.links.length).toBe(0);
    });

    test('rejects link without http:// or https:// protocol', () => {
        panel.addLink('Example', 'example.com');
        expect(panel.links.length).toBe(0);
    });

    test('rejects link with ftp:// protocol', () => {
        panel.addLink('FTP Site', 'ftp://example.com');
        expect(panel.links.length).toBe(0);
    });

    test('rejects link with name exceeding 100 characters', () => {
        const longName = 'a'.repeat(101);
        panel.addLink(longName, 'http://example.com');
        expect(panel.links.length).toBe(0);
    });

    test('accepts link with name exactly 100 characters', () => {
        const maxName = 'a'.repeat(100);
        panel.addLink(maxName, 'http://example.com');
        expect(panel.links.length).toBe(1);
    });

    test('trims whitespace from name and URL', () => {
        panel.addLink('  Example  ', '  http://example.com  ');
        
        expect(panel.links.length).toBe(1);
        expect(panel.links[0].name).toBe('Example');
        expect(panel.links[0].url).toBe('http://example.com');
    });

    test('deletes link by id', () => {
        panel.addLink('Example 1', 'http://example1.com');
        panel.addLink('Example 2', 'http://example2.com');
        
        const idToDelete = panel.links[0].id;
        panel.deleteLink(idToDelete);
        
        expect(panel.links.length).toBe(1);
        expect(panel.links[0].name).toBe('Example 2');
    });

    test('persists links to localStorage on add', () => {
        panel.addLink('Example', 'http://example.com');
        
        const stored = JSON.parse(storage.getItem('productivity_dashboard_links'));
        expect(stored).toEqual(panel.links);
    });

    test('persists links to localStorage on delete', () => {
        panel.addLink('Example 1', 'http://example1.com');
        panel.addLink('Example 2', 'http://example2.com');
        
        const idToDelete = panel.links[0].id;
        panel.deleteLink(idToDelete);
        
        const stored = JSON.parse(storage.getItem('productivity_dashboard_links'));
        expect(stored).toEqual(panel.links);
        expect(stored.length).toBe(1);
    });

    test('loads links from localStorage', () => {
        const testLinks = [
            { id: '1', name: 'Example 1', url: 'http://example1.com', createdAt: Date.now() },
            { id: '2', name: 'Example 2', url: 'http://example2.com', createdAt: Date.now() }
        ];
        
        storage.setItem('productivity_dashboard_links', JSON.stringify(testLinks));
        panel.loadLinks();
        
        expect(panel.links).toEqual(testLinks);
    });

    test('validateUrl returns true for http://', () => {
        expect(panel.validateUrl('http://example.com')).toBe(true);
    });

    test('validateUrl returns true for https://', () => {
        expect(panel.validateUrl('https://example.com')).toBe(true);
    });

    test('validateUrl returns false for invalid protocols', () => {
        expect(panel.validateUrl('ftp://example.com')).toBe(false);
        expect(panel.validateUrl('example.com')).toBe(false);
        expect(panel.validateUrl('www.example.com')).toBe(false);
    });

    test('generateId creates unique IDs', () => {
        const id1 = panel.generateId();
        const id2 = panel.generateId();
        
        expect(id1).not.toBe(id2);
        expect(typeof id1).toBe('string');
        expect(typeof id2).toBe('string');
    });
});
