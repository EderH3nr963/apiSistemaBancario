import { Request, Response } from "express";
import TransacaoService from "../services/TransacaoService";

class TransacaoController {
  static async transferMoney(req: Request, res: Response) {
    const { password, value, chave_transferencia, descricao } = req.body;
    const id_conta = req.session.id_conta;
    if (!id_conta || typeof id_conta !== "number") {
      res.status(503).json({
        status: "error",
        statusCode: 503,
        msg: "Usuário não autentificado",
      });
      return;
    }

    const response = await TransacaoService.transferMoney(
      id_conta,
      password,
      chave_transferencia,
      value,
      descricao
    );

    res.status(response.statusCode).json(response);
  }

  static async get(req: Request, res: Response) {
    const { id_transacao } = req.params;
    try {
      Number(id_transacao)
    } catch {
      res.status(503).json({
        status: "error",
        statusCode: 503,
        msg: "Id de transação inválido",
      });
      return;
    }

    const id_usuario = req.session.id_usuario;
    if (!id_usuario || typeof id_usuario !== "number") {
      res.status(503).json({
        status: "error",
        statusCode: 503,
        msg: "Usuário não autentificado",
      });
      return;
    }

    const response = await TransacaoService.getTransacao(
      id_usuario,
      Number(id_transacao)
    );

    res.status(response.statusCode).json(response);
  }

  static async getAll(req: Request, res: Response) {
    const id_usuario = req.session.id_usuario;
    if (!id_usuario || typeof id_usuario !== "number") {
      res.status(503).json({
        status: "error",
        statusCode: 503,
        msg: "Usuário não autentificado",
      });
      return;
    }

    const response = await TransacaoService.getAllTransacao(id_usuario);

    res.status(response.statusCode).json(response);
  }
}

export default TransacaoController;
