const esbuild = require('esbuild');
const path = require('path');

async function build() {
  try {
    await esbuild.build({
      entryPoints: ['src/renderer/index.js'],
      bundle: true,
      minify: true,
      sourcemap: true,
      platform: 'browser',
      target: ['chrome91'],
      outfile: 'dist/renderer/bundle.js',
      loader: { 
        '.js': 'jsx',
        '.css': 'css',
        '.svg': 'dataurl',
        '.png': 'dataurl',
        '.jpg': 'dataurl'
      },
      define: {
        'process.env.NODE_ENV': '"production"'
      }
    });

    console.log('Build completed successfully');
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

build(); 