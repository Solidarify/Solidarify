const express = require('express');
const router = express.Router();
const controller = require('../controllers/propuestaController');
const auth = require('../middleware/authMiddleware'); 

router.get('/', controller.getAll);
router.get('/buscar', controller.getAll);
router.get('/publicas', controller.getPublicas);
router.get('/:id', controller.getById);

router.post('/', auth, controller.create);
router.put('/:id', auth, controller.update);
router.delete('/:id', auth, controller.delete);
router.patch('/:id/estado', auth, controller.cambiarEstado);
router.post('/:id/asignar', auth, controller.asignarOng);
router.post('/:id/solicitar-ong', auth, controller.solicitarOng);
router.post('/:id/responder-solicitud', auth, controller.responderSolicitudOng);

module.exports = router;
