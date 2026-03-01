const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function (file) {
        file = dir + '/' + file;
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else {
            if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.css') || file.endsWith('.js')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walk('./src');

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    // 1) Neon Lime to Muted Olive
    content = content.replace(/bfff00/gi, '8a9a5b');

    // 2) Deep Blacks to Soft Charcoal
    content = content.replace(/#0a0a0a/gi, '#1c1c1c');
    content = content.replace(/#0f0f0f/gi, '#222222');
    content = content.replace(/bg-black/gi, 'bg-[#1c1c1c]');
    content = content.replace(/text-black/gi, 'text-[#1c1c1c]');
    content = content.replace(/#000000/gi, '#1c1c1c');

    if (content !== original) {
        fs.writeFileSync(file, content);
        console.log("Updated", file);
    }
});
