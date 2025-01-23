"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Reconhecimento extends Model {}

  Reconhecimento.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      alunoId: {
        type: DataTypes.INTEGER,
        allowNull: false, // Garantir que a chave estrangeira não seja nula
        references: {
          model: "Alunos", // Nome da tabela relacionada
          key: "id",
        },
        onUpdate: "CASCADE", // Atualizar em cascata
        onDelete: "CASCADE", // Excluir em cascata
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW, // Define o timestamp padrão
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW, // Define o timestamp padrão
      },
    },
    {
      sequelize,
      modelName: "Reconhecimento",
      tableName: "Reconhecimento",
      timestamps: true, // Indica que o Sequelize deve gerenciar automaticamente `createdAt` e `updatedAt`
    }
  );

  return Reconhecimento;
};
