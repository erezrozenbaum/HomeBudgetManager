const fs = require('fs');
const path = require('path');

function ensureDirectoryExists(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

try {
    // Ensure the dist directory exists
    const distDir = path.join(__dirname, '../src/renderer/dist');
    ensureDirectoryExists(distDir);

    // Copy only the necessary files
    const filesToCopy = [
        'index.html',
        'index.js',
        'index.css',
        'App.js',
        'App.css'
    ];

    filesToCopy.forEach(file => {
        const sourcePath = path.join(__dirname, '../src/renderer', file);
        const destPath = path.join(distDir, file);
        if (fs.existsSync(sourcePath)) {
            fs.copyFileSync(sourcePath, destPath);
        }
    });

    // Copy required directories
    const dirsToCopy = [
        'components',
        'context',
        'pages',
        'services',
        'utils'
    ];

    dirsToCopy.forEach(dir => {
        const sourceDir = path.join(__dirname, '../src/renderer', dir);
        const destDir = path.join(distDir, dir);
        if (fs.existsSync(sourceDir)) {
            ensureDirectoryExists(destDir);
            const files = fs.readdirSync(sourceDir);
            files.forEach(file => {
                if (file.endsWith('.js') || file.endsWith('.css')) {
                    const sourcePath = path.join(sourceDir, file);
                    const destPath = path.join(destDir, file);
                    fs.copyFileSync(sourcePath, destPath);
                }
            });
        }
    });

    // Create a simple bundle.js that loads all dependencies
    const bundleContent = `
        window.React = require('react');
        window.ReactDOM = require('react-dom/client');
        require('./index.js');
    `;
    fs.writeFileSync(path.join(distDir, 'bundle.js'), bundleContent);

    // Update index.html to load bundle.js
    let htmlContent = fs.readFileSync(path.join(distDir, 'index.html'), 'utf8');
    htmlContent = htmlContent.replace(
        /<script.*?src=".*?index\.js".*?>/,
        '<script src="bundle.js"></script>'
    );
    fs.writeFileSync(path.join(distDir, 'index.html'), htmlContent);

    console.log('Build completed successfully');
} catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
} 