'use strict';
const { Model } = require('sequelize');
const Aluno = require('./aluno.models');
const Propina = require('./propina.models');

module.exports = (sequelize, DataTypes) => {
  class Aluno_propina extends Model {}
  
  Aluno_propina.init({
    id : {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    alunoId: {
      type: DataTypes.INTEGER,
      references: {
        model: Aluno,
        key: 'id',
      },
    },
    propinaId: {
      type: DataTypes.INTEGER,
      references: {
        model: Propina,
        key: 'id',
      },
    },
    valor: {
      type: DataTypes.STRING,
      allowNull : false,
    },    
  }, {
    sequelize,
    modelName: 'Aluno_propina',
    tableName: 'Alunos_propina',
  });

  return Aluno_propina;
};
