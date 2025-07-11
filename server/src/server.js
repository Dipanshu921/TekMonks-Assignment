import http from 'http';
const PORT = 3000;
import { fetchStories } from './service/fetchStories.js';
import { extractStories } from './service/extractStories.js';


const server = http.createServer(async (req, res) => {
  console.log("Request received:", req.method, req.url);

  // Here i have to mention both types of urls(with and without trailing slash) due to in-built http library behavior
  if (req.method === 'GET' && (req.url === '/getTimeStories' || req.url === '/getTimeStories/')) {
    try {
      const data = await fetchStories('https://time.com/feed/'); // i received json from fetchStories
      const stories = extractStories(data);

      res.writeHead(200, { 'Content-Type': 'application/json' }); // because i am sending json response
      res.end(JSON.stringify(stories, null, 2)); // doing serialization here
    } catch (error) {
      console.error("Error:", error.message);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: error.message }));
    }
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' }); // for plain text response(if wrong url)
    res.end('404 Not Found');
  }
});

// I am starting the  server here
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/getTimeStories`);
});

