const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const path = require('path');

const { registerAdmin, loginAdmin, userManager } = require('./adminPanel');
const { register, login } = require('./Authentication');
const { createEvent } = require('./eventHandler');

const app = express();
const PORT = 3030;
const server = http.createServer(app);

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/registerAdmin',registerAdmin);
app.use('/loginAdmin',loginAdmin);
app.use('/register', register);
app.use('/login', login);
app.use('/userManager', userManager);
app.use('/createEvent', createEvent);


server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });