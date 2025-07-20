/**
 * Tag Manager - Simple GitHub Gist Tag Management
 * スライドカード内でのシンプルなタグ編集
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
        
        this.init();
    }

    /**
     * Initialize the tag manager
     */
    async init() {
        this.bindEvents();
        await this.loadData();
        // 設定に関係なく、常にタグエリアを表示
        this.renderAllSlideTags();
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        // Configuration events
        document.getElementById('saveConfig')?.addEventListener('click', () => this.saveConfig());
        document.getElementById('testConnection')?.addEventListener('click', () => this.testConnection());

        // Auto-save on page unload
        window.addEventListener('beforeunload', () => {
            if (this.syncInProgress) {
                // Block page unload if sync in progress
                event.preventDefault();
                event.returnValue = '';
            }
        });
    }

    /**
     * Load data from GitHub Gist
     */
    async loadData() {
        if (!this.gistAPI.isConfigured()) {
            console.log('⚠️ GitHub token not configured - showing local mode');
            this.updateConnectionStatus('Not configured - using local storage only');
            return;
        }

        try {
            this.showSyncIndicator('Loading tags...');
            this.data = await this.gistAPI.loadData();
            this.hideSyncIndicator();
            this.updateConnectionStatus('✅ Connected to GitHub');
            console.log('✅ Loaded tag data from GitHub Gist');
        } catch (error) {
            console.error('❌ Failed to load from Gist:', error);
            this.showSyncIndicator('❌ Failed to load tags', 2000);
            this.updateConnectionStatus('❌ Connection failed - using local storage');
        }
        
        // Ensure data structure
        if (!this.data.tags) this.data.tags = {};
        if (!this.data.assignments) this.data.assignments = {};
    }

    /**
     * Save data to GitHub Gist
     */
    async saveData() {
        if (!this.gistAPI.isConfigured()) {
            this.showSyncIndicator('❌ GitHub not configured', 2000);
            return;
        }

        if (this.syncInProgress) return;
        
        this.syncInProgress = true;
        
        try {
            this.showSyncIndicator('Saving...');
            this.data.lastUpdated = new Date().toISOString();
            await this.gistAPI.saveData(this.data);
            this.showSyncIndicator('✅ Saved', 1000);
        } catch (error) {
            console.error('❌ Failed to save to Gist:', error);
            this.showSyncIndicator('❌ Save failed', 2000);
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
        }, 1000);
    }

    /**
     * Add a new tag to a slide
     */
    async addTagToSlide(slideId) {
        // GitHub設定の確認
        if (!this.gistAPI.isConfigured()) {
            this.showGitHubSetupGuide();
            return;
        }

        // Gist存在確認・自動作成
        this.showSyncIndicator('Initializing GitHub storage...');
        const gistReady = await this.gistAPI.ensureGistExists();
        this.hideSyncIndicator();
        
        if (!gistReady) {
            alert('Failed to initialize GitHub storage. Please check your Personal Access Token and try again.');
            return;
        }

        const tagName = prompt('Enter tag name:');
        if (!tagName || !tagName.trim()) return;
        
        const name = tagName.trim();
        const tagId = this.generateTagId(name);
        
        // Create tag if it doesn't exist
        if (!this.data.tags[tagId]) {
            this.data.tags[tagId] = {
                name: name,
                color: this.getRandomColor(),
                createdAt: new Date().toISOString()
            };
        }
        
        // Add tag to slide
        if (!this.data.assignments[slideId]) {
            this.data.assignments[slideId] = [];
        }
        
        if (!this.data.assignments[slideId].includes(tagId)) {
            this.data.assignments[slideId].push(tagId);
            this.renderSlideTagsForSlide(slideId);
            this.scheduleAutoSave();
        }
    }

    /**
     * Show GitHub setup guide
     */
    showGitHubSetupGuide() {
        const message = `🔧 GitHub Setup Required for Tag Persistence

To use tags, please:

1. Click the ⚙️ Settings button (top-right corner)
2. Create a GitHub Personal Access Token:
   • Go to https://github.com/settings/tokens
   • Generate new token (classic)
   • Enable 'gist' scope
   • Copy the token
3. Paste the token in the settings and click 'Save'
4. Click 'Test' to verify connection

Tags will be automatically saved to your private GitHub Gist!

Would you like to open the settings panel now?`;

        if (confirm(message)) {
            // Open settings panel
            const configPanel = document.getElementById('configPanel');
            if (configPanel) {
                configPanel.classList.add('open');
            }
        }
    }

    /**
     * Remove a tag from a slide
     */
    removeTagFromSlide(slideId, tagId) {
        const tag = this.data.tags[tagId];
        if (!tag) return;

        if (!confirm(`Remove "${tag.name}" tag from this slide?`)) return;
        
        if (!this.data.assignments[slideId]) return;
        
        const index = this.data.assignments[slideId].indexOf(tagId);
        if (index !== -1) {
            this.data.assignments[slideId].splice(index, 1);
            this.renderSlideTagsForSlide(slideId);
            this.scheduleAutoSave();
        }
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
     * Render tags for a specific slide (inline editing)
     */
    renderSlideTagsForSlide(slideId) {
        const container = document.getElementById(`slide-tags-${slideId}`);
        if (!container) {
            console.warn(`Tag container not found for slide: ${slideId}`);
            return;
        }

        const tagIds = this.getTagsBySlide(slideId);
        
        // Render existing tags
        const tagsHTML = tagIds.map(tagId => {
            const tag = this.data.tags[tagId];
            if (!tag) return '';
            
            const colorClass = this.getTagColorClass(tag.color);
            return `
                <span class="slide-tag ${colorClass} removable" 
                      onclick="tagManager.removeTagFromSlide('${slideId}', '${tagId}')"
                      title="Click to remove">
                    ${tag.name}
                </span>
            `;
        }).join('');
        
        // Always show "Add Tag" button
        const addButtonHTML = `
            <button class="add-tag-btn" 
                    onclick="tagManager.addTagToSlide('${slideId}')"
                    title="Add new tag">
                + Add Tag
            </button>
        `;
        
        // Show appropriate placeholder text
        let placeholderHTML = '';
        if (tagIds.length === 0) {
            if (!this.gistAPI.isConfigured()) {
                placeholderHTML = `<span class="text-gray-400 text-sm mr-2">Setup GitHub to add tags</span>`;
            } else {
                placeholderHTML = `<span class="text-gray-400 text-sm mr-2">No tags yet</span>`;
            }
        }
        
        container.innerHTML = placeholderHTML + tagsHTML + addButtonHTML;
    }

    /**
     * Configuration methods
     */
    async saveConfig() {
        const token = document.getElementById('githubToken')?.value?.trim();
        
        if (token) {
            this.gistAPI.setToken(token);
            await this.testConnection();
        }
    }

    async testConnection() {
        this.showSyncIndicator('Testing connection...');
        
        const isConnected = await this.gistAPI.testConnection();
        
        if (isConnected) {
            this.showSyncIndicator('✅ Connected', 2000);
            await this.loadData();
            this.renderAllSlideTags();
            this.updateConnectionStatus('✅ Connected to GitHub');
        } else {
            this.showSyncIndicator('❌ Connection failed', 2000);
            this.updateConnectionStatus('❌ Connection failed');
        }
    }

    /**
     * Update connection status display
     */
    updateConnectionStatus(message) {
        const statusEl = document.getElementById('connectionStatus');
        if (statusEl) {
            statusEl.textContent = message;
            
            // Update visual styling based on status
            statusEl.className = 'text-xs';
            if (message.includes('✅')) {
                statusEl.classList.add('text-green-600');
            } else if (message.includes('❌')) {
                statusEl.classList.add('text-red-600');
            } else {
                statusEl.classList.add('text-gray-600');
            }
        }
    }

    /**
     * UI helper methods
     */
    showSyncIndicator(message, duration = null) {
        const indicator = document.getElementById('syncIndicator');
        if (!indicator) return;
        
        indicator.textContent = message;
        indicator.classList.remove('hidden');
        
        if (duration) {
            setTimeout(() => this.hideSyncIndicator(), duration);
        }
    }

    hideSyncIndicator() {
        const indicator = document.getElementById('syncIndicator');
        if (indicator) {
            indicator.classList.add('hidden');
        }
    }
}

// Global instance
window.tagManager = null;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.tagManager = new TagManager();
});
