const { Organizador, Usuario } = require('../models');
const { Op } = require('sequelize');

exports.getAll = async (req, res) => {
  try {
    const { zona, q, cif } = req.query;
    const whereClause = {};

    if (zona) whereClause.zonaResponsable = { [Op.like]: `%${zona}%` };
    if (cif) whereClause.cif = cif;
    if (q) whereClause.nombre = { [Op.like]: `%${q}%` };

    const organizadores = await Organizador.findAll({ where: whereClause });
    res.json(organizadores);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener organizadores' });
  }
};

exports.getById = async (req, res) => {
  try {
    const org = await Organizador.findByPk(req.params.id);
    if (!org) return res.status(404).json({ message: 'Organizador no encontrado' });
    res.json(org);
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor' });
  }
};

exports.createOrUpdate = async (req, res) => {
  try {
    const { idUsuario, nombre, cif, zonaResponsable, telefonoDirecto } = req.body;
    
    const [organizador, created] = await Organizador.upsert({
      idUsuario,
      nombre,
      cif,
      zonaResponsable,
      telefonoDirecto
    });

    res.json(organizador);
  } catch (error) {
    res.status(500).json({ message: 'Error al guardar organizador' });
  }
};

exports.countByZona = async (req, res) => {
  try {
    const { zona } = req.query;
    const count = await Organizador.count({
      where: { zonaResponsable: { [Op.like]: `%${zona}%` } }
    });
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: 'Error al contar' });
  }
};
