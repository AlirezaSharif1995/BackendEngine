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
const { eventName, schemaID, description, eventType, priority } = req.body;

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
        let insertValues = [ID, eventName ];
        if (description) insertValues.push(description); else insertValues.push(null);
        if (eventType) insertValues.push(eventType); else insertValues.push(null);
        if (priority) insertValues.push(priority); else insertValues.push(null);
        await pool.query('INSERT INTO events (ID, eventName, description, eventType, priority) VALUES (?, ?, ?, ?, ?)', insertValues);

        const createEventTableQuery = `
        CREATE TABLE IF NOT EXISTS \`${eventName}\` (
            id VARCHAR(255) PRIMARY KEY,
            userId INT NOT NULL,
            eventTime TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`;
    
        // Execute the query
        await pool.query(createEventTableQuery);
        res.status(201).json({ message: `event created successfully`, ID});
    
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