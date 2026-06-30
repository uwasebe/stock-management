const express = require('express');
const mysql = require('mysql2');
require('dotenv').config();
const db = require('../db'); // Iyi ifite promise tayari
const router = express.Router();

// ===================== 1. SOMA (GET ALL PRODUCTS) =====================
router.get('/', async (req, res) => {
    try {
        // HAKOSOWE: Hakuwemo .promise() kuko db yacu yo muri db.js isanzwe iyifite
        const [rows] = await db.query(
            'SELECT productcode, productname, description, price FROM products'
        );
        
        // Kugarura data kandi 'productcode' igakora nka 'id' muri React
        const formattedRows = rows.map(row => ({
            id: row.productcode || row.ProductCode, 
            productcode: row.productcode || row.ProductCode,
            ProductCode: row.productcode || row.ProductCode,
            productname: row.productname || row.ProductName,
            ProductName: row.productname || row.ProductName,
            description: row.description || row.Description || '',
            Description: row.description || row.Description || '',
            price: row.price !== undefined ? row.price : row.Price,
            Price: row.price !== undefined ? row.price : row.Price
        }));

        return res.status(200).json(formattedRows); 
    } catch (error) {
        console.error("Error in GET /api/products:", error);
        return res.status(500).json({ message: "Hari ikibazo cyabaye kuri server", error: error.message });
    }
});

// ===================== 2. REMA (CREATE A NEW PRODUCT) =====================
router.post('/', async (req, res) => {
    const productcode = req.body.productcode || req.body.ProductCode;
    const productname = req.body.productname || req.body.ProductName;
    const description = req.body.description || req.body.Description;
    const price = req.body.price !== undefined ? req.body.price : req.body.Price;

    if (!productcode || !productname) {
        return res.status(400).json({ message: "Code n'Izina ry'igicuruzwa bigomba kuzuzwa!" });
    }

    const prodDesc = description || '';
    const prodPrice = price || 0; 

    try {
        // HAKOSOWE: Hakuwemo .promise()
        const [result] = await db.query(
            'INSERT INTO products (productcode, productname, description, price) VALUES (?, ?, ?, ?)',
            [productcode, productname, prodDesc, prodPrice]
        );
        return res.status(201).json({ message: "Product created successfully", productId: productcode });
    } catch (error) {
        console.error("Error in POST /api/products:", error);
        return res.status(500).json({ message: "Hari ikibazo cyabaye kuri server", error: error.message });
    }
});

// ====================== 3. HINDURA (UPDATE A PRODUCT) =====================
router.put('/:id', async (req, res) => {
    const { id } = req.params; // Iyi id izaba irimo ya productcode ya gicuruzwa
    
    const productcode = req.body.productcode || req.body.ProductCode;
    const productname = req.body.productname || req.body.ProductName;
    const description = req.body.description || req.body.Description;
    const price = req.body.price !== undefined ? req.body.price : req.body.Price;

    if (!productcode || !productname) {
        return res.status(400).json({ message: "Code n'Izina ry'igicuruzwa bigomba kuzuzwa!" });
    }

    try {
        // HAKOSOWE: Gukoresha 'WHERE productcode = ?' kuko nta nkingi ya 'id' iri kuri table
        await db.query(
            'UPDATE products SET productname = ?, description = ?, price = ? WHERE productcode = ?',
            [productname, description || '', price || 0, id]
        );
        return res.status(200).json({ message: "Product updated successfully" });
    } catch (error) {
        console.error("Error in PUT /api/products:", error);
        return res.status(500).json({ message: "Hari ikibazo cyabaye kuri server", error: error.message });
    }
});

// ====================== 4. SIBA (DELETE A PRODUCT) =====================
router.delete('/:id', async (req, res) => {
    const { id } = req.params; // Iyi nayo ni productcode iba ije

    try {
        // HAKOSOWE: Gukoresha 'WHERE productcode = ?' aho gukoresha 'id' idahari
        await db.query('DELETE FROM products WHERE productcode = ?', [id]);
        return res.status(200).json({ message: "Product deleted successfully" });
    } catch (error) {
        console.error("Error in DELETE /api/products:", error);
        return res.status(500).json({ message: "Hari ikibazo cyabaye kuri server", error: error.message });
    }
});

module.exports = router;