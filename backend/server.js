const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
require('dotenv').config();

const app = express();
const db = require('./db');

app.use(express.json());
app.use(cors());

// ===================== IMPORT ROUTERS =====================
// HAKOSOWE: Inzira n'amazina byashyizwe neza nk'uko biri ku ifoto yawe
const AuthRoutes = require('./routes/Auth');
const productRoutes = require('./routes/product');
const productInRoutes = require('./routes/ProductIn');
const productOutRoutes = require('./routes/ProductOut');


// ===================== USE ROUTERS =====================

app.use('/api/auth', AuthRoutes);
app.use('/api/products', productRoutes);
app.use('/api/product-in', productInRoutes);
app.use('/api/product-out', productOutRoutes);


// ===================== SERVER START =====================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

module.exports = app;