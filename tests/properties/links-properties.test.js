import { describe, test, expect, beforeEach } from 'vitest';
import fc from 'fast-check';

class MockStorage {
    constructor() { this.storage = {}; }
    getItem(key) { return this.storage[key] || null; }
    setItem(key, value) { this.storage[key] = value; }
    clear() { this.storage = {}; }
}

class MockDashboardController {
    constructor() { this.storage = new MockStorage(); }
    getFromStorage(key) {
        try {
            const data = this.storage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (e) { return null; }
    }
    saveToStorage(key, data) {
        try { this.storage.setItem(key, JSON.stringify(data)); } catch (e) {}
    }
}

class QuickLinksPanel {
    constructor(storageController) {
        this.storageController = storageController;
        this.links = [];
        this.storageKey = 'productivity_dashboard_links';
        this.idCounter = 0;
    }
    loadLinks() {
        const stored = this.storageController.getFromStorage(this.storageKey);
        this.links = stored || [];
    }
    addLink(name, url) {
        const trimmedName = name.trim();
        const trimmedUrl = url.trim();
        if (!trimmedName || !trimmedUrl) return;
        if (!this.validateUrl(trimmedUrl)) return;
        if (trimmedName.length > 100) return;
        const link = { id: this.generateId(), name: trimmedName, url: trimmedUrl, createdAt: Date.now() };
        this.links.push(link);
        this.saveLinks();
    }
    deleteLink(id) {
        this.links = this.links.filter(l => l.id !== id);
        this.saveLinks();
    }
    renderLinks() {
        const linksContainer = document.getElementById('links-container');
        if (!linksContainer) return;
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
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'link-delete';
            deleteBtn.textContent = 'Delete';
            linkItem.appendChild(anchor);
            linkItem.appendChild(deleteBtn);
            linksContainer.appendChild(linkItem);
        });
    }
    saveLinks() { this.storageController.saveToStorage(this.storageKey, this.links); }
    validateUrl(url) { return url.startsWith('http://') || url.startsWith('https://'); }
    generateId() { return `link-${this.idCounter++}`; }
}

describe('Quick Links Panel Properties', () => {
    let quickLinksPanel, mockController;
    beforeEach(() => {
        mockController = new MockDashboardController();
        quickLinksPanel = new QuickLinksPanel(mockController);
        quickLinksPanel.loadLinks();
    });

    test('Property 18: Quick link deletion removal', () => {
        fc.assert(fc.property(
            fc.array(fc.record({
                name: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
                url: fc.constantFrom('http://example.com', 'https://test.org', 'https://site.net')
            }), { minLength: 1, maxLength: 10 }),
            fc.integer({ min: 0, max: 9 }),
            (linkData, deleteIndex) => {
                quickLinksPanel.links = [];
                quickLinksPanel.idCounter = 0;
                mockController.storage.clear();
                linkData.forEach(data => quickLinksPanel.addLink(data.name, data.url));
                const initialCount = quickLinksPanel.links.length;
                if (initialCount === 0) return;
                const indexToDelete = deleteIndex % initialCount;
                const deletedId = quickLinksPanel.links[indexToDelete].id;
                quickLinksPanel.deleteLink(deletedId);
                expect(quickLinksPanel.links.length).toBe(initialCount - 1);
                expect(quickLinksPanel.links.find(l => l.id === deletedId)).toBeUndefined();
                const storedLinks = mockController.getFromStorage('productivity_dashboard_links');
                expect(storedLinks).not.toBeNull();
                expect(storedLinks.length).toBe(initialCount - 1);
                expect(storedLinks.find(l => l.id === deletedId)).toBeUndefined();
            }
        ), { numRuns: 100 });
    });

    test('Property 19: Quick link loading from storage retrieves and displays all links', () => {
        fc.assert(fc.property(
            fc.array(fc.record({
                id: fc.string({ minLength: 5, maxLength: 30 }),
                name: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
                url: fc.oneof(fc.constant('http://example.com'), fc.constant('https://test.org'), fc.constant('https://github.com')),
                createdAt: fc.integer({ min: 1000000000000, max: Date.now() })
            }), { minLength: 0, maxLength: 20 }),
            (storedLinks) => {
                mockController.saveToStorage('productivity_dashboard_links', storedLinks);
                const freshQuickLinksPanel = new QuickLinksPanel(mockController);
                freshQuickLinksPanel.loadLinks();
                expect(freshQuickLinksPanel.links.length).toBe(storedLinks.length);
                storedLinks.forEach((storedLink) => {
                    const loadedLink = freshQuickLinksPanel.links.find(l => l.id === storedLink.id);
                    expect(loadedLink).toBeDefined();
                    expect(loadedLink).not.toBeNull();
                    expect(loadedLink.id).toBe(storedLink.id);
                    expect(loadedLink.name).toBe(storedLink.name);
                    expect(loadedLink.url).toBe(storedLink.url);
                    expect(loadedLink.createdAt).toBe(storedLink.createdAt);
                });
                const linksContainer = document.createElement('div');
                linksContainer.id = 'links-container';
                document.body.appendChild(linksContainer);
                try {
                    freshQuickLinksPanel.renderLinks();
                    const renderedItems = linksContainer.querySelectorAll('.link-item');
                    expect(renderedItems.length).toBe(storedLinks.length);
                    storedLinks.forEach((storedLink) => {
                        const renderedItem = Array.from(renderedItems).find(item => item.dataset.id === storedLink.id);
                        expect(renderedItem).toBeDefined();
                        expect(renderedItem).not.toBeNull();
                        const anchorElement = renderedItem.querySelector('.link-anchor');
                        expect(anchorElement).toBeDefined();
                        expect(anchorElement).not.toBeNull();
                        expect(anchorElement.textContent).toBe(storedLink.name);
                        const normalizeUrl = (url) => new URL(url).href;
                        expect(normalizeUrl(anchorElement.href)).toBe(normalizeUrl(storedLink.url));
                        expect(anchorElement.target).toBe('_blank');
                        const deleteBtn = renderedItem.querySelector('.link-delete');
                        expect(deleteBtn).toBeDefined();
                        expect(deleteBtn).not.toBeNull();
                    });
                } finally {
                    document.body.removeChild(linksContainer);
                }
            }
        ), { numRuns: 100 });
    });
});
