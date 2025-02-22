const express = require('express');
const router = express.Router();

const { validateAuth } = require('../middleware/validateAuth');


router.post('/create', validateAuth, (req, res) => res.json({ message: "funfou" }));
router.get('/', validateAuth, (req, res) => res.json({ message: "funfou" }));
router.get('/:id', validateAuth, (req, res) => res.json({ message: "funfou" }));
router.get('/cancel', validateAuth, (req, res) => res.json({ message: "funfou" }));
