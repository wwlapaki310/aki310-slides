/**
 * Slide Filter - Integrated filtering and search functionality
 * Works with TagManager for seamless tag-based filtering
 */

class SlideFilter {
    constructor() {
        this.activeFilters = new Set();
        this.searchTerm = '';
        this.allSlides = [];
        this.slideElements = [];
        
        this.init();
    }

    /**
     * Initialize the slide filter system
     */
    init() {
        this.cacheElements();
        this.bindEvents();
        this.updateDisplay();
    }

    /**
     * Cache DOM elements and slide data
     */
    cacheElements() {
        this.slideElements = document.querySelectorAll('.slide-card');
        this.allSlides = Array.from(this.slideElements).map(el => ({
            element: el,
            slideId: el.dataset.slide,
            text: el.textContent.toLowerCase()
        }));
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        // Search input
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchTerm = e.target.value.toLowerCase();
                this.applyFilters();
            });
        }

        // Tag filter clicks
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('filter-tag')) {
                this.toggleTagFilter(e.target.dataset.tag, e.target);
            } else if (e.target.classList.contains('slide-tag')) {
                // Clicking slide tags also applies filter
                this.applyTagFilter(e.target.dataset.tag);
            }
        });

        // Clear filters button
        const clearBtn = document.querySelector('[onclick*="clearAllFilters"]');
        if (clearBtn) {
            clearBtn.onclick = () => this.clearAllFilters();
        }
    }

    /**
     * Toggle tag filter on/off
     */
    toggleTagFilter(tagId, element) {
        if (this.activeFilters.has(tagId)) {
            this.activeFilters.delete(tagId);
            element.classList.remove('active');
        } else {
            this.activeFilters.add(tagId);
            element.classList.add('active');
        }
        this.applyFilters();
    }

    /**
     * Apply tag filter (always on)
     */
    applyTagFilter(tagId) {
        if (!this.activeFilters.has(tagId)) {
            this.activeFilters.add(tagId);
            const filterElement = document.querySelector(`[data-tag="${tagId}"].filter-tag`);
            if (filterElement) {
                filterElement.classList.add('active');
            }
            this.applyFilters();
        }
    }

    /**
     * Clear all active filters
     */
    clearAllFilters() {
        this.activeFilters.clear();
        this.searchTerm = '';
        
        // Clear search input
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.value = '';
        }
        
        // Clear active filter tags
        document.querySelectorAll('.filter-tag.active').forEach(tag => {
            tag.classList.remove('active');
        });
        
        this.applyFilters();
    }

    /**
     * Apply current filters to all slides
     */
    applyFilters() {
        let visibleCount = 0;

        this.allSlides.forEach(({ element, slideId, text }) => {
            const matchesSearch = !this.searchTerm || text.includes(this.searchTerm);
            const matchesTags = this.matchesTagFilter(slideId);
            
            const isVisible = matchesSearch && matchesTags;
            
            if (isVisible) {
                element.classList.remove('hidden');
                visibleCount++;
            } else {
                element.classList.add('hidden');
            }
        });

        this.updateResultsCounter(visibleCount);
        this.toggleNoResults(visibleCount === 0);
    }

    /**
     * Check if slide matches current tag filters
     */
    matchesTagFilter(slideId) {
        if (this.activeFilters.size === 0) return true;
        
        // Get slide tags from TagManager if available
        if (window.tagManager) {
            const slideTags = window.tagManager.getTagsBySlide(slideId);
            return Array.from(this.activeFilters).some(filterTag => 
                slideTags.includes(filterTag)
            );
        }
        
        // Fallback: check DOM for slide tags
        const slideElement = document.querySelector(`[data-slide="${slideId}"]`);
        const slideTags = Array.from(slideElement.querySelectorAll('.slide-tag'))
            .map(tag => tag.dataset.tag);
        
        return Array.from(this.activeFilters).some(filterTag => 
            slideTags.includes(filterTag)
        );
    }

    /**
     * Update results counter display
     */
    updateResultsCounter(count = null) {
        if (count === null) {
            count = this.allSlides.length;
        }
        
        const counter = document.getElementById('resultsCounter');
        if (counter) {
            counter.textContent = `Showing ${count} of ${this.allSlides.length} presentations`;
        }
    }

    /**
     * Show/hide no results message
     */
    toggleNoResults(show) {
        const noResults = document.getElementById('noResults');
        const slidesContainer = document.getElementById('slidesContainer');
        
        if (noResults && slidesContainer) {
            if (show) {
                noResults.classList.remove('hidden');
                slidesContainer.style.display = 'none';
            } else {
                noResults.classList.add('hidden');
                slidesContainer.style.display = 'grid';
            }
        }
    }

    /**
     * Update display when data changes
     */
    updateDisplay() {
        this.cacheElements();
        this.updateResultsCounter();
        this.applyFilters();
    }

    /**
     * Render slide tags (called by TagManager)
     */
    renderSlideTags(slideId, tags, tagDefinitions) {
        const container = document.getElementById(`slide-tags-${slideId}`);
        if (!container) return;

        container.innerHTML = tags.map(tagId => {
            const tagDef = tagDefinitions[tagId];
            if (!tagDef) return '';
            
            const colorClass = this.getTagColorClass(tagDef.color);
            return `
                <span class="slide-tag ${colorClass}" data-tag="${tagId}" title="${tagDef.description || ''}">
                    ${tagDef.name}
                </span>
            `;
        }).join('');
    }

    /**
     * Get CSS classes for tag colors
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
     * Open tag editor for a specific slide
     */
    editSlideTags(slideId) {
        if (!window.tagManager) {
            alert('Tag manager not available');
            return;
        }

        const currentTags = window.tagManager.getTagsBySlide(slideId);
        const allTags = window.tagManager.data.tags;
        
        // Create simple modal for tag editing
        this.showTagEditor(slideId, currentTags, allTags);
    }

    /**
     * Show tag editor modal
     */
    showTagEditor(slideId, currentTags, allTags) {
        // Remove existing modal if any
        const existingModal = document.getElementById('tagEditorModal');
        if (existingModal) {
            existingModal.remove();
        }

        // Create modal HTML
        const modalHTML = `
            <div id="tagEditorModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div class="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                    <h3 class="text-lg font-bold text-gray-800 mb-4">Edit Tags for Slide</h3>
                    <div class="space-y-3 max-h-60 overflow-y-auto">
                        ${Object.entries(allTags).map(([tagId, tag]) => {
                            const isChecked = currentTags.includes(tagId);
                            const colorClass = this.getTagColorClass(tag.color);
                            return `
                                <label class="flex items-center space-x-3 cursor-pointer">
                                    <input type="checkbox" ${isChecked ? 'checked' : ''} 
                                           data-tag-id="${tagId}" class="rounded">
                                    <span class="slide-tag ${colorClass}">${tag.name}</span>
                                </label>
                            `;
                        }).join('')}
                    </div>
                    <div class="flex justify-end space-x-2 mt-6">
                        <button onclick="this.closest('#tagEditorModal').remove()" 
                                class="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">
                            Cancel
                        </button>
                        <button onclick="slideFilter.saveTagChanges('${slideId}')" 
                                class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Add modal to page
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    /**
     * Save tag changes from modal
     */
    saveTagChanges(slideId) {
        const modal = document.getElementById('tagEditorModal');
        const checkboxes = modal.querySelectorAll('input[type="checkbox"]');
        
        const newTags = Array.from(checkboxes)
            .filter(cb => cb.checked)
            .map(cb => cb.dataset.tagId);

        // Update tags in TagManager
        if (window.tagManager) {
            window.tagManager.data.assignments[slideId] = newTags;
            window.tagManager.scheduleAutoSave();
            window.tagManager.render();
        }

        // Update display
        this.updateDisplay();
        
        // Close modal
        modal.remove();
    }

    /**
     * Refresh filter display (called when tags change)
     */
    refresh() {
        this.updateDisplay();
    }
}

// Global instance
window.slideFilter = null;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Wait a bit for TagManager to initialize
    setTimeout(() => {
        window.slideFilter = new SlideFilter();
    }, 100);
});