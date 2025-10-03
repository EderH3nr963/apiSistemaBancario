import { ContaModel, EmprestimoModel, TransacaoModel } from "../models";
import sequelize from "../config/database";
import { sendEmail } from "../utils/sendEmail";

class EmprestimoService {
  static async solicitar(id_conta: number, valor: number, prazo_meses: number, password: string) {
    const transaction = await sequelize.transaction();
    try {
      const conta = await ContaModel.findOne({
        where: { id_conta },
        transaction,
      });
      if (!conta) {
        await transaction.rollback();
        return {
          status: "error",
          statusCode: 400,
          msg: "Conta não encontrada",
        };
      }
      if (!(await conta.validPassword(password))) {
        await transaction.rollback();
        return {
          status: "error",
          statusCode: 400,
          msg: "Senha inválida",
        };
      }

      const taxa_juros = 0.01; // 1% ao mês
      const saldo_devedor = Number((valor * (1 + taxa_juros * prazo_meses)).toFixed(2));

      const emprestimo = await EmprestimoModel.create(
        {
          id_conta,
          valor,
          taxa_juros,
          prazo_meses,
          saldo_devedor,
          status: "aprovado", // Aprovação automática (ajuste se necessário)
          data_aprovacao: new Date(),
        },
        { transaction }
      );

      await conta.update(
        { saldo: Number(conta.saldo) + Number(valor) },
        { transaction }
      );

      await TransacaoModel.create(
        {
          id_conta_destino: id_conta,
          id_conta_origem: null, // Banco como origem
          valor,
          date: new Date().toLocaleDateString("pt-BR"),
          hora: new Date().toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          }),
          descricao: "Empréstimo recebido",
          tipo: "emprestimo",
        },
        { transaction }
      );

      await transaction.commit();

      // Enviar email de confirmação
      const usuario = await conta.getUsuario();
      await sendEmail(
        usuario.email,
        "Empréstimo Solicitado",
        `
          <div style="font-family: sans-serif; text-align: center;">
            <h2>Empréstimo Solicitado</h2>
            <p>Seu empréstimo de R$${valor.toFixed(2)} foi aprovado!</p>
            <p>Prazo: ${prazo_meses} meses</p>
            <p>Saldo devedor inicial: R$${saldo_devedor.toFixed(2)}</p>
          </div>
        `
      );

      return {
        status: "success",
        statusCode: 201,
        msg: "Empréstimo solicitado com sucesso",
        emprestimo,
      };
    } catch (e) {
      await transaction.rollback();
      return {
        status: "error",
        statusCode: 500,
        msg: "Erro ao solicitar empréstimo",
      };
    }
  }

  static async listar(id_conta: number) {
    try {
      const emprestimos = await EmprestimoModel.findAll({
        where: { id_conta },
      });
      return {
        status: "success",
        statusCode: 200,
        msg: "Empréstimos listados com sucesso",
        emprestimos,
      };
    } catch (e) {
      return {
        status: "error",
        statusCode: 500,
        msg: "Erro ao listar empréstimos",
      };
    }
  }

  static async pagar(id_conta: number, id_emprestimo: number, valor: number, password: string) {
    const transaction = await sequelize.transaction();
    try {
      const conta = await ContaModel.findOne({
        where: { id_conta },
        transaction,
      });
      if (!conta) {
        await transaction.rollback();
        return {
          status: "error",
          statusCode: 400,
          msg: "Conta não encontrada",
        };
      }
      if (!(await conta.validPassword(password))) {
        await transaction.rollback();
        return {
          status: "error",
          statusCode: 400,
          msg: "Senha inválida",
        };
      }
      if (Number(conta.saldo) < valor) {
        await transaction.rollback();
        return {
          status: "error",
          statusCode: 400,
          msg: "Saldo insuficiente",
        };
      }

      const emprestimo = await EmprestimoModel.findOne({
        where: { id_emprestimo, id_conta },
        transaction,
      });
      if (!emprestimo) {
        await transaction.rollback();
        return {
          status: "error",
          statusCode: 400,
          msg: "Empréstimo não encontrado",
        };
      }
      if (emprestimo.status === "pago") {
        await transaction.rollback();
        return {
          status: "error",
          statusCode: 400,
          msg: "Empréstimo já foi pago",
        };
      }

      const novo_saldo_devedor = Number((emprestimo.saldo_devedor - valor).toFixed(2));
      const novo_status = novo_saldo_devedor <= 0 ? "pago" : emprestimo.status;

      await emprestimo.update(
        { saldo_devedor: novo_saldo_devedor, status: novo_status },
        { transaction }
      );

      await conta.update(
        { saldo: Number(conta.saldo) - Number(valor) },
        { transaction }
      );

      await TransacaoModel.create(
        {
          id_conta_origem: id_conta,
          id_conta_destino: null, // Banco como destino
          valor,
          date: new Date().toLocaleDateString("pt-BR"),
          hora: new Date().toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          }),
          descricao: "Pagamento de parcela de empréstimo",
          tipo: "pagamento_emprestimo",
        },
        { transaction }
      );

      await transaction.commit();

      // Enviar email de confirmação
      const usuario = await conta.getUsuario();
      await sendEmail(
        usuario.email,
        "Pagamento de Empréstimo",
        `
          <div style="font-family: sans-serif; text-align: center;">
            <h2>Pagamento de Empréstimo</h2>
            <p>Você pagou R$${valor.toFixed(2)} da sua dívida.</p>
            <p>Saldo devedor restante: R$${novo_saldo_devedor.toFixed(2)}</p>
            <p>Status: ${novo_status}</p>
          </div>
        `
      );

      return {
        status: "success",
        statusCode: 200,
        msg: "Parcela paga com sucesso",
        emprestimo,
      };
    } catch (e) {
      await transaction.rollback();
      return {
        status: "error",
        statusCode: 500,
        msg: "Erro ao pagar parcela",
      };
    }
  }
}

export default EmprestimoService;