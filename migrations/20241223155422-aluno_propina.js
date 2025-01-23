'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    queryInterface.createTable("Alunos_propina", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      alunoId: {
        type: Sequelize.INTEGER,
        references: {
          model: "Alunos",
          key: "id",
        },
      },
      propinaId: {
        type: Sequelize.INTEGER,
        references: {
          model: "Propinas",
          key: "id",
        },
      },
      valor: {
        type: Sequelize.STRING,
        allowNull : false,
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

  async down (queryInterface, Sequelize) {
      queryInterface.dropTable("Alunos_propina");
  }
};
