const pathToRegexp = require('path-to-regexp');

const pathsToTest = [
    '/profile',
    '/item/12345',
    '/item/12345/details',
    '/item/12345/details/',
    '/item/12.345',
];

function testPattern(pattern) {
    console.log(`\nTesting pattern: ${pattern}`);
    const keys = [];
    const re = pathToRegexp(pattern, keys);
    pathsToTest.forEach(p => {
        console.log(`  ${p} -> ${re.test(p)}`);
    });
}

testPattern('/:path([^.]*)');
testPattern('/(.*[^.])'); // doesn't end with dot
