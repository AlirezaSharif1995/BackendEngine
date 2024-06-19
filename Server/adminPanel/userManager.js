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

  router.post('/',async(req,res)=>{
    const { ID } = req.body;

    try {
        
    const switchDatabase = `USE backendengin`;
    await pool.query(switchDatabase);
    const [existingUser] = await pool.query('SELECT * FROM adminpanel WHERE ID = ?', [ID]);
    if (existingUser.length === 0) {
        return res.status(404).json({ error: 'User not found' });
    }

    
    const switchDatabaseQuery = `USE \`${existingUser[0].schemaID}\``;
    await pool.query(switchDatabaseQuery);

    const [rows] = await pool.query('SELECT * FROM users LIMIT 50');
    res.status(200).json({ users: rows });

    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Internal server error', details: error });
    }

  });

  module.exports = router;

