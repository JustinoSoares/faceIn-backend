const express = require("express");
const bcrypt = require("bcrypt");
const { Users } = require("../../models/index"); // Supondo que você tenha o modelo de User
const { Op } = require("sequelize");
require("dotenv");
// Função para criar um admin
const createAdmin = async () => {
  try {
    const adminExists = await Users.findOne({
      where: {
        [Op.or]: [
          { type: "admin" },
          { email: process.env.ADMIN_EMAIL },
          { telefone: process.env.ADMIN_PHONE },
        ],
      },
    });

    if (!adminExists) {
      const pass = process.env.ADMIN_PASSWORD;
      const hashedPassword = bcrypt.hashSync(pass, 10); // Senha segura
      // Cria o usuário admin
      const users =  await Users.create({
        nome_completo: 'Admin',
        email: process.env.ADMIN_EMAIL,
        telefone: process.env.ADMIN_PHONE,
        password: hashedPassword,
        is_active: true,
        type: "admin",
      });
      console.log("Admin criado com sucesso!");
    } else {
      console.log("...");
    }
  } catch (error) {
    console.error("Erro ao criar admin:", error);
  }
};

// Chama a função para criar o admin ao iniciar o servidor
module.exports = createAdmin;
