const esbuild = require('esbuild');
const path = require('path');
const fs = require('fs');

async function build() {
    try {
        // Ensure the dist directory exists
        const distDir = path.join(__dirname, '../src/renderer/dist');
        if (!fs.existsSync(distDir)) {
            fs.mkdirSync(distDir, { recursive: true });
        }

        // Build the main bundle
        await esbuild.build({
            entryPoints: [path.join(__dirname, '../src/renderer/index.tsx')],
            bundle: true,
            outfile: path.join(distDir, 'bundle.js'),
            platform: 'browser',
            format: 'iife',
            minify: true,
            sourcemap: true,
            target: ['chrome95'],
            define: {
                'process.env.NODE_ENV': '"production"',
                'global': 'window'
            },
            loader: {
                '.js': 'jsx',
                '.jsx': 'jsx',
                '.ts': 'tsx',
                '.tsx': 'tsx',
                '.css': 'css'
            },
            external: ['electron'],
            inject: [path.join(__dirname, 'react-shim.js')]
        });

        // Copy index.html to dist directory
        const htmlSource = path.join(__dirname, '../src/renderer/index.html');
        const htmlDest = path.join(distDir, 'index.html');
        fs.copyFileSync(htmlSource, htmlDest);

        // Copy CSS files
        const cssSource = path.join(__dirname, '../src/renderer/index.css');
        const cssDest = path.join(distDir, 'index.css');
        if (fs.existsSync(cssSource)) {
            fs.copyFileSync(cssSource, cssDest);
        }

        const appCssSource = path.join(__dirname, '../src/renderer/App.css');
        const appCssDest = path.join(distDir, 'App.css');
        if (fs.existsSync(appCssSource)) {
            fs.copyFileSync(appCssSource, appCssDest);
        }

        console.log('React application bundled successfully');
    } catch (error) {
        console.error('Build failed:', error);
        process.exit(1);
    }
}

build(); 