const { PerfilONG, Usuario } = require('../models');
const { Op } = require('sequelize');

exports.getAll = async (req, res) => {
    try {
        const { estado, q, cif } = req.query;
        const whereClause = {};

        if (estado) {
            whereClause.estadoVerificacion = estado; 
        }

        if (cif) whereClause.cif = cif;
        if (q) whereClause.nombreLegal = { [Op.like]: `%${q}%` };

        const ongs = await PerfilONG.findAll({ where: whereClause });
        res.json(ongs);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener ONGs', error: error.message });
    }
};

exports.getById = async (req, res) => {
  try {
    const ong = await PerfilONG.findByPk(req.params.id);
    if (!ong) return res.status(404).json({ message: 'ONG no encontrada' });
    res.json(ong);
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor' });
  }
};

exports.createOrUpdate = async (req, res) => {
  try {
    const { idUsuario, nombreLegal, cif, descripcion, direccion, web } = req.body;

    const [ong] = await PerfilONG.upsert({
      idUsuario,
      nombreLegal,
      cif,
      descripcion,
      direccion,
      web,
      isVerified: false 
    });

    res.json(ong);
  } catch (error) {
    res.status(500).json({ message: 'Error al guardar ONG' });
  }
};

exports.verificar = async (req, res) => {
  try {
    const { aprobado } = req.body; 
    const ong = await PerfilONG.findByPk(req.params.id);

    if (!ong) return res.status(404).json({ message: 'ONG no encontrada' });

    ong.estadoVerificacion = aprobado ? 'verificado' : 'pendiente';
    await ong.save();

    res.json(ong);
  } catch (error) {
    res.status(500).json({ message: 'Error al verificar' });
  }
};
