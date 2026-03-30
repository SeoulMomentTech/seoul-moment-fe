const fs = require('fs');
const http = require('http');
const https = require('https');

async function fetchJson(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    client.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error("Failed to parse JSON from " + url));
        }
      });
    }).on('error', reject);
  });
}

async function main() {
  const source = process.argv[2];
  const keyword = process.argv[3];

  if (!source || !keyword) {
    console.error("Usage: node extract-swagger.js <url-or-filepath> <path-or-tag-keyword>");
    process.exit(1);
  }

  let swaggerData;
  try {
    if (source.startsWith('http://') || source.startsWith('https://')) {
      swaggerData = await fetchJson(source);
    } else {
      swaggerData = JSON.parse(fs.readFileSync(source, 'utf8'));
    }
  } catch (error) {
    console.error("Error loading Swagger data:", error.message);
    process.exit(1);
  }

  const extracted = {
    openapi: swaggerData.openapi || swaggerData.swagger,
    info: swaggerData.info,
    paths: {},
    components: { schemas: {} }
  };

  const refs = new Set();

  function findRefs(obj) {
    if (!obj || typeof obj !== 'object') return;
    if (obj.$ref) {
      refs.add(obj.$ref);
    }
    for (const key in obj) {
      findRefs(obj[key]);
    }
  }

  let matchCount = 0;
  const searchKeyword = keyword.toLowerCase();

  for (const [path, methods] of Object.entries(swaggerData.paths || {})) {
    const pathMatches = path.toLowerCase().includes(searchKeyword);
    
    for (const [methodName, operation] of Object.entries(methods)) {
      if (methodName === 'parameters') continue;

      let tagMatches = false;
      if (operation.tags && Array.isArray(operation.tags)) {
        tagMatches = operation.tags.some(tag => tag.toLowerCase().includes(searchKeyword));
      }

      if (pathMatches || tagMatches) {
        if (!extracted.paths[path]) extracted.paths[path] = {};
        extracted.paths[path][methodName] = operation;
        findRefs(operation);
        matchCount++;
      }
    }

    if (extracted.paths[path] && methods.parameters) {
      extracted.paths[path].parameters = methods.parameters;
      findRefs(methods.parameters);
    }
  }

  if (matchCount === 0) {
    console.error(`No endpoints found matching path or tag: "${keyword}"`);
    console.log(JSON.stringify(extracted, null, 2));
    return;
  }

  let added = true;
  while (added) {
    added = false;
    for (const ref of Array.from(refs)) {
      if (ref.startsWith('#/components/schemas/')) {
        const schemaName = ref.replace('#/components/schemas/', '');
        if (swaggerData.components?.schemas?.[schemaName] && !extracted.components.schemas[schemaName]) {
          extracted.components.schemas[schemaName] = swaggerData.components.schemas[schemaName];
          const beforeSize = refs.size;
          findRefs(swaggerData.components.schemas[schemaName]);
          if (refs.size > beforeSize) added = true;
        }
      } else if (ref.startsWith('#/definitions/')) {
        const schemaName = ref.replace('#/definitions/', '');
        if (!extracted.definitions) extracted.definitions = {};
        if (swaggerData.definitions?.[schemaName] && !extracted.definitions[schemaName]) {
          extracted.definitions[schemaName] = swaggerData.definitions[schemaName];
          const beforeSize = refs.size;
          findRefs(swaggerData.definitions[schemaName]);
          if (refs.size > beforeSize) added = true;
        }
      }
    }
  }

  console.log(JSON.stringify(extracted, null, 2));
}

main().catch(error => {
  console.error("Fatal Error:", error);
  process.exit(1);
});
