const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Organizador = sequelize.define('Organizador', {
  idUsuario: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    field: 'Id_Usuario'
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'Nombre'
  },
  cif: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    field: 'CIF'
  },
  telefonoDirecto: {
    type: DataTypes.STRING,
    field: 'Telefono_Directo'
  },
  zonaResponsable: {
    type: DataTypes.STRING,
    field: 'Zona_Responsable'
  },
  estadoVerificacion: {
    type: DataTypes.STRING,
    defaultValue: 'pendiente',
    field: 'Estado_Verificacion'
  }
}, {
  tableName: 'Organizador',
  timestamps: false
});

module.exports = Organizador;
