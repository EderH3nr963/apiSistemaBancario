// Importacoes
const express = require('express');
const userRoutes = require('./routes/userRoutes');
const transacaoRoutes = require('./routes/transacaoRoutes');

require('dotenv').config();
require('./config/db');

// ---------------------------

const app = express();
app.use(express.json());

// Rotas
app.use('/api/profile', userRoutes);
app.use('/api/transactions', transacaoRoutes);

app.listen(5000);