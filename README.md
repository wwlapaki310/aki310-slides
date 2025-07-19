# Aki310 Slides

🎯 **Personal Slidev presentations with advanced tag management and customization features**

This is a personal fork of my-slidev-presentations with enhanced features for individual use, including:

- 🏷️ **Advanced tag management** with persistence
- 💾 **GitHub Gist integration** for data storage
- 🔍 **Enhanced search and filtering**
- ⚙️ **Personal customizations**

## 🚀 Live Demo

**Main site**: Coming soon (will be deployed on Vercel)

## 📁 Project Structure

```
aki310-slides/
├── pnpm-workspace.yaml        # Workspace configuration
├── package.json               # Root package with personal settings
├── slides/                    # Slides directory
│   ├── sre-next-2025/         # SRE presentation
│   │   └── src/
│   │       ├── slides.md      # Slide content
│   │       └── package.json   # Individual settings
│   └── slidev-system/         # System presentation
│       └── src/
│           ├── slides.md      # Slide content
│           └── package.json   # Individual settings
├── scripts/
│   ├── build-index.js         # Index generation with tag management
│   ├── generate-previews.js   # Preview image generation
│   ├── create-slide.js        # Slide creation automation
│   └── slide-metadata.json   # Metadata with tag persistence
├── dist/
│   └── previews/              # Generated preview images
└── vercel.json                # Vercel configuration
```

## 🏷️ Tag Management Features

### Enhanced Tag System
- **Persistent storage**: Tags are saved to GitHub Gist
- **Category system**: Organized tag categories
- **Real-time editing**: Add/remove tags on the page
- **Search & filter**: Find slides by tags instantly

### Personal Customizations
- GitHub Gist integration for data persistence
- Custom metadata management
- Enhanced UI/UX for personal use
- Advanced filtering and search capabilities

## 🔧 Development

### Local Development

```bash
# Develop specific presentation
npm run dev:sre-next-2025
npm run dev:slidev-system
```

### Local Build (for verification)

```bash
# Build all presentations (including preview images)
npm run build

# Build specific parts
npm run build:slides          # Slides only
npm run build:index           # Index page only
npm run build:previews        # Preview images only
npm run generate-previews     # Generate preview images individually
```

### Create New Slide

```bash
npm run create-slide [slide-name] [title]
```

## 🌐 Deployment

This repository is designed for personal use with Vercel:

1. Connect to Vercel
2. Import this repository
3. Deploy automatically

## 🛠️ Tech Stack

- **Frontend**: Slidev (Vue.js)
- **Hosting**: Vercel
- **Package Manager**: pnpm (workspace)
- **Build System**: Integrated build scripts
- **Storage**: GitHub Gist (for tag persistence)
- **Automation**: Playwright (for preview generation)

## 📝 Current Presentations

### SRE NEXT 2025 - NoC Staff Experience

- **Content**: Experience as NoC staff at SRE NEXT 2025 and session introductions
- **Topics**: SRE, NoC, Infrastructure, Operations
- **Updated**: 2025-07-17

### Slidev × Vercel Multi-slide Management System

- **Content**: Explanation of the system for efficiently managing multiple Slidev presentations in one repository
- **Topics**: Slidev, Vercel, DevOps, Automation
- **Updated**: 2025-07-18

## 🔗 Related Projects

- **OSS Version**: [my-slidev-presentations](https://github.com/wwlapaki310/my-slidev-presentations) - Simplified version without advanced tag features
- **Live Demo**: [my-slidev-eight.vercel.app](https://my-slidev-eight.vercel.app/)

---

**Built with ❤️ for personal use, powered by Slidev + pnpm workspace + Playwright + GitHub Gist**
