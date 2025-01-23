'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Reconhecimento', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      alunoId: {
        type: Sequelize.INTEGER,
        allowNull: false, // Chave estrangeira não pode ser nula
        references: {
          model: 'Alunos', // Nome da tabela relacionada
          key: 'id', // Chave primária da tabela relacionada
        },
        onUpdate: 'CASCADE', // Atualizar em cascata
        onDelete: 'CASCADE', // Excluir em cascata
      },
       createdAt: {
         allowNull: false,
         type: Sequelize.DATE,
         defaultValue: Sequelize.fn('NOW'), // Valor padrão para timestamp atual
       },
       updatedAt: {
         allowNull: false,
         type: Sequelize.DATE,
         defaultValue: Sequelize.fn('NOW'), // Valor padrão para timestamp atual
       },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Reconhecimento'); // Adicionado `await` para garantir execução correta
  },
};
