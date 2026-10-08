import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const endpoint = new URL(process.argv[2]);
if (endpoint.protocol !== 'https:' || endpoint.username || endpoint.password || endpoint.search || endpoint.hash
    || !endpoint.pathname.endsWith('/api/')) throw new Error('Use an HTTPS /api/ endpoint without credentials.');
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
for (let page = 1; page <= 15; page++) {
  const filename = path.join(root, `landing_page_${String(page).padStart(2, '0')}`, 'index.html');
  const html = await readFile(filename, 'utf8');
  const tag = `<script src="../assets/service-chat.js?v=20261008-chat-7" data-api-base="${endpoint.href}" defer></script>`;
  const changed = html.replace(/<script src="\.\.\/assets\/service-chat\.js(?:\?[^\"]*)?"[^>]*><\/script>/, tag);
  if (html === changed && !html.includes(tag)) throw new Error(`Missing assistant script in ${filename}`);
  await writeFile(filename, changed);
}
console.log('Configured HTTPS chat API for 15 service pages.');
