"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    queryInterface.createTable("Alunos_propina", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      alunoId: {
        type: Sequelize.UUID,
        references: {
          model: "Alunos",
          key: "id",
        },
      },
      propinaId: {
        type: Sequelize.UUID,
        references: {
          model: "Propinas",
          key: "id",
        },
      },
      valor: {
        type: Sequelize.STRING,
        allowNull: false,
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
