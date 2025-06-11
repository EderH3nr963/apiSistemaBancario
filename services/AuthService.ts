import { UsuarioModel, ContaModel, EnderecoModel } from "../models";
import Endereco from "../models/EnderecoModel";
import sequelize from "../config/database";
import Redis from "ioredis";
import { sendEmail } from "../utils/sendEmail";
import crypto from "crypto";

const redisClient = new Redis({ host: "127.0.0.1", port: 6379 });

class AuthService {
  static async register(usuarioReq: any, enderecoReq: any, contaReq: any) {
    const transaction = await sequelize.transaction();
    try {
      const redisKey = `verify_code:${usuarioReq.email}`;
      const verification = await redisClient.hget(redisKey, "verification");

      const chave_transferencia = crypto
        .createHash("sha256")
        .update(`${usuarioReq.cpf}-${usuarioReq.email}-${Date.now()}`)
        .digest("hex");

      if (!verification) {
        return {
          status: "error",
          statusCode: 400,
          msg: "Erro ao verificar email",
        };
      }

      if (verification !== "1") {
        return {
          status: "error",
          statusCode: 400,
          msg: "Email não verificado",
        };
      }

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

      Promise.all([
        await Endereco.create(
          { ...enderecoReq, id_usuario: usuario.id_usuario },
          { transaction }
        ),

        await ContaModel.create(
          {
            ...contaReq,
            id_usuario: usuario.id_usuario,
            chave_transferencia: chave_transferencia,
          },
          { transaction }
        ),
      ]);

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

  static async login(email: string, passwordReq: string) {
    try {
      // Pega o usuário no banco de dados
      const usuario = await UsuarioModel.findOne({
        where: {
          email: email,
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

      return {
        status: "success",
        statusCode: 200,
        msg: "Sucesso fazer login no banco!",
        usuario: usuarioRetornar,
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
      const redisKey = `verify_code:${email}`;
      const verification = await redisClient.hget(redisKey, "verification");

      if (!verification) {
        return {
          status: "error",
          statusCode: 400,
          msg: "Erro ao verificar email",
        };
      }

      if (verification !== "1") {
        return {
          status: "error",
          statusCode: 400,
          msg: "Email não verificado",
        };
      }

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
        msg: "Sucesso ao se cadastrar no banco!",
      };
    } catch (e) {
      return {
        status: "error",
        statusCode: 500,
        msg: "Erro inesperado ao fazer login.",
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
      const code = Math.floor(100000 + Math.random() * 900000); // código de 6 dígitos
      const redisKey = `verify_code:${email}`;

      const currentTimeSendEmail = await redisClient.hget(
        redisKey,
        "currentTimeSendEmail"
      );
      if (
        currentTimeSendEmail &&
        Date.now() - Number(currentTimeSendEmail) < 1000 * 60
      ) {
        return {
          status: "error",
          statusCode: 400,
          msg: "Você deve esperar 60 segundos para enviar um novo código",
        };
      }

      // setando o tempo atual
      await redisClient.hset(redisKey, {
        verification: "0",
        code: code.toString(),
        currentTimeSendEmail: Date.now().toString(),
      });

      await redisClient.expire(redisKey, 300); // 5 minutos

      const html = `
            <div style="font-family: sans-serif; text-align: center;">
                <h2>Verificação de E-mail</h2>
                <p>Seu código de verificação é:</p>
                <h1 style="letter-spacing: 5px;">${code}</h1>
                <p>Esse código expira em 5 minutos.</p>
            </div>
        `;

      await sendEmail(email, "Código de verificação", html);

      return {
        status: "success",
        statusCode: 200,
        msg: "Código de verificação enviado com sucesso",
      };
    } catch (e) {
      console.error("Erro ao enviar código de verificação:", e);
      return {
        status: "error",
        statusCode: 500,
        msg: "Erro interno ao enviar código de verificação",
      };
    }
  }

  static async verifyCode(email: string, code: number) {
    const redisKey = `verify_code:${email}`;
    try {
      const verification = await redisClient.hget(redisKey, "verification");
      const redisCode = await redisClient.hget(redisKey, "code");

      if (!verification || !code) {
        return {
          status: "error",
          statusCode: 400,
          msg: "Código inválido ou expirado",
        };
      }

      if (redisCode !== code.toString()) {
        return {
          status: "error",
          statusCode: 400,
          msg: "Código inválido ou expirado",
        };
      }

      if (verification === "1") {
        return {
          status: "error",
          statusCode: 400,
          msg: "Código já utilizado",
        };
      }

      // Atualiza como verificado
      await redisClient.hset(redisKey, "verification", "1");

      return {
        status: "success",
        statusCode: 200,
        msg: "Código verificado com sucesso",
      };
    } catch (e) {
      console.error("Erro ao verificar código:", e);
      return {
        status: "error",
        statusCode: 500,
        msg: "Erro interno ao verificar código",
      };
    }
  }
}

export default AuthService;
