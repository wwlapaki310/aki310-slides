// GitHub Gist-based Tag Persistence System
class TagPersistenceManager {
    constructor() {
        this.gistConfig = null;
        this.localStorageKey = 'aki310-slides-tags';
        this.lastSyncKey = 'aki310-slides-last-sync';
        this.init();
    }

    async init() {
        // Load gist configuration from metadata
        try {
            const response = await fetch('/scripts/slide-metadata.json');
            const metadata = await response.json();
            this.gistConfig = metadata.gistConfig;
        } catch (error) {
            console.warn('Could not load gist config:', error);
        }
    }

    // Save tags to localStorage (immediate)
    saveToLocal(slideData) {
        try {
            localStorage.setItem(this.localStorageKey, JSON.stringify({
                slides: slideData,
                timestamp: Date.now()
            }));
            console.log('📱 Tags saved to local storage');
        } catch (error) {
            console.error('Failed to save to localStorage:', error);
        }
    }

    // Load tags from localStorage
    loadFromLocal() {
        try {
            const stored = localStorage.getItem(this.localStorageKey);
            if (stored) {
                const data = JSON.parse(stored);
                console.log('📱 Tags loaded from local storage');
                return data.slides;
            }
        } catch (error) {
            console.error('Failed to load from localStorage:', error);
        }
        return null;
    }

    // Save to GitHub Gist (async)
    async saveToGist(slideData) {
        if (!this.gistConfig || !this.gistConfig.gistId) {
            console.log('🔧 Gist not configured, creating new one...');
            return this.createNewGist(slideData);
        }

        try {
            const gistData = {
                description: this.gistConfig.description,
                files: {
                    [this.gistConfig.filename]: {
                        content: JSON.stringify({
                            slides: slideData,
                            lastUpdated: new Date().toISOString(),
                            version: "2.0.0"
                        }, null, 2)
                    }
                }
            };

            const response = await fetch(`https://api.github.com/gists/${this.gistConfig.gistId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(gistData)
            });

            if (response.ok) {
                localStorage.setItem(this.lastSyncKey, Date.now().toString());
                console.log('☁️ Tags synced to GitHub Gist');
                this.showSyncStatus('success', 'Tags saved to cloud');
            } else {
                throw new Error(`Gist update failed: ${response.status}`);
            }
        } catch (error) {
            console.error('Failed to save to Gist:', error);
            this.showSyncStatus('error', 'Cloud save failed, using local storage');
        }
    }

    // Create new Gist if none exists
    async createNewGist(slideData) {
        try {
            const gistData = {
                description: this.gistConfig?.description || "Tag data for aki310-slides",
                public: false,
                files: {
                    [this.gistConfig?.filename || "aki310-slides-tags.json"]: {
                        content: JSON.stringify({
                            slides: slideData,
                            lastUpdated: new Date().toISOString(),
                            version: "2.0.0"
                        }, null, 2)
                    }
                }
            };

            const response = await fetch('https://api.github.com/gists', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(gistData)
            });

            if (response.ok) {
                const result = await response.json();
                console.log('🆕 New Gist created:', result.html_url);
                this.showSyncStatus('info', `New Gist created: ${result.id}`);
                
                // Save gist ID for future use
                if (this.gistConfig) {
                    this.gistConfig.gistId = result.id;
                }
                
                return result;
            } else {
                throw new Error(`Gist creation failed: ${response.status}`);
            }
        } catch (error) {
            console.error('Failed to create Gist:', error);
            this.showSyncStatus('error', 'Could not create cloud storage');
        }
    }

    // Load from GitHub Gist
    async loadFromGist() {
        if (!this.gistConfig?.gistId) {
            console.log('No Gist configured');
            return null;
        }

        try {
            const response = await fetch(`https://api.github.com/gists/${this.gistConfig.gistId}`);
            
            if (response.ok) {
                const gist = await response.json();
                const file = gist.files[this.gistConfig.filename];
                
                if (file) {
                    const data = JSON.parse(file.content);
                    console.log('☁️ Tags loaded from GitHub Gist');
                    localStorage.setItem(this.lastSyncKey, Date.now().toString());
                    return data.slides;
                }
            } else {
                throw new Error(`Gist fetch failed: ${response.status}`);
            }
        } catch (error) {
            console.error('Failed to load from Gist:', error);
            this.showSyncStatus('warning', 'Could not sync from cloud, using local data');
        }
        return null;
    }

    // Sync with conflict resolution
    async syncTags(currentSlideData) {
        const gistData = await this.loadFromGist();
        const localData = this.loadFromLocal();
        
        if (!gistData && !localData) {
            // First time use
            this.saveToLocal(currentSlideData);
            await this.saveToGist(currentSlideData);
            return currentSlideData;
        }

        if (gistData && localData) {
            // Merge data (prefer more recent changes)
            const mergedData = this.mergeSlideData(gistData, localData, currentSlideData);
            this.saveToLocal(mergedData);
            await this.saveToGist(mergedData);
            return mergedData;
        }

        // Use whichever data is available
        const availableData = gistData || localData || currentSlideData;
        this.saveToLocal(availableData);
        if (gistData !== availableData) {
            await this.saveToGist(availableData);
        }
        return availableData;
    }

    // Simple merge strategy (can be enhanced)
    mergeSlideData(gistData, localData, currentData) {
        const merged = [...currentData];
        
        // Create a map for easier lookup
        const mergedMap = new Map(merged.map(slide => [slide.name, slide]));
        
        // Merge tags from both sources
        [gistData, localData].forEach(dataSource => {
            if (Array.isArray(dataSource)) {
                dataSource.forEach(slide => {
                    if (mergedMap.has(slide.name)) {
                        const existingSlide = mergedMap.get(slide.name);
                        // Merge tags, removing duplicates
                        const combinedTags = [...new Set([
                            ...(existingSlide.tags || []),
                            ...(slide.tags || [])
                        ])];
                        existingSlide.tags = combinedTags;
                    }
                });
            }
        });
        
        return merged;
    }

    // Show sync status to user
    showSyncStatus(type, message) {
        const colors = {
            success: 'bg-green-500 text-white',
            error: 'bg-red-500 text-white',
            warning: 'bg-yellow-500 text-black',
            info: 'bg-blue-500 text-white'
        };

        const statusDiv = document.createElement('div');
        statusDiv.className = `fixed top-4 right-4 px-4 py-2 rounded-lg shadow-lg z-50 ${colors[type]} text-sm`;
        statusDiv.innerHTML = `
            <div class="flex items-center gap-2">
                <span>${this.getStatusIcon(type)}</span>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(statusDiv);
        setTimeout(() => statusDiv.remove(), 4000);
    }

    getStatusIcon(type) {
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        return icons[type] || 'ℹ️';
    }

    // Get last sync time
    getLastSyncTime() {
        const lastSync = localStorage.getItem(this.lastSyncKey);
        return lastSync ? new Date(parseInt(lastSync)) : null;
    }

    // Manual sync trigger
    async manualSync(slideData) {
        this.showSyncStatus('info', 'Syncing...');
        const syncedData = await this.syncTags(slideData);
        return syncedData;
    }

    // Export data for backup
    exportData(slideData) {
        const exportData = {
            slides: slideData,
            exportDate: new Date().toISOString(),
            version: "2.0.0"
        };
        
        const blob = new Blob([JSON.stringify(exportData, null, 2)], {
            type: 'application/json'
        });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `aki310-slides-backup-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        this.showSyncStatus('success', 'Data exported successfully');
    }

    // Import data from backup
    async importData(file) {
        try {
            const text = await file.text();
            const data = JSON.parse(text);
            
            if (data.slides && Array.isArray(data.slides)) {
                this.saveToLocal(data.slides);
                await this.saveToGist(data.slides);
                this.showSyncStatus('success', 'Data imported successfully');
                return data.slides;
            } else {
                throw new Error('Invalid backup file format');
            }
        } catch (error) {
            this.showSyncStatus('error', 'Import failed: ' + error.message);
            throw error;
        }
    }
}

// Initialize the persistence manager
window.tagPersistenceManager = new TagPersistenceManager();

export default TagPersistenceManager;
