const express = require('express');
const db = require('../db');
const router = express.Router();
require('dotenv').config();
// ===================== CREATE A PRODUCT OUT (POST) =====================
router.post('/', async (req, res) => {
    const { ProductCode, Date, Quantity, UniquePrice, Totalprice } = req.body;
    
    if (!ProductCode || !Date || !Quantity || !UniquePrice || !Totalprice) {
        return res.status(400).json({ message: "All fields are required! Genzura niba code, itariki, ingano n'igiciro byuzuye." });
    }

    try {
        // 1. Kubara ibyinjiye byose (Total Stock In) kuri icyo gicuruzwa
        const [sumIn] = await db.query(
            'SELECT SUM(Quantity) AS totalIn FROM product_in WHERE ProductCode = ?', 
            [ProductCode]
        );
        const totalAvailableIn = Number(sumIn[0].totalIn || 0);

        // 2. Kubara ibyasohotse byose basanzwe bafite muli stoki
        const [sumOut] = await db.query(
            'SELECT SUM(Quantity) AS totalOut FROM product_out WHERE ProductCode = ?', 
            [ProductCode]
        );
        const totalAlreadyOut = Number(sumOut[0].totalOut || 0);

        // 3. Kubara ingano isigaye mu bubiko (Current Stock)
        const currentStock = totalAvailableIn - totalAlreadyOut;

        // 4. Kugenzura niba ingano bashaka gusohora ihari
        if (Number(Quantity) > currentStock) {
            return res.status(400).json({ 
                message: `Ntabwo bikunze! Ingano ushaka gusohora (${Quantity}) iruta iyasigaye muli stoki (${currentStock}).` 
            });
        }

        // 5. Niba ihari, reka twemeze kwinjira
        const [result] = await db.query(
            'INSERT INTO product_out (ProductCode, Date, Quantity, UniquePrice, Totalprice) VALUES (?, ?, ?, ?, ?)',
            [ProductCode, Date, Quantity, UniquePrice, Totalprice]
        );
        return res.status(201).json({ message: "Product out created successfully", productOutId: result.insertId });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Hari ikibazo cyabaye kuri server", error: error.message });
    }
});

// ===================== GET ALL PRODUCT OUT (READ) =====================
router.get('/', async (req, res) => {
    try {
        const [productOutList] = await db.query('SELECT * FROM product_out ORDER BY id DESC');
        return res.status(200).json({ message: "Product out data retrieved successfully", productOutList });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Hari ikibazo cyabaye kuri server", error: error.message });
    }
});

// ===================== UPDATE A PRODUCT OUT (UPDATE) =====================
router.put('/:id', async (req, res) => {
    const { ProductCode, Date, Quantity, UniquePrice, Totalprice } = req.body;
    const { id } = req.params;

    if (!ProductCode || !Date || !Quantity || !UniquePrice || !Totalprice) {
        return res.status(400).json({ message: "All fields are required for update" });
    }

    try {
        // 1. Gufata ingano ya kera y'iki gicuruzwa cyari gifite kuri uyu murongo (Gukuraho amakosa yo kwisuzugura)
        const [currentRecord] = await db.query('SELECT Quantity FROM product_out WHERE id = ?', [id]);
        if (currentRecord.length === 0) {
            return res.status(404).json({ message: "Nta product out yabonetse ifite iyo ID" });
        }
        const oldQuantity = Number(currentRecord[0].Quantity || 0);

        // 2. Kubara ibyinjiye byose muli Stock In
        const [sumIn] = await db.query(
            'SELECT SUM(Quantity) AS totalIn FROM product_in WHERE ProductCode = ?', 
            [ProductCode]
        );
        const totalAvailableIn = Number(sumIn[0].totalIn || 0);

        // 3. Kubara ibyasohotse byose uretse iyi turimo guhindura ubu (Other records)
        const [sumOut] = await db.query(
            'SELECT SUM(Quantity) AS totalOut FROM product_out WHERE ProductCode = ? AND id != ?', 
            [ProductCode, id]
        );
        const totalOtherOut = Number(sumOut[0].totalOut || 0);

        // 4. Ingano yose ishobora gushirwaho (Max available for update)
        const maxAvailableStock = totalAvailableIn - totalOtherOut;

        // 5. Gupima niba ingano nshya bayemera
        if (Number(Quantity) > maxAvailableStock) {
            return res.status(400).json({ 
                message: `Ntabwo bikunze muli Update! Ingano nshya ushaka gushyiraho (${Quantity}) iruta iyasigaye muli stoki (${maxAvailableStock}).` 
            });
        }

        // 6. Gukora Update
        const [result] = await db.query(
            'UPDATE product_out SET ProductCode = ?, Date = ?, Quantity = ?, UniquePrice = ?, Totalprice = ? WHERE id = ?',
            [ProductCode, Date, Quantity, UniquePrice, Totalprice, id]
        );
        
        return res.status(200).json({ message: "Product out updated successfully" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Hari ikibazo cyabaye kuri server", error: error.message });
    }
});

// ===================== DELETE A PRODUCT OUT (DELETE) =====================
router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const [result] = await db.query('DELETE FROM product_out WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Nta product out yabonetse ifite iyo ID" });
        }

        return res.status(200).json({ message: "Product out deleted successfully" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Hari ikibazo cyabaye kuri server", error: error.message });
    }
});

module.exports = router;