// server.js
const port = process.env.PORT || 3000; // 👈 Priorité à Hostinger (process.env.PORT)

app.prepare().then(() => {
  createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  })
  .listen(port, "0.0.0.0", (err) => { // 👈 "0.0.0.0" au lieu de localhost
    if (err) throw err;
    // Ce log te dira enfin quel port Hostinger utilise !
    console.log(`> [HEBRON] Serveur démarré sur le port : ${port}`);
  });
});