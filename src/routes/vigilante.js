const express = require("express");
const router = express.Router();
const { Vigilante, Users } = require("../../models/index.js");
const auth = require("../auth/main.auth.js");
const bcrypt = require("bcrypt");
const { where, Op } = require("sequelize");
const {validationResult} = require("express-validator");
const validator = require("../validator/vigilantes.validator.js");
const control = require("../controllers/control.controller.js");

// endpoit para criar um vigilante
router.post("/create", validator.create, async (req, res) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty())
    {
      return res.status(400).json({
        status : false,
        error : errors.array(),
      });
    }
    const { nome_completo, telefone, email, turno, desc } = req.body;

    const allUsers = await Users.findOne({
      where: {
        [Op.or]: [{ email }, { telefone }],
      },
    });
    if (allUsers) {
      return res.status(400).json({
        status: false,
        error: [
          {
            msg: "Esse vigilante já existe",
          },
        ],
      });
    }
    const pin = Math.floor(1000 + Math.random() * 9000);
    console.log(`HASH ${pin.toString()}`);
    const hash = bcrypt.hashSync(pin.toString(), 10);

    const users = await Users.create({
      nome_completo,
      telefone,
      email,
      password: hash,
      is_active : true,
      type: "vigilante",
    });

    const vigilante = await Vigilante.create({
      turno,
      desc,
      UserId: users.id,
    });
    return res.status(201).json({
      status: true,
      msg: "Vigilante criado com sucesso",
      data: {
        nome_completo: users.nome_completo,
        telefone: users.telefone,
        email: users.email,
        turno: vigilante.turno,
        desc: vigilante.desc,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: false,
      error: [
        {
          msg: "Erro ao criar um vigilante",
        },
      ],
    });
  }
});
// endpoit to get all vigilantes
router.get("/all", async (req, res) => {
  try {
    const vigilante = await Vigilante.findAll();
    return res.status(200).json({
      status: true,
      data: vigilante,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
//get each vigilantes
router.get("/each/:id", async (req, res) => {
  try {
    const vigilante = await Vigilante.findByPk(req.params.id);
    if (!vigilante)
      return res.status(400).json({ error: "Vigilante não encontrado" });
    return res.status(200).json({
      status: true,
      data : vigilante,
    });
  } catch (error) {
    res.status(400).json({
      status: false,
      error: error.message 
    });
  }
});
// update to de each vigilante
router.put("/update/:id", async (req, res) => {
  try {
    const vigilante = await Vigilante.findByPk(req.params.id);
    if (!vigilante)
      return res.status(404).json({ error: "Vigilante não encontrado" });
    await vigilante.update(req.body);
    return res.status(200).json({
      status: true,
      data: vigilante,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete("/delete/:id", async (req, res) => {
  try {
    const vigilante = await Vigilante.findByPk(req.params.id);
    if (!vigilante)
      return res.status(404).json({ error: "Vigilante não encontrado" });

    await vigilante.destroy();
    res.status(200).send();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
// permitir a entrada de um aluno
router.post("/permitir/:alunoId", auth.vigilante, control.permitir);
// negar a entrada de um aluno
router.post("/negar/:alunoId", auth.vigilante, control.negar);
// reconhecimento
router.get("/reconhecimento/:alunoId", control.reconhecimento);
// pagar a propina para cada aluno
router.post("/pagar_propina/:alunoId", control.pagar_propina);

module.exports = router;
