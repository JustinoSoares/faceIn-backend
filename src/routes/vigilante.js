const express = require("express");
const router = express.Router();
const { Vigilante, Users } = require("../../models/index.js");
const auth = require("../auth/main.auth.js");
const bcrypt = require("bcrypt");
const { where, Op } = require("sequelize");
const {validationResult} = require("express-validator");
const validator = require("../validator/vigilantes.validator.js");
const control = require("../controllers/control.controller.js");


/**
 * @swagger
 * /vigilante/create:
 *   post:
 *     summary: Cria um novo vigilante
 *     description: Endpoint para criar um vigilante no sistema. Valida campos obrigatórios e verifica se o vigilante já existe pelo telefone ou email.
 *     tags:
 *       - Vigilante
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome_completo:
 *                 type: string
 *                 description: Nome completo do vigilante.
 *                 example: "João Silva"
 *               telefone:
 *                 type: string
 *                 description: Telefone do vigilante.
 *                 example: "+244923456789"
 *               email:
 *                 type: string
 *                 description: Email do vigilante.
 *                 example: "joao.silva@example.com"
 *               turno:
 *                 type: string
 *                 description: Turno de trabalho do vigilante.
 *                 example: "Noturno"
 *               desc:
 *                 type: string
 *                 description: Descrição adicional sobre o vigilante.
 *                 example: "Responsável pelo turno da noite."
 *     responses:
 *       201:
 *         description: O Pin de acesso será envidado por email.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 msg:
 *                   type: string
 *                   example: "Vigilante criado com sucesso"
 *                 data:
 *                   type: object
 *                   properties:
 *                     nome_completo:
 *                       type: string
 *                       example: "João Silva"
 *                     telefone:
 *                       type: string
 *                       example: "+244923456789"
 *                     email:
 *                       type: string
 *                       example: "joao.silva@example.com"
 *                     turno:
 *                       type: string
 *                       example: "Noturno"
 *                     desc:
 *                       type: string
 *                       example: "Responsável pelo turno da noite."
 *       400:
 *         description: Erro na validação ou na criação do vigilante.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       msg:
 *                         type: string
 *                         example: "Esse vigilante já existe"
 */
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

router.get("/all", async (req, res) => {
  try {
    const vigilante = await Vigilante.findAll();
    return res.status(200).json(vigilante);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get("/each/:id", async (req, res) => {
  try {
    const vigilante = await Vigilante.findByPk(req.params.id);
    if (!vigilante)
      return res.status(400).json({ error: "Vigilante não encontrado" });
    return res.status(200).json(vigilante);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put("/update/:id", async (req, res) => {
  try {
    const vigilante = await Vigilante.findByPk(req.params.id);
    if (!vigilante)
      return res.status(404).json({ error: "Vigilante não encontrado" });
    await vigilante.update(req.body);
    return res.status(200).json(vigilante);
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

/**
 * @swagger
 * /permitir/{alunoId}:
 *   post:
 *     summary: Permitir a entrada de um aluno
 *     description: Endpoint para permitir a entrada de um aluno específico. Emite um evento em tempo real via WebSocket com o status do aluno.
 *     tags:
 *       - Alunos
 *     parameters:
 *       - in: path
 *         name: alunoId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do aluno a ser permitido.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Aluno permitido com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 msg:
 *                   type: string
 *                   example: "Aluno permitido"
 *       400:
 *         description: Erro ao processar a permissão do aluno.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       msg:
 *                         type: string
 *                         example: "Este aluno não existe"
 */
router.post("/permitir/:alunoId", auth.vigilante, control.permitir);
/**
 * @swagger
 * /negar/{alunoId}:
 *   post:
 *     summary: Negar a entrada de um aluno
 *     description: Endpoint para negar a entrada de um aluno específico e registrar o motivo da negação.
 *     tags:
 *       - Alunos
 *     parameters:
 *       - in: path
 *         name: alunoId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do aluno a ser negado.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               motivo_negacao:
 *                 type: string
 *                 example: "Documentos incompletos"
 *                 description: Motivo da negação.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Aluno negado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 msg:
 *                   type: string
 *                   example: "Aluno Negado"
 *       400:
 *         description: Erro ao processar a negação do aluno.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       msg:
 *                         type: string
 *                         example: "Este aluno não existe"
 */
router.post("/negar/:alunoId", auth.vigilante, control.negar);

/**
 * @swagger
 * /reconhecimento/{alunoId}:
 *   get:
 *     summary: Verificar informações de um aluno e o histórico de propinas
 *     description: Retorna os dados do aluno, incluindo nome, foto, número de processo, turno, status de propinas e histórico de meses pagos.
 *     tags:
 *       - Alunos
 *     parameters:
 *       - in: path
 *         name: alunoId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do aluno.
 *     responses:
 *       200:
 *         description: Dados do aluno e histórico de propinas retornados com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 msg:
 *                   type: string
 *                   example: "Todos os meses pagos"
 *                 aluno:
 *                   type: object
 *                   properties:
 *                     nome_completo:
 *                       type: string
 *                       example: "João Silva"
 *                     imagem:
 *                       type: string
 *                       example: "https://example.com/foto.jpg"
 *                     n_processo:
 *                       type: string
 *                       example: "123456"
 *                     turno:
 *                       type: string
 *                       example: "Manhã"
 *                     status_propina:
 *                       type: boolean
 *                       example: true
 *                 propinas:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       mes:
 *                         type: string
 *                         example: "Janeiro"
 *                       status:
 *                         type: boolean
 *                         example: true
 *       404:
 *         description: Aluno não encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: false
 *                 msg:
 *                   type: string
 *                   example: "Aluno não encontrado"
 *       400:
 *         description: Erro ao trazer os dados do aluno.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       msg:
 *                         type: string
 *                         example: "Erro ao trazer os dados dos alunos"
 *                       error:
 *                         type: string
 *                         example: "Mensagem de erro detalhada"
 */
router.get("/reconhecimento/:alunoId", control.reconhecimento);

/**
 * @swagger
 * /pagar_propina/{alunoId}:
 *   post:
 *     summary: Efetuar o pagamento de uma propina para um aluno
 *     description: Realiza o pagamento de propina de um aluno, verificando se o pagamento já foi realizado para o mês e ano letivo especificados.
 *     tags:
 *       - Propinas
 *     parameters:
 *       - in: path
 *         name: alunoId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do aluno.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               mes:
 *                 type: string
 *                 example: "Janeiro"
 *               ano_lectivo:
 *                 type: string
 *                 example: "2024"
 *               valor:
 *                 type: number
 *                 example: 5000
 *     responses:
 *       200:
 *         description: Pagamento realizado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 msg:
 *                   type: string
 *                   example: "Pagamento realizado com sucesso"
 *       400:
 *         description: Erro ao realizar o pagamento da propina.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       msg:
 *                         type: string
 *                         example: "Problemas ao efectuar o pagamento de propina!"
 *                       error:
 *                         type: string
 *                         example: "Mensagem de erro detalhada"
 */
router.post("/pagar_propina/:alunoId", control.pagar_propina);

module.exports = router;
