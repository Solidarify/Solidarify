const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Usuario, Rol, Organizador, PerfilONG, UsuarioRol } = require('../models');

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Buscar usuario con sus roles
    const usuario = await Usuario.findOne({ 
      where: { email },
      include: {
        model: Rol,
        through: { attributes: [] } 
      }
    });

    if (!usuario) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    // Verificar contraseña
    const isMatch = await bcrypt.compare(password, usuario.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const roles = usuario.Rols ? usuario.Rols.map(r => r.nombre) : [];

    const token = jwt.sign(
      { 
        id: usuario.idUsuario, 
        email: usuario.email, 
        roles: roles 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      usuario: {
        idUsuario: usuario.idUsuario,
        nombre: usuario.nombre,
        email: usuario.email,
        telefono: usuario.telefono,
        fotoPerfil: usuario.fotoPerfil,
        roles: roles
      }
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

exports.register = async (req, res) => {
    try {
        // 1. Extraemos TODOS los campos (incluidos los opcionales)
        const { 
            nombre, email, password, telefono, role,
            // Campos de Organizador
            nombreOrganizacion, cif, telefonoDirecto, zonaResponsable,
            // Campos de ONG
            nombreLegal, descripcion, direccion, web
        } = req.body;

        console.log(`Intentando registrar email ${email} con rol ${role}`);

        const existe = await Usuario.findOne({ where: { email } });
        if (existe) {
            return res.status(400).json({ message: 'El email ya está registrado' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // 2. Creamos el Usuario base
        const nuevoUsuario = await Usuario.create({
            nombre,
            email,
            password: hashedPassword,
            telefono
        });

        if (role === 'ADMIN') {
            return res.status(403).json({ message: 'No tienes permiso para registrarte con ese rol.' });
        }

        let rolAsignar;
        if (role) {
            rolAsignar = await Rol.findOne({ where: { nombre: role } });
        }
        if (!rolAsignar) {
            rolAsignar = await Rol.findByPk(4); 
        }

        if (rolAsignar) {
            await nuevoUsuario.addRol(rolAsignar);
            console.log(`Usuario creado con rol ${rolAsignar.nombre}`);

            if (role === 'ORGANIZADOR') {
                await Organizador.create({
                    idUsuario: nuevoUsuario.idUsuario,
                    nombre: nombreOrganizacion || nombre,
                    cif: cif,
                    telefonoDirecto: telefonoDirecto || null,
                    zonaResponsable: zonaResponsable || null
                });
                console.log('Datos de Organizador guardados.');
            } 
            else if (role === 'ONG') {
                await PerfilONG.create({
                    idUsuario: nuevoUsuario.idUsuario,
                    nombreLegal: nombreLegal || nombre,
                    cif: cif,
                    descripcion: descripcion || null,
                    direccion: direccion || null,
                    web: web || null,
                    estadoVerificacion: 'pendiente'
                });
                console.log('Datos de ONG guardados.');
            }

        } else {
            console.error('ERROR CRÍTICO: No se pudo asignar ningún rol');
        }

        res.status(201).json({ message: 'Usuario registrado correctamente' });

    } catch (error) {
        console.error('Error en registro:', error);
        res.status(500).json({ message: 'Error al registrar usuario', error: error.message });
    }
};


