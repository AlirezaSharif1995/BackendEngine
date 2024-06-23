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

router.post('/', async(req,res)=>{
    const { email, password, location, username, schemaID, phoneNumber, label, tags } = req.body;

    try {
        if(email == null || password == null ){
            return res.status(400).json({ error: 'enter email and password' });
        }
        const switchDatabaseQuery = `USE \`${schemaID}\``;
        await pool.query(switchDatabaseQuery);

        const [existingUser] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (existingUser.length > 0) {
            return res.status(400).json({ error: 'email is already registered' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const ID = generateRandomToken();
        let insertValues = [ID, email, hashedPassword];
        if (location) insertValues.push(location); else insertValues.push(null);
        if (phoneNumber) insertValues.push(phoneNumber); else insertValues.push(null);
        if (username) insertValues.push(username); else insertValues.push(null);
        if (label) insertValues.push(label); else insertValues.push(null);
        if (tags) insertValues.push(tags); else insertValues.push(null);

        await pool.query('INSERT INTO users (ID, email, password_hash, location, phoneNumber, username, label, tags) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', insertValues);
        res.status(201).json({ message: 'User registered successfully', ID });
        
    } catch (error) {
        console.log(error)
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