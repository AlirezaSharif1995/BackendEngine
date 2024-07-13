const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'Alireza1995!',
    database: 'backendengin',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

router.post('/', async (req, res) => {

    const { email, password } = req.body;

    try {
        const switchDatabase = `USE backendengin`;
        await pool.query(switchDatabase);
        const [existingUser] = await pool.query('SELECT * FROM adminpanel WHERE email = ?', [email]);
        if (existingUser.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const match = await bcrypt.compare(password, existingUser[0].password_hash);
        if (!match) {
            return res.status(404).json({ error: 'Password is incorect' });
        }

        const user = {
            ID: existingUser[0].ID,
            schemaID: existingUser[0].schemaID,
        };

        res.status(200).json({ message: 'Login successful', user });

    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Internal server error', details: error });
    }

});

router.post('/inAppLogin', async (req, res) => {

    const { ID } = req.body;

    try {
console.log(req.body)
        const switchDatabase = `USE backendengin`;
        await pool.query(switchDatabase);
        const [existingUser] = await pool.query('SELECT * FROM adminpanel WHERE ID = ?', [ID]);
        if (existingUser.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const user = {
            ID: existingUser[0].ID,
            schemaID: existingUser[0].schemaID,
            baseURL: existingUser[0].baseURL
        };

        res.status(200).json({ message: 'Login successful', user });

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal server error', details: error });
    }

});

router.post('/getAdminInfo', async (req, res) => {
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
        const [rows] = await pool.query('SELECT COUNT(*) AS row_count FROM users');
        const rowCount = rows[0].row_count;

        const [rows2] = await pool.query('SELECT COUNT(*) AS login_count FROM users WHERE DATE(lastLogin) = CURDATE()');
        const loginCount = rows2[0].login_count;

        const user = {
            ID: existingUser[0].ID,
            schemaID: existingUser[0].schemaID,
            expireDate: existingUser[0].expireDate,
            rowCount: rowCount,
            dailyUser: loginCount,
        };

        res.status(200).json({ message: 'Login successful', user });

    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Internal server error', details: error });
    }

});

router.post('/updateCharts', async (req, res) => {
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

        const [rows2] = await pool.query('SELECT COUNT(*) AS first_login_count FROM users WHERE DATE(firstLogin) = CURDATE()');
        const firstLoginCount = rows2[0].first_login_count;

        const [rows3] = await pool.query(`
            SELECT DATE(firstLogin) AS login_date, COUNT(*) AS login_count 
            FROM users 
            WHERE DATE(firstLogin) >= CURDATE() - INTERVAL 6 DAY 
            GROUP BY DATE(firstLogin)
            ORDER BY DATE(firstLogin)
        `);

        const today = new Date();
        today.setHours(0, 0, 0, 0); // Ensure we start from midnight of the current day

        const last7DaysLoginCounts = {};

        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            const formattedDate = date.toISOString().split('T')[0]; // Format date as YYYY-MM-DD
            last7DaysLoginCounts[formattedDate] = 0;
        }

        rows3.forEach(row => {
            const formattedDate = new Date(row.login_date).toISOString().split('T')[0]; // Ensure date is formatted as YYYY-MM-DD
            last7DaysLoginCounts[formattedDate] = row.login_count;
        });

        const loginCountsArray = Object.entries(last7DaysLoginCounts).map(([date, count]) => ({
            date,
            count
        }));

        const user = {
            firstLoginCount: firstLoginCount,
            last7DaysLoginCounts: loginCountsArray
        }

        res.status(200).json({ message: 'Data sent successfully', user });

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal server error', details: error });
    }
});


module.exports = router;