"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    queryInterface.createTable("Alunos_propina", {
      id: {
        type: Sequelize.STRING,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      alunoId: {
        type: Sequelize.STRING,
        references: {
          model: "Alunos",
          key: "id",
        },
      },
      propinaId: {
        type: Sequelize.STRING,
        references: {
          model: "Propinas",
          key: "id",
        },
      },
      valor: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    queryInterface.dropTable("Alunos_propina");
  },
};
