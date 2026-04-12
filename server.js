// server.js (Version ES Module)
import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';

const dev = process.env.NODE_ENV !== 'production';
const port = process.env.PORT || 3000;
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  }).listen(port, "0.0.0.0", (err) => { // 👈 On force l'écoute sur toutes les interfaces
    if (err) throw err;
    console.log(`> Application lancée sur le PORT: ${port}`);
    console.log(`> URL: http://localhost:${port}`);
  });
});