// Importacoes
const express = require('express');
const userRoutes = require('./routes/userRoutes');
const transacaoRoutes = require('./routes/transacaoRoutes');
const paymentsRoutes = require('./routes/paymentsRoutes');

require('dotenv').config();
require('./config/db');

// ---------------------------

const app = express();
app.use(express.json());

// Rotas
app.use('/api/profile', userRoutes);
app.use('/api/transactions', transacaoRoutes);
app.use('api/payments', paymentsRoutes);

app.listen(5000);