const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'Alireza1995!',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });

router.post('/',async(req,res)=>{
const { eventName, schemaID } = req.body;

try {
    if(eventName == null ){
        return res.status(400).json({ error: 'enter event name' });
    }
    const switchDatabaseQuery = `USE \`${schemaID}\``;
    await pool.query(switchDatabaseQuery);

    const [existingEvent] = await pool.query('SELECT * FROM events WHERE eventName = ?', [eventName]);
        if (existingEvent.length > 0) {
            return res.status(400).json({ error: 'eventName is already registered' });
        }
        const ID = generateRandomToken();
        await pool.query('INSERT INTO events (ID, eventName) VALUES (?, ?)', [ID, eventName]);
        res.status(201).json({ message: `event created successfully with ID:`, ID});
    
    } catch (error) {
        console.error('Error occurred:', error);
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