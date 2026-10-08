import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const host = path.join(root, '.chat-host');
await mkdir(path.join(host, 'src'), { recursive: true });
const data = JSON.parse(await readFile(path.join(root, '.knowledge/index.json'), 'utf8'));
if (data.failures.length || data.services.length !== 15) throw new Error('Kho tài liệu chưa đầy đủ.');
// Only runtime knowledge is bundled. Pricing and evaluation documents stay local.
data.chunks = data.chunks.filter(c => !c.evaluation && !c.pricing && !/07_Service_/.test(c.file) && !/sheet .*test_cases/i.test(c.locator));
delete data.testCases;
const modules = [];
for (const name of ['gemini', 'knowledge', 'chat', 'worker']) {
  let source = await readFile(path.join(root, 'server', `${name}.mjs`), 'utf8');
  source = source.replace(/^import .*;\r?\n/gm, '');
  source = source.replace(/^  static load\(path\).*\r?\n/m, '');
  modules.push(source);
}
await writeFile(path.join(host, 'src/worker.mjs'), `${modules.join('\n')}\nconst knowledge = new Knowledge(${JSON.stringify(data)});\nexport default createWorker(knowledge);\n`);
await writeFile(path.join(host, 'build.mjs'), `import { mkdir, copyFile, writeFile } from 'node:fs/promises';\nawait mkdir('dist/server', { recursive: true });\nawait copyFile('src/worker.mjs', 'dist/server/index.js');\nawait writeFile('dist/server/wrangler.json', JSON.stringify({name:'gascolae-service-chat', main:'index.js', compatibility_date:'2026-10-01', placement:{region:'gcp:us-central1'}}, null, 2));\n`);
await writeFile(path.join(host, '.gitignore'), 'dist/\n.env\n.sites-runtime/\n.wrangler/\nnode_modules/\n');
console.log(`Private server prepared: ${data.services.length} services, ${data.documents.length} documents, ${data.chunks.length} runtime chunks.`);
