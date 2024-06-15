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

router.post('/',async (req,res)=>{
    const { email, password, plan } = req.body;
    const schemaID = generateRandomToken();

    if (!plans[plan]) {
        return res.status(400).json({ error: 'Invalid plan' });
      }
    
      // Extract plan details
      const planDetails = plans[plan];
      const userLimitation = planDetails.userLimitation;
      const expireDate = planDetails.expireDate();


    try {

        const createDatabaseQuery = `CREATE DATABASE IF NOT EXISTS \`${schemaID}\``;
        await pool.query(createDatabaseQuery);

        const switchDatabaseQuery = `USE \`${schemaID}\``;
        await pool.query(switchDatabaseQuery);

        const createUsersTableQuery = `
        CREATE TABLE IF NOT EXISTS users (
          id INT PRIMARY KEY,
          email VARCHAR(255) NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          location VARCHAR(255),
          username VARCHAR(255) NOT NULL UNIQUE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;
      await pool.query(createUsersTableQuery);

      const hashedPassword = await bcrypt.hash(password, 10);

      const adminID = generateRandomToken();
      await pool.query('USE backendengin');
      await pool.query('INSERT INTO adminpanel (ID, email, password_hash, userLimitaion, expireDate, schemaID) VALUES (?, ?, ?, ?, ?, ?)', [adminID, email, hashedPassword, userLimitation, expireDate, schemaID]);

        res.status(201).json({ message: `Admin panel with SchemaID : ${schemaID} created successfully` });
        
    } catch (error) {
        res.status(500).json({ error: 'Internal server error', details: error });
    }
});

function generateRandomToken() {
    let token = '';
    for (let i = 0; i < 5; i++) {
        token += Math.floor(Math.random() * 10); // Generate random digit (0-9)
    }
    return token;
}

module.exports = router;