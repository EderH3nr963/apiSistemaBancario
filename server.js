// Importacoes
const express = require('express');
const userRoutes = require('./routes/userRoutes');

require('dotenv').config();
require('./config/db')

// ---------------------------

const app = express();
app.use(express.json());

app.use('/profile', userRoutes);

app.listen(5000);