const fs = require('fs');
const path = require('path');

// URL mapping untuk clean URLs
const urlMap = {
    'landing.html': '/home',
    'new-game.html': '/game', 
    'docs.html': '/docs',
    'about.html': '/about',
    'leaderboard.html': '/leaderboard',
    'index.html': '/'
};

// List file HTML yang perlu diupdate
const htmlFiles = [
    'new-game.html',
    'docs.html', 
    'about.html',
    'leaderboard.html',
    'index.html'
];

function updateLinksInFile(filePath) {
    if (!fs.existsSync(filePath)) {
        console.log(`File ${filePath} not found, skipping...`);
        return;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    let updated = false;
    
    // Replace semua href dengan .html extension
    for (const [oldUrl, newUrl] of Object.entries(urlMap)) {
        const oldPattern = new RegExp(`href=["']${oldUrl}["']`, 'g');
        if (content.match(oldPattern)) {
            content = content.replace(oldPattern, `href="${newUrl}"`);
            updated = true;
            console.log(`Updated ${oldUrl} -> ${newUrl} in ${filePath}`);
        }
    }
    
    if (updated) {
        fs.writeFileSync(filePath, content);
        console.log(`✅ Updated links in ${filePath}`);
    } else {
        console.log(`⏭️  No updates needed for ${filePath}`);
    }
}

console.log('🔄 Updating navigation links to clean URLs...\n');

// Update semua file HTML
htmlFiles.forEach(file => {
    updateLinksInFile(file);
});

console.log('\n✅ All navigation links updated to clean URLs!');
console.log('\nURL Structure:');
console.log('- / → landing.html (Home)');
console.log('- /home → landing.html'); 
console.log('- /game → new-game.html');
console.log('- /docs → docs.html'); 
console.log('- /about → about.html');
console.log('- /leaderboard → leaderboard.html');
