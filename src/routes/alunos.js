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

router.post(
  "/create",
  validator.create,
  validator.validateImages,
  auth.admin,
  upload.array("images", 5),
  async (req, res) => {
    try {
      // if (!req.files) {
      //   return res.status(400).json({
      //     status: false,
      //     msg: "Nenhuma imagem enviada",
      //   });
      // }
      // console.log("FIles: " + JSON.stringify(req.files));
      // const uploadPromise = req.files.map((file, index) => {
      //   return cloudinary.uploader.upload(req.files[index].path);
      // });
      // const results = await Promise.all(uploadPromise);
      // //apaga arquivos locais
      // req.files.forEach((file) => {
      //   fs.unlinkSync(file.path);
      // });
      //Url das imagens
      // const urls = results.map((result) => result.secure_url);

      // if (urls.length < 3) {
      //   return res.status(400).json({
      //     status: false,
      //     error: [
      //       {
      //         msg: "O Aluno deve ter no mínimo 3 fotos",
      //       },
      //     ],
      //   });
      // }
      const {
        nome_completo,
        turno,
        classe,
        n_do_aluno,
        ano_letivo,
        turma,
        curso,
        images,
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
        images.map(async (url) => {
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

router.get("/all", async (req, res) => {
  try {
    const maxLen = req.query.maxLen || 3;
    const offset = req.query.offset || 0;
    const pesquisa = req.query.pesquisa || "";
    const attribute = req.query.attribute || "nome_completo";
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

    res.status(200).json({
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

router.get("/:id", async (req, res) => {
  try {
    const aluno = await Alunos.findByPk(req.params.id);
    if (!aluno) return res.status(400).json({ error: "Aluno não encontrado" });
    return res.status(201).json({
      status: true,
      data: aluno,
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
