"use strict";
const { Model } = require("sequelize");
const Aluno = require("./aluno.models");
const Propina = require("./propina.models");
const { v4: uuidv4 } = require("uuid");
module.exports = (sequelize, DataTypes) => {
  class Aluno_propina extends Model {}

  Aluno_propina.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue : uuidv4,
        primaryKey: true,
      },
      alunoId: {
        type: DataTypes.UUID,
        references: {
          model: Aluno,
          key: "id",
        },
      },
      propinaId: {
        type: DataTypes.UUID,
        references: {
          model: Propina,
          key: "id",
        },
      },
      valor: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Aluno_propina",
      tableName: "Alunos_propina",
    }
  );

  return Aluno_propina;
};
