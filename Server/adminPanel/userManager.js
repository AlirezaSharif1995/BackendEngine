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

  router.post('/getAchievements', async (req, res) => {
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

        // Get the total number of unique users
        const [uniqueUsersResult] = await pool.query('SELECT COUNT(DISTINCT userId) AS totalUsers FROM Achievements');
        const totalUsers = uniqueUsersResult[0].totalUsers;

        // Get the achievements data with counts and percentages
        const [achievements] = await pool.query(`
            SELECT 
                achievement, 
                COUNT(*) AS count, 
                COUNT(*) / ? * 100 AS percentage, 
                MAX(timeEvent) AS lastTime,
                (
                    SELECT userId
                    FROM Achievements AS innerA
                    WHERE innerA.achievement = outerA.achievement
                    ORDER BY innerA.timeEvent DESC
                    LIMIT 1
                ) AS lastUserId
            FROM Achievements AS outerA
            GROUP BY achievement
        `, [totalUsers]);

        res.status(200).json({ achievements });

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal server error', details: error });
    }
});

router.post('/getActiveUser', async (req, res) => {
    const { ID } = req.body;

    try {
        // Switch to the main database to check for the user
        await pool.query(`USE backendengin`);
        const [existingUser] = await pool.query('SELECT * FROM adminpanel WHERE ID = ?', [ID]);

        if (existingUser.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Switch to the specific user's database
        const switchDatabaseQuery = `USE \`${existingUser[0].schemaID}\``;
        await pool.query(switchDatabaseQuery);

        // Query to get active user counts for the last 7 days
        const [rows] = await pool.query(`
            SELECT DATE(lastLogin) AS login_date, COUNT(*) AS login_count
            FROM users
            WHERE lastLogin >= CURDATE() - INTERVAL 7 DAY
            GROUP BY DATE(lastLogin)
            ORDER BY DATE(lastLogin)
        `);

        // Create an array with all dates of the last 7 days and their counts
        const result = [];
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Ensure we start from midnight of the current day

        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            const formattedDate = date.toISOString().substring(5, 10); // MM-DD format

            const row = rows.find(row => {
                const rowDate = new Date(row.login_date);
                return rowDate.toISOString().substring(0, 10) === date.toISOString().substring(0, 10);
            });

            result.push({
                date: formattedDate,
                count: row ? row.login_count : 0
            });
        }

        res.status(200).json({ message: 'Data retrieved successfully', activeUserCounts: result });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal server error', details: error });
    }
});

router.post('/getReturningUser', async (req, res) => {
    const { ID } = req.body;

    try {
        // Switch to backendengin database or your relevant database
        const switchDatabase = `USE backendengin`;
        await pool.query(switchDatabase);

        // Fetch admin panel details
        const [existingUser] = await pool.query('SELECT * FROM adminpanel WHERE ID = ?', [ID]);
        if (existingUser.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Switch to the user's schema
        const switchDatabaseQuery = `USE \`${existingUser[0].schemaID}\``;
        await pool.query(switchDatabaseQuery);

        // Query to count returning users (firstLogin != lastLogin)
        const [rows] = await pool.query(`
            SELECT COUNT(*) AS returning_user_count 
            FROM users 
            WHERE DATE(firstLogin) != DATE(lastLogin)
        `);

        const returningUserCount = rows[0].returning_user_count;

        res.status(200).json({ message: 'Returning user count fetched successfully', returningUserCount });
        
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal server error', details: error });
    }
});

router.post('/userLimitationStats', async (req, res) => {
    const { ID } = req.body;

    try {
        
        const switchDatabase = `USE backendengin`;
        await pool.query(switchDatabase);
        const [limitRows] = await pool.query('SELECT userLimitaion FROM adminpanel WHERE ID = ?', [ID]); 

        const [existingUser] = await pool.query('SELECT * FROM adminpanel WHERE ID = ?', [ID]);
        if (existingUser.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const switchDatabaseQuery = `USE \`${existingUser[0].schemaID}\``;
        await pool.query(switchDatabaseQuery);

        const [userCountRows] = await pool.query('SELECT COUNT(*) AS userCount FROM users'); 
        const userCount = userCountRows[0].userCount;

        // Calculate percentage
        const userLimitation = limitRows[0].userLimitaion;
        const percentage = (userCount / userLimitation) * 100;

        res.status(200).json({ percentage });
    } catch (error) {
        console.error('Error fetching user limitation stats:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

  module.exports = router;

