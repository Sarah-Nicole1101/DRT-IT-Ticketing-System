
// Import Node.js modules for creating the local server.
import http from 'node:http';

// Import functions for reading files and checking file information.
import { readFile, stat } from 'node:fs/promises';

// Import utilities for handling file and directory paths.
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Set the public folder as the root directory of the website.
const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../public'
);

// Set the server port to 5173 unless another port is provided.
const port = Number(process.env.PORT ?? 5173);

// Define the content types for supported frontend files.
const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml'
};

// Create a local HTTP server for the Employee Portal.
http.createServer(async (request, response) => {
  try {
    // Get and decode the requested URL path.
    const urlPath = decodeURIComponent(
      new URL(request.url, `http://${request.headers.host}`).pathname
    );

    // Convert the requested URL into a local file path.
    const filePath = path.resolve(root, '.' + urlPath);

    // Prevent requests from accessing files outside the public folder.
    if (!filePath.startsWith(root + path.sep) && filePath !== root) {
      response.writeHead(403);
      response.end('Forbidden');
      return;
    }

    // Use the requested file as the initial file candidate.
    let candidate = filePath;

    // Check whether the requested path points to an existing file.
    const isFile = await stat(candidate)
      .then(info => info.isFile())
      .catch(() => false);

    // Load index.html for routes without a matching file.
    if (!isFile) {
      candidate = path.join(root, 'index.html');
    }

    // Read the requested file or the fallback HTML page.
    const data = await readFile(candidate);

    // Send the file with its appropriate content type.
    response.writeHead(200, {
      'Content-Type': mimeTypes[path.extname(candidate)] ?? 'application/octet-stream',
      'Cache-Control': 'no-store'
    });

    // Return the file contents to the browser.
    response.end(data);

  } catch (error) {
    // Return an error response if the server cannot process the request.
    response.writeHead(500);
    response.end('Local development server error');

    // Display the error in the terminal for debugging.
    console.error(error);
  }

// Start the server on localhost using the configured port.
}).listen(port, '127.0.0.1', () => {
  console.log(`Employee frontend available at http://localhost:${port}`);
});
