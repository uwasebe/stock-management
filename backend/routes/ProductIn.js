const express = require('express');
const mysql = require('mysql2');
require('dotenv').config();

const db = require('../db');
const router = express.Router();

// ===================== CREATE A PRODUCT IN =====================
router.post('/', async (req, res) => {
    const { productcode, date, quantity, uniqueprice, totalprice } = req.body;
    
    if (!productcode || !date || !quantity || !uniqueprice || !totalprice) {
        return res.status(400).json({ message: "Uzuza amakuru yose asabwa!" });
    }

    try {
        const [result] = await db.query(
            'INSERT INTO product_in (ProductCode, Date, Quantity, UniquePrice, Totalprice) VALUES (?, ?, ?, ?, ?)',
            [productcode, date, quantity, uniqueprice, totalprice]
        );
        return res.status(201).json({ message: "Product in created successfully", productInId: result.insertId });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Hari ikibazo cyabaye kuri server", error: error.message });
    }
});
        
// ===================== GET ALL PRODUCT IN ============================
router.get('/', async (req, res) => {
    try {
        // HAKOSOWE: id yongeweho kugira ngo ifatswe neza mu guhindura cyangwa gusiba
        const [rows] = await db.query(
            'SELECT id, ProductCode AS productcode, Date AS date, Quantity AS quantity, UniquePrice AS uniqueprice, Totalprice AS totalprice FROM product_in ORDER BY id DESC'
        );
        return res.status(200).json(rows);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Hari ikibazo cyabaye kuri server", error: error.message });
    }
});

// ======================== UPDATE A PRODUCT IN ===========================
router.put('/:id', async (req, res) => {
    const { productcode, date, quantity, uniqueprice, totalprice } = req.body;
    const { id } = req.params;
    
    try {
        await db.query(
            'UPDATE product_in SET ProductCode = ?, Date = ?, Quantity = ?, UniquePrice = ?, Totalprice = ? WHERE id = ?',
            [productcode, date, quantity, uniqueprice, totalprice, id]
        );
        return res.status(200).json({ message: "Product in updated successfully" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Hari ikibazo cyabaye kuri server", error: error.message });
    }
});

// ========================= DELETE A PRODUCT IN ======================
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    
    try {
        await db.query('DELETE FROM product_in WHERE id = ?', [id]);
        return res.status(200).json({ message: "Product in deleted successfully" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Hari ikibazo cyabaye kuri server", error: error.message });
    }
});

module.exports = router;