const express = require('express');
const router = express.Router();
const controller = require('../controllers/ongController');
const auth = require('../middleware/authMiddleware');

router.get('/', controller.getAll);
router.get('/buscar', controller.getAll);
router.get('/:id', controller.getById);
router.post('/', auth, controller.createOrUpdate);
router.put('/:id', auth, controller.createOrUpdate);

router.patch('/:id/verificar', auth, controller.verificar);

module.exports = router;
