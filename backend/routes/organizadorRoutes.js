const express = require('express');
const router = express.Router();
const controller = require('../controllers/organizadorController');
const auth = require('../middleware/authMiddleware');

router.get('/', controller.getAll);
router.get('/count', controller.countByZona);
router.get('/:id', controller.getById);
router.post('/', auth, controller.createOrUpdate);
router.put('/:id', auth, controller.createOrUpdate); 

module.exports = router;
