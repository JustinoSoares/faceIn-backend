require("dotenv");
const { where } = require("sequelize");
const {
  Alunos,
  Historico,
  Propinas,
  Aluno_propina,
  Fotos,
} = require("../../models/index");
const { compareSync } = require("bcrypt");

exports.permitir = async (req, res) => {
  try {
    const alunoId = req.params.alunoId;
    const userId = req.userId;

    const aluno = await Alunos.findByPk(alunoId);
    if (!aluno) {
      return res.status(400).json({
        status: false,
        error: [
          {
            msg: "Este aluno não exite",
          },
        ],
      });
    }

    const historico = await Historico.create({
      timestamp: new Date(),
      status: "Permitido",
      userId,
      alunoId: aluno.id,
    });
    const io = req.app.get("socketio");
    const data = {
      nome_completo: aluno.nome_completo,
      timestamp: historico.timestamp,
      status: historico.status,
    };
    io.emit("historico", data);
    return res.status(200).json({
      status: true,
      msg: "Aluno permitido",
    });
  } catch (error) {
    return res.status(400).json({
      status: false,
      error: [
        {
          msg: "Erro ao permitir a entrada desse aluno",
          error: error.message,
        },
      ],
    });
  }
};

exports.negar = async (req, res) => {
  try {
    const alunoId = req.params.alunoId;
    const userId = req.userId;

    const { motivo_negacao } = req.body;

    const aluno = await Alunos.findByPk(alunoId);
    if (!aluno) {
      return res.status(400).json({
        status: false,
        error: [
          {
            msg: "Este aluno não exite",
          },
        ],
      });
    }
    const historico = await Historico.create({
      timestamp: new Date(),
      status: "Negado",
      motivo_negacao,
      userId,
      alunoId: aluno.id,
    });
    const io = req.app.get("socketio");
    const data = {
      nome_completo: aluno.nome_completo,
      timestamp: historico.timestamp,
      status: historico.status,
    };
    io.emit("historico", data);
    return res.status(200).json({
      status: true,
      msg: "Aluno Negado",
    });
  } catch (error) {
    return res.status(400).json({
      status: false,
      error: [
        {
          msg: "Erro ao permitir a entrada desse aluno",
        },
      ],
    });
  }
};

exports.reconhecimento = async (req, res) => {
  try {
    const alunoId = req.params.alunoId;

    // Buscar o aluno pelo ID
    const aluno = await Alunos.findByPk(alunoId);
    if (!aluno) {
      return res.status(404).json({
        status: false,
        msg: "Aluno não encontrado",
      });
    }

    // Buscar todas as propinas do aluno
    const propinas = await Aluno_propina.findAll({
      where: { alunoId },
    });

    const meses = [
      "Janeiro",
      "Fevereiro",
      "Março",
      "Abril",
      "Maio",
      "Junho",
      "Julho",
      "Agosto",
      "Setembro",
      "Outubro",
      "Novembro",
      "Dezembro",
    ];

    if (propinas.length > 0) {
      // Obter os meses pagos, se houver propinas
      let meses_pagos = [];
      if (propinas.length > 0) {
        meses_pagos = await Promise.all(
          propinas.map(async (each) => {
            const propinass = await Propinas.findByPk(each.propinaId);
            return propinass ? propinass.mes : null; // Verificar se propinass existe
          })
        ).then((meses) => meses.filter((mes) => mes !== null)); // Filtrar valores nulos
      }

      // Construir histórico das propinas
      var historico_propinas = meses.map((mes) => {
        const status = meses_pagos.includes(mes);
        return { mes, status };
      });
      let ultimo_mes_pago = -1;
      if (propinas[0].propinaId) {
        const propina_each = await Propinas.findByPk(propinas[0].propinaId);
      }
    } else {
      var historico_propinas = meses.map((mes) => {
        return { mes, status: false };
      });
    }
    // Buscar a foto do aluno, se existir
    const foto = await Fotos.findOne({
      where: { alunoId: aluno.id },
    });
    // Obter data atual e mês atual (0-11)
    const data_actual = new Date();
    const mes_actual = data_actual.getMonth();
    // Determinar o status da propina
    const ultimo_mes_pago = await Aluno_propina.findAll({
      where: { alunoId },
    });
    const status_propina = ultimo_mes_pago.length - 1 >= mes_actual;
    // Preparar dados do aluno para resposta
    const respostaAluno = {
      nome_completo: aluno.nome_completo,
      imagem: foto ? foto.url : null, // Verificar se foto existe
      n_do_processo: aluno.n_do_processo,
      turno: aluno.turno,
      turma : aluno.turma,
      curso : aluno.curso,
      status_propina,
    };

    return res.status(200).json({
      status: true,
      msg: "Todos os meses pagos",
      aluno: respostaAluno,
      propinas: historico_propinas,
    });
  } catch (error) {
    return res.status(400).json({
      status: false,
      error: [
        {
          msg: "Erro ao trazer os dados dos alunos",
          error: error.message,
        },
      ],
    });
  }
};

exports.pagar_propina = async (req, res) => {
  try {
    const alunoId = req.params.alunoId;
    const { mes, ano_lectivo, valor } = req.body;

    //verificar se o aluno já pagou a propina
    const propina_aluno = await Aluno_propina.findAll({
      alunoId,
    });

    const is_pay = await Promise.all(
      propina_aluno.map(async (pay) => {
        const new_pay = await Propinas.findByPk(pay.propinaId);
        if (new_pay.mes == mes && new_pay.ano_lectivo == ano_lectivo) {
          return false;
        } else {
          return true;
        }
      })
    );

    if (is_pay.includes(false)) {
      return res.status(400).json({
        status: false,
        error: [
          {
            msg: "Pagamento para esse mês já foi efetuado!",
          },
        ],
      });
    }

    const propina = await Propinas.create({
      mes,
      ano_lectivo,
    });

    await Aluno_propina.create({
      alunoId,
      propinaId: propina.id,
      valor,
    });
    return res.status(200).json({
      status: true,
      msg: "Pagamento realizado com sucesso",
    });
  } catch (error) {
    return res.status(400).json({
      status: false,
      error: [
        {
          msg: "Problemas ao efectuar o pagamento de propina!",
          error: error.message,
        },
      ],
    });
  }
};

exports.historico = async (req, res) =>{
  const user
}
