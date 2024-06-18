const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'Alireza1995!',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });

  router.get('/',async (req,res)=>{

    const { email, password, schemaID } = req.body;
    const switchDatabaseQuery = `USE \`${schemaID}\``;
    await pool.query(switchDatabaseQuery);

    try {

        const [existingUser] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (existingUser.length === 0) {
            return res.status(400).json({ error: 'email is not found' });
        }

        const match = await bcrypt.compare(password, existingUser[0].password_hash);
        if (!match) {
                return res.status(404).json({ error: 'Password is incorect' });
        }

    const user = {
        username: existingUser[0].username

    };

    res.status(200).json({ message: 'Login successful', user });

    } catch (error) {
        res.status(500).json({ error: 'Internal server error', details: error });
    }
    
  });

module.exports = router;