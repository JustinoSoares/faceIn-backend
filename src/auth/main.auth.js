const jwt = require("jsonwebtoken");
require("dotenv").config(); // Certifique-se de carregar as variáveis do .env

exports.vigilante = async (req, res, next) => {
  try {
    const secret = process.env.JWT_SECRET;
    const authHeader = req.header("authorization");

    if (!authHeader) {
      return res.status(401).json({ status: false, error: [{ msg: "Acesso negado!" }] });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ status: false, error: [{ msg: "Acesso negado!" }] });
    }

    const dados = jwt.verify(token, secret);
    if (dados.type === "vigilante") {
      req.userId = dados.id;
      return next(); // 🔹 "return" para evitar que outra resposta seja enviada depois
    }

    return res.status(401).json({ status: false, error: [{ msg: "Acesso negado!" }] });

  } catch (error) {
    return res.status(403).json({ status: false, error: [{ msg: "Acesso negado!" }] });
  }
};

exports.admin = async (req, res, next) => {
  try {
    const secret = process.env.JWT_SECRET;
    const authHeader = req.headers["authorization"];

    if (!authHeader) {
      return res.status(401).json({ status: false, error: [{ msg: "Acesso negado!" }] });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ status: false, error: [{ msg: "Acesso negado!" }] });
    }

    const dados = jwt.verify(token, secret);
    if (dados.type === "admin") {
      req.userId = dados.id;
      return next();
    }

    return res.status(401).json({ status: false, error: [{ msg: "Acesso negado!" }] });

  } catch (error) {
    return res.status(403).json({ status: false, error: [{ msg: "Acesso negado!" }] });
  }
};

exports.double = async (req, res, next) => {
  try {
    const secret = process.env.JWT_SECRET;
    const authHeader = req.headers["authorization"];

    if (!authHeader) {
      return res.status(401).json({ status: false, error: [{ msg: "Acesso negado!" }] });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ status: false, error: [{ msg: "Acesso negado!" }] });
    }

    const dados = jwt.verify(token, secret);
    if (dados.type === "admin" || dados.type === "vigilante") {
      req.userId = dados.id;
      return next();
    }

    return res.status(401).json({ status: false, error: [{ msg: "Acesso negado!" }] });

  } catch (error) {
    return res.status(403).json({ status: false, error: [{ msg: "Acesso negado!" }] });
  }
};
