'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
   await queryInterface.createTable('Users', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      nome_completo: {
        type: Sequelize.STRING
      },
      email: {
        type: Sequelize.STRING
      },
      password : {
        type : Sequelize.STRING,
        allowNull : false,
      },
      telefone: {
        type: Sequelize.STRING
      },
      type: {
        type: Sequelize.ENUM('admin', 'vigilante'),
        defaultValue: 'vigilante',
      },
      is_active : {
        type: Sequelize.BOOLEAN,
        defaultValue : false,
      },
      bi : {
        type: Sequelize.STRING
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

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('Users');
  }
};
