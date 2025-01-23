'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Alunos', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      n_do_processo:{
        type: Sequelize.INTEGER,
        allowNull: false
      },
      n_do_aluno:{
        type: Sequelize.INTEGER,
        allowNull: false
      },
      nome_completo: {
        type: Sequelize.STRING,
        allowNull: false
      },
      classe: {
        type: Sequelize.STRING,
        allowNull: false
      },
      turno: {
        type: Sequelize.ENUM("m", "t", "n"),
        defaultValue: "m",
        allowNull: false
      },
      ano_letivo: {
        type: Sequelize.STRING,
        allowNull: false
      },
      turma: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      curso: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Alunos');
  }
};