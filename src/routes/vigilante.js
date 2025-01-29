const express = require("express");
const router = express.Router();
const mailjet = require("node-mailjet");
const { Vigilante, Users } = require("../../models/index.js");
const auth = require("../auth/main.auth.js");
const bcrypt = require("bcrypt");
const { where, Op } = require("sequelize");
const { validationResult } = require("express-validator");
const validator = require("../validator/vigilantes.validator.js");
const control = require("../controllers/control.controller.js");

// endpoit para criar um vigilante
router.post("/create", validator.create, async (req, res) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: false,
        error: errors.array(),
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
      is_active: true,
      type: "vigilante",
    });

    const vigilante = await Vigilante.create({
      turno,
      desc,
      UserId: users.id,
    });
    const mailjetClient = await mailjet.apiConnect(
      process.env.MAILJET_PUBLIC_KEY,
      process.env.MAILJET_SECRET_KEY
    );

    const request = await mailjetClient
      .post("send", { version: "v3.1" })
      .request({
        Messages: [
          {
            From: {
              Email: process.env.MAILJET_FROM_EMAIL,
              Name: process.env.MAILJET_FROM_NAME,
            },
            To: [
              {
                Email: users.email,
                Name: users.nome_completo,
              },
            ],
            Subject: `Pin de acesso do vigilante ${users.nome_completo}`,
            TextPart:
              `Pin de acesso ** ${pin.toString()} **`,
          },
        ],
      });

    const response = await request;

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
          error : error.message,
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
    const each_vigilante = await Promise.all(
      vigilante.map(async (each) => {
        const user = await Users.findByPk(each.UserId);
        const data = {
          nome_completo: user.nome_completo,
          telefone: user.telefone,
          email: user.email,
          turno: each.turno,
          descricao: each.descricao,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        };
        return data;
      })
    );

    return res.status(200).json({
      status: true,
      data: each_vigilante,
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
      data: vigilante,
    });
  } catch (error) {
    res.status(400).json({
      status: false,
      error: error.message,
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
// quando uma aluno é reconhecido
router.get("/reconhecimento/:alunoId", control.reconhecimento);
// pagar a propina para cada aluno
router.post("/pagar_propina/:alunoId", control.pagar_propina);

router.get("/historico/", control.historico);



module.exports = router;
