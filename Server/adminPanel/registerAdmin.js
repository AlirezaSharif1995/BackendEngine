const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

const plans = {
  free: {
    userLimitation: 100,
    expireDate: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
  },
  premium: {
    userLimitation: 1000,
    expireDate: () => new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
  },
  enterprise: {
    userLimitation: 5000,
    expireDate: () => new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000), // 2 years from now
  }
};

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'Alireza1995!',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

router.post('/', async (req, res) => {
  const { email, password, plan } = req.body;
  const schemaID = generateRandomToken();

  if (!plans[plan]) {
    return res.status(400).json({ error: 'Invalid plan' });
  }

  const planDetails = plans[plan];
  const userLimitation = planDetails.userLimitation;
  const expireDate = planDetails.expireDate();

  try {

    const switchDatabase = `USE backendengin`;
    await pool.query(switchDatabase);

    const [existingUser] = await pool.query('SELECT * FROM adminpanel WHERE email = ?', [email]);
    if (existingUser.length > 0) {
        return res.status(400).json({ message: 'email is already registered' });
    }
    const createDatabaseQuery = `CREATE DATABASE IF NOT EXISTS \`${schemaID}\``;
    await pool.query(createDatabaseQuery);

    const switchDatabaseQuery = `USE \`${schemaID}\``;
    await pool.query(switchDatabaseQuery);

    const createUsersTableQuery = `
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(255) PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        location VARCHAR(255),
        phoneNumber VARCHAR(255) UNIQUE,
        username VARCHAR(255),
        label VARCHAR(255),
        tags VARCHAR(255),
        isBan TINYINT(1) DEFAULT 0,
        firstLogin TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        lastLogin TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    await pool.query(createUsersTableQuery);

    const createEventTableQuery = `
  CREATE TABLE IF NOT EXISTS Events (
    id VARCHAR(255) PRIMARY KEY,
    eventName VARCHAR(255) NOT NULL,
    eventTrigger int,
    description TEXT,
    status ENUM('active', 'inactive', 'completed') DEFAULT 'active',
    eventData JSON,
    frequency VARCHAR(255),
    createdBy VARCHAR(255),
    updatedBy VARCHAR(255),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    firstTimeTrigger TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    lastTimeTrigger TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    eventType VARCHAR(255),
    priority INT,
    FOREIGN KEY (userId) REFERENCES Users(id)
  )
    `;
    await pool.query(createEventTableQuery);


    const hashedPassword = await bcrypt.hash(password, 10);

    const adminID = generateRandomToken();
    await pool.query('USE backendengin');
    await pool.query('INSERT INTO adminpanel (ID, email, password_hash, userLimitaion, expireDate, schemaID) VALUES (?, ?, ?, ?, ?, ?)', [adminID, email, hashedPassword, userLimitation, expireDate, schemaID]);

    res.status(201).json({ message: `Admin panel with SchemaID: ${schemaID} created successfully`, ID: adminID});
  } catch (error) {
    console.error('Error occurred:', error);
    res.status(500).json({ error: 'Internal server error', details: error });
  }
});

function generateRandomToken() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < 50; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    token += characters.charAt(randomIndex);
  }
  return token;
}

module.exports = router;
