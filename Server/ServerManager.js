const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');

const { registerAdmin, loginAdmin } = require('./adminPanel');
const { register, login } = require('./Authentication')

const app = express();
const PORT = 3030;
const server = http.createServer(app);

app.use(bodyParser.json());

app.use('/registerAdmin',registerAdmin);
app.use('/loginAdmin',loginAdmin);
app.use('/register', register);
app.use('./login', login);


server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });