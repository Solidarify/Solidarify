const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Usuario, Rol, Organizador, PerfilONG, UsuarioRol } = require('../models');

const sequelize = require('../config/database');

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

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
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

exports.register = async (req, res) => {
    try {
        const { 
            nombre, email, password, telefono, role,
            nombreOrganizacion, cif, telefonoDirecto, zonaResponsable,
            nombreLegal, descripcion, direccion, web
        } = req.body;

        const existe = await Usuario.findOne({ where: { email } });
        if (existe) {
            return res.status(400).json({ message: 'El email ya está registrado' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        if (role === 'ADMIN') {
            return res.status(403).json({ message: 'No tienes permiso para registrarte con ese rol.' });
        }

        await sequelize.transaction(async (t) => {
          
            console.log('Transacción iniciada');

            const nuevoUsuario = await Usuario.create({
                nombre,
                email,
                password: hashedPassword,
                telefono
            }, { transaction: t });

            let rolAsignar;
            if (role) {
                rolAsignar = await Rol.findOne({ where: { nombre: role }, transaction: t });
            }
            if (!rolAsignar) {
                rolAsignar = await Rol.findByPk(4, { transaction: t }); 
            }

            if (rolAsignar) {
                await nuevoUsuario.addRol(rolAsignar, { transaction: t });

                if (role === 'ORGANIZADOR') {
                    await Organizador.create({
                        idUsuario: nuevoUsuario.idUsuario,
                        nombre: nombreOrganizacion || nombre,
                        cif: cif,
                        telefonoDirecto: telefonoDirecto || null,
                        zonaResponsable: zonaResponsable || null
                    }, { transaction: t });
                    
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
                    }, { transaction: t });
                    
                }

            } else {
                throw new Error('No se pudo asignar ningún rol válido al usuario');
            }
        });
        res.status(201).json({ message: 'Usuario registrado correctamente' });

    } catch (error) {
        res.status(500).json({ message: 'Error al registrar usuario', error: error.message });
    }
};
