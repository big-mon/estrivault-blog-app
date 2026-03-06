import { createReadStream, existsSync, statSync } from 'node:fs';
import { mkdir } from 'node:fs/promises';
import { createServer } from 'node:http';
import path from 'node:path';
import process from 'node:process';

const args = process.argv.slice(2);

function getArg(name, fallback) {
  const index = args.indexOf(name);
  if (index === -1) {
    return fallback;
  }

  return args[index + 1] ?? fallback;
}

const host = getArg('--host', '127.0.0.1');
const port = Number(getArg('--port', '4173'));
const rootDir = path.resolve(process.cwd(), 'dist');

const contentTypes = new Map([
  ['.css', 'text/css; charset=utf-8'],
  ['.gif', 'image/gif'],
  ['.html', 'text/html; charset=utf-8'],
  ['.ico', 'image/x-icon'],
  ['.js', 'application/javascript; charset=utf-8'],
  ['.jpeg', 'image/jpeg'],
  ['.jpg', 'image/jpeg'],
  ['.json', 'application/json; charset=utf-8'],
  ['.mjs', 'application/javascript; charset=utf-8'],
  ['.png', 'image/png'],
  ['.svg', 'image/svg+xml'],
  ['.txt', 'text/plain; charset=utf-8'],
  ['.webp', 'image/webp'],
  ['.woff', 'font/woff'],
  ['.woff2', 'font/woff2'],
  ['.xml', 'application/xml; charset=utf-8'],
]);

function getContentType(filePath) {
  return contentTypes.get(path.extname(filePath).toLowerCase()) ?? 'application/octet-stream';
}

function resolveRequestPath(urlPathname) {
  let decodedPath;
  try {
    decodedPath = decodeURIComponent(urlPathname);
  } catch {
    return null;
  }

  const relativePath = path.normalize(`.${decodedPath}`).replace(/^(\.\.[/\\])+/, '.');
  const targetPath = path.resolve(rootDir, relativePath);

  if (!targetPath.startsWith(rootDir)) {
    return null;
  }

  if (existsSync(targetPath) && statSync(targetPath).isDirectory()) {
    return path.join(targetPath, 'index.html');
  }

  if (existsSync(targetPath) && statSync(targetPath).isFile()) {
    return targetPath;
  }

  return path.join(targetPath, 'index.html');
}

await mkdir(rootDir, { recursive: true });

const server = createServer(async (req, res) => {
  try {
    const requestUrl = new URL(req.url ?? '/', `http://${req.headers.host ?? `${host}:${port}`}`);
    const filePath = resolveRequestPath(requestUrl.pathname);

    if (filePath === null || !existsSync(filePath) || !statSync(filePath).isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Not found');
      return;
    }

    res.writeHead(200, { 'Content-Type': getContentType(filePath) });
    createReadStream(filePath).pipe(res);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end(message);
  }
});

server.listen(port, host, async () => {
  const indexPath = path.join(rootDir, 'index.html');
  const readiness = existsSync(indexPath) ? 'ready' : 'missing index.html';
  const body = `Static preview server ${readiness}`;
  process.stdout.write(`${body}\n`);

  if (!existsSync(indexPath)) {
    process.stderr.write(
      'dist/index.html was not found. Run the Astro build before starting the preview server.\n',
    );
  }
});
