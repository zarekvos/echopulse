const fs = require('fs');
const path = require('path');

// Create public directory
if (!fs.existsSync('public')) {
    fs.mkdirSync('public');
}

// Copy HTML files
const htmlFiles = fs.readdirSync('.').filter(file => file.endsWith('.html'));
htmlFiles.forEach(file => {
    fs.copyFileSync(file, path.join('public', file));
});

// Copy assets directory
function copyDir(src, dest) {
    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
    }
    
    const entries = fs.readdirSync(src, { withFileTypes: true });
    
    for (let entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);
        
        if (entry.isDirectory()) {
            copyDir(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

if (fs.existsSync('assets')) {
    copyDir('assets', 'public/assets');
}

// Copy manifest.json if exists
if (fs.existsSync('manifest.json')) {
    fs.copyFileSync('manifest.json', 'public/manifest.json');
}

console.log('Build complete - files copied to public/');
