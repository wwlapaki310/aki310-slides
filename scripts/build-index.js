import fs from 'fs';
import path from 'path';

// Import slide metadata from config
import { slideMetadata } from '../config/slides-metadata.js';

// Enhanced slide card generation with inline tag editing
function generateSlideCard(slide) {
    return `
    <div class="slide-card bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden" 
         data-slide="${slide.name}">
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
            
            <!-- Inline Tag Editor -->
            <div class="mb-4">
                <div class="flex flex-wrap gap-2 mb-2" id="slide-tags-${slide.name}">
                    <!-- Tags will be rendered here by tag-manager.js -->
                </div>
                <div class="text-sm text-gray-500">
                    Click tags to filter • 
                    <button onclick="slideFilter.editSlideTags('${slide.name}')" class="text-blue-600 hover:text-blue-800">
                        Edit Tags
                    </button>
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
        
        /* Simplified tag styles */
        .slide-tag {
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 0.75rem;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease;
            border: 1px solid;
        }
        
        .slide-tag:hover {
            transform: scale(1.05);
        }
        
        .filter-tag {
            border: 2px dashed;
            opacity: 0.7;
        }
        
        .filter-tag.active {
            border-style: solid;
            opacity: 1;
            transform: scale(1.05);
        }
        
        .slide-card.hidden {
            display: none;
        }
        
        /* Configuration panel */
        .config-panel {
            max-height: 0;
            overflow: hidden;
            transition: max-height 0.3s ease;
        }
        
        .config-panel.open {
            max-height: 400px;
        }
        
        /* Sync indicator */
        .sync-indicator {
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 50;
            padding: 8px 16px;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            border-radius: 8px;
            font-size: 0.875rem;
        }
    </style>
</head>
<body class="bg-gray-50 min-h-screen">
    <!-- Sync Indicator -->
    <div id="syncIndicator" class="sync-indicator hidden"></div>

    <header class="gradient-bg text-white shadow-lg">
        <div class="max-w-6xl mx-auto px-4 py-8">
            <div class="text-center">
                <h1 class="text-4xl md:text-5xl font-bold mb-4">🎪 Aki's Slidev Presentations</h1>
                <p class="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto">Personal presentation system with smart tag management</p>
                <div class="mt-6 flex justify-center gap-4">
                    <a href="https://github.com/wwlapaki310/aki310-slides" class="bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center gap-2" target="_blank">
                        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clip-rule="evenodd"></path></svg>
                        GitHub Repository
                    </a>
                    <button onclick="toggleConfigPanel()" class="bg-green-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors inline-flex items-center gap-2">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        </svg>
                        Settings
                    </button>
                </div>
            </div>
        </div>
    </header>

    <!-- Configuration Panel -->
    <div id="configPanel" class="config-panel bg-white border-b border-gray-200">
        <div class="max-w-6xl mx-auto px-4 py-6">
            <h2 class="text-xl font-bold text-gray-800 mb-4">GitHub Integration Settings</h2>
            <div class="grid md:grid-cols-2 gap-6">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">GitHub Personal Access Token</label>
                    <input type="password" id="githubToken" placeholder="ghp_xxxxxxxxxxxx" 
                           class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <p class="text-xs text-gray-500 mt-1">
                        <a href="https://github.com/settings/tokens" target="_blank" class="text-blue-600 hover:underline">
                            Create token
                        </a> with "gist" scope for automatic sync
                    </p>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Gist ID (optional)</label>
                    <input type="text" id="gistId" placeholder="Leave blank to create new gist" 
                           class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <p class="text-xs text-gray-500 mt-1">Existing Gist ID for data storage</p>
                </div>
            </div>
            <div class="mt-4 flex gap-4 items-center">
                <button id="saveConfig" class="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">
                    Save Configuration
                </button>
                <button id="testConnection" class="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors">
                    Test Connection
                </button>
                <div id="connectionStatus" class="text-sm"></div>
            </div>
        </div>
    </div>

    <main class="max-w-6xl mx-auto px-4 py-12">
        <!-- Tag Management Section -->
        <section class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-xl font-bold text-gray-800">🏷️ Tag Management</h2>
                <div class="flex gap-2">
                    <input type="text" id="newTagName" placeholder="New tag name..." 
                           class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <button id="addTag" class="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors">
                        Add Tag
                    </button>
                </div>
            </div>
            <div id="tagsContainer" class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
                <!-- Tags will be rendered here -->
            </div>
        </section>

        <!-- Filter Section -->
        <section class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <div class="flex flex-col md:flex-row gap-4 items-center justify-between mb-4">
                <h2 class="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z"></path>
                    </svg>
                    Filter & Search
                </h2>
                <button onclick="slideFilter.clearAllFilters()" class="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
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
                    <!-- Tag filters will be rendered here -->
                </div>
            </div>
        </section>

        <!-- System Overview -->
        <section class="mb-12">
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                <h2 class="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-3"><span class="text-2xl">🏗️</span>System Overview</h2>
                <div class="grid md:grid-cols-4 gap-6">
                    <div class="text-center"><div class="text-4xl mb-3">📊</div><h3 class="font-semibold text-gray-800 mb-2">Unified Management</h3><p class="text-gray-600 text-sm">Manage presentations in one place</p></div>
                    <div class="text-center"><div class="text-4xl mb-3">🚀</div><h3 class="font-semibold text-gray-800 mb-2">Auto Deploy</h3><p class="text-gray-600 text-sm">Automated deployment with Vercel</p></div>
                    <div class="text-center"><div class="text-4xl mb-3">🏷️</div><h3 class="font-semibold text-gray-800 mb-2">Smart Tags</h3><p class="text-gray-600 text-sm">GitHub Gist-powered tag system</p></div>
                    <div class="text-center"><div class="text-4xl mb-3">🔄</div><h3 class="font-semibold text-gray-800 mb-2">Auto Sync</h3><p class="text-gray-600 text-sm">Real-time synchronization</p></div>
                </div>
            </div>
        </section>

        <!-- Slides Section -->
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

        <!-- Tech Stack -->
        <section class="mt-16">
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                <h2 class="text-2xl font-bold text-gray-800 mb-6 text-center">⚙️ Tech Stack</h2>
                <div class="grid grid-cols-2 md:grid-cols-5 gap-6 text-center">
                    <div><div class="text-3xl mb-2">🎪</div><div class="font-semibold text-gray-800">Slidev</div><div class="text-sm text-gray-600">52.0.0</div></div>
                    <div><div class="text-3xl mb-2">⚡</div><div class="font-semibold text-gray-800">Vue.js</div><div class="text-sm text-gray-600">3.4+</div></div>
                    <div><div class="text-3xl mb-2">🌐</div><div class="font-semibold text-gray-800">Vercel</div><div class="text-sm text-gray-600">Hosting</div></div>
                    <div><div class="text-3xl mb-2">📦</div><div class="font-semibold text-gray-800">pnpm</div><div class="text-sm text-gray-600">Workspace</div></div>
                    <div><div class="text-3xl mb-2">🐙</div><div class="font-semibold text-gray-800">GitHub</div><div class="text-sm text-gray-600">Gist API</div></div>
                </div>
            </div>
        </section>
    </main>

    <footer class="bg-gray-800 text-white py-8 mt-16">
        <div class="max-w-6xl mx-auto px-4 text-center">
            <p class="text-gray-300">Built with ❤️ using Slidev + Vercel + GitHub Gist</p>
            <p class="text-gray-400 text-sm mt-2">© 2025 Satoru Akita. All rights reserved.</p>
        </div>
    </footer>

    <!-- Scripts -->
    <script src="js/gist-api.js"></script>
    <script src="js/tag-manager.js"></script>
    <script src="js/slide-filter.js"></script>
    <script>
        // Configuration panel toggle
        function toggleConfigPanel() {
            const panel = document.getElementById('configPanel');
            panel.classList.toggle('open');
        }
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
    
    console.log('✅ Generated simplified index.html with GitHub Gist integration');
    console.log(`📊 Slides included: ${slideMetadata.length}`);
    console.log('🏷️ Tag system: GitHub Gist + localStorage fallback');
    slideMetadata.forEach(slide => {
        console.log(`   - ${slide.title} (/${slide.name}/)`);
    });
}

if (import.meta.url === `file://${process.argv[1]}`) {
    generateIndexPage();
}

export { generateIndexPage, slideMetadata };