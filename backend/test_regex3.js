const pathToRegexp = require('path-to-regexp');

const pathsToTest = [
    '/_/backend',
    '/_/backend/api/users',
    '/_/backend/api/login.js',
];

function testPattern(pattern) {
    console.log(`\nTesting pattern: ${pattern}`);
    const keys = [];
    const re = pathToRegexp(pattern, keys);
    pathsToTest.forEach(p => {
        console.log(`  ${p} -> ${re.test(p)}`);
    });
}

testPattern('/_/backend/:path*');
