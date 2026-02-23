const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, usuarioController.getAll); 
router.put('/:id', authMiddleware, usuarioController.updateProfile);
router.get('/:id', authMiddleware, usuarioController.getById);
router.get('/:id/detalles', authMiddleware, usuarioController.getDetallesRol);
router.get('/:id/logo', usuarioController.getUserLogoById);
router.delete('/:id', authMiddleware, usuarioController.delete);

module.exports = router;
