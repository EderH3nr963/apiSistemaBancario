import { UsuarioModel, ContaModel, EnderecoModel } from "../models";
import AuthService from "./AuthService";
import Redis from "ioredis";
import sequelize from "../config/database";

const redisClient = new Redis({ host: "127.0.0.1", port: 6379 });

class UsuarioService {
  static async getById(id_usuario: number) {
    try {
      // Pega o usuário no banco de dados
      const usuario = await UsuarioModel.findOne({
        where: {
          id_usuario: id_usuario,
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

      if (!usuario)
        return {
          status: "error",
          statusCode: 500,
          msg: "Usuario não encontrado",
        };
      const { password, ...usuarioRetornar } = usuario.dataValues;

      return {
        status: "success",
        statusCode: 200,
        msg: "Usuário encontrado.",
        usuario: usuarioRetornar,
      };
      usuario;
    } catch (e) {
      return {
        status: "error",
        statusCode: 500,
        msg: "Usuario não encontrado",
      };
    }
  }

  static async updateEmail(id_usuario: number, email: string) {
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

      const usuario = await UsuarioModel.findByPk(id_usuario);
      if (!usuario)
        return {
          status: "error",
          statusCode: 400,
          msg: "Usuário não encontrado.",
        };

      const response = await AuthService.emailInUse(email);
      if (response.status === "error")
        return { status: "error", statusCode: 400, msg: "Email já está uso." };

      usuario.update({
        email: email,
      });

      return {
        status: "success",
        statusCode: 200,
        msg: "Email atualizado com sucesso",
      };
    } catch (e) {
      return {
        status: "success",
        statusCode: 200,
        msg: "Erro inesperado ao atualizar email",
      };
    }
  }

  static async updateTelefone(id_usuario: number, telefone: string) {
    try {
      const usuario = await UsuarioModel.findByPk(id_usuario);
      if (!usuario) {
        return {
          status: "error",
          statusCode: 400,
          msg: "Usuário não encontrado",
        };
      }

      usuario.update({ telefone: telefone });

      return {
        status: "success",
        statusCode: 200,
        msg: "Telefone atualizado com sucesso",
      };
    } catch (e) {
      return {
        status: "error",
        statusCode: 500,
        msg: "Erro interno no sistema. Por favor tente novamente mais tarde",
      };
    }
  }

  static async updateFieldEndereco<K extends keyof EnderecoModel>(
    id_usuario: number,
    field: K,
    value: EnderecoModel[K]
  ) {
    try {
      const endereco = await EnderecoModel.findOne({
        where: { id_usuario },
      });
      if (!endereco) {
        return {
          status: "error",
          statusCode: 400,
          msg: "Usuário não encontrado",
        };
      }

      if (endereco[field] === value) {
        return {
          status: "error",
          statusCode: 400,
          msg: `Não foi possível atualizar ${String(
            field
          )}. O valor informado é idêntico ao atual`,
        };
      }

      await endereco.update({ [field]: value });

      return {
        status: "success",
        statusCode: 200,
        msg: `Sucesso ao atualizar ${String(field)}!`,
      };
    } catch (e) {
      return {
        status: "error",
        statusCode: 500,
        msg: "Erro interno no servidor. Tente novamente mais tarde",
      };
    }
  }

  static async updatePassword(
    id_usuario: number,
    newPassword: string,
    oldPassword: string
  ) {
    try {
      const usuario = await UsuarioModel.findByPk(id_usuario);
      if (!usuario) {
        return {
          status: "error",
          statusCode: 400,
          msg: "Usuário não encontrado",
        };
      }

      if (!(await usuario).validPassword(oldPassword)) {
        return {
          status: "error",
          statusCode: 400,
          msg: "Senha inválida",
        };
      }

      usuario.update({ password: newPassword });

      return {
        status: "success",
        statusCode: 200,
        msg: "Senha atualizada com sucesso",
      };
    } catch (e) {
      return {
        status: "error",
        statusCode: 500,
        msg: "Erro interno no sistema. Por favor tente novamente mais tarde",
      };
    }
  }
}

export default UsuarioService;
