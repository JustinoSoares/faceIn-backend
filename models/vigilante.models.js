"use strict";
const { Model, DataTypes } = require("sequelize");
const bcrypt = require("bcryptjs");
const Users = require("./users.models");
const { v4: uuidv4 } = require("uuid");

module.exports = (sequelize, DataTypes) => {
  class Vigilante extends Model {
    /**
     * Helper method for defining associations.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Vigilante.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: uuidv4,
        primaryKey : true,
      },
      turno: {
        type: DataTypes.ENUM("m", "t", "n", "manhã", "tarde", "noite"),
        allowNull: false,
      },
      descricao: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      UserId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: Users,
          key: "id",
        },
      },
    },
    {
      sequelize,
      modelName: "Vigilante",
      tableName: "Vigilantes",
    }
  );

  return Vigilante;
};
