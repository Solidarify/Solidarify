const { Usuario, PerfilONG, Organizador } = require('../models');

exports.updateProfile = async (req, res) => {
  try {
    const { id } = req.params; 
    const { nombre, email, telefono, fotoPerfil } = req.body;

    if (req.userData.id != id && req.userData.rol !== 'ADMIN') return res.status(403).json({ message: 'No autorizado' });

    const usuario = await Usuario.findByPk(id);
    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    usuario.nombre = nombre || usuario.nombre;
    usuario.email = email || usuario.email;
    usuario.telefono = telefono || usuario.telefono;
    
    if (fotoPerfil !== undefined) {
      usuario.fotoPerfil = fotoPerfil;
    }

    await usuario.save();

    const usuarioResponse = usuario.toJSON();
    delete usuarioResponse.password;

    res.json(usuarioResponse);

  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar perfil' });
  }
};

exports.getDetallesRol = async (req, res) => {
  try {
    const { id } = req.params;
    
    const ong = await PerfilONG.findOne({ where: { idUsuario: id } });
    if (ong) return res.json({ tipo: 'ONG', datos: ong });

    const org = await Organizador.findOne({ where: { idUsuario: id } });
    if (org) return res.json({ tipo: 'ORGANIZADOR', datos: org });

    res.json({ tipo: 'USUARIO', datos: null });

  } catch (error) {
    res.status(500).json({ message: 'Error obteniendo detalles' });
  }
};

exports.getAll = async (req, res) => {
    try {
        const usuarios = await Usuario.findAll({
            attributes: ['idUsuario', 'nombre', 'email', 'telefono'] 
        });
        res.json(usuarios);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener usuarios' });
    }
};
