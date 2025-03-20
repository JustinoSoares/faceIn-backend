'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Alunos', {
      id: {
        type: Sequelize.STRING,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true, // Adicione esta linha
      },
      n_do_processo: {
        type: Sequelize.INTEGER,
        // autoIncrement: true,
        allowNull: true,
      },
      n_do_aluno:{
        type: Sequelize.INTEGER,
        // autoIncrement : true,
        allowNull: true
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