/**
 * Slide Filter - Simple search and tag filtering
 * Works with TagManager for GitHub Gist tags
 */

class SlideFilter {
    constructor() {
        this.activeFilters = new Set();
        this.searchTerm = '';
        this.allSlides = [];
        
        this.init();
    }

    /**
     * Initialize the slide filter system
     */
    init() {
        // Wait for TagManager to be ready
        if (window.tagManager) {
            this.setup();
        } else {
            setTimeout(() => this.init(), 100);
        }
    }

    /**
     * Setup after TagManager is ready
     */
    setup() {
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

        // Tag clicks for filtering (improved event delegation)
        document.addEventListener('click', (e) => {
            // Only handle non-removable tag clicks for filtering
            if (e.target.classList.contains('slide-tag') && 
                !e.target.classList.contains('removable') && 
                !e.target.classList.contains('add-tag-btn')) {
                
                e.preventDefault();
                e.stopPropagation();
                
                const tagText = e.target.textContent.trim();
                if (tagText && window.tagManager) {
                    // Find tag ID by name
                    const tagId = this.findTagIdByName(tagText);
                    if (tagId) {
                        this.toggleTagFilter(tagId);
                    }
                }
            }
        });
    }

    /**
     * Find tag ID by name (helper method)
     */
    findTagIdByName(tagName) {
        if (!window.tagManager || !window.tagManager.data.tags) return null;
        
        for (const [tagId, tagData] of Object.entries(window.tagManager.data.tags)) {
            if (tagData.name === tagName) {
                return tagId;
            }
        }
        return null;
    }

    /**
     * Toggle tag filter on/off
     */
    toggleTagFilter(tagId) {
        if (this.activeFilters.has(tagId)) {
            this.activeFilters.delete(tagId);
        } else {
            this.activeFilters.add(tagId);
        }
        this.applyFilters();
        this.updateFilterDisplay();
    }

    /**
     * Update filter display to show active filters
     */
    updateFilterDisplay() {
        // Visual feedback for active filters could be added here
        // For now, we'll just update the results counter
        console.log('Active filters:', Array.from(this.activeFilters));
    }

    /**
     * Clear all active filters
     */
    clearAllFilters() {
        this.activeFilters.clear();
        this.searchTerm = '';
        
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.value = '';
        }
        
        this.applyFilters();
        this.updateFilterDisplay();
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
        
        if (window.tagManager) {
            const slideTags = window.tagManager.getTagsBySlide(slideId);
            return Array.from(this.activeFilters).some(filterTag => 
                slideTags.includes(filterTag)
            );
        }
        
        return false;
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
            if (this.activeFilters.size > 0 || this.searchTerm) {
                const filterInfo = [];
                if (this.searchTerm) {
                    filterInfo.push(`search: "${this.searchTerm}"`);
                }
                if (this.activeFilters.size > 0) {
                    filterInfo.push(`${this.activeFilters.size} tag filter(s)`);
                }
                counter.innerHTML = `Showing ${count} of ${this.allSlides.length} <span class="text-sm text-gray-500">(${filterInfo.join(', ')})</span>`;
            } else {
                counter.textContent = `${this.allSlides.length} presentations`;
            }
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
     * Refresh filter display (called when tags change)
     */
    refresh() {
        this.updateDisplay();
    }

    /**
     * Get current filter state for debugging
     */
    getFilterState() {
        return {
            activeFilters: Array.from(this.activeFilters),
            searchTerm: this.searchTerm,
            visibleSlides: this.allSlides.filter(slide => !slide.element.classList.contains('hidden')).length,
            totalSlides: this.allSlides.length
        };
    }
}

// Global instance
window.slideFilter = null;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        window.slideFilter = new SlideFilter();
    }, 200);
});
