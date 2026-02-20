const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Rol = sequelize.define('Rol', {
  idRol: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'Id_Rol'
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'Nombre'
  }
}, {
  tableName: 'Rol',
  timestamps: false
});

module.exports = Rol;
