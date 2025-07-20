/**
 * Tag Manager - Hybrid Tag Management System
 * Primary: GitHub Gist (public sharing) + Fallback: LocalStorage (offline/no-config)
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
        this.isInitialized = false;
        
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
        this.isInitialized = true;
        this.render();
        this.renderAllSlideTags();
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

        // Auto-save on page unload
        window.addEventListener('beforeunload', () => {
            if (this.hasUnsavedChanges()) {
                this.saveData();
            }
        });
    }

    /**
     * Load data with Hybrid strategy: Gist (primary) + LocalStorage (fallback)
     */
    async loadData() {
        let dataLoaded = false;
        
        // Try GitHub Gist first if configured
        if (this.gistAPI.isConfigured()) {
            try {
                this.showSyncIndicator('Loading from GitHub Gist...');
                this.data = await this.gistAPI.loadData();
                this.hideSyncIndicator();
                dataLoaded = true;
                console.log('✅ Loaded tag data from GitHub Gist');
            } catch (error) {
                console.error('❌ Failed to load from Gist:', error);
                this.showError('Failed to load from GitHub Gist, using local storage');
            }
        }
        
        // Fallback to localStorage
        if (!dataLoaded) {
            const stored = localStorage.getItem('tag-data');
            if (stored) {
                try {
                    this.data = JSON.parse(stored);
                    console.log('✅ Loaded tag data from LocalStorage');
                } catch (error) {
                    console.error('❌ Failed to parse localStorage data:', error);
                }
            }
        }
        
        // Ensure data structure
        if (!this.data.tags) this.data.tags = {};
        if (!this.data.assignments) this.data.assignments = {};
    }

    /**
     * Save data with Hybrid strategy: Always LocalStorage + Gist if configured
     */
    async saveData() {
        if (this.syncInProgress) return;
        
        this.syncInProgress = true;
        
        try {
            // Always save to localStorage first (immediate feedback)
            this.data.lastUpdated = new Date().toISOString();
            localStorage.setItem('tag-data', JSON.stringify(this.data));
            
            // Save to Gist if configured
            if (this.gistAPI.isConfigured()) {
                this.showSyncIndicator('Syncing to GitHub Gist...');
                await this.gistAPI.saveData(this.data);
                this.showSyncIndicator('✅ Synced to GitHub Gist', 2000);
                console.log('✅ Synced to GitHub Gist');
            }
        } catch (error) {
            console.error('❌ Failed to sync to GitHub Gist:', error);
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
    addTag() {
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
        this.renderAllSlideTags();
        this.scheduleAutoSave();
    }

    /**
     * Remove a tag
     */
    removeTag(tagId) {
        if (!confirm(`Remove tag "${this.data.tags[tagId]?.name}"?`)) return;
        
        // Remove from assignments
        Object.keys(this.data.assignments).forEach(slideId => {
            this.data.assignments[slideId] = this.data.assignments[slideId].filter(id => id !== tagId);
        });
        
        // Remove tag definition
        delete this.data.tags[tagId];
        
        this.render();
        this.renderAllSlideTags();
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
        
        this.renderSlideTagsForSlide(slideId);
        this.scheduleAutoSave();
    }

    /**
     * Get slides assigned to a specific tag
     */
    getSlidesByTag(tagId) {
        return Object.keys(this.data.assignments).filter(slideId =>
            this.data.assignments[slideId] && this.data.assignments[slideId].includes(tagId)
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
            statusEl.innerHTML = '<span class="text-green-600">✅ Connected to GitHub Gist</span>';
        } else {
            statusEl.innerHTML = '<span class="text-yellow-600">⚠️ Using LocalStorage only</span>';
        }
    }

    /**
     * Render all tags in management section
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
     * Render tags for all slides
     */
    renderAllSlideTags() {
        const slideCards = document.querySelectorAll('.slide-card');
        slideCards.forEach(card => {
            const slideId = card.dataset.slide;
            if (slideId) {
                this.renderSlideTagsForSlide(slideId);
            }
        });
    }

    /**
     * Render tags for a specific slide
     */
    renderSlideTagsForSlide(slideId) {
        const container = document.getElementById(`slide-tags-${slideId}`);
        if (!container) return;

        const tagIds = this.getTagsBySlide(slideId);
        
        if (tagIds.length === 0) {
            container.innerHTML = '<span class="text-gray-400 text-sm">No tags</span>';
            return;
        }

        container.innerHTML = tagIds.map(tagId => {
            const tag = this.data.tags[tagId];
            if (!tag) return '';
            
            const colorClass = this.getTagColorClass(tag.color);
            return `
                <span class="slide-tag ${colorClass} cursor-pointer" 
                      data-tag="${tagId}" 
                      title="Click to filter">
                    ${tag.name}
                </span>
            `;
        }).join('');
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
            this.showSyncIndicator('✅ Connection successful', 2000);
            // Merge local data with gist data
            await this.loadData();
            this.render();
            this.renderAllSlideTags();
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
        console.error(message);
        // Show as toast notification instead of alert for better UX
        this.showSyncIndicator(`❌ ${message}`, 3000);
    }

    hasUnsavedChanges() {
        return true; // Simplified check
    }
}

// Global instance
window.tagManager = null;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.tagManager = new TagManager();
});
