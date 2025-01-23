const { body } = require("express-validator");

const create = [
  body("nome_completo")
    .trim()
    .notEmpty()
    .withMessage("O nome Completo é obrigatório"),
  body("email")
    .notEmpty()
    .withMessage("O email é obrigatório")
    .isEmail()
    .withMessage("Formato inválido de email"),
  body("telefone").notEmpty().withMessage("O número de telefone é obrigatório"),
  body("turno")
    .notEmpty()
    .withMessage("O turno do vigilante é obrigatório")
    .isIn(["m", "t", "n", "manhã", "tarde", "noite"])
    .withMessage("Valor passado para o turno não é válido"),
];

module.exports = { create };
