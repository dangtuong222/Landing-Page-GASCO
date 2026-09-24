import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const port = Number(process.argv[2] || process.env.PORT || 8080);
const host = process.env.HOST || "127.0.0.1";
const mode = process.argv[3] || "";
const verifyMode = mode === "--verify";
const maxRequests = verifyMode ? 0 : Number(mode || 0);
let servedRequests = 0;

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".gif": "image/gif",
  ".html": "text/html; charset=utf-8",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml; charset=utf-8",
  ".webp": "image/webp",
};

const sendFile = async (response, filePath, statusCode = 200) => {
  const body = await readFile(filePath);
  response.writeHead(statusCode, {
    "Content-Type": contentTypes[path.extname(filePath).toLowerCase()] || "application/octet-stream",
    "Content-Length": body.length,
    "X-Content-Type-Options": "nosniff",
  });
  response.end(body);
};

const server = createServer(async (request, response) => {
  response.once("finish", () => {
    servedRequests += 1;
    if (maxRequests > 0 && servedRequests >= maxRequests) server.close();
  });

  try {
    const requestUrl = new URL(request.url || "/", `http://${request.headers.host || host}`);
    const pathname = decodeURIComponent(requestUrl.pathname);
    const relativePath = pathname.replace(/^\/+/, "");
    let filePath = path.resolve(root, relativePath);

    if (filePath !== root && !filePath.startsWith(`${root}${path.sep}`)) {
      response.writeHead(403);
      response.end("Forbidden");
      return;
    }

    const fileStats = await stat(filePath);
    if (fileStats.isDirectory()) filePath = path.join(filePath, "index.html");
    await sendFile(response, filePath);
  } catch (error) {
    if (error?.code !== "ENOENT" && error?.code !== "ENOTDIR") {
      response.writeHead(500);
      response.end("Internal server error");
      return;
    }

    try {
      await sendFile(response, path.join(root, "404.html"), 404);
    } catch {
      response.writeHead(404);
      response.end("Not found");
    }
  }
});

server.listen(port, host, async () => {
  console.log(`GASCOLAE dashboard: http://${host}:${port}/`);

  if (!verifyMode) return;

  const paths = [
    "/",
    ...Array.from({ length: 12 }, (_, index) => `/landing_page_${String(index + 1).padStart(2, "0")}/`),
    "/assets/dashboard.css",
    "/assets/dashboard.js",
    "/assets/service-hub.css",
    "/assets/service-hub.js",
    "/assets/dashboard-thumbnails/service-01.webp",
  ];

  try {
    for (const requestPath of paths) {
      const response = await fetch(`http://${host}:${port}${requestPath}`);
      const body = await response.arrayBuffer();
      if (response.status !== 200 || body.byteLength === 0) {
        throw new Error(`${requestPath}: HTTP ${response.status}, ${body.byteLength} bytes`);
      }
      console.log(`PASS\t${requestPath}\t${body.byteLength} bytes`);
    }

    const missingResponse = await fetch(`http://${host}:${port}/does-not-exist/`);
    if (missingResponse.status !== 404) {
      throw new Error(`/does-not-exist/: expected HTTP 404, received ${missingResponse.status}`);
    }
    console.log("PASS\t/does-not-exist/\t404.html returned");
  } catch (error) {
    console.error(`VERIFY FAILED: ${error.message}`);
    process.exitCode = 1;
  } finally {
    server.close();
  }
});
