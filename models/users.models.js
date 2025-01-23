'use strict';
const { Model } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
  class Users extends Model {
    /**
     * Helper method for defining associations.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Users.init({
    nome_completo: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    telefone: {
      type: DataTypes.STRING, // Alterado para STRING para suportar números internacionais
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true, // Garante que o valor seja um email válido
      },
    },
    password : {
      type : DataTypes.STRING,
      allowNull : false,
    },
    is_active : {
      type : DataTypes.BOOLEAN,
      defaultValue : false,
    },
    type: {
        type: DataTypes.ENUM("admin", "vigilante"),
        defaultValue: "vigilante",
        allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'Users',
    tableName: 'Users',
  });
  return Users;
};
