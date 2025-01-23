'use strict';
const { Model, DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const Users = require('./users.models');

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
  Vigilante.init({
    turno: {
      type: DataTypes.ENUM("m", "t", "n", "manhã", "tarde", "noite"),
      allowNull: false,
    },
    descricao: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    UserId: {
      type: DataTypes.INTEGER,
      allowNull : false,
      references: {
        model: Users,
        key: 'id',
      },
    },
  }, {
    sequelize,
    modelName: 'Vigilante',
    tableName: 'Vigilantes',
  });

  return Vigilante;
};
