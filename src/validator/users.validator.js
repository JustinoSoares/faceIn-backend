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

const validateImages = (req, res, next) => {
  const { images } = req.body;

  // Verifica se "images" é um array
  if (!Array.isArray(images)) {
    return res.status(400).json({ error: "As imagens devem ser um array de URLs." });
  }

  // Verifica se há entre 3 e 5 imagens
  if (images.length < 3 || images.length > 5) {
    return res.status(400).json({ error: "O número de imagens deve ser entre 3 e 5." });
  }

  // Verifica se todas são URLs válidas
  const urlRegex = /^(https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp))$/i;
  const invalidUrls = images.filter((url) => !urlRegex.test(url));

  if (invalidUrls.length > 0) {
    return res.status(400).json({ error: "Uma ou mais URLs de imagens são inválidas." });
  }

  next();
};


module.exports = { create, validateImages };
