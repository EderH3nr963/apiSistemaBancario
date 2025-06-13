import { UsuarioModel, ContaModel, TransacaoModel } from "../models";

import sequelize from "../config/database";

class TransacaoService {
  static async transferMoney(
    id_conta: number,
    passwordRemetente: string,
    chave_transferencia: string,
    value: number,
    descricao: string | null
  ) {
    const transaction = await sequelize.transaction();
    try {
      const contaRemetente = await ContaModel.findByPk(id_conta);
      const contaDestinario = await ContaModel.findOne({
        where: { chave_transferencia: chave_transferencia },
      });

      if (!contaDestinario || !contaRemetente) {
        return {
          status: "error",
          statusCode: 400,
          msg: "Conta bancária não encontrada",
        };
      }

      if (contaDestinario.id_conta === contaRemetente.id_conta) {
        return {
          status: "error",
          statusCode: 400,
          msg: "Não é possível enviar dinheiro para você mesmo",
        };
      }

      if (!contaRemetente.validPassword(passwordRemetente)) {
        return {
          status: "error",
          statusCode: 400,
          msg: "Senha inválida",
        };
      }

      if (contaRemetente.saldo < value) {
        return {
          status: "error",
          statusCode: 400,
          msg: "Saldo insuficiente",
        };
      }

      Promise.all([
        await contaRemetente.update(
          { saldo: Number(contaRemetente.saldo) - value },
          { transaction }
        ),
        await contaDestinario.update(
          { saldo: Number(contaDestinario.saldo) + value },
          { transaction }
        ),
        await TransacaoModel.create(
          {
            id_conta_destino: contaDestinario.id_conta,
            id_conta_origem: contaRemetente.id_conta,
            valor: value,
            descricao: descricao || "",
            tipo: "transferência",
          },
          { transaction }
        ),
      ]);

      await transaction.commit();

      return {
        status: "success",
        statusCode: 200,
        msg: "Saldo enviado com sucesso",
      };
    } catch (e) {
      return {
        status: "error",
        statusCode: 500,
        msg: "Erro interno no servidor. Por favor tente novamente mais tarde.",
      };
    }
  }

  static async getTransacao(id_usuario: number, id_transacao: number) {
    try {
      // Busca a conta do usuário logado
      const conta_usuario_logado = await ContaModel.findOne({
        where: { id_usuario: id_usuario },
      });

      if (!conta_usuario_logado) {
        return {
          status: "error",
          statusCode: 400,
          msg: "Conta do usuário não encontrada",
        };
      }

      // Busca a transação com as contas de origem e destino
      const transacao = await TransacaoModel.findOne({
        where: {
          id_transacao: id_transacao,
        },
        include: [
          {
            model: ContaModel,
            as: "conta_origem",
            attributes: { exclude: ["saldo", "password", "status_conta"] },
          },
          {
            model: ContaModel,
            as: "conta_destino",
            attributes: { exclude: ["saldo", "password", "status_conta"] },
          },
        ],
      });

      if (!transacao) {
        return {
          status: "error",
          statusCode: 400,
          msg: "Transação não encontrada",
        };
      }

      const usuario_destino = await UsuarioModel.findOne({
        where: {
          id_usuario: transacao.conta_origem?.id_usuario,
        },
        attributes: ["full_name", "email", "telefone"],
      });
      const usuario_origem = await UsuarioModel.findOne({
        where: {
          id_usuario: transacao.conta_destino?.id_usuario,
        },
        attributes: ["full_name", "email", "telefone"],
      });

      // Verifica se o usuário logado está envolvido na transação
      if (
        transacao.id_conta_destino !== conta_usuario_logado.id_conta &&
        transacao.id_conta_origem !== conta_usuario_logado.id_conta
      ) {
        return {
          status: "error",
          statusCode: 403,
          msg: "Usuário não autorizado a visualizar esta transação",
        };
      }

      return {
        status: "success",
        statusCode: 200,
        msg: "Transaco buscada com sucesso",
        data: {
          transacao: transacao,
          usuario_destino: usuario_destino,
          usuario_origem: usuario_origem,
        },
      };
    } catch (e) {
      console.error("Erro ao buscar transação:", e);
      return {
        status: "error",
        statusCode: 500,
        msg: "Erro interno ao buscar transação",
      };
    }
  }

  static async getAllTransacao(id_usuario: number) {
    try {
      const conta = await ContaModel.findOne({
        where: { id_usuario: id_usuario },
      });

      if (!conta) {
        return {
          status: "error",
          statusCode: 400,
          msg: "Conta bancária não encontrada",
        };
      }

      const transacoesEnviadas = await TransacaoModel.findAll({
        where: { id_conta_origem: conta.id_conta },
        include: [
          {
            model: ContaModel,
            as: "conta_destino",
            attributes: { exclude: ["saldo", "password", "status_conta"] },
          },
        ],
      });

      const transacoesRecebidas = await TransacaoModel.findAll({
        where: { id_conta_destino: conta.id_conta },
        include: [
          {
            model: ContaModel,
            as: "conta_origem",
            attributes: { exclude: ["saldo", "password", "status_conta"] },
          },
        ],
      });

      return {
        status: "success",
        statusCode: 200,
        msg: "Transações coletadas com sucesso",
        data: {
          transacoesEnviadas,
          transacoesRecebidas,
        },
      };
    } catch (e) {
      console.error("Erro ao buscar transações:", e);
      return {
        status: "error",
        statusCode: 500,
        msg: "Erro interno ao buscar transações",
      };
    }
  }
}

export default TransacaoService;
