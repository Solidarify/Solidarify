const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PerfilONG = require('../models/PerfilONG');
const Organizador = require('../models/Organizador');

const Usuario = sequelize.define('Usuario', {
  idUsuario: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'Id_Usuario'
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'Nombre'
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    field: 'Email'
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'Password'
  },
  telefono: {
    type: DataTypes.STRING,
    field: 'Telefono'
  },
  fotoPerfil: {
    type: DataTypes.TEXT('long'), 
    field: 'Foto_Perfil'
  }
}, {
  tableName: 'Usuario',
  timestamps: false
});

module.exports = Usuario;
