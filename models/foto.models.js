'use strict';
const { Model } = require('sequelize');
const Aluno = require('./aluno.models');

module.exports = (sequelize, DataTypes) => {
  class Fotos extends Model {}
  
  Fotos.init({
    id : {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    descricao: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    url: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    alunoId: {
      type: DataTypes.INTEGER,
      references: {
        model: Aluno,
        key: 'id',
      },
    },
  }, {
    sequelize,
    modelName: 'Fotos',
    tableName: 'Fotos',
  });

  return Fotos;
};
