const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Minimum versions required
const REQUIRED_VERSIONS = {
    node: '14.0.0',
    npm: '6.0.0'
};

// Environment variables needed
const REQUIRED_ENV_VARS = {
    NODE_ENV: 'production',
    ELECTRON_ENABLE_SECURITY_WARNINGS: 'false',
    // Add any other required environment variables
};

function checkNodeVersion() {
    const nodeVersion = process.version;
    console.log(`Checking Node.js version... Found: ${nodeVersion}`);
    
    if (nodeVersion.startsWith('v')) {
        const version = nodeVersion.slice(1);
        if (compareVersions(version, REQUIRED_VERSIONS.node) < 0) {
            throw new Error(`Node.js version ${REQUIRED_VERSIONS.node} or higher is required`);
        }
    }
}

function checkNpmVersion() {
    try {
        const npmVersion = execSync('npm -v').toString().trim();
        console.log(`Checking npm version... Found: ${npmVersion}`);
        
        if (compareVersions(npmVersion, REQUIRED_VERSIONS.npm) < 0) {
            throw new Error(`npm version ${REQUIRED_VERSIONS.npm} or higher is required`);
        }
    } catch (error) {
        throw new Error('npm is not installed or not accessible');
    }
}

function setEnvironmentVariables() {
    console.log('Setting environment variables...');
    
    for (const [key, value] of Object.entries(REQUIRED_ENV_VARS)) {
        if (process.platform === 'win32') {
            // Windows: Set user environment variables
            execSync(`setx ${key} "${value}"`);
        } else {
            // Unix-like: Add to ~/.profile
            const profilePath = path.join(os.homedir(), '.profile');
            const exportLine = `export ${key}="${value}"\n`;
            
            if (!fs.existsSync(profilePath) || !fs.readFileSync(profilePath, 'utf8').includes(exportLine)) {
                fs.appendFileSync(profilePath, exportLine);
            }
        }
        
        // Set for current process
        process.env[key] = value;
    }
}

function compareVersions(a, b) {
    const partsA = a.split('.').map(Number);
    const partsB = b.split('.').map(Number);
    
    for (let i = 0; i < 3; i++) {
        const valueA = partsA[i] || 0;
        const valueB = partsB[i] || 0;
        
        if (valueA > valueB) return 1;
        if (valueA < valueB) return -1;
    }
    
    return 0;
}

function main() {
    try {
        console.log('Starting prerequisites check...');
        
        // Check versions
        checkNodeVersion();
        checkNpmVersion();
        
        // Set environment variables
        setEnvironmentVariables();
        
        console.log('All prerequisites are satisfied!');
        process.exit(0);
    } catch (error) {
        console.error('Error during prerequisites check:', error.message);
        process.exit(1);
    }
}

main(); 