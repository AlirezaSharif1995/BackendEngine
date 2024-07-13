const http = require('http');

const httpApp = express();

httpApp.get('*', (req, res) => {
  res.redirect(`https://${req.headers.host}${req.url}`);
});

const httpServer = http.createServer(httpApp);
httpServer.listen(80, () => {
  console.log('HTTP Server is running on port 80 and redirecting to HTTPS');
});
