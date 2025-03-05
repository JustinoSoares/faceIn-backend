'use strict';
const { Model } = require('sequelize');
const Aluno = require('./aluno.models');
const { v4: uuidv4 } = require("uuid");

module.exports = (sequelize, DataTypes) => {
  class Fotos extends Model {}
  
  Fotos.init({
    id : {
      type: DataTypes.UUID,
      defaultValue: uuidv4,
      primaryKey: true,
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
      type: DataTypes.UUID,
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
