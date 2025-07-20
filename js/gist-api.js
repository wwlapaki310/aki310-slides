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
     * @returns {boolean}
     */
    isConfigured() {
        return !!(this.token && this.gistId);
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
            ...initialData
        };

        const response = await this.makeRequest('/gists', {
            method: 'POST',
            body: JSON.stringify({
                description: 'Aki310 Slides - Tag Management Data',
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
        if (!this.gistId) {
            throw new Error('Gist ID not configured');
        }

        try {
            const response = await this.makeRequest(`/gists/${this.gistId}`);
            const gist = await response.json();
            
            const file = gist.files[this.filename];
            if (!file) {
                throw new Error(`File ${this.filename} not found in Gist`);
            }

            return JSON.parse(file.content);
        } catch (error) {
            console.error('Failed to load data from Gist:', error);
            // Return default structure if loading fails
            return {
                tags: {},
                assignments: {},
                lastUpdated: new Date().toISOString()
            };
        }
    }

    /**
     * Save tag data to Gist
     * @param {object} data - Tag data to save
     * @returns {Promise<void>}
     */
    async saveData(data) {
        if (!this.gistId) {
            // Create new Gist if none exists
            await this.createGist(data);
            return;
        }

        const dataWithTimestamp = {
            ...data,
            lastUpdated: new Date().toISOString()
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
     * Check if Gist exists and is accessible
     * @returns {Promise<boolean>}
     */
    async testConnection() {
        if (!this.isConfigured()) {
            return false;
        }

        try {
            await this.makeRequest(`/gists/${this.gistId}`);
            return true;
        } catch (error) {
            console.error('Gist connection test failed:', error);
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
            isConfigured: this.isConfigured()
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
