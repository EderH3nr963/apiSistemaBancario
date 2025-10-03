import { Request, Response } from "express";
import EmprestimoService from "../services/EmprestimoService";
import { AuthRequest } from "../middlewares/AuthMiddleware";

class EmprestimoController {
  static async solicitar(req: AuthRequest, res: Response) {
    const id_conta = req.user?.id_conta_bancaria;
    if (!id_conta || typeof id_conta !== "number") {
      res.status(401).json({
        status: "error",
        statusCode: 401,
        msg: "Usuário não autenticado",
      });
      return;
    }
    const { valor, prazo_meses, password } = req.body;

    const response = await EmprestimoService.solicitar(id_conta, valor, prazo_meses, password);
    res.status(response.statusCode).json(response);
  }

  static async listar(req: AuthRequest, res: Response) {
    const id_conta = req.user?.id_conta_bancaria;
    if (!id_conta || typeof id_conta !== "number") {
      res.status(401).json({
        status: "error",
        statusCode: 401,
        msg: "Usuário não autenticado",
      });
      return;
    }

    const response = await EmprestimoService.listar(id_conta);
    res.status(response.statusCode).json(response);
  }

  static async pagar(req: AuthRequest, res: Response) {
    const id_conta = req.user?.id_conta_bancaria;
    if (!id_conta || typeof id_conta !== "number") {
      res.status(401).json({
        status: "error",
        statusCode: 401,
        msg: "Usuário não autenticado",
      });
      return;
    }
    const { valor, password } = req.body;
    const id_emprestimo = parseInt(req.params.id_emprestimo);

    const response = await EmprestimoService.pagar(id_conta, id_emprestimo, valor, password);
    res.status(response.statusCode).json(response);
  }
}

export default EmprestimoController;