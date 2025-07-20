/**
 * Tag Manager - Simple and Integrated Tag Management System
 * Works with GitHub Gist API for automatic persistence
 */

class TagManager {
    constructor() {
        this.gistAPI = new GistAPI();
        this.data = {
            tags: {},
            assignments: {},
            lastUpdated: null
        };
        
        this.syncInProgress = false;
        this.autoSaveTimeout = null;
        
        // Cache DOM elements
        this.elements = {};
        
        this.init();
    }

    /**
     * Initialize the tag manager
     */
    async init() {
        this.cacheElements();
        this.bindEvents();
        await this.loadData();
        this.render();
    }

    /**
     * Cache frequently used DOM elements
     */
    cacheElements() {
        this.elements = {
            configPanel: document.getElementById('configPanel'),
            tokenInput: document.getElementById('githubToken'),
            gistIdInput: document.getElementById('gistId'),
            saveConfigBtn: document.getElementById('saveConfig'),
            testConnectionBtn: document.getElementById('testConnection'),
            statusDisplay: document.getElementById('connectionStatus'),
            tagsContainer: document.getElementById('tagsContainer'),
            addTagBtn: document.getElementById('addTag'),
            newTagInput: document.getElementById('newTagName'),
            syncIndicator: document.getElementById('syncIndicator')
        };
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        // Configuration events
        this.elements.saveConfigBtn?.addEventListener('click', () => this.saveConfig());
        this.elements.testConnectionBtn?.addEventListener('click', () => this.testConnection());
        
        // Tag creation events
        this.elements.addTagBtn?.addEventListener('click', () => this.addTag());
        this.elements.newTagInput?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTag();
        });

        // Auto-save on visibility change
        document.addEventListener('visibilitychange', () => {
            if (document.hidden && this.hasUnsavedChanges()) {
                this.saveData();
            }
        });
    }

    /**
     * Load data from Gist or localStorage fallback
     */
    async loadData() {
        try {
            if (this.gistAPI.isConfigured()) {
                this.showSyncIndicator('Loading from GitHub...');
                this.data = await this.gistAPI.loadData();
                this.hideSyncIndicator();
            } else {
                // Fallback to localStorage
                const stored = localStorage.getItem('tag-data');
                if (stored) {
                    this.data = JSON.parse(stored);
                }
            }
        } catch (error) {
            console.error('Failed to load tag data:', error);
            this.showError('Failed to load tag data from GitHub');
            
            // Fallback to localStorage
            const stored = localStorage.getItem('tag-data');
            if (stored) {
                this.data = JSON.parse(stored);
            }
        }
        
        // Ensure data structure
        if (!this.data.tags) this.data.tags = {};
        if (!this.data.assignments) this.data.assignments = {};
    }

    /**
     * Save data to Gist and localStorage
     */
    async saveData() {
        if (this.syncInProgress) return;
        
        this.syncInProgress = true;
        this.showSyncIndicator('Syncing...');
        
        try {
            // Always save to localStorage as backup
            localStorage.setItem('tag-data', JSON.stringify(this.data));
            
            // Save to Gist if configured
            if (this.gistAPI.isConfigured()) {
                await this.gistAPI.saveData(this.data);
                this.showSyncIndicator('Synced to GitHub ✓', 2000);
            } else {
                this.hideSyncIndicator();
            }
        } catch (error) {
            console.error('Failed to save tag data:', error);
            this.showError('Failed to sync to GitHub (saved locally)');
        } finally {
            this.syncInProgress = false;
        }
    }

    /**
     * Auto-save with debouncing
     */
    scheduleAutoSave() {
        if (this.autoSaveTimeout) {
            clearTimeout(this.autoSaveTimeout);
        }
        
        this.autoSaveTimeout = setTimeout(() => {
            this.saveData();
        }, 2000); // Save after 2 seconds of inactivity
    }

    /**
     * Add a new tag
     */
    async addTag() {
        const input = this.elements.newTagInput;
        const name = input?.value?.trim();
        
        if (!name) return;
        
        const tagId = this.generateTagId(name);
        
        if (this.data.tags[tagId]) {
            this.showError('Tag already exists');
            return;
        }
        
        this.data.tags[tagId] = {
            name: name,
            color: this.getRandomColor(),
            createdAt: new Date().toISOString()
        };
        
        input.value = '';
        this.render();
        this.scheduleAutoSave();
    }

    /**
     * Remove a tag
     */
    async removeTag(tagId) {
        if (!confirm(`Remove tag "${this.data.tags[tagId]?.name}"?`)) return;
        
        // Remove from assignments
        Object.keys(this.data.assignments).forEach(slideId => {
            this.data.assignments[slideId] = this.data.assignments[slideId].filter(id => id !== tagId);
        });
        
        // Remove tag definition
        delete this.data.tags[tagId];
        
        this.render();
        this.scheduleAutoSave();
    }

    /**
     * Toggle tag assignment for a slide
     */
    toggleSlideTag(slideId, tagId) {
        if (!this.data.assignments[slideId]) {
            this.data.assignments[slideId] = [];
        }
        
        const assignments = this.data.assignments[slideId];
        const index = assignments.indexOf(tagId);
        
        if (index === -1) {
            assignments.push(tagId);
        } else {
            assignments.splice(index, 1);
        }
        
        this.render();
        this.scheduleAutoSave();
    }

    /**
     * Get slides assigned to a specific tag
     */
    getSlidesByTag(tagId) {
        return Object.keys(this.data.assignments).filter(slideId =>
            this.data.assignments[slideId].includes(tagId)
        );
    }

    /**
     * Get tags assigned to a specific slide
     */
    getTagsBySlide(slideId) {
        return this.data.assignments[slideId] || [];
    }

    /**
     * Generate tag ID from name
     */
    generateTagId(name) {
        return name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    }

    /**
     * Get random color for new tags
     */
    getRandomColor() {
        const colors = ['blue', 'green', 'red', 'yellow', 'purple', 'pink', 'indigo', 'gray'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    /**
     * Get tag color class
     */
    getTagColorClass(color) {
        const colorMap = {
            blue: 'bg-blue-100 text-blue-800 border-blue-200',
            green: 'bg-green-100 text-green-800 border-green-200',
            red: 'bg-red-100 text-red-800 border-red-200',
            yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            purple: 'bg-purple-100 text-purple-800 border-purple-200',
            pink: 'bg-pink-100 text-pink-800 border-pink-200',
            indigo: 'bg-indigo-100 text-indigo-800 border-indigo-200',
            gray: 'bg-gray-100 text-gray-800 border-gray-200'
        };
        return colorMap[color] || colorMap.blue;
    }

    /**
     * Render the tag management UI
     */
    render() {
        this.renderConfigurationStatus();
        this.renderTags();
        this.renderSlideFilters();
    }

    /**
     * Render configuration status
     */
    renderConfigurationStatus() {
        const status = this.gistAPI.getStatus();
        const statusEl = this.elements.statusDisplay;
        
        if (!statusEl) return;
        
        if (status.isConfigured) {
            statusEl.innerHTML = '<span class="text-green-600">✓ Connected to GitHub</span>';
        } else {
            statusEl.innerHTML = '<span class="text-yellow-600">⚠ Using local storage only</span>';
        }
    }

    /**
     * Render all tags
     */
    renderTags() {
        const container = this.elements.tagsContainer;
        if (!container) return;
        
        const tags = Object.entries(this.data.tags);
        
        if (tags.length === 0) {
            container.innerHTML = '<p class="text-gray-500 text-sm">No tags created yet</p>';
            return;
        }
        
        container.innerHTML = tags.map(([tagId, tag]) => `
            <div class="tag-item flex items-center justify-between p-2 border rounded ${this.getTagColorClass(tag.color)}">
                <span class="font-medium">${tag.name}</span>
                <div class="flex items-center space-x-2">
                    <span class="text-xs opacity-75">${this.getSlidesByTag(tagId).length} slides</span>
                    <button onclick="tagManager.removeTag('${tagId}')" 
                            class="text-red-600 hover:text-red-800 text-sm">×</button>
                </div>
            </div>
        `).join('');
    }

    /**
     * Render slide filters (for main page integration)
     */
    renderSlideFilters() {
        const filterContainer = document.getElementById('tagFilters');
        if (!filterContainer) return;
        
        const tags = Object.entries(this.data.tags);
        
        filterContainer.innerHTML = tags.map(([tagId, tag]) => `
            <button class="filter-tag px-3 py-1 rounded-full text-sm border-2 border-dashed transition-all
                           ${this.getTagColorClass(tag.color)} hover:scale-105"
                    data-tag="${tagId}">
                ${tag.name}
            </button>
        `).join('');
    }

    /**
     * Configuration methods
     */
    async saveConfig() {
        const token = this.elements.tokenInput?.value?.trim();
        const gistId = this.elements.gistIdInput?.value?.trim();
        
        if (token) this.gistAPI.setToken(token);
        if (gistId) this.gistAPI.setGistId(gistId);
        
        this.render();
        
        if (this.gistAPI.isConfigured()) {
            await this.testConnection();
        }
    }

    async testConnection() {
        this.showSyncIndicator('Testing connection...');
        
        const isConnected = await this.gistAPI.testConnection();
        
        if (isConnected) {
            this.showSyncIndicator('✓ Connection successful', 2000);
            await this.loadData();
            this.render();
        } else {
            this.showError('Connection failed. Check your token and Gist ID.');
        }
    }

    /**
     * UI helper methods
     */
    showSyncIndicator(message, duration = null) {
        const indicator = this.elements.syncIndicator;
        if (!indicator) return;
        
        indicator.textContent = message;
        indicator.classList.remove('hidden');
        
        if (duration) {
            setTimeout(() => this.hideSyncIndicator(), duration);
        }
    }

    hideSyncIndicator() {
        const indicator = this.elements.syncIndicator;
        if (indicator) {
            indicator.classList.add('hidden');
        }
    }

    showError(message) {
        // Simple error display - could be enhanced with toast notifications
        console.error(message);
        alert(message);
    }

    hasUnsavedChanges() {
        // Simple check - could be enhanced with proper change tracking
        return true;
    }
}

// Global instance
window.tagManager = null;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.tagManager = new TagManager();
});