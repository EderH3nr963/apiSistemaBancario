import { Request, Response } from "express";
import UsuarioService from "../services/UsuarioServices";
import { AuthRequest } from "../middlewares/AuthMiddleware";

class UsuarioController {
  static async get(req: Request, res: Response) {
    const id_usuario = req.user?.id_usuario;
    if (!id_usuario || typeof id_usuario !== "number") {
      res.status(503).json({
        status: "error",
        statusCode: 503,
        msg: "Usuário não autentificado",
      });
      return;
    }

    const response = await UsuarioService.getById(id_usuario);

    res.status(response.statusCode).json(response);
  }

  static async getByChaveTransferencia(req: Request, res: Response) {
    const { chave_transferencia } = req.params;

    const response = await UsuarioService.getByChaveTransferencia(
      chave_transferencia as string
    );

    res.status(response.statusCode).json(response);
  }

  static async getByCpf(req: Request, res: Response) {
    const { cpf } = req.params;

    const response = await UsuarioService.getByCpf(
      cpf as string
    );

    res.status(response.statusCode).json(response);
  }

  static async getByPhone(req: Request, res: Response) {
    const { phone } = req.params;

    const response = await UsuarioService.getByPhone(
      phone as string
    );

    res.status(response.statusCode).json(response);
  }

  static async updateEmail(req: Request, res: Response) {
    const { email } = req.body;
    const id_usuario = req.user?.id_usuario;
    if (!id_usuario || typeof id_usuario !== "number") {
      res.status(503).json({
        status: "error",
        statusCode: 503,
        msg: "Usuário não autentificado",
      });
      return;
    }

    const response = await UsuarioService.updateEmail(id_usuario, email);

    res.status(response.statusCode).json(response);
  }

  static async updatePasswordUsuario(req: Request, res: Response) {
    const { newPassword, oldPassword } = req.body;
    const id_usuario = req.user?.id_usuario;
    if (!id_usuario || typeof id_usuario !== "number") {
      res.status(503).json({
        status: "error",
        statusCode: 503,
        msg: "Usuário não autentificado",
      });
      return;
    }

    const response = await UsuarioService.updatePasswordLogin(
      id_usuario,
      newPassword,
      oldPassword
    );

    res.status(response.statusCode).json(response);
  }

  static async updatePasswordConta(req: Request, res: Response) {
    const { newPassword, oldPassword } = req.body;
    const id_usuario = req.user?.id_usuario;
    if (!id_usuario || typeof id_usuario !== "number") {
      res.status(503).json({
        status: "error",
        statusCode: 503,
        msg: "Usuário não autentificado",
      });
      return;
    }

    const response = await UsuarioService.updatePasswordConta(
      id_usuario,
      newPassword,
      oldPassword
    );

    res.status(response.statusCode).json(response);
  }

  static async updateTelefone(req: Request, res: Response) {
    const { telefone } = req.body;
    const id_usuario = req.user?.id_usuario;
    if (!id_usuario || typeof id_usuario !== "number") {
      res.status(503).json({
        status: "error",
        statusCode: 503,
        msg: "Usuário não autentificado",
      });
      return;
    }

    const response = await UsuarioService.updateTelefone(id_usuario, telefone);

    res.status(response.statusCode).json(response);
  }

  static async updateEndereco(req: Request, res: Response) {
    const { field, value } = req.body;
    const id_usuario = req.user?.id_usuario;
    if (!id_usuario || typeof id_usuario !== "number") {
      res.status(503).json({
        status: "error",
        statusCode: 503,
        msg: "Usuário não autentificado",
      });
      return;
    }

    const response = await UsuarioService.updateFieldEndereco(
      id_usuario,
      field,
      value
    );

    res.status(response.statusCode).json(response);
  }

  static async verifySession(req: Request, res: Response) {
    const id_usuario = req.user?.id_usuario;
    if (!id_usuario || typeof id_usuario !== "number") {
      res.status(503).json({
        status: "error",
        statusCode: 503,
        msg: "Usuário não autentificado",
      });
      return;
    }

    res.status(200).json({
      status: "success",
      statusCode: 200,
      msg: "Usuário autentificado",
    });
  }

  static async updateChaveTransferencia(req: Request, res: Response) {
    const { chave_transferencia } = req.body;
    const id_usuario = req.user?.id_usuario;
    if (!id_usuario || typeof id_usuario !== "number") {
      res.status(503).json({
        status: "error",
        statusCode: 503,
        msg: "Usuário não autentificado",
      });
      return;
    }

    const response = await UsuarioService.updateChaveTransferencia(id_usuario, chave_transferencia);

    res.status(response.statusCode).json(response);
  }

  static async addToCofrinho(req: Request, res: Response) {
    const { valor } = req.body;
    const id_usuario = req.user?.id_usuario;
    if (!id_usuario || typeof id_usuario !== "number") {
      res.status(503).json({
        status: "error",
        statusCode: 503,
        msg: "Usuário não autentificado",
      });
      return;
    }

    const response = await UsuarioService.addToCofrinho(id_usuario, parseFloat(valor));

    res.status(response.statusCode).json(response);
  }

  static async withdrawFromCofrinho(req: Request, res: Response) {
    const { valor } = req.body;
    const id_usuario = req.user?.id_usuario;
    if (!id_usuario || typeof id_usuario !== "number") {
      res.status(503).json({
        status: "error",
        statusCode: 503,
        msg: "Usuário não autentificado",
      });
      return;
    }

    const response = await UsuarioService.withdrawFromCofrinho(id_usuario, parseFloat(valor));

    res.status(response.statusCode).json(response);
  }

  static async logout(req: Request, res: Response) {
    const id_usuario = req.user?.id_usuario;
    if (!id_usuario || typeof id_usuario !== "number") {
      res.status(503).json({
        status: "success",
        statusCode: 503,
        msg: "Usuário desautentificado",
      });
      return;
    }

    req.session.destroy;
    res.status(503).json({
      status: "success",
      statusCode: 503,
      msg: "Usuário desautentificado",
    });
  }
}

export default UsuarioController;
