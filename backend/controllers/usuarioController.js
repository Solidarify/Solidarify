const { Usuario, PerfilONG, Organizador } = require('../models');

exports.updateProfile = async (req, res) => {
  console.log('=== UPDATE PROFILE ===');
  console.log('ID param:', req.params.id);
  console.log('req.userData:', req.userData);
  
  try {
    const { id } = req.params; 
    const { nombre, email, telefono, fotoPerfil } = req.body;

    const userIdLogueado = req.userData.userId;
    const rolesUsuario = Array.isArray(req.userData.roles) ? req.userData.roles : [req.userData.roles || ''];
    
    console.log('User ID logueado:', userIdLogueado);
    console.log('Roles usuario:', rolesUsuario);
    console.log('Puede editar?', userIdLogueado == id || rolesUsuario.includes('ADMIN'));

    if (parseInt(userIdLogueado) !== parseInt(id) && !rolesUsuario.includes('ADMIN')) {
      console.log('🚫 Acceso denegado');
      return res.status(403).json({ message: 'No autorizado' });
    }

    const usuario = await Usuario.findByPk(id);
    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    if (nombre) usuario.nombre = nombre;
    if (email) usuario.email = email;
    if (telefono !== undefined) usuario.telefono = telefono;
    if (fotoPerfil !== undefined) usuario.fotoPerfil = fotoPerfil;
    
    await usuario.save();

    const usuarioResponse = usuario.toJSON();
    delete usuarioResponse.password;

    console.log('✅ Perfil actualizado');
    res.json(usuarioResponse);

  } catch (error) {
    console.error('ERROR updateProfile:', error.message);
    res.status(500).json({ message: 'Error al actualizar perfil', error: error.message });
  }
};

/*
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
*/

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


exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const usuario = await Usuario.findByPk(id, {
      attributes: ['idUsuario', 'nombre', 'email', 'telefono', 'fotoPerfil']
    });
    if (!usuario) return res.status(404).json({ message: 'Usuario no encontrado' });
    res.json(usuario);
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor' });
  }
};

exports.delete = async (req, res) => {
  try {    const { id } = req.params;
    const usuario = await Usuario.findByPk(id);
    if (!usuario) return res.status(404).json({ message: 'Usuario no encontrado' });
    await usuario.destroy();
    res.json({ message: 'Usuario eliminado' });
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor' });
  }
};

exports.getUserLogoById = async (req, res) => {
  try {
    const { id } = req.params;
    const usuario = await Usuario.findByPk(id);
    if (!usuario) return res.status(404).json({ message: 'Usuario no encontrado' });
    res.json({ fotoPerfil: usuario.fotoPerfil });
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor' });
  } 
};