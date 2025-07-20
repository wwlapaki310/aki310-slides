/**
 * Tag Manager - Simple and Integrated Tag Management System
 * Works with localStorage for persistence
 */

class TagManager {
    constructor() {
        this.data = {
            tags: {},
            assignments: {},
            lastUpdated: null
        };
        
        this.autoSaveTimeout = null;
        
        this.init();
    }

    /**
     * Initialize the tag manager
     */
    async init() {
        this.loadData();
        this.bindEvents();
        this.render();
        this.renderAllSlideTags();
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        // Tag creation events
        const addTagBtn = document.getElementById('addTag');
        const newTagInput = document.getElementById('newTagName');
        
        addTagBtn?.addEventListener('click', () => this.addTag());
        newTagInput?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTag();
        });

        // Auto-save on page unload
        window.addEventListener('beforeunload', () => {
            this.saveData();
        });
    }

    /**
     * Load data from localStorage
     */
    loadData() {
        const stored = localStorage.getItem('tag-data');
        if (stored) {
            try {
                this.data = JSON.parse(stored);
            } catch (error) {
                console.error('Failed to parse tag data:', error);
            }
        }
        
        // Ensure data structure
        if (!this.data.tags) this.data.tags = {};
        if (!this.data.assignments) this.data.assignments = {};
    }

    /**
     * Save data to localStorage
     */
    saveData() {
        this.data.lastUpdated = new Date().toISOString();
        localStorage.setItem('tag-data', JSON.stringify(this.data));
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
        }, 1000); // Save after 1 second of inactivity
    }

    /**
     * Add a new tag
     */
    addTag() {
        const input = document.getElementById('newTagName');
        const name = input?.value?.trim();
        
        if (!name) return;
        
        const tagId = this.generateTagId(name);
        
        if (this.data.tags[tagId]) {
            alert('Tag already exists');
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
        this.renderTags();
        this.renderSlideFilters();
    }

    /**
     * Render all tags in management section
     */
    renderTags() {
        const container = document.getElementById('tagsContainer');
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
}

// Global instance
window.tagManager = null;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.tagManager = new TagManager();
});
