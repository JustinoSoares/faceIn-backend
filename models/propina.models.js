"use strict";
const { Model } = require("sequelize");
const Aluno = require("./aluno.models");
const { v4: uuidv4 } = require("uuid");

module.exports = (sequelize, DataTypes) => {
  class Propinas extends Model {}

  Propinas.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue : uuidv4,
        primaryKey: true,
      },
      mes: {
        type: DataTypes.ENUM(
          "Janeiro",
          "Fevereiro",
          "Março",
          "Abril",
          "Maio",
          "Junho",
          "Julho",
          "Agosto",
          "Setembro",
          "Outubro",
          "Novembro",
          "Dezembro"
        ),
        allowNull: false,
      },
      ano_lectivo: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Propinas",
      tableName: "Propinas",
    }
  );

  return Propinas;
};
