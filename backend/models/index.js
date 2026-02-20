const sequelize = require('../config/database');
const Usuario = require('./Usuario');
const Rol = require('./Rol');
const Organizador = require('./Organizador');
const PerfilONG = require('./PerfilONG');
const Propuesta = require('./Propuesta');

const UsuarioRol = sequelize.define('UsuarioRol', {}, { tableName: 'UsuarioRol', timestamps: false });

Usuario.belongsToMany(Rol, { through: UsuarioRol, foreignKey: 'Id_Usuario', otherKey: 'Id_Rol' });
Rol.belongsToMany(Usuario, { through: UsuarioRol, foreignKey: 'Id_Rol', otherKey: 'Id_Usuario' });

Usuario.hasOne(Organizador, { foreignKey: 'Id_Usuario', onDelete: 'CASCADE' });
Organizador.belongsTo(Usuario, { foreignKey: 'Id_Usuario', onDelete: 'CASCADE' });

Usuario.hasOne(PerfilONG, { foreignKey: 'Id_Usuario', onDelete: 'CASCADE' });
PerfilONG.belongsTo(Usuario, { foreignKey: 'Id_Usuario', onDelete: 'CASCADE' });

Usuario.hasMany(Propuesta, { as: 'propuestasAsignadas', foreignKey: 'Id_Ong_Asignada' });
Propuesta.belongsTo(Usuario, { as: 'ongAsignada', foreignKey: 'Id_Ong_Asignada' });

Usuario.hasMany(Propuesta, { as: 'propuestasCreadas', foreignKey: 'Id_Organizador', onDelete: 'RESTRICT' });
Propuesta.belongsTo(Usuario, { as: 'organizador', foreignKey: 'Id_Organizador', onDelete: 'RESTRICT' });

module.exports = {
  sequelize,
  Usuario,
  Rol,
  Organizador,
  PerfilONG,
  Propuesta,
  UsuarioRol
};
