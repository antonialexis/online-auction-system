const pathToRegexp = require('path-to-regexp');

const pathsToTest = [
    '/profile',
    '/profile/settings',
    '/_/backend/api',
    '/assets/main.js',
    '/',
];

function testPattern(pattern) {
    console.log(`\nTesting pattern: ${pattern}`);
    const keys = [];
    try {
        const re = pathToRegexp(pattern, keys);
        pathsToTest.forEach(p => {
            console.log(`  ${p} -> ${re.test(p)}`);
        });
    } catch(e) {
        console.log(`  Error: ${e.message}`);
    }
}

// testPattern('/((?!_/backend|.*\\..*).*)'); // We know this fails
testPattern('/:path([^.]*)');
testPattern('/:path(.*)');
testPattern('/(.*)');
testPattern('/(.*[^.])'); // doesn't end with dot
