/**
 * GitHub Gist API Wrapper for Tag Management
 * Provides simple interface for storing and retrieving tag data via GitHub Gist
 */

class GistAPI {
    constructor() {
        this.token = null;
        this.gistId = null;
        this.baseURL = 'https://api.github.com';
        this.filename = 'aki310-slides-tags.json';
        
        // Load settings from localStorage
        this.loadSettings();
    }

    /**
     * Load API settings from localStorage
     */
    loadSettings() {
        const settings = localStorage.getItem('gist-settings');
        if (settings) {
            try {
                const parsed = JSON.parse(settings);
                this.token = parsed.token;
                this.gistId = parsed.gistId;
            } catch (error) {
                console.error('Failed to parse gist settings:', error);
            }
        }
    }

    /**
     * Save API settings to localStorage
     */
    saveSettings() {
        const settings = {
            token: this.token,
            gistId: this.gistId
        };
        localStorage.setItem('gist-settings', JSON.stringify(settings));
    }

    /**
     * Configure GitHub Personal Access Token
     * @param {string} token - GitHub Personal Access Token
     */
    setToken(token) {
        this.token = token;
        this.saveSettings();
    }

    /**
     * Set Gist ID for data storage
     * @param {string} gistId - GitHub Gist ID
     */
    setGistId(gistId) {
        this.gistId = gistId;
        this.saveSettings();
    }

    /**
     * Check if API is properly configured
     * Only requires token - Gist will be auto-created if needed
     * @returns {boolean}
     */
    isConfigured() {
        return !!this.token;
    }

    /**
     * Ensure Gist exists, create if needed
     * @returns {Promise<boolean>} Success status
     */
    async ensureGistExists() {
        if (!this.token) {
            return false;
        }

        if (this.gistId) {
            // Test if existing Gist is accessible
            try {
                await this.makeRequest(`/gists/${this.gistId}`);
                return true;
            } catch (error) {
                console.warn('Existing Gist not accessible, creating new one:', error);
                this.gistId = null;
            }
        }

        // Create new Gist if none exists or existing is inaccessible
        try {
            const gistId = await this.createGist();
            console.log('✅ Created new Gist:', gistId);
            return true;
        } catch (error) {
            console.error('❌ Failed to create Gist:', error);
            return false;
        }
    }

    /**
     * Make authenticated request to GitHub API
     * @param {string} endpoint - API endpoint
     * @param {object} options - Request options
     * @returns {Promise<Response>}
     */
    async makeRequest(endpoint, options = {}) {
        if (!this.token) {
            throw new Error('GitHub token not configured');
        }

        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: {
                'Authorization': `token ${this.token}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        const response = await fetch(url, config);
        
        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(`GitHub API Error: ${response.status} - ${error.message || response.statusText}`);
        }

        return response;
    }

    /**
     * Create a new Gist for tag storage
     * @param {object} initialData - Initial tag data
     * @returns {Promise<string>} Gist ID
     */
    async createGist(initialData = {}) {
        const defaultData = {
            tags: {},
            assignments: {},
            lastUpdated: new Date().toISOString(),
            version: "1.0",
            created: new Date().toISOString(),
            ...initialData
        };

        const response = await this.makeRequest('/gists', {
            method: 'POST',
            body: JSON.stringify({
                description: 'Aki310 Slides - Tag Management Data (Auto-created)',
                public: false,
                files: {
                    [this.filename]: {
                        content: JSON.stringify(defaultData, null, 2)
                    }
                }
            })
        });

        const gist = await response.json();
        this.setGistId(gist.id);
        return gist.id;
    }

    /**
     * Load tag data from Gist
     * @returns {Promise<object>} Tag data
     */
    async loadData() {
        if (!await this.ensureGistExists()) {
            throw new Error('Failed to ensure Gist exists');
        }

        try {
            const response = await this.makeRequest(`/gists/${this.gistId}`);
            const gist = await response.json();
            
            const file = gist.files[this.filename];
            if (!file) {
                throw new Error(`File ${this.filename} not found in Gist`);
            }

            const data = JSON.parse(file.content);
            
            // Ensure data structure integrity
            return {
                tags: data.tags || {},
                assignments: data.assignments || {},
                lastUpdated: data.lastUpdated || new Date().toISOString(),
                version: data.version || "1.0"
            };
        } catch (error) {
            console.error('Failed to load data from Gist:', error);
            // Return default structure if loading fails
            return {
                tags: {},
                assignments: {},
                lastUpdated: new Date().toISOString(),
                version: "1.0"
            };
        }
    }

    /**
     * Save tag data to Gist
     * @param {object} data - Tag data to save
     * @returns {Promise<void>}
     */
    async saveData(data) {
        if (!await this.ensureGistExists()) {
            throw new Error('Failed to ensure Gist exists');
        }

        const dataWithTimestamp = {
            ...data,
            lastUpdated: new Date().toISOString(),
            version: data.version || "1.0"
        };

        await this.makeRequest(`/gists/${this.gistId}`, {
            method: 'PATCH',
            body: JSON.stringify({
                files: {
                    [this.filename]: {
                        content: JSON.stringify(dataWithTimestamp, null, 2)
                    }
                }
            })
        });
    }

    /**
     * Test connection with token validation and Gist accessibility
     * @returns {Promise<boolean>}
     */
    async testConnection() {
        if (!this.token) {
            return false;
        }

        try {
            // Test token validity by making a simple API call
            await this.makeRequest('/user');
            
            // Ensure Gist exists (create if needed)
            const gistReady = await this.ensureGistExists();
            
            return gistReady;
        } catch (error) {
            console.error('Connection test failed:', error);
            return false;
        }
    }

    /**
     * Get current configuration status
     * @returns {object} Configuration status
     */
    getStatus() {
        return {
            hasToken: !!this.token,
            hasGistId: !!this.gistId,
            isConfigured: this.isConfigured(),
            canCreateGist: !!this.token
        };
    }

    /**
     * Reset configuration
     */
    reset() {
        this.token = null;
        this.gistId = null;
        localStorage.removeItem('gist-settings');
    }
}

// Export for use in other modules
window.GistAPI = GistAPI;
