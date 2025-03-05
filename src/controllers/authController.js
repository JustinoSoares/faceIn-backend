const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { Users } = require("../../models/index.js");

module.exports = {
  async login(req, res) {
    try {
      const { email, password } = req.body;
      if (!email || !password){
        return res.status(404).json({
          status: false,
          error: [
            {
              msg: "Dados Inválidos",
            },
          ],
        });
      }

      const user = await Users.findOne({ where: { email } });
      if (!user) {
        return res.status(404).json({
          status: false,
          error: [
            {
              msg: "email ou senha inválida",
            },
          ],
        });
      }
      // Compare o pin_acesso fornecido com o hash armazenado
      const senhaValida = await bcrypt.compare(password, user.password);
      if (!senhaValida) {
        return res.status(401).json({
          status: false,
          error: [
            {
              msg: "email ou senha inválida",
            },
          ],
        });
      }
      if (!user.is_active) {
        return res.status(401).json({
          status: false,
          error: [
            {
              msg: "Conta não ativada ainda!",
            },
          ],
        });
      }
      // Gerar Token
      const SECRET = process.env.JWT_SECRET;
      const token = jwt.sign(
        { id: user.id, email: user.email, type: user.type },
        SECRET,
        { expiresIn: process.env.JWT_EXPIRATION || "1d" }
      );

      return res.status(200).json({
        status: true,
        data: {
          usuarioId: user.id,
          type: user.type,
          token,
        },
      });
    } catch (error) {
      return res.status(500).json({
        status: false,
        error: [
          {
            msg: "Erro ao fazer login",
            error: error.message,
          },
        ],
      });
    }
  },
};
