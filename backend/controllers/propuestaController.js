const { Propuesta, Usuario, Organizador, PerfilONG } = require('../models');
const { Op } = require('sequelize');

exports.getAll = async (req, res) => {
  try {
    const { q, tipobien_id, lugar, estado, organizador_id, ong_asignada } = req.query; 
    const whereClause = {};

    if (q) {
      whereClause[Op.or] = [
        { titulo: { [Op.like]: `%${q}%` } },
        { descripcion: { [Op.like]: `%${q}%` } }
      ];
    }
    if (lugar) whereClause.lugar = { [Op.like]: `%${lugar}%` };
    if (estado) {
        if (estado === 'explorar') {
        whereClause.estadoPropuesta = { [Op.in]: ['publicada', 'asignada'] };
        } else {
        whereClause.estadoPropuesta = estado;
    }
}
    if (organizador_id) whereClause.idOrganizador = organizador_id;
    if (ong_asignada) whereClause.idOngAsignada = ong_asignada; 

    const propuestas = await Propuesta.findAll({
      where: whereClause,
      include: [
        { model: Usuario, as: 'organizador', attributes: ['nombre', 'email'] },
        { model: Usuario, as: 'ongAsignada', attributes: ['nombre'] }
      ],
      order: [['fechaPublicacion', 'DESC']]
    });

    res.json(propuestas);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener propuestas' });
  }
};

exports.getPublicas = async (req, res) => {
  try {
    const propuestas = await Propuesta.findAll({
      where: { estadoPropuesta: 'publicada' },
      include: [
        { model: Usuario, as: 'organizador', attributes: ['nombre'] }
      ],
      order: [['fechaPublicacion', 'DESC']]
    });
    res.json(propuestas);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener públicas' });
  }
};

// Obtener una por ID
exports.getById = async (req, res) => {
  try {
    const propuesta = await Propuesta.findByPk(req.params.id, {
      include: [
        { model: Usuario, as: 'organizador', attributes: ['nombre', 'email', 'telefono'] },
        { model: Usuario, as: 'ongAsignada', attributes: ['nombre', 'email', 'telefono'] }
      ]
    });

    if (!propuesta) return res.status(404).json({ message: 'Propuesta no encontrada' });
    res.json(propuesta);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener propuesta' });
  }
};


exports.create = async (req, res) => {
  try {
    const { titulo, descripcion, tipoBien, lugar, fechaInicio, fechaFin, estadoPropuesta } = req.body;
    const idOrganizador = req.userData.userId; 

    if (!idOrganizador) {
      return res.status(400).json({ message: 'No se pudo identificar al organizador.' });
    }

    const nuevaPropuesta = await Propuesta.create({
      titulo,
      descripcion,
      idTipoBien: tipoBien,
      lugar,
      fechaInicio,
      fechaFin,
      estadoPropuesta,
      fechaPublicacion: new Date(),
      idOrganizador: idOrganizador 
    });

    res.status(201).json(nuevaPropuesta);

  } catch (error) {
    res.status(500).json({ message: 'Error al crear la propuesta' });
  }
};


exports.update = async (req, res) => {
  try {
    const [updated] = await Propuesta.update(req.body, {
      where: { idPropuesta: req.params.id }
    });

    if (updated) {
      const updatedPropuesta = await Propuesta.findByPk(req.params.id);
      return res.json(updatedPropuesta);
    }
    throw new Error('Propuesta no encontrada');
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar' });
  }
};

exports.delete = async (req, res) => {
  try {
    const deleted = await Propuesta.destroy({
      where: { idPropuesta: req.params.id }
    });
    if (deleted) return res.json({ message: 'Propuesta eliminada' });
    throw new Error('Propuesta no encontrada');
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar' });
  }
};

exports.cambiarEstado = async (req, res) => {
  try {
    const { estado } = req.body;
    const propuesta = await Propuesta.findByPk(req.params.id);
    
    if (!propuesta) return res.status(404).json({ message: 'No encontrada' });

    propuesta.estadoPropuesta = estado;
    await propuesta.save();
    
    res.json(propuesta);
  } catch (error) {
    res.status(500).json({ message: 'Error al cambiar estado' });
  }
};

exports.asignarOng = async (req, res) => {
  try {
    const { idOng } = req.body; 
    const propuesta = await Propuesta.findByPk(req.params.id);

    if (!propuesta) return res.status(404).json({ message: 'No encontrada' });

    propuesta.idOngAsignada = idOng;
    propuesta.estadoPropuesta = 'asignada';
    await propuesta.save();

    res.json(propuesta);
  } catch (error) {
    res.status(500).json({ message: 'Error al asignar ONG' });
  }
};


exports.solicitarOng = async (req, res) => {
  try {
    const { idOng } = req.body;
    const idOrganizador = req.userData.userId; 
    const propuesta = await Propuesta.findByPk(req.params.id);

    if (!propuesta) return res.status(404).json({ message: 'Propuesta no encontrada' });
    
    if (propuesta.idOrganizador !== idOrganizador) {
        return res.status(403).json({ message: 'No eres el dueño de esta propuesta' });
    }

    propuesta.idOngAsignada = idOng;
    propuesta.estadoPropuesta = 'pendiente_ong'; 
    await propuesta.save();

    res.json({ message: 'Solicitud enviada a la ONG', propuesta });
  } catch (error) {
    res.status(500).json({ message: 'Error al solicitar ONG' });
  }
};

exports.responderSolicitudOng = async (req, res) => {
  try {
    const { aceptar } = req.body; 
    const idUsuarioOng = req.userData.userId; 
    
    const propuesta = await Propuesta.findByPk(req.params.id);

    if (!propuesta) return res.status(404).json({ message: 'Propuesta no encontrada' });
    
    if (propuesta.idOngAsignada !== idUsuarioOng) {
        return res.status(403).json({ message: 'Esta solicitud no es para ti' });
    }
    
    if (propuesta.estadoPropuesta !== 'pendiente_ong') {
        return res.status(400).json({ message: 'Esta propuesta no está pendiente de aceptación' });
    }

    if (aceptar) {
        propuesta.estadoPropuesta = 'asignada';
        propuesta.fechaAsignacion = new Date();
    } else {
        propuesta.estadoPropuesta = 'publicada';
        propuesta.idOngAsignada = null; 
    }

    await propuesta.save();
    
    res.json({ 
        message: aceptar ? 'Has aceptado la campaña' : 'Has rechazado la campaña', 
        propuesta 
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al responder a la solicitud' });
  }
};
