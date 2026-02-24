const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Usuario = require('../models/Usuario');

const PerfilONG = sequelize.define('PerfilONG', {
  idUsuario: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    field: 'Id_Usuario'
  },
  nombreLegal: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'Nombre_Legal'
  },
  cif: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    field: 'CIF'
  },
  descripcion: {
    type: DataTypes.TEXT,
    field: 'Descripcion'
  },
  direccion: {
    type: DataTypes.STRING,
    field: 'Direccion'
  },
  telefonoContacto: {
    type: DataTypes.STRING,
    field: 'Telefono_Contacto'
  },
  web: {
    type: DataTypes.STRING,
    field: 'Web'
  },
  estadoVerificacion: {
    type: DataTypes.STRING,
    defaultValue: 'pendiente',
    field: 'Estado_Verificacion'
  },
    isVerified: {
    type: DataTypes.BOOLEAN,
    get() {
      return this.getDataValue('estadoVerificacion') === 'verificado';
    }
  },
  fechaVerificacion: {
    type: DataTypes.DATE,
    field: 'Fecha_Verificacion'
  },
  idAdminVerificador: {
    type: DataTypes.INTEGER,
    field: 'Id_Admin_Verificador'
  }
}, {
  tableName: 'PerfilONG',
  timestamps: false
});

module.exports = PerfilONG;

