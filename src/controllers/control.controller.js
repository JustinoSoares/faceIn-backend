require("dotenv");
const { where } = require("sequelize");
const {
  Alunos,
  Historico,
  Propinas,
  Aluno_propina,
  Vigilante,
  Fotos,
} = require("../../models/index");

async function numero_do_aluno(alunoId) {
  const aluno = await Alunos.findByPk(alunoId);
  if (!aluno) return -1;
  const Aluno_na_turma = await Alunos.findAll({
    where: {
      turma: aluno.turma,
      classe: aluno.classe,
      curso: aluno.curso,
      ano_letivo: aluno.ano_letivo,
    },
    order: [["nome_completo", "ASC"]],
  });

  const posicao = Aluno_na_turma.findIndex((a) => a.id === alunoId) + 1;
  return posicao;
}

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

    const data_actual = new Date();
    const mes_actual = data_actual.getMonth(); // Mês atual (0-11)
    const ano_atual = data_actual.getFullYear();

    // Determinar o ano letivo atual com base no mês
    const ano_letivo = mes_actual >= 8 ? `${ano_atual}/${ano_atual + 1}` : `${ano_atual - 1}/${ano_atual}`;

    // Buscar os pagamentos de propina do aluno
    const ultimo_mes_pago = await Aluno_propina.findAll({
      where: { alunoId },
      order: [["createdAt", "DESC"]], // Ordenar pelo mês mais recente
      limit: 1,
    });

    // Verificar se a propina está em dia
    const ultimo_mes = ultimo_mes_pago.length ? ultimo_mes_pago[0].mes : -1;
    const status_propina = ultimo_mes >= mes_actual;

    // Preparar dados do aluno para resposta
    const respostaAluno = {
      id: aluno.id,
      status: true,
      n_do_aluno: await numero_do_aluno(aluno.id),
      nome_completo: aluno.nome_completo,
      imagem: foto ? foto.url : null, // Verificar se foto existe
      n_do_processo: aluno.n_do_processo,
      turno: aluno.turno,
      turma: aluno.turma,
      curso: aluno.curso,
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
    const { mes, valor } = req.body;

    const data_actual = new Date();
    const mes_actual = data_actual.getMonth(); // Mês atual (0-11)
    const ano_atual = data_actual.getFullYear();

    // Determinar o ano letivo atual com base no mês
    const ano = mes_actual >= 8 ? `${ano_atual}/${ano_atual + 1}` : `${ano_atual - 1}/${ano_atual}`;


    //verificar se o aluno já pagou a propina
    const propina_aluno = await Aluno_propina.findAll({
      alunoId,
    });

    const is_pay = await Promise.all(
      propina_aluno.map(async (pay) => {
        const new_pay = await Propinas.findByPk(pay.propinaId);
        if (new_pay.mes == mes && new_pay.ano_lectivo == ano) {
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

exports.historico = async (req, res) => {
  try {
    const limit = req.query.limit || 5;
    const lastPage = req.query.lastPage || 1;
    const order = req.query.order || "DESC";
    const atribute = req.query.atribute || "createdAt";

    const countHist = await Historico.count();
    let pages = (countHist / limit).ceil;
    if (countHist == 0) pages = 1;
    let is_lastPages = false;
    if (pages == lastPage) is_lastPages = true;
    offset = limit * lastPage;

    const historico = await Historico.findAll({
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [[atribute, order]],
    });
    //pegar o historico de entrada que eu preciso
    const HistoricoAlunos = await Promise.all(
      historico.map(async (each) => {
        const aluno = await Alunos.findByPk(each.userId);
        const photo = await File.findAll({
          where: { alunoId: aluno.id },
          limit: 1,
        });
        data = {
          alunoId: aluno.id,
          nome_completo: aluno.nome_completo,
          timestamp: each.createdAt,
          img: photo.url,
          status: each.status,
          createdAt: aluno.createdAt,
          lastPage: lastPage,
        };
        return data;
      })
    );

    //estatistica
    const countVigilante = await Vigilante.count();

    return res.status(200).json({
      status: true,
      is_lastPages,
      alunosLength: HistoricoAlunos.length,
      vigilanteLength: countVigilante,
      historico: HistoricoAlunos,
    });
  } catch (error) {
    return res.status(400).json({
      status: false,
      data: {
        error: error.message,
      },
    });
  }
};
