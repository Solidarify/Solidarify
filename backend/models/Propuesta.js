const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Propuesta = sequelize.define('Propuesta', {
  idPropuesta: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'Id_Propuesta'
  },
  idOrganizador: {
    type: DataTypes.INTEGER,
    field: 'Id_Organizador'
  },
  idTipoBien: {
    type: DataTypes.INTEGER,
    field: 'Id_Tipo_Bien'
  },
  titulo: { type: DataTypes.STRING, field: 'Titulo' },
  descripcion: { type: DataTypes.TEXT, field: 'Descripcion' },
  fechaInicio: { type: DataTypes.DATE, field: 'Fecha_Inicio' },
  fechaFin: { type: DataTypes.DATE, field: 'Fecha_Fin' },
  
  fechaPublicacion: { 
    type: DataTypes.DATE, 
    defaultValue: DataTypes.NOW,
    field: 'Fecha_Publicacion' 
  },

  estadoPropuesta: { 
    type: DataTypes.STRING, 
    defaultValue: 'borrador',
    field: 'Estado_Propuesta' 
  },
  lugar: { type: DataTypes.STRING, field: 'Lugar' },
  imagen: { type: DataTypes.TEXT('long'), field: 'Imagen' },
  idOngAsignada: { type: DataTypes.INTEGER, field: 'Id_Ong_Asignada' }
}, {
  tableName: 'Propuesta',
  timestamps: false
});

module.exports = Propuesta;
