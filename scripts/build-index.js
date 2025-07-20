import fs from 'fs';
import path from 'path';

// Import slide metadata from config
import { slideMetadata } from '../config/slides-metadata.js';

// Simple slide card with inline tag editing
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
            
            <!-- Inline Tag Area -->
            <div class="mb-4">
                <div class="flex flex-wrap gap-2 items-center" id="slide-tags-${slide.name}">
                    <!-- Tags will be rendered here -->
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
        
        /* Enhanced tag styles */
        .slide-tag {
            padding: 4px 10px;
            border-radius: 12px;
            font-size: 0.75rem;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease;
            border: 1px solid;
            position: relative;
        }
        
        .slide-tag:hover {
            transform: scale(1.05);
        }
        
        .slide-tag.removable:hover::after {
            content: '×';
            position: absolute;
            top: -2px;
            right: -2px;
            background: red;
            color: white;
            border-radius: 50%;
            width: 16px;
            height: 16px;
            font-size: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .add-tag-btn {
            padding: 4px 8px;
            border: 2px dashed #cbd5e1;
            border-radius: 12px;
            font-size: 0.75rem;
            color: #64748b;
            cursor: pointer;
            transition: all 0.2s ease;
        }
        
        .add-tag-btn:hover {
            border-color: #3b82f6;
            color: #3b82f6;
            transform: scale(1.05);
        }
        
        .slide-card.hidden {
            display: none;
        }
        
        /* Enhanced config panel */
        .config-toggle {
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 40;
        }
        
        .config-panel {
            position: fixed;
            top: 60px;
            right: 20px;
            z-index: 50;
            background: white;
            border: 1px solid #e5e7eb;
            border-radius: 12px;
            padding: 20px;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
            width: 360px;
            transform: translateY(-10px);
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s ease;
        }
        
        .config-panel.open {
            transform: translateY(0);
            opacity: 1;
            visibility: visible;
        }
        
        .sync-indicator {
            position: fixed;
            top: 20px;
            left: 20px;
            z-index: 50;
            padding: 10px 16px;
            background: rgba(0, 0, 0, 0.85);
            color: white;
            border-radius: 8px;
            font-size: 0.875rem;
            backdrop-filter: blur(10px);
        }
        
        .setup-card {
            background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
            border: 2px dashed #9ca3af;
            border-radius: 12px;
            padding: 16px;
            margin-bottom: 16px;
        }
        
        .connected-indicator {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 4px 8px;
            background: #dcfce7;
            color: #166534;
            border-radius: 6px;
            font-size: 0.75rem;
            font-weight: 500;
        }
        
        .disconnected-indicator {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 4px 8px;
            background: #fef2f2;
            color: #dc2626;
            border-radius: 6px;
            font-size: 0.75rem;
            font-weight: 500;
        }
    </style>
</head>
<body class="bg-gray-50 min-h-screen">
    <!-- Sync Indicator -->
    <div id="syncIndicator" class="sync-indicator hidden"></div>

    <!-- Enhanced Config Panel -->
    <div class="config-toggle">
        <button onclick="toggleConfig()" class="bg-gray-600 text-white p-3 rounded-full hover:bg-gray-700 transition-colors shadow-lg" title="Tag Settings">
            ⚙️
        </button>
    </div>
    
    <div id="configPanel" class="config-panel">
        <div class="flex items-center justify-between mb-4">
            <h3 class="font-bold text-gray-800 text-lg">🏷️ Tag Settings</h3>
            <button onclick="toggleConfig()" class="text-gray-400 hover:text-gray-600">✕</button>
        </div>
        
        <div class="setup-card">
            <div class="flex items-center gap-2 mb-3">
                <span class="text-lg">🔗</span>
                <h4 class="font-semibold text-gray-800">GitHub Integration</h4>
            </div>
            <p class="text-sm text-gray-600 mb-3">
                Connect your GitHub account to automatically save tags to a private Gist. 
                This enables tag synchronization across devices.
            </p>
            <div class="space-y-3">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                        Personal Access Token
                    </label>
                    <input type="password" id="githubToken" placeholder="ghp_..." 
                           class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <p class="text-xs text-gray-500 mt-1">
                        <a href="https://github.com/settings/tokens" target="_blank" class="text-blue-500 hover:underline">
                            Create token
                        </a> with 'gist' scope
                    </p>
                </div>
                <div class="flex gap-2">
                    <button id="saveConfig" class="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors">
                        Save & Connect
                    </button>
                    <button id="testConnection" class="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                        Test
                    </button>
                </div>
            </div>
        </div>
        
        <div class="border-t pt-4">
            <div class="flex items-center justify-between mb-2">
                <span class="text-sm font-medium text-gray-700">Connection Status</span>
                <div id="connectionStatus" class="text-xs text-gray-600">Not configured</div>
            </div>
            <div class="text-xs text-gray-500">
                💡 Tags work locally without GitHub, but won't sync across devices
            </div>
        </div>
    </div>

    <header class="gradient-bg text-white shadow-lg">
        <div class="max-w-6xl mx-auto px-4 py-8">
            <div class="text-center">
                <h1 class="text-4xl md:text-5xl font-bold mb-4">🎪 Aki's Slidev Presentations</h1>
                <p class="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto">Personal presentation system with smart tags</p>
                <div class="mt-6">
                    <a href="https://github.com/wwlapaki310/aki310-slides" class="bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center gap-2" target="_blank">
                        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clip-rule="evenodd"></path></svg>
                        GitHub Repository
                    </a>
                </div>
            </div>
        </div>
    </header>

    <main class="max-w-6xl mx-auto px-4 py-12">
        <!-- Simple Search -->
        <section class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <div class="flex gap-4 items-center">
                <input type="text" id="searchInput" placeholder="Search presentations..." 
                       class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <button onclick="clearFilters()" class="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                    Clear Filters
                </button>
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
                <p class="text-gray-600">Try adjusting your search terms.</p>
            </div>
        </section>
    </main>

    <footer class="bg-gray-800 text-white py-8 mt-16">
        <div class="max-w-6xl mx-auto px-4 text-center">
            <p class="text-gray-300">Built with ❤️ using Slidev + Vercel + Smart Tags</p>
            <p class="text-gray-400 text-sm mt-2">© 2025 Satoru Akita. All rights reserved.</p>
        </div>
    </footer>

    <!-- Scripts -->
    <script src="js/gist-api.js"></script>
    <script src="js/tag-manager.js"></script>
    <script src="js/slide-filter.js"></script>
    <script>
        // Enhanced config toggle
        function toggleConfig() {
            const panel = document.getElementById('configPanel');
            panel.classList.toggle('open');
        }
        
        // Simple clear filters
        function clearFilters() {
            document.getElementById('searchInput').value = '';
            if (window.slideFilter) {
                window.slideFilter.clearAllFilters();
            }
        }
        
        // Close config when clicking outside
        document.addEventListener('click', (e) => {
            const panel = document.getElementById('configPanel');
            const toggle = e.target.closest('.config-toggle');
            if (!toggle && !panel.contains(e.target)) {
                panel.classList.remove('open');
            }
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
    
    console.log('✅ Generated enhanced index.html with improved tag management UI');
    console.log(`📊 Slides included: ${slideMetadata.length}`);
    console.log('🏷️ Tag system: Enhanced GitHub integration with auto-setup');
    slideMetadata.forEach(slide => {
        console.log(`   - ${slide.title} (/${slide.name}/)`);
    });
}

if (import.meta.url === `file://${process.argv[1]}`) {
    generateIndexPage();
}

export { generateIndexPage, slideMetadata };
