// Importacoes
const express = require('express');
const userRoutes = require('./routes/userRoutes');
const transacaoRoutes = require('./routes/transacaoRoutes');
const paymentsRoutes = require('./routes/paymentsRoutes');
const authRoutes = require('./routes/authRoutes');
const { validateAuth } = require('./middleware/validateAuth');

require('dotenv').config();
require('./config/db');

// ---------------------------

const app = express();
app.use(express.json());

// Rotas
app.use('/api/profile', validateAuth, userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/transactions', validateAuth, transacaoRoutes);
app.use('/api/payments', validateAuth, paymentsRoutes);

app.listen(80);