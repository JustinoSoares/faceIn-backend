const { body } = require("express-validator");
const create = [
  body("nome_completo").notEmpty().withMessage("O Nome Completo é obrigatório"),
  body("turno")
    .notEmpty()
    .withMessage("O O turno é obrigatório é obrigatório")
    .isIn(["m", "t", "n", "manhã", "tarde", "noite"])
    .withMessage("Valor passado para o turno não é válido"),
  body("classe").notEmpty().withMessage("A classe do Aluno é obrigatória"),
  body("n_do_aluno").notEmpty().withMessage("O número do Aluno é obrigatória"),
  body("ano_letivo")
    .notEmpty()
    .withMessage("O Ano letivo do Aluno é obrigatória"),
  body("curso").notEmpty().withMessage("O Curso do Aluno é obrigatória"),
];

module.exports = { create };
