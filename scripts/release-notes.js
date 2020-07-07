#!/usr/bin/env node

const { promises: fs } = require('fs');
const { resolve: resolvePath } = require('path');
const { spawn } = require('child_process');
const { diff } = require('deep-diff');
const { endpointUrl, srcPath } = require('./_constants');

const reCdnUrl = new RegExp(`^${endpointUrl}/(.+)-([\\d\\.]+)\\.js$`);
const rootPath = resolvePath(__dirname, '..');
const inPath = resolvePath(rootPath, srcPath);
const encoding = 'utf8';

function getHeadContent(filePath) {
    return new Promise((resolve, reject) => {
        const out = [];
        const err = [];
        const args = ['-C', rootPath, '--no-pager', 'show', `HEAD:${filePath}`];
        const child = spawn('git', args);

        child.stdout.on('data', (data) => {
            out.push(data);
        });
        child.stderr.on('data', (data) => {
            err.push(data);
        });
        child.on('close', (code) => {
            if (err.length || code !== 0) {
                return reject({ code, content: err.join('') });
            }
            resolve(out.join(''));
        });
    });
}

function renderList(arr, prefix = '  -') {
    arr.forEach((item) => {
        console.log(`${prefix} ${item}`);
    });
    console.log(); // newline
}

(async () => {
    const headContent = await getHeadContent(srcPath);
    const currentContent = await fs.readFile(inPath, encoding);
    const differences = diff(JSON.parse(headContent), JSON.parse(currentContent));

    if (!differences) {
        console.log('No differences');
        return;
    }

    const added = [];
    const updated = [];
    const deleted = [];
    differences.forEach((d) => {
        switch (d.kind) {
            case 'D':
                deleted.push(d.path);
                break;
            case 'E':
                updated.push(d.rhs.replace(reCdnUrl, '$1: $2'));
                break;
            case 'N':
                added.push(d.path);
                break;
            default:
                console.warn('Unexpected difference', d);
        }
    });

    if (updated.length || deleted.length) {
        console.log('**Breaking Changes**\n');
    }

    if (updated.length) {
        console.log('- UPDATED version for AMP components:\n');
        renderList(updated);
    }

    if (deleted.length) {
        console.log('- REMOVED support for AMP components:\n');
        renderList(deleted);
    }

    if (added.length) {
        console.log('**Other Changes**\n');
        console.log('- ADDED support for AMP components:\n');
        renderList(added);
    }
})();
