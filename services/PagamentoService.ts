import sequelize from "../config/database";
import {
  ContaModel,
  PagamentoModel,
  TransacaoModel,
  UsuarioModel,
} from "../models";
import crypto from "crypto";

class PagamentoService {
  static async set(id_conta: number, valor: number) {
    try {
      const conta = await ContaModel.findOne({
        where: { id_conta: id_conta },
        include: {
          model: UsuarioModel,
          as: "usuario",
          attributes: {
            include: ["cpf"],
          },
        },
      });

      if (!conta || !conta.usuario) {
        return {
          status: "success",
          statusCode: 400,
          msg: "Usuário não encontrado",
        };
      }

      const chave_pagamento = crypto
        .createHash("sha256")
        .update(`${conta.usuario.cpf}-${Date.now()}`)
        .digest("hex");

      const pagamento = await PagamentoModel.create({
        valor: valor,
        id_conta_destino: id_conta,
        chave_pagamento: chave_pagamento,
        status_pagamento: "pendente",
      });

      return {
        status: "success",
        statusCode: 201,
        msg: "Pagemento criado com sucesso",
        pagamento,
      };
    } catch {
      return {
        status: "error",
        statusCode: 500,
        msg: "Erro inesperado ao criar pagamento. Por favor tente novamente mais tarde",
      };
    }
  }

  static async get(chave_pagamento: string) {
    try {
      const pagamento = await PagamentoModel.findOne({
        where: { chave_pagamento: chave_pagamento },
      });

      if (!pagamento || pagamento.status_pagamento === "cancelada") {
        return {
          status: "error",
          statusCode: 400,
          msg: "Pagamento não encontrado",
        };
      }

      const conta = await ContaModel.findOne({
        where: { id_conta: pagamento.id_conta_destino },
        attributes: { exclude: ["password", "saldo", "id_usuario"] },
        include: {
          model: UsuarioModel,
          as: "usuario",
          attributes: {
            exclude: [
              "password",
              "id_usuario",
              "cpf",
              "is_admin",
              "is_inactive",
              "telefone",
              "createdAt",
              "updatedAt",
            ],
          },
        },
      });

      if (!conta || !conta.usuario) {
        return {
          status: "success",
          statusCode: 400,
          msg: "Usuário não encontrado",
        };
      }

      return {
        status: "success",
        statusCode: 200,
        msg: "Pagamento encontrado com sucesso",
        pagamento: pagamento,
        conta_cobrador: conta,
      };
    } catch (e) {
      return {
        status: "error",
        statusCode: 500,
        msg: "Erro inesperado ao buscar pagamento. Por favor tente novamente mais tarde",
      };
    }
  }

  static async pay(
    id_conta: number,
    password: string,
    chave_pagamento: string
  ) {
    try {
      const transaction = await sequelize.transaction();

      const conta_origem = await ContaModel.findByPk(id_conta);
      if (!conta_origem) {
        return {
          status: "error",
          statusCode: 400,
          msg: "Usuário não encontrado",
        };
      }

      const pagamento = await PagamentoModel.findOne({
        where: { chave_pagamento: chave_pagamento },
      });
      if (
        !pagamento ||
        pagamento.status_pagamento === "aceita" ||
        pagamento.status_pagamento === "cancelada"
      ) {
        return {
          status: "error",
          statusCode: 400,
          msg: "Pagamento não encontrado",
        };
      }

      const conta_destino = await ContaModel.findByPk(
        pagamento.id_conta_destino
      );
      if (!conta_destino) {
        return {
          status: "error",
          statusCode: 400,
          msg: "Conta do cobrador não encontrada",
        };
      }

      if (!(await conta_origem).validPassword(password)) {
        return {
          status: "error",
          statusCode: 400,
          msg: "Senha inválida",
        };
      }

      if (conta_origem.saldo < pagamento.valor) {
        return {
          status: "error",
          statusCode: 400,
          msg: "Saldo insuficiente",
        };
      }

      Promise.all([
        await conta_origem.update(
          { saldo: Number(conta_origem.saldo) - Number(pagamento.valor) },
          { transaction }
        ),
        await conta_destino.update(
          { saldo: Number(conta_destino.saldo) + Number(pagamento.valor) },
          { transaction }
        ),
        await pagamento.update({ status_pagamento: "aceita" }, { transaction }),
        await TransacaoModel.create(
          {
            id_conta_destino: conta_destino.id_conta,
            id_conta_origem: conta_origem.id_conta,
            valor: pagamento.valor,
            descricao: "",
            tipo: "pagamento",
          },
          { transaction }
        ),
      ]);

      await transaction.commit();

      return {
        status: "success",
        statusCode: 200,
        msg: "Pagamento realizado com sucesso",
      };
    } catch (e) {
      return {
        status: "error",
        statusCode: 500,
        msg: "Erro inesperado ao pagar. Por favor tente novamente mais tarde",
      };
    }
  }

  static async cancel(id_conta: number, chave_pagamento: string) {
    try {
      const pagamento = await PagamentoModel.findOne({
        where: { chave_pagamento },
      });

      if (!pagamento) {
        return {
          status: "error",
          statusCode: 400,
          msg: "Pagamento não encontrado",
        };
      }

      if (pagamento.id_conta_destino !== id_conta) {
        return {
          status: "error",
          statusCode: 400,
          msg: "Usuário nao tem acesso a esse pagamento",
        };
      }

      return {
        status: "success",
        statusCode: 400,
        msg: "Pagamento cancelado com sucesso",
      };
    } catch {
      return {
        status: "error",
        statusCode: 500,
        msg: "Erro inesperado ao cancelar pagamento. Por favor tente novamente mais tarde",
      };
    }
  }
}

export default PagamentoService;
