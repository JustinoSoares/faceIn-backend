const express = require("express");
const router = express.Router();
const {
  Alunos,
  Fotos,
  Propinas,
  Aluno_propina,
} = require("../../models/index.js");
const upload = require("../config/upload.config");
const cloudinary = require("../config/cloudinary.config");
const fs = require("fs");

const auth = require("../auth/main.auth.js");

const { validationResult } = require("express-validator");
const validator = require("../validator/users.validator.js");
const { where, Op } = require("sequelize");

/**
 * @swagger
 * /alunos/create:
 *   post:
 *     summary: Cadastrar um novo aluno
 *     description: Cadastra um novo aluno e armazena as imagens no Cloudinary.
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: formData
 *         name: nome_completo
 *         required: true
 *         type: string
 *         description: Nome completo do aluno.
 *       - in: formData
 *         name: turno
 *         required: true
 *         type: string
 *         description: Turno do aluno.
 *       - in: formData
 *         name: classe
 *         required: true
 *         type: string
 *         description: Classe do Aluno.
 *       - in: formData
 *         name: n_do_aluno
 *         required: true
 *         type: string
 *         description: Número do aluno.
 *       - in: formData
 *         name: ano_letivo
 *         required: true
 *         type: string
 *         description: Ano lectivo no formato 2024/2025.
 *       - in: formData
 *         name: curso
 *         required: true
 *         type: string
 *         description: Curso do aluno. 
 *       - in: formData
 *         name: images
 *         required: true
 *         type: file
 *         description: Fotos do aluno (mínimo 3 imagens).
 *     responses:
 *       201:
 *         description: Aluno cadastrado com sucesso.
 *       400:
 *         description: Erro ao cadastrar aluno ou imagens insuficientes.
 */
router.post(
  "/create",
  validator.create,
  upload.array("images", 5),
  async (req, res) => {
    try {
      if (!req.files) {
        return res.status(400).json({
          status: false,
          msg: "Nenhuma imagem enviada",
        });
      }
      const uploadPromise = req.files.map((file, index) => {
        return cloudinary.uploader.upload(req.files[index].path);
      });
      const results = await Promise.all(uploadPromise);
      //apaga arquivos locais
      req.files.forEach((file) => {
        fs.unlinkSync(file.path);
      });
      //Url das imagens
      const urls = results.map((result) => result.secure_url);

      if (urls.length < 3) {
        return res.status(400).json({
          status: false,
          error: [
            {
              msg: "O Aluno deve ter no mínimo 3 fotos",
            },
          ],
        });
      }

      const {
        nome_completo,
        turno,
        classe,
        n_do_aluno,
        ano_letivo,
        turma,
        curso,
      } = req.body;

      const allAlunos = await Alunos.findAll({
        where: { ano_letivo },
        order: [["id", "DESC"]],
        limit: 1,
      });

      let n_do_processo = 1;
      if (allAlunos.length > 0) {
        n_do_processo = allAlunos[0].n_do_processo + 1; // Acessa o primeiro registro do array
      }
      const aluno = await Alunos.create({
        n_do_processo,
        nome_completo,
        turno,
        classe,
        n_do_aluno,
        ano_letivo,
        turma,
        curso,
      });
      const fotos = await Promise.all(
        urls.map(async (url) => {
          const fotoData = await Fotos.create({
            url: url,
            alunoId: aluno.id,
          });
          return fotoData;
        })
      );
      res.status(201).json({
        status: true,
        msg: "Aluno cadastrado com sucesso",
        aluno,
        fotos,
      });
    } catch (error) {
      res.status(400).json({
        status: false,
        error: {
          msg: "Erro ao cadastrar Aluno",
          error: error.message,
        },
      });
    }
  }
);


/**
 * @swagger
 * alunos/:
 *   get:
 *     summary: Listar alunos
 *     description: Retorna todos os alunos com base em parâmetros de consulta.
 *     parameters:
 *       - in: query
 *         name: maxLen
 *         required: false
 *         type: integer
 *         description: Número máximo de alunos a retornar.
 *       - in: query
 *         name: offset
 *         required: false
 *         type: integer
 *         description: Offset para paginação.
 *       - in: query
 *         name: pesquisa
 *         required: false
 *         type: string
 *         description: Nome parcial para buscar alunos.
 *     responses:
 *       200:
 *         description: Lista de alunos.
 *       400:
 *         description: Erro ao buscar os alunos.
 */
router.get("/", async (req, res) => {
  try {
    const maxLen = req.query.maxLen || 3;
    const offset = req.query.offset || 0;
    const pesquisa = req.query.pesquisa || "";
    const attribute = req.query.attribute || "id";
    const order = req.query.order || "ASC";

    const aluno = await Alunos.findAll({
      where: {
        nome_completo: {
          [Op.like]: `%${pesquisa}%`,
        },
      },
      limit: maxLen,
      offset,
      order: [[attribute, order]],
    });

    res.status(201).json({
      status: true,
      msg: "Todos os Alunos",
      data: aluno,
    });
  } catch (error) {
    res.status(400).json({
      status: false,
      error: [
        {
          msg: "Erro ao achar os alunos",
          error: error.message,
        },
      ],
    });
  }
});

/**
 * @swagger
 * alunos/{id}:
 *   get:
 *     summary: Buscar aluno por ID
 *     description: Retorna as informações de um aluno específico.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         type: integer
 *         description: ID do aluno.
 *     responses:
 *       200:
 *         description: Detalhes do aluno.
 *       404:
 *         description: Aluno não encontrado.
 */
router.get("/:id", async (req, res) => {
  try {
    const aluno = await Alunos.findByPk(req.params.id);
    if (!aluno) return res.status(400).json({ error: "Aluno não encontrado" });
    return res.status(201).json({
      status : true,
      data : aluno,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const aluno = await Aluno.findByPk(req.params.id);
    if (!aluno) return res.status(404).json({ error: "Aluno não encontrado" });
    await aluno.update(req.body);
    return res.json(aluno);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const aluno = await Aluno.findByPk(req.params.id);
    if (!aluno) return res.status(404).json({ error: "Aluno não encontrado" });

    await aluno.destroy();
    return res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * @swagger
 * /propinas_pagas/{alunoId}:
 *   get:
 *     summary: Retorna as propinas pagas por um aluno específico
 *     description: Busca todas as propinas pagas pelo aluno identificado pelo `alunoId`.
 *     tags:
 *       - Propinas
 *     parameters:
 *       - name: alunoId
 *         in: path
 *         required: true
 *         description: ID do aluno cujas propinas pagas serão retornadas.
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de propinas pagas pelo aluno.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 proninas:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         description: ID da propina.
 *                       mes:
 *                         type: string
 *                         description: Mês referente à propina.
 *                       ano_letivo:
 *                         type: string
 *                         description: Ano letivo referente à propina.
 *       400:
 *         description: Erro ao buscar as propinas pagas.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Erro ao buscar as propinas pagas."
 */
router.get("/propinas_pagas/:alunoId", async (req, res) => {
  const alunoId = req.params.alunoId;
  const pagas = await Aluno_propina.findAll({
    where: {
      alunoId,
    },
  });

  const meses = await Promise.all(
    pagas.map(async (cada) => {
      const propina = await Propinas.findByPk(cada.propinaId);
      return propina;
    })
  );
  return res.status(200).json({
    status: true,
    proninas: meses,
  });
});
module.exports = router;
