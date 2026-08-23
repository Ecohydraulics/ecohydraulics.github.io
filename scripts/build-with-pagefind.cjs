/* This is a script to build the site with Pagefind */

const { execSync } = require('child_process');
const { existsSync } = require('fs');
const { join } = require('path');

// Detect the platform
function detectPlatform() {
    // Check environment variables
    if (process.env.GITHUB_ACTIONS) {
        return 'github';
    }
    if (process.env.CF_PAGES) {
        return 'cloudflare';
    }
    if (process.env.NETLIFY) {
        return 'netlify';
    }
    if (process.env.EDGEONE) {
        return 'edgeone';
    }
    if (process.env.VERCEL) {
        return 'vercel';
    }

    // Check if specific directories exist
    if (existsSync('.vercel')) {
        return 'vercel';
    }

    // Default to standard dist directory
    return 'default';
}

// Get Pagefind output directory
function getPagefindOutputDir(platform) {
    const outputDirs = {
        default: 'dist',
        github: 'dist',
        cloudflare: 'dist',
        netlify: 'dist',
        edgeone: 'dist',
        vercel: '.vercel/output/static',
    };

    return outputDirs[platform] || 'dist';
}

// Resolve a locally installed binary. Going through `npx` routes into npm, which does
// not understand the pnpm-only settings in .npmrc (noisy warnings on every build) and
// which silently downloads a different major version from the registry when
// node_modules is incomplete -- failing later with a confusing error.
function localBin(name) {
    const bin = join(__dirname, '..', 'node_modules', '.bin', name + (process.platform === 'win32' ? '.cmd' : ''));
    if (!existsSync(bin)) {
        console.error(`❌ ${name} not found at ${bin}`);
        console.error('   Dependencies are not installed. Run: pnpm install');
        process.exit(1);
    }
    return `"${bin}"`;
}

// Main function
function main() {
    const platform = detectPlatform();
    const outputDir = getPagefindOutputDir(platform);

    console.log(`🚀 Detected deployment platform: ${platform}`);
    console.log(`📁 Pagefind output directory: ${outputDir}`);

    try {
        // Run Astro build
        console.log('🔨 Running Astro build...');
        execSync(`${localBin('astro')} build`, {
            stdio: 'inherit',
            cwd: process.cwd() // Ensure in the correct directory
        });

        // Check if output directory exists
        if (!existsSync(outputDir)) {
            console.error(`❌ Output directory does not exist: ${outputDir}`);
            process.exit(1);
        }

        // Run Pagefind
        console.log(`🔍 Running Pagefind search index generation...`);
        execSync(`${localBin('pagefind')} --site ${outputDir}`, {
            stdio: 'inherit',
            cwd: process.cwd() // Ensure in the correct directory
        });

        console.log('✅ Build completed!');
        console.log(`📊 Search index generated at: ${outputDir}/pagefind/`);

    } catch (error) {
        console.error('❌ Build failed:', error.message);
        process.exit(1);
    }
}

main();