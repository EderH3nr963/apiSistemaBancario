import { UsuarioModel, ContaModel, EnderecoModel } from "../models";
import Endereco from "../models/EnderecoModel";
import sequelize from "../config/database";
import jwt from "jsonwebtoken";
import crypto from "crypto";

// In-memory storage for verification codes (development only)
const verificationCodes = new Map<string, { code: string; expires: number }>();

class AuthService {
  static async register(usuarioReq: any, enderecoReq: any, contaReq: any) {
    const transaction = await sequelize.transaction();
    try {
      const chave_transferencia = crypto
        .createHash("sha256")
        .update(`${usuarioReq.cpf}-${usuarioReq.email}-${Date.now()}`)
        .digest("hex");

      const emailExisting = await UsuarioModel.findOne({
        where: { email: usuarioReq.email },
      });
      if (emailExisting) {
        return {
          status: "error",
          statusCode: 400,
          msg: "Email já está em uso",
        };
      }

      const cpfExisting = await UsuarioModel.findOne({
        where: { cpf: usuarioReq.cpf },
      });
      if (cpfExisting) {
        return {
          status: "error",
          statusCode: 400,
          msg: "CPF já está em uso",
        };
      }

      const usuario = await UsuarioModel.create(usuarioReq, { transaction });

      await Endereco.create(
        { ...enderecoReq, id_usuario: usuario.id_usuario },
        { transaction }
      );

      await ContaModel.create(
        {
          ...contaReq,
          id_usuario: usuario.id_usuario,
          chave_transferencia: chave_transferencia,
        },
        { transaction }
      );

      await transaction.commit();

      return {
        status: "success",
        statusCode: 201,
        msg: "Sucesso ao se cadastrar no banco!",
      };
    } catch (e) {
      await transaction.rollback();
      console.error("Erro no cadastro:", e); // bom pra log
      return {
        status: "error",
        statusCode: 500,
        msg: "Erro inesperado ao cadastrar o usuário.",
      };
    }
  }

  static async login(cpf: string, passwordReq: string) {
    try {
      // Pega o usuário no banco de dados
      const usuario = await UsuarioModel.findOne({
        where: {
          cpf: cpf,
          is_inactive: false,
        },
        include: [
          {
            model: EnderecoModel,
            as: "endereco",
            attributes: { exclude: ["id_usuario"] },
          },
          {
            model: ContaModel,
            as: "conta_bancaria",
            attributes: { exclude: ["id_usuario", "password"] },
          },
        ],
      });

      if (
        !usuario ||
        !(await usuario.validPassword(passwordReq)) ||
        !usuario.conta_bancaria
      ) {
        return {
          status: "error",
          statusCode: 400,
          msg: "Usuário ou senha inválidos.",
        };
      }
      const { password, ...usuarioRetornar } = usuario.dataValues;

      const jwt_token = jwt.sign(
        {
          id_usuario: usuarioRetornar.id_usuario,
          id_conta_bancaria: usuarioRetornar.conta_bancaria?.id_conta
        },
        "MorangoOuBanana", {
        expiresIn: "24h"
      })

      return {
        status: "success",
        statusCode: 200,
        msg: "Sucesso fazer login no banco!",
        usuario: usuarioRetornar,
        token: jwt_token
      };
    } catch (e) {
      console.log(e);
      return {
        status: "error",
        statusCode: 500,
        msg: "Erro inesperado ao fazer login.",
      };
    }
  }

  static async resetPassword(email: string, password: string) {
    try {
      // Pega o usuário no banco de dados
      const usuario = await UsuarioModel.findOne({
        where: {
          email: email,
        },
      });

      // Verificar Email
      if (!usuario)
        return {
          status: "error",
          statusCode: 400,
          msg: "Usuário Não encontrado.",
        };

      await usuario.update({
        password: password,
      });

      return {
        status: "success",
        statusCode: 201,
        msg: "Senha redefinida com sucesso",
      };
    } catch (e) {
      return {
        status: "error",
        statusCode: 500,
        msg: "Erro inesperado ao redefinir senha.",
      };
    }
  }

  static async emailInUse(email: string) {
    try {
      const usuario = await UsuarioModel.findOne({
        where: {
          email: email,
        },
      });

      if (usuario)
        return {
          status: "error",
          statusCode: 400,
          msg: "Email ja está em uso.",
        };

      return {
        status: "success",
        statusCode: 200,
        msg: "Email não está em uso.",
      };
    } catch (e) {
      return { status: "error", statusCode: 400, msg: "Email já esta em uso." };
    }
  }

  static async cpfInUse(cpf: string) {
    try {
      const usuario = await UsuarioModel.findOne({
        where: {
          cpf: cpf,
        },
      });

      if (usuario)
        return { status: "error", statusCode: 400, msg: "CPF ja está em uso." };

      return {
        status: "success",
        statusCode: 200,
        msg: "CPF não está em uso.",
      };
    } catch (e) {
      return { status: "error", statusCode: 400, msg: "CPF já esta em uso." };
    }
  }

  static async sendCodeVerification(email: string) {
    try {
      // Use fixed code for development
      const code = "123456";
      const expires = Date.now() + 10 * 60 * 1000; // 10 minutes

      // Store the code
      verificationCodes.set(email, { code, expires });

      // Try to send email (but don't fail if it doesn't work)
      try {
        const { sendEmail } = await import("../utils/sendEmail");
        await sendEmail(
          email,
          "Código de Verificação - Sistema Bancário",
          `<p>Seu código de verificação é: <strong>${code}</strong></p><p>Este código expira em 10 minutos.</p>`
        );
      } catch (emailError) {
        console.log("Email sending failed, but code generated:", code);
      }

      return {
        status: "success",
        statusCode: 200,
        msg: "Código de verificação enviado com sucesso",
        code: code, // Include code in response for development
      };
    } catch (error) {
      console.error("Error generating verification code:", error);
      return {
        status: "error",
        statusCode: 500,
        msg: "Erro ao gerar código de verificação",
      };
    }
  }

  static async verifyCode(email: string, code: number) {
    try {
      const stored = verificationCodes.get(email);

      if (!stored) {
        return {
          status: "error",
          statusCode: 400,
          msg: "Código de verificação não encontrado ou expirado",
        };
      }

      if (Date.now() > stored.expires) {
        verificationCodes.delete(email);
        return {
          status: "error",
          statusCode: 400,
          msg: "Código de verificação expirado",
        };
      }

      if (stored.code !== code.toString()) {
        return {
          status: "error",
          statusCode: 400,
          msg: "Código de verificação inválido",
        };
      }

      // Code is valid, remove it
      verificationCodes.delete(email);

      return {
        status: "success",
        statusCode: 200,
        msg: "Código verificado com sucesso",
      };
    } catch (error) {
      console.error("Error verifying code:", error);
      return {
        status: "error",
        statusCode: 500,
        msg: "Erro ao verificar código",
      };
    }
  }
}

export default AuthService;
