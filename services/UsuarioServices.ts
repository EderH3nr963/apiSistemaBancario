import { UsuarioModel, ContaModel, EnderecoModel } from "../models";
import AuthService from "./AuthService";

class UsuarioService {
  static async getById(id_usuario: number) {
    try {
      // Pega o usuário no banco de dados
      const usuario = await UsuarioModel.findOne({
        where: {
          id_usuario: id_usuario,
          is_inactive: false,
        },
        // Inclui o endereco e conta referente ao usuário
        include: [
          {
            model: EnderecoModel,
            as: "endereco",
            attributes: { exclude: ["id_usuario", "id_endereco"] },
          },
          {
            model: ContaModel,
            as: "conta_bancaria",
            attributes: { exclude: ["id_usuario", "password"] },
          },
        ],
      });

      // Verifica se o usuário existe e foi coletado corretamente
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
    } catch (e) {
      // Mensagem genérica para erros no servidor
      return {
        status: "error",
        statusCode: 500,
        msg: "Usuario não encontrado",
      };
    }
  }

  static async getByChaveTransferencia(chave_transferencia: string) {
    try {
      // Pega o usuário no banco de dados
      const conta = await ContaModel.findOne({
        where: { chave_transferencia: chave_transferencia },
        attributes: {
          exclude: ["password", "saldo", "chave_transferencia", "status_conta"],
        },
        include: {
          model: UsuarioModel,
          as: "usuario",
          attributes: ["full_name"],
        },
      });

      // Verifica se o usuário existe e foi coletado corretamente
      if (!conta)
        return {
          status: "error",
          statusCode: 500,
          msg: "Conta bancária não encontrada",
        };

      return {
        status: "success",
        statusCode: 200,
        msg: "Usuário encontrado.",
        conta: conta,
      };
    } catch (e) {
      // Mensagem genérica para erros no servidor
      return {
        status: "error",
        statusCode: 500,
        msg: "Usuario não encontrado",
      };
    }
  }

  static async getByCpf(cpf: string) {
    try {
      // Pega o usuário no banco de dados
      const conta = await ContaModel.findOne({
        where: { "$usuario.cpf$": cpf },
        attributes: {
          exclude: ["password", "saldo", "chave_transferencia", "status_conta"],
        },
        include: {
          model: UsuarioModel,
          as: "usuario",
          attributes: ["full_name"],
        },
      });

      // Verifica se o usuário existe e foi coletado corretamente
      if (!conta)
        return {
          status: "error",
          statusCode: 500,
          msg: "Conta bancária não encontrada",
        };

      return {
        status: "success",
        statusCode: 200,
        msg: "Usuário encontrado.",
        conta: conta,
      };
    } catch (e) {
      // Mensagem genérica para erros no servidor
      return {
        status: "error",
        statusCode: 500,
        msg: "Usuario não encontrado",
      };
    }
  }

  static async getByPhone(cpf: string) {
    try {
      // Pega o usuário no banco de dados
      const conta = await ContaModel.findOne({
        where: { "$usuario.telefone$": cpf },
        attributes: {
          exclude: ["password", "saldo", "chave_transferencia", "status_conta"],
        },
        include: {
          model: UsuarioModel,
          as: "usuario",
          attributes: ["full_name"],
        },
      });

      // Verifica se o usuário existe e foi coletado corretamente
      if (!conta)
        return {
          status: "error",
          statusCode: 500,
          msg: "Conta bancária não encontrada",
        };

      return {
        status: "success",
        statusCode: 200,
        msg: "Usuário encontrado.",
        conta: conta,
      };
    } catch (e) {
      // Mensagem genérica para erros no servidor
      return {
        status: "error",
        statusCode: 500,
        msg: "Usuario não encontrado",
      };
    }
  }

  static async updateEmail(id_usuario: number, email: string) {
    try {
      // Coleta o usuario e verifica se ele foi importado corretamente
      const usuario = await UsuarioModel.findByPk(id_usuario);
      if (!usuario)
        return {
          status: "error",
          statusCode: 400,
          msg: "Usuário não encontrado.",
        };

      // Verifica se o usuario e já existe no banco de dados
      const response = await AuthService.emailInUse(email);
      if (response.status === "error")
        return { status: "error", statusCode: 400, msg: "Email já está uso." };

      // Atualiza o usuario no banco de dados
      usuario.update({
        email: email,
      });

      return {
        status: "success",
        statusCode: 200,
        msg: "Email atualizado com sucesso",
      };
    } catch (e) {
      // Mensagem genérica para erros no servidor
      return {
        status: "success",
        statusCode: 200,
        msg: "Erro inesperado ao atualizar email",
      };
    }
  }

  static async updateTelefone(id_usuario: number, telefone: string) {
    try {
      // Coleta o usuario e verifica se ele foi importado corretamente
      const usuario = await UsuarioModel.findByPk(id_usuario);
      if (!usuario) {
        return {
          status: "error",
          statusCode: 400,
          msg: "Usuário não encontrado",
        };
      }

      /*  Adicionar logica de verificação de telefone com envio de código por número de telefone */

      // Atuliza o telefone do usuario no banco de dados
      usuario.update({ telefone: telefone });

      return {
        status: "success",
        statusCode: 200,
        msg: "Telefone atualizado com sucesso",
      };
    } catch (e) {
      // Mensagem genérica para erros no servidor
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
      // Coleta o endereço e verifica se ele foi importado corretamente
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

      // Verifica se o valor no banco de dados é igual ao valor passado pelo usuario, para evitar querys desnecessárias
      if (endereco[field] === value) {
        return {
          status: "error",
          statusCode: 400,
          msg: `Não foi possível atualizar ${String(
            field
          )}. O valor informado é idêntico ao atual`,
        };
      }

      // Atualiza o campo passado no banco de dados
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

  static async updatePasswordLogin(
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

  static async updatePasswordConta(
    id_usuario: number,
    newPassword: string,
    oldPassword: string
  ) {
    try {
      const conta = await ContaModel.findOne({ where: { id_usuario } });
      if (!conta) {
        return {
          status: "error",
          statusCode: 400,
          msg: "Usuário não encontrado",
        };
      }

      if (!(await conta).validPassword(oldPassword)) {
        return {
          status: "error",
          statusCode: 400,
          msg: "Senha inválida",
        };
      }

      conta.update({ password: newPassword });

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
