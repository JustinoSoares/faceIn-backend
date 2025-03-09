const jwt = require("jsonwebtoken");
require("dotenv");

exports.vigilante = async (req, res, next) => {
  const secret = process.env.JWT_SECRET;
  const authHeader = req.header("authorization");
  if (!authHeader) {
    return res.status(401).json({
      status: false,
      error: [
        {
          msg: "Acesso negado!",
        },
      ],
    });
  }
  try {
    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({
        status: false,
        error: [
          {
            msg: "Acesso negado!",
          },
        ],
      });
    }

    const verify = jwt.verify(token, secret, (error, dados) => {
      if (dados.type === "vigilante") {
        req.userId = dados.id;
        return next();
      } else {
        return res.json(401).json({
          status: false,
          error: [
            {
              msg: "Acesso negado!",
            },
          ],
        });
      }
    });
  } catch (error) {
    return res.status(403).json({
      status: false,
      error: [
        {
          msg: "Acesso negado!",
        },
      ],
    });
  }
};

exports.admin = async (req, res, next) => {
  const secret = process.env.JWT_SECRET;
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return res.status(401).json({
      status: false,
      error: [
        {
          msg: "Acesso negado!",
        },
      ],
    });
  }
  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({
      status: false,
      error: [
        {
          msg: "Acesso negado!",
        },
      ],
    });
  }

  try {
    const verify = jwt.verify(token, secret, (error, dados) => {
      if (dados.type === "admin") {
        req.userId = dados.id;
        next();
      } else {
        return res.json(401).json({
          status: false,
          error: [
            {
              msg: "Acesso negado!",
            },
          ],
        });
      }
    });
  } catch (error) {
    return res.status(403).json({
      status: false,
      error: [
        {
          msg: "Acesso negado!",
        },
      ],
    });
  }
};

exports.double = async (req, res, next) => {
  const secret = process.env.JWT_SECRET;
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return res.status(401).json({
      status: false,
      error: [
        {
          msg: "Acesso negado!",
        },
      ],
    });
  }
  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({
      status: false,
      error: [
        {
          msg: "Acesso negado!",
        },
      ],
    });
  }

  try {
    const verify = jwt.verify(token, secret, (error, dados) => {
      if (dados.type == "admin" || dados.type == "vigilante") {
        req.userId = dados.id;
        next();
      }
      return res.json(401).json({
        status: false,
        error: [
          {
            msg: "Acesso negado",
          },
        ],
      });
    });
  } catch (error) {
    return res.status(403).json({
      status: false,
      error: [
        {
          msg: "Acesso negado",
        },
      ],
    });
  }
};
