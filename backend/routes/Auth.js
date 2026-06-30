const express = require('express');
const bcrypt = require('bcryptjs'); 
const jwt = require('jsonwebtoken'); 
require('dotenv').config();

const router = express.Router();
const db = require('../db'); 

// ==================== REGISTER ====================
router.post('/users', async (req, res) => {
    const { username, email, password, role } = req.body;

    // 
    if (!username || !email || !password) {
        return res.status(400).json({ message: "Uzuza ibyasabwe byose (username, email, password)" });
    }

    try {
        // 2. Reba niba email isanzwe mu bashyitsi
        const [existingUser] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (existingUser.length > 0) {
            return res.status(400).json({ message: "Iyi email isanzwe ikoreshwa!" });
        }

        // 3. Hashing password (Umutekano)
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 4. Shyira umuser muri Database (role default ni 'user' niba idatanzwe)
        const userRole = role || 'user';
        const query = 'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)';
        
        // HAKOSOWE: Hari hasigaye .promise() kugira ngo async/await ikore
        await db.query(query, [username, email, hashedPassword, userRole]);

        return res.status(201).json({ message: "Umukoresha (User) wegeranyijwe neza!" });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Hari ikibazo cyabaye kuri server", error: error.message });
    }
});

// ==================== LOGIN ====================
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    // 1. Reba niba amakuru yatanzwe
    if (!email || !password) {
        return res.status(400).json({ message: "Uzuza email na password!" });
    }

    try {
        // 2. Shaka umuser ukoresheje email
        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(400).json({ message: "Email cyangwa Password ntabwo ari byo!" });
        }

        const user = users[0];

        // 3. Ganisha password yanditswe n'iri muri database (Bcrypt compare)
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Email cyangwa Password ntabwo ari byo!" });
        }

        // 4. Kora JWT Token (Igihe azamara ari logged in)
        // Shingira kuri JWT_SECRET iri muli .env file yawe
        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET || 'izina_ry_ibanga_ryiza', 
            { expiresIn: '1h' } // Icyura igihe nyuma y'isaha imwe
        );

        // 5. Garura amakuru n'umutekano (Token) muli Frontend
        return res.status(200).json({
            message: "Uyinjiye neza!",
            token: token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Hari ikibazo cyabaye kuri server", error: error.message });
    }
});

module.exports = router;