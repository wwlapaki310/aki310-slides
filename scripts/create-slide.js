#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

// コマンドライン引数を解析
const args = process.argv.slice(2);
if (args.length < 2) {
    console.error('❌ Usage: npm run create-slide <slide-name> <title>');
    console.error('Example: npm run create-slide my-presentation "My Awesome Presentation"');
    process.exit(1);
}

const slideName = args[0];
const title = args.slice(1).join(' ');

// スライド名のバリデーション
if (!/^[a-z0-9-]+$/.test(slideName)) {
    console.error('❌ Slide name must contain only lowercase letters, numbers, and hyphens');
    process.exit(1);
}

// スライドテンプレートを生成
function generateSlideTemplate(title) {
    return `---
theme: default
background: https://source.unsplash.com/1920x1080/?technology
title: ${title}
class: text-center
highlighter: shiki
lineNumbers: false
info: |
  ## ${title}
  
  Created by Satoru Akita
  
  Learn more at [Slidev](https://sli.dev)
drawings:
  persist: false
transition: slide-left
mdc: true
---

# ${title}

Presentation subtitle

<div class="pt-12">
  <span @click="$slidev.nav.next" class="px-2 py-1 rounded cursor-pointer" hover="bg-white bg-opacity-10">
    Press Space for next page <carbon:arrow-right class="inline"/>
  </span>
</div>

<div class="abs-br m-6 flex gap-2">
  <button @click="$slidev.nav.openInEditor()" title="Open in Editor" class="text-xl slidev-icon-btn opacity-50 !border-none !hover:text-white">
    <carbon:edit />
  </button>
  <a href="https://github.com/wwlapaki310/aki310-slides" target="_blank" alt="GitHub" title="Open in GitHub"
    class="text-xl slidev-icon-btn opacity-50 !border-none !hover:text-white">
    <carbon-logo-github />
  </a>
</div>

---

# What is ${title}?

- 📝 Your first point
- 🎨 Your second point  
- 🚀 Your third point

---

# Getting Started

Add your content here...

\`\`\`javascript
// Example code
console.log('Hello, ${title}!');
\`\`\`

---

# Thank You!

Questions?

<div class="abs-br m-6 text-xl">
  <carbon-logo-github /> wwlapaki310
</div>
`;
}

// package.jsonを生成
function generatePackageJson(slideName) {
    return JSON.stringify({
        "name": slideName,
        "type": "module",
        "private": true,
        "scripts": {
            "build": `slidev build --base /${slideName}/ --out ../../dist/${slideName}`,
            "dev": "slidev --open",
            "export": "slidev export"
        },
        "dependencies": {
            "@slidev/cli": "^0.52.8",
            "@slidev/theme-default": "latest",
            "vue": "^3.4.31"
        }
    }, null, 2);
}

// メイン実行関数
function createSlide(slideName, title) {
    const slideDir = `slides/${slideName}/src`;
    
    // 既存チェック
    if (fs.existsSync(`slides/${slideName}`)) {
        console.error(`❌ Slide "${slideName}" already exists!`);
        process.exit(1);
    }
    
    try {
        console.log(`🚀 Creating slide: ${slideName}`);
        
        // ディレクトリ作成
        fs.mkdirSync(slideDir, { recursive: true });
        console.log(`📁 Created directory: ${slideDir}`);
        
        // slides.md作成
        const slideTemplate = generateSlideTemplate(title);
        fs.writeFileSync(`${slideDir}/slides.md`, slideTemplate);
        console.log(`📝 Created slides.md`);
        
        // package.json作成
        const packageJson = generatePackageJson(slideName);
        fs.writeFileSync(`${slideDir}/package.json`, packageJson);
        console.log(`📦 Created package.json`);
        
        console.log(`\n✅ Successfully created slide: ${slideName}`);
        console.log(`\n🎯 Next steps:`);
        console.log(`   1. cd slides/${slideName}/src`);
        console.log(`   2. npm run dev`);
        console.log(`   3. Edit slides.md`);
        console.log(`   4. npm run build (from root directory)`);
        console.log(`   5. Update scripts/slide-metadata.json manually`);
        console.log(`\n🚀 Your slide will be available at: /${slideName}/`);
        
    } catch (error) {
        console.error(`❌ Error creating slide: ${error.message}`);
        process.exit(1);
    }
}

// スクリプト実行
if (import.meta.url === `file://${process.argv[1]}`) {
    createSlide(slideName, title);
}

export { createSlide };