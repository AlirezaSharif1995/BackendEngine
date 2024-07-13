const express = require('express');
const bodyParser = require('body-parser');
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const { registerAdmin, loginAdmin, userManager } = require('./adminPanel');
const { register, login } = require('./Authentication');
const { createEvent } = require('./eventHandler');

const app = express();
const HTTPS_PORT = 443; // Default HTTPS port
const HTTP_PORT = 80; // Default HTTP port for redirection

// Load SSL certificates
const privateKey = fs.readFileSync('C:/Program Files/OpenSSL-Win64/bin/server.key', 'utf8');
const certificate = fs.readFileSync('C:/Program Files/OpenSSL-Win64/bin/server.crt', 'utf8');
const credentials = { key: privateKey, cert: certificate };

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/registerAdmin', registerAdmin);
app.use('/loginAdmin', loginAdmin);
app.use('/register', register);
app.use('/login', login);
app.use('/userManager', userManager);
app.use('/createEvent', createEvent);
app.use('/', registerAdmin);

const httpsServer = https.createServer(credentials, app);

httpsServer.listen(HTTPS_PORT, () => {
    console.log(`HTTPS Server is running on port ${HTTPS_PORT}`);
});

// Optional: HTTP to HTTPS redirection
const httpApp = express();

httpApp.get('*', (req, res) => {
  res.redirect(`https://${req.headers.host}${req.url}`);
});

const httpServer = http.createServer(httpApp);
httpServer.listen(HTTP_PORT, () => {
  console.log(`HTTP Server is running on port ${HTTP_PORT} and redirecting to HTTPS`);
});

