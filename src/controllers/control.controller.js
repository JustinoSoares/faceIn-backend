require("dotenv");
const { where, Op } = require("sequelize");
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

function ordenarMeses(meses) {
  const ordemPersonalizada = [
    "setembro",
    "outubro",
    "novembro",
    "dezembro",
    "janeiro",
    "fevereiro",
    "março",
    "abril",
    "maio",
    "junho",
    "julho",
    "agosto",
  ];

  return meses.sort(
    (a, b) =>
      ordemPersonalizada.indexOf(a.toLowerCase()) -
      ordemPersonalizada.indexOf(b.toLowerCase())
  );
}

exports.reconhecimento = async (req, res) => {
  try {
    const alunoId = req.params.alunoId;

    // Buscar aluno pelo ID
    const aluno = await Alunos.findByPk(alunoId);
    if (!aluno) {
      return res.status(404).json({
        status: false,
        msg: "Aluno não encontrado",
      });
    }

    // Buscar todas as propinas do aluno
    const propinas = await Aluno_propina.findAll({ where: { alunoId } });

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

    let historico_propinas = [];
    let meses_pagos = [];

    if (propinas.length > 0) {
      meses_pagos = await Promise.all(
        propinas.map(async (each) => {
          const propina = await Propinas.findByPk(each.propinaId);
          return propina ? propina.mes : null; // Evitar valores nulos
        })
      ).then((meses) => meses.filter((mes) => mes !== null));

      historico_propinas = meses.map((mes) => ({
        mes,
        status: meses_pagos.includes(mes),
      }));
    } else {
      historico_propinas = meses.map((mes) => ({ mes, status: false }));
    }

    // Buscar a foto do aluno, se existir
    const foto = await Fotos.findOne({ where: { alunoId: aluno.id } });

    const data_atual = new Date();
    const mes_atual = data_atual.getMonth(); // 0-11
    const dia_atual = data_atual.getDate();
    const ano_atual = data_atual.getFullYear();

    // Determinar o ano letivo com base no mês
    const ano_letivo =
      mes_atual >= 8
        ? `${ano_atual}/${ano_atual + 1}`
        : `${ano_atual - 1}/${ano_atual}`;

    // Buscar todos os pagamentos de propina do aluno
    const todos_meses_pagos = await Aluno_propina.findAll({
      where: { alunoId },
      order: [["createdAt", "DESC"]],
    });

    // Construir array de meses pagos
    const meses_pagos_lista = await Promise.all(
      todos_meses_pagos.map(async (p) => {
        const propina = await Propinas.findByPk(p.propinaId);
        return propina ? propina.mes : null;
      })
    ).then((meses) => meses.filter((mes) => mes !== null));

    // Ordenar os meses pagos corretamente
    const orderMonth = ordenarMeses(meses_pagos_lista);

    // Pegar o último mês pago, se existir
    const lastMonth =
      orderMonth.length > 0 ? orderMonth[orderMonth.length - 1] : null;

    // Verificar se a propina está em dia
    const ultimo_mes = lastMonth
      ? meses.findIndex((mes) => mes === lastMonth)
      : -1;
    let status_propina = ultimo_mes !== -1 && ultimo_mes >= mes_atual;
    if (ultimo_mes == mes_atual - 1 && dia_atual <= 10) status_propina = true;

    // Dados do aluno para resposta
    const respostaAluno = {
      id: aluno.id,
      status: true,
      n_do_aluno: await numero_do_aluno(aluno.id),
      nome_completo: aluno.nome_completo,
      imagem: foto ? foto.url : null,
      n_do_processo: aluno?.n_do_processo,
      turno: aluno.turno,
      turma: aluno.turma,
      curso: aluno.curso,
      classe: aluno.classe,
      ano_letivo,
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
        { msg: "Erro ao trazer os dados dos alunos", error: error.message },
      ],
    });
  }
};

exports.pagar_propina = async (req, res) => {
  try {
    const alunoId = req.params.alunoId;
    const { meses, toogle } = req.body; // Agora recebe um array de meses

    const data_actual = new Date();
    const mes_actual = data_actual.getMonth();
    const ano_atual = data_actual.getFullYear();

    // Determinar o ano letivo atual com base no mês
    const ano =
      mes_actual >= 8
        ? `${ano_atual}/${ano_atual + 1}`
        : `${ano_atual - 1}/${ano_atual}`;

    // Obter pagamentos existentes do aluno
    const propina_aluno = await Aluno_propina.findAll({ where: { alunoId } });

    const propinas_existentes = await Propinas.findAll({
      where: {
        id: propina_aluno.map((p) => p.propinaId),
        ano_lectivo: ano,
      },
    });

    if (toogle) {
      // PAGAR PROPINA (Adiciona os meses que ainda não foram pagos)
      const meses_nao_pagados = meses.filter(
        (mes) => !propinas_existentes.some((p) => p.mes == mes)
      );

      if (meses_nao_pagados.length === 0) {
        return res.status(400).json({
          status: false,
          error: [{ msg: "Todos os meses selecionados já foram pagos!" }],
        });
      }

      for (const mes of meses_nao_pagados) {
        const propina = await Propinas.create({ mes, ano_lectivo: ano });
        await Aluno_propina.create({
          alunoId,
          propinaId: propina.id,
          valor: "19000",
        });
      }

      return res.status(200).json({
        status: true,
        msg: "Pagamentos realizados com sucesso",
      });
    } else {
      // CANCELAR PAGAMENTO (Remove os meses selecionados)
      const propinas_para_remover = propinas_existentes.filter((p) =>
        meses.includes(p.mes)
      );

      if (propinas_para_remover.length === 0) {
        return res.status(400).json({
          status: false,
          error: [
            { msg: "Nenhum dos meses selecionados foi encontrado como pago!" },
          ],
        });
      }

      for (const propina of propinas_para_remover) {
        await Aluno_propina.destroy({
          where: { alunoId, propinaId: propina.id },
        });
        await Propinas.destroy({ where: { id: propina.id } });
      }

      return res.status(200).json({
        status: true,
        msg: "Pagamentos cancelados com sucesso",
      });
    }
  } catch (error) {
    return res.status(400).json({
      status: false,
      error: [
        { msg: "Problemas ao processar a operação!", error: error.message },
      ],
    });
  }
};

exports.historico = async (req, res) => {
  try {
    // 📌 Parametrização da paginação
    const limit = parseInt(req.query.peerPage) || 5;
    const page = parseInt(req.query.lastPage) || 1;
    const offset = (page - 1) * limit;
    const order = req.query.order?.toUpperCase() === "ASC" ? "ASC" : "DESC";
    const attribute = req.query.attribute || "createdAt";
    const search = req.query.pesquisa || "";


    // 📌 Data de hoje às 00:00
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    // 📌 Total de registros do histórico (para cálculo de páginas)
    const totalHistoricoHoje = await Historico.count({
      where: {
        createdAt: { [Op.gte]: hoje },
      },
      // include: [
      //   {
      //     model: Alunos,
      //     as: "aluno",
      //     where: {
      //       nome_completo: {
      //         [Op.iLike]: `%${search}%`,
      //       },
      //     },
      //   },
      // ],
    });

    const totalPages = Math.max(1, Math.ceil(totalHistoricoHoje / limit));
    const is_lastPages = page >= totalPages;

    // 📌 Busca paginada dos históricos do dia
    const historicoBruto = await Historico.findAll({
      where: {
        createdAt: { [Op.gte]: hoje },
      },
      order: [[attribute, order]],
      limit,
      offset,
      // include: [
      //   {
      //     model: Alunos,
      //     as: "aluno",
      //     where: {
      //       nome_completo: {
      //         [Op.iLike]: `%${search}%`,
      //       },
      //     },
      //   },
      // ],
    });
    
    // 📌 Mapeamento dos históricos e associação com dados do aluno e foto
    const historico = await Promise.all(
      historicoBruto.map(async (item) => {
        const { alunoId, status, createdAt } = item;
        const aluno = await Alunos.findByPk(alunoId);

        if (!aluno) return null;

        const foto = await Fotos.findOne({
          where: { alunoId: aluno.id },
          order: [["createdAt", "DESC"]],
        });

        return {
          alunoId: aluno.id,
          nome_completo: aluno.nome_completo,
          timestamp: createdAt,
          img: foto ? foto.url : null,
          status,
          createdAt: aluno.createdAt,
        };
      })
    );

    const historicoFiltrado = historico.filter((item) => item !== null);

    // 📌 Outras informações adicionais
    const totalAlunos = await Alunos.count();
    const totalVigilantes = await Vigilante.count();

    // 📌 Retorno da resposta formatada
    return res.status(200).json({
      status: true,
      currentPage: page,
      totalPages,
      is_lastPages,
      historico: historicoFiltrado,
      historicoHojeLength: totalHistoricoHoje,
      alunosLength: historicoFiltrado.length,
      vigilanteLength: totalVigilantes,
      totalAlunos,
    });
  } catch (error) {
    return res.status(400).json({
      status: false,
      error: error.message,
    });
  }
};

