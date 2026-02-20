const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, usuarioController.getAll); 
router.put('/:id', authMiddleware, usuarioController.updateProfile);
router.get('/:id/detalles', authMiddleware, usuarioController.getDetallesRol);

module.exports = router;
