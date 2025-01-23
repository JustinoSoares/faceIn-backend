require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const alunosRoutes = require("./routes/alunos.js");
const vigilanteRoutes = require("./routes/vigilante.js");
const authRoutes = require("./routes/auth.js");
const master = require("./middleware/master.middleware.js")();
const { Sequelize } = require("sequelize");
require("dotenv").config();

const app = express();
// swagger
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");

// Configuração do Swagger
const swaggerOptions = {
  definition: {
    openapi: "3.0.0", // Versão do OpenAPI
    info: {
      title: "Minha API Node.js", // Nome da API
      version: "1.0.0", // Versão da API
      description: "Documentação da API utilizando Swagger",
    },
    servers: [
      {
        url: "http://localhost:3000", // URL base da API
        description: "Servidor local",
      },
    ],
  },
  apis: ["src/routes/*.js"], // Caminho para arquivos de rotas
};

// Gerar especificações do Swagger
const swaggerDocs = swaggerJsdoc(swaggerOptions);

// Rota para exibir a documentação
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

PORT = process.env.PORT || 3000;

// real-time
const http = require("http");
const { Server } = require("socket.io");
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

app.use(async (req, res, next) => {
  (req.io = io), next();
});

app.set("socketio", io);
io.on("connect", (socket) => {
  console.log(`Novo usuário connectado ${socket.id}`);
  socket.on("disconnect", () => {
    console.log("Desconetou");
  });
});
// Middlewares
app.use(
  cors({
    origin: "*",
    methods: ["get", "post", "put", "delete"],
    allowedHeaders: ["Content-type", "Authorization"],
  })
);
app.use(bodyParser.json());
app.use(express.json());

// Rotas
app.use("/alunos", alunosRoutes);
app.use("/vigilante", vigilanteRoutes);
app.use("/auth", authRoutes);

// Inicialização do Servidor
app.get("/", (req, res) => {
  res.send("Sistema de API Escolar Funcionando");
});

// Verificação da conexão
const sequelize = new Sequelize(
  process.env.DATABASE_NAME,
  process.env.DATABASE_USER,
  process.env.DATABASE_PASSWORD,
  {
    dialect: process.env.DATABASE_DIALECT,
    timezone: "+01:00", // Luanda está em UTC+1
    host: process.env.DATABASE_HOST,
    port: process.env.PORT,
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: true, // Use true em produção
      },
    },
  }
);

(async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    console.log("Conexão com o banco de dados feita com sucesso!");
  } catch (error) {
    console.error("Erro na conexão com o banco de dados: " + error);
  }
})();

app.listen(PORT, () => {
  console.log(`Servidor Online, Servidor Rodando na porta ${PORT}`);
});
