#!/usr/bin/env node

const { promises: fs } = require('fs');
const { resolve: resolvePath } = require('path');
const { get: httpsGet } = require('https');
const { endpointUrl, versionsUrl, srcPath } = require('./_constants');

const outPath = resolvePath(__dirname, '..', srcPath);
const encoding = 'utf8';

function getJson(url) {
    return new Promise((resolve, reject) => {
        let body = '';
        httpsGet(url, (res) => {
            res.setEncoding(encoding);
            res.on('data', (data) => {
                body += data;
            });
            res.on('end', () => {
                try {
                    resolve(JSON.parse(body));
                } catch (e) {
                    reject(e);
                }
            });
        }).on('error', reject);
    });
}

function replacer(name, value) {
    if (!name || !value) {
        // Thanks https://stackoverflow.com/a/43636793
        return value instanceof Object && !(value instanceof Array)
            ? Object.keys(value)
                  .sort()
                  .reduce((sorted, key) => {
                      sorted[key] = value[key];
                      return sorted;
                  }, {})
            : value;
    }

    return `${endpointUrl}/${name}-${value}.js`;
}

(async () => {
    const json = await getJson(versionsUrl);
    const content = JSON.stringify(json, replacer, 2);
    console.log(content);
    await fs.writeFile(outPath, content, encoding);
})();
