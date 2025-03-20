'use strict';
const { Model, DataTypes } = require('sequelize');
const { v4: uuidv4 } = require("uuid");

module.exports = (sequelize, DataTypes) => {
  class Alunos extends Model {}
  
  Alunos.init({
    id : {
      type : DataTypes.UUID,
      defaultValue: uuidv4,
      primaryKey : true,
    },
    n_do_processo: {
      type: DataTypes.INTEGER,
      // autoIncrement : true,
      allowNull: true,
    },
    n_do_aluno: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    nome_completo: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    classe: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    turno: {
      type: DataTypes.ENUM("m", "t", "n"),
      allowNull: false,
    },
    ano_letivo: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    turma: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    curso: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  }, {
    sequelize,
    modelName: 'Alunos',
    tableName: 'Alunos',
  });

  return Alunos;
};
