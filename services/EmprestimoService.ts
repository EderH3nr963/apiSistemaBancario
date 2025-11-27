import { ContaModel, EmprestimoModel, TransacaoModel, UsuarioModel, ParcelaModel } from "../models";
import sequelize from "../config/database";
import { sendEmail } from "../utils/sendEmail";

class EmprestimoService {
  static async solicitar(id_conta: number, valor: number, prazo_meses: number, password: string) {
    const transaction = await sequelize.transaction();
    try {
      const conta = await ContaModel.findOne({
        where: { id_conta },
        include: [
          {
            model: UsuarioModel,
            as: "usuario", // tem que ser o mesmo alias da associação
          },
        ],
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

      // Criar parcelas mensais
      const valorParcela = Number((saldo_devedor / prazo_meses).toFixed(2));
      const parcelas = [];
      for (let i = 1; i <= prazo_meses; i++) {
        const dataVencimento = new Date();
        dataVencimento.setMonth(dataVencimento.getMonth() + i);

        parcelas.push({
          id_emprestimo: emprestimo.id_emprestimo,
          numero_parcela: i,
          valor_parcela: valorParcela,
          data_vencimento: dataVencimento,
          status: "pendente",
        });
      }
      await ParcelaModel.bulkCreate(parcelas, { transaction });

      await transaction.commit();

      // Enviar email de confirmação (opcional)
      try {
        const usuario = await conta.usuario;

        if (usuario) {
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
        }
      } catch (emailError) {
        console.warn("Falha ao enviar email de confirmação:", emailError);
        // Não falha a operação por causa do email
      }

      return {
        status: "success",
        statusCode: 201,
        msg: "Empréstimo solicitado com sucesso",
        emprestimo,
      };
    } catch (e) {
      console.error("Erro ao solicitar empréstimo:", e);
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
        include: [
          {
            model: ParcelaModel,
            as: "parcelas",
            order: [["numero_parcela", "ASC"]],
          },
        ],
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

  static async pagar(id_conta: number, id_parcela: number, password: string) {
    const transaction = await sequelize.transaction();
    try {
      const conta = await ContaModel.findOne({
        where: { id_conta },
        include: [
          {
            model: UsuarioModel,
            as: "usuario",
          },
        ],
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

      const parcela = await ParcelaModel.findOne({
        where: { id_parcela },
        include: [
          {
            model: EmprestimoModel,
            as: "emprestimo",
            where: { id_conta },
            required: true,
          },
        ],
        transaction,
      });
      if (!parcela) {
        await transaction.rollback();
        return {
          status: "error",
          statusCode: 400,
          msg: "Parcela não encontrada",
        };
      }
      if (parcela.status === "pago") {
        await transaction.rollback();
        return {
          status: "error",
          statusCode: 400,
          msg: "Parcela já foi paga",
        };
      }

      const valor = parcela.valor_parcela;
      if (Number(conta.saldo) < valor) {
        await transaction.rollback();
        return {
          status: "error",
          statusCode: 400,
          msg: "Saldo insuficiente",
        };
      }

      // Pagar a parcela
      await parcela.update(
        {
          status: "pago",
          data_pagamento: new Date(),
        },
        { transaction }
      );

      // Debitar da conta
      await conta.update(
        { saldo: Number(conta.saldo) - Number(valor) },
        { transaction }
      );

      // Criar transação
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
          descricao: `Pagamento de parcela ${parcela.numero_parcela} do empréstimo`,
          tipo: "pagamento_emprestimo",
        },
        { transaction }
      );

      // Verificar se todas as parcelas foram pagas
      const emprestimo = parcela.get('emprestimo') as EmprestimoModel;
      const parcelasPendentes = await ParcelaModel.count({
        where: {
          id_emprestimo: emprestimo.id_emprestimo,
          status: "pendente",
        },
        transaction,
      });

      if (parcelasPendentes === 0) {
        await emprestimo.update({ status: "pago" }, { transaction });
      }

      await transaction.commit();

      // Enviar email de confirmação (opcional)
      try {
        const usuario = await conta.usuario;
        if (usuario) {
          await sendEmail(
            usuario.email,
            "Pagamento de Parcela",
            `
              <div style="font-family: sans-serif; text-align: center;">
                <h2>Pagamento de Parcela</h2>
                <p>Você pagou a parcela ${parcela.numero_parcela} do seu empréstimo.</p>
                <p>Valor pago: R$${valor.toFixed(2)}</p>
                <p>Data de pagamento: ${new Date().toLocaleDateString("pt-BR")}</p>
              </div>
            `
          );
        }
      } catch (emailError) {
        console.warn("Falha ao enviar email de confirmação:", emailError);
        // Não falha a operação por causa do email
      }

      return {
        status: "success",
        statusCode: 200,
        msg: "Parcela paga com sucesso",
        parcela,
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