import { Request, Response } from "express";
import PagamentoService from "../services/PagamentoService";

import { AuthRequest } from "../middlewares/AuthMiddleware";

class PagamentoController {
  static async set(req: Request, res: Response) {
    const { valor } = req.body;
    const id_conta = req.user?.id_conta_bancaria;
    if (!id_conta || typeof id_conta !== "number") {
      res.status(503).json({
        status: "error",
        statusCode: 503,
        msg: "Usuario não autentificado",
      });
      return;
    }

    const response = await PagamentoService.set(id_conta, valor);

    res.status(response.statusCode).json(response);
  }

  static async get(req: Request, res: Response) {
    const { chave_pagamento } = req.params;
    const id_conta = req.user?.id_conta_bancaria;
    if (!id_conta || typeof id_conta !== "number") {
      res.status(503).json({
        status: "error",
        statusCode: 503,
        msg: "Usuario não autentificado",
      });
      return;
    }

    const response = await PagamentoService.get(chave_pagamento);

    res.status(response.statusCode).json(response);
  }

  static async pay(req: Request, res: Response) {
    const { password, barcode } = req.body;
    const id_conta = req.user?.id_conta_bancaria;
    if (!id_conta || typeof id_conta !== "number") {
      res.status(503).json({
        status: "error",
        statusCode: 503,
        msg: "Usuario não autentificado",
      });
      return;
    }

    const response = await PagamentoService.pay(id_conta, password, barcode);

    res.status(response.statusCode).json(response);
  }

  static async cancel(req: Request, res: Response) {
    const { chave_pagamento } = req.params;
    const id_conta = req.user?.id_conta_bancaria;
    if (!id_conta || typeof id_conta !== "number") {
      res.status(503).json({
        status: "error",
        statusCode: 503,
        msg: "Usuario não autentificado",
      });
      return;
    }

    const response = await PagamentoService.cancel(id_conta, chave_pagamento);

    res.status(response.statusCode).json(response);
  }
}

export default PagamentoController;
