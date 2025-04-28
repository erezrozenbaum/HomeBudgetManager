const fs = require('fs');
const path = require('path');

function ensureDirectoryExists(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

function deleteDirectoryRecursive(dir) {
    if (fs.existsSync(dir)) {
        fs.readdirSync(dir).forEach((file) => {
            const curPath = path.join(dir, file);
            if (fs.lstatSync(curPath).isDirectory()) {
                deleteDirectoryRecursive(curPath);
            } else {
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(dir);
    }
}

try {
    // Ensure a clean dist directory
    const distDir = path.join(__dirname, '../src/renderer/dist');
    deleteDirectoryRecursive(distDir);
    ensureDirectoryExists(distDir);

    // Create a bundle that includes React and ReactDOM
    const bundleContent = `
        // Load React and ReactDOM from node_modules
        const React = require('react');
        const ReactDOM = require('react-dom/client');
        const { BrowserRouter } = require('react-router-dom');
        const { AuthProvider } = require('../context/AuthContext');
        const { ThemeProvider } = require('../context/ThemeContext');
        
        // Make them available globally
        window.React = React;
        window.ReactDOM = ReactDOM;
        
        // Load our app
        require('../index.js');
    `;
    fs.writeFileSync(path.join(distDir, 'bundle.js'), bundleContent);

    // Copy necessary files
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
        'contexts',
        'pages',
        'services',
        'utils'
    ];

    dirsToCopy.forEach(dir => {
        if (dir === 'dist') return; // Never copy dist into itself
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