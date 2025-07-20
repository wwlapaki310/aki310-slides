import fs from 'fs';
import path from 'path';

// Import slide metadata from config
import { slideMetadata } from '../config/slides-metadata.js';

// Enhanced slide card generation with tag support
function generateSlideCard(slide) {
    const tagsHtml = (slide.tags || []).map(tagId => 
        `<span class="tag" data-tag="${tagId}">${tagId}</span>`
    ).join('');
    
    return `
    <div class="slide-card bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden" data-slide="${slide.name}" data-tags='${JSON.stringify(slide.tags || [])}'>
        <a href="/${slide.name}/" class="block">
            <div class="h-48 relative overflow-hidden bg-gray-100 cursor-pointer">
                <img src="/previews/${slide.name}.png" alt="${slide.title} - Preview"
                    class="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    loading="lazy" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"/>
                <div class="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center" style="display: none;">
                    <div class="text-center text-white">
                        <div class="text-4xl mb-2">🎯</div>
                        <div class="text-lg font-semibold px-4">${slide.title}</div>
                    </div>
                </div>
                <div class="absolute top-4 right-4 bg-white bg-opacity-90 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
                    ${new Date(slide.date).toLocaleDateString('en-US')}
                </div>
            </div>
        </a>
        <div class="p-6">
            <h3 class="text-xl font-bold text-gray-800 mb-3">${slide.title}</h3>
            <p class="text-gray-600 mb-4 line-clamp-3">${slide.description}</p>
            
            <!-- Tags Section -->
            <div class="mb-4">
                <div class="flex flex-wrap gap-2" id="tags-${slide.name}">
                    ${tagsHtml}
                </div>
            </div>
            
            <div class="flex gap-3">
                <a href="/${slide.name}/" class="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold text-center hover:bg-blue-700 transition-colors">View Slide</a>
                <a href="/${slide.name}/presenter/" class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors" title="Presenter Mode">🎤</a>
                <a href="/${slide.name}/overview/" class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors" title="Overview Mode">📋</a>
            </div>
        </div>
    </div>`;
}

const htmlTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Aki's Slidev Presentations</title>
    <meta name="description" content="Personal presentation system for managing multiple Slidev presentations">
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
    <style>
        .slide-card { transition: transform 0.3s ease, box-shadow 0.3s ease; }
        .slide-card:hover { transform: translateY(-4px); box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04); }
        .gradient-bg { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
        .line-clamp-3 { display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
        
        /* Tag styles */
        .tag {
            display: inline-block;
            padding: 4px 8px;
            margin: 2px;
            border-radius: 12px;
            font-size: 0.75rem;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease;
        }
        
        .tag.default-tech { background-color: #dbeafe; color: #1e40af; }
        .tag.default-business { background-color: #dcfce7; color: #166534; }
        .tag.sre { background-color: #f3e8ff; color: #7c3aed; }
        .tag.conference { background-color: #fef3c7; color: #d97706; }
        .tag.slidev { background-color: #e0e7ff; color: #4338ca; }
        .tag.vercel { background-color: #fce7f3; color: #be185d; }
        
        .tag:hover {
            transform: scale(1.05);
            opacity: 0.8;
        }
        
        .tag.active {
            box-shadow: 0 0 0 2px #3b82f6;
            transform: scale(1.05);
        }
        
        .slide-card.hidden {
            display: none;
        }
        
        .filter-section {
            background: white;
            border-radius: 1rem;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            border: 1px solid #e5e7eb;
            padding: 1.5rem;
            margin-bottom: 2rem;
        }
    </style>
</head>
<body class="bg-gray-50 min-h-screen">
    <header class="gradient-bg text-white shadow-lg">
        <div class="max-w-6xl mx-auto px-4 py-8">
            <div class="text-center">
                <h1 class="text-4xl md:text-5xl font-bold mb-4">🎪 Aki's Slidev Presentations</h1>
                <p class="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto">Personal presentation system for managing multiple Slidev presentations</p>
                <div class="mt-6 flex justify-center gap-4">
                    <a href="https://github.com/wwlapaki310/aki310-slides" class="bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center gap-2" target="_blank">
                        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clip-rule="evenodd"></path></svg>
                        GitHub Repository
                    </a>
                    <a href="manage-tags.html" class="bg-purple-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-600 transition-colors inline-flex items-center gap-2">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
                        </svg>
                        Manage Tags
                    </a>
                    <a href="assign-tags.html" class="bg-green-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors inline-flex items-center gap-2">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"></path>
                        </svg>
                        Assign Tags
                    </a>
                </div>
            </div>
        </div>
    </header>

    <main class="max-w-6xl mx-auto px-4 py-12">
        <!-- Filter Section -->
        <section class="filter-section">
            <div class="flex flex-col md:flex-row gap-4 items-center justify-between mb-4">
                <h2 class="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z"></path>
                    </svg>
                    Filter & Search
                </h2>
                <button id="clearFilters" class="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                    Clear All Filters
                </button>
            </div>
            
            <!-- Search Bar -->
            <div class="mb-4">
                <input type="text" id="searchInput" placeholder="Search presentations by title or description..." 
                       class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            </div>
            
            <!-- Tag Filters -->
            <div>
                <h3 class="text-sm font-medium text-gray-700 mb-2">Filter by Tags:</h3>
                <div id="tagFilters" class="flex flex-wrap gap-2">
                    <!-- Tags will be dynamically loaded here -->
                </div>
            </div>
        </section>

        <section class="mb-12">
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                <h2 class="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-3"><span class="text-2xl">🏗️</span>System Overview</h2>
                <div class="grid md:grid-cols-4 gap-6">
                    <div class="text-center"><div class="text-4xl mb-3">📊</div><h3 class="font-semibold text-gray-800 mb-2">Unified Management</h3><p class="text-gray-600 text-sm">Manage multiple presentations in one repository</p></div>
                    <div class="text-center"><div class="text-4xl mb-3">🚀</div><h3 class="font-semibold text-gray-800 mb-2">Auto Deploy</h3><p class="text-gray-600 text-sm">Automated deployment with Vercel</p></div>
                    <div class="text-center"><div class="text-4xl mb-3">🏷️</div><h3 class="font-semibold text-gray-800 mb-2">Tag System</h3><p class="text-gray-600 text-sm">Organize presentations with custom tags</p></div>
                    <div class="text-center"><div class="text-4xl mb-3">🔄</div><h3 class="font-semibold text-gray-800 mb-2">Efficient Development</h3><p class="text-gray-600 text-sm">Streamlined workflow for personal use</p></div>
                </div>
            </div>
        </section>

        <section id="slidesSection">
            <div class="flex justify-between items-center mb-8">
                <h2 class="text-3xl font-bold text-gray-800">📚 Available Presentations</h2>
                <div id="resultsCounter" class="text-gray-600"></div>
            </div>
            <div class="grid md:grid-cols-2 gap-8" id="slidesContainer">
                ${slideMetadata.map(generateSlideCard).join('')}
            </div>
            <div id="noResults" class="hidden text-center py-12">
                <div class="text-6xl mb-4">🔍</div>
                <h3 class="text-xl font-bold text-gray-800 mb-2">No presentations found</h3>
                <p class="text-gray-600">Try adjusting your search terms or filters.</p>
            </div>
        </section>

        <section class="mt-16">
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                <h2 class="text-2xl font-bold text-gray-800 mb-6 text-center">⚙️ Tech Stack</h2>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                    <div><div class="text-3xl mb-2">🎪</div><div class="font-semibold text-gray-800">Slidev</div><div class="text-sm text-gray-600">52.0.0</div></div>
                    <div><div class="text-3xl mb-2">⚡</div><div class="font-semibold text-gray-800">Vue.js</div><div class="text-sm text-gray-600">3.4+</div></div>
                    <div><div class="text-3xl mb-2">🌐</div><div class="font-semibold text-gray-800">Vercel</div><div class="text-sm text-gray-600">Hosting</div></div>
                    <div><div class="text-3xl mb-2">📦</div><div class="font-semibold text-gray-800">pnpm</div><div class="text-sm text-gray-600">Workspace</div></div>
                </div>
            </div>
        </section>
    </main>

    <footer class="bg-gray-800 text-white py-8 mt-16">
        <div class="max-w-6xl mx-auto px-4 text-center">
            <p class="text-gray-300">Built with ❤️ using Slidev + Vercel + pnpm workspace</p>
            <p class="text-gray-400 text-sm mt-2">© 2025 Satoru Akita. All rights reserved.</p>
        </div>
    </footer>

    <script>
        // Tag filtering and search functionality
        class SlideFilter {
            constructor() {
                this.activeFilters = new Set();
                this.searchTerm = '';
                this.allSlides = document.querySelectorAll('.slide-card');
                this.init();
            }

            init() {
                this.loadTags();
                this.bindEvents();
                this.updateResultsCounter();
            }

            loadTags() {
                // Load tags from localStorage
                const storedTags = localStorage.getItem('slide-tags');
                let tags = [];
                
                if (storedTags) {
                    tags = JSON.parse(storedTags);
                } else {
                    // Default tags if none stored
                    tags = [
                        { id: 'default-tech', name: 'Tech', color: 'blue' },
                        { id: 'default-business', name: 'Business', color: 'green' },
                        { id: 'sre', name: 'SRE', color: 'purple' },
                        { id: 'conference', name: 'Conference', color: 'yellow' },
                        { id: 'slidev', name: 'Slidev', color: 'indigo' },
                        { id: 'vercel', name: 'Vercel', color: 'pink' }
                    ];
                }

                this.renderTagFilters(tags);
            }

            renderTagFilters(tags) {
                const container = document.getElementById('tagFilters');
                container.innerHTML = tags.map(tag => 
                    \`<span class="tag \${tag.id}" data-tag="\${tag.id}">\${tag.name}</span>\`
                ).join('');
            }

            bindEvents() {
                // Search input
                document.getElementById('searchInput').addEventListener('input', (e) => {
                    this.searchTerm = e.target.value.toLowerCase();
                    this.applyFilters();
                });

                // Tag filters
                document.getElementById('tagFilters').addEventListener('click', (e) => {
                    if (e.target.classList.contains('tag')) {
                        const tagId = e.target.dataset.tag;
                        this.toggleTagFilter(tagId, e.target);
                    }
                });

                // Slide tags (for filtering)
                document.addEventListener('click', (e) => {
                    if (e.target.classList.contains('tag') && e.target.closest('.slide-card')) {
                        const tagId = e.target.dataset.tag;
                        this.activateTagFilter(tagId);
                    }
                });

                // Clear filters
                document.getElementById('clearFilters').addEventListener('click', () => {
                    this.clearAllFilters();
                });
            }

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

            activateTagFilter(tagId) {
                if (!this.activeFilters.has(tagId)) {
                    this.activeFilters.add(tagId);
                    const filterTag = document.querySelector(\`#tagFilters .tag[data-tag="\${tagId}"]\`);
                    if (filterTag) {
                        filterTag.classList.add('active');
                    }
                    this.applyFilters();
                }
            }

            clearAllFilters() {
                this.activeFilters.clear();
                this.searchTerm = '';
                document.getElementById('searchInput').value = '';
                document.querySelectorAll('#tagFilters .tag').forEach(tag => {
                    tag.classList.remove('active');
                });
                this.applyFilters();
            }

            applyFilters() {
                let visibleCount = 0;

                this.allSlides.forEach(slide => {
                    const slideTags = JSON.parse(slide.dataset.tags || '[]');
                    const slideText = slide.textContent.toLowerCase();
                    
                    // Check search term
                    const matchesSearch = !this.searchTerm || slideText.includes(this.searchTerm);
                    
                    // Check tag filters
                    const matchesTags = this.activeFilters.size === 0 || 
                        Array.from(this.activeFilters).some(filterTag => slideTags.includes(filterTag));
                    
                    const isVisible = matchesSearch && matchesTags;
                    
                    if (isVisible) {
                        slide.classList.remove('hidden');
                        visibleCount++;
                    } else {
                        slide.classList.add('hidden');
                    }
                });

                this.updateResultsCounter(visibleCount);
                this.toggleNoResults(visibleCount === 0);
            }

            updateResultsCounter(count = null) {
                if (count === null) {
                    count = this.allSlides.length;
                }
                const counter = document.getElementById('resultsCounter');
                counter.textContent = \`Showing \${count} of \${this.allSlides.length} presentations\`;
            }

            toggleNoResults(show) {
                const noResults = document.getElementById('noResults');
                const slidesContainer = document.getElementById('slidesContainer');
                
                if (show) {
                    noResults.classList.remove('hidden');
                    slidesContainer.style.display = 'none';
                } else {
                    noResults.classList.add('hidden');
                    slidesContainer.style.display = 'grid';
                }
            }
        }

        // Initialize when DOM is loaded
        document.addEventListener('DOMContentLoaded', () => {
            new SlideFilter();
        });
    </script>
</body>
</html>`;

function generateIndexPage() {
    const distDir = 'dist';
    if (!fs.existsSync(distDir)) {
        fs.mkdirSync(distDir, { recursive: true });
    }
    
    const indexPath = path.join(distDir, 'index.html');
    fs.writeFileSync(indexPath, htmlTemplate);
    
    console.log('✅ Generated index.html with tag system integration');
    console.log(`📊 Slides included: ${slideMetadata.length}`);
    slideMetadata.forEach(slide => {
        console.log(`   - ${slide.title} (/${slide.name}/) - Tags: ${(slide.tags || []).join(', ')}`);
    });
}

if (import.meta.url === `file://${process.argv[1]}`) {
    generateIndexPage();
}

export { generateIndexPage, slideMetadata };