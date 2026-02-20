const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

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
  }
}, {
  tableName: 'PerfilONG',
  timestamps: false
});

module.exports = PerfilONG;
