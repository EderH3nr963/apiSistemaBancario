import { Request, Response } from "express";
import UsuarioService from "../services/UsuarioServices";

class UsuarioController {
  static async get(req: Request, res: Response) {
    const id_usuario = req.session.id_usuario;
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

  static async updateEmail(req: Request, res: Response) {
    const { email } = req.body;
    const id_usuario = req.session.id_usuario;
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

  static async updatePassword(req: Request, res: Response) {
    const { newPassword, oldPassword } = req.body;
    const id_usuario = req.session.id_usuario;
    if (!id_usuario || typeof id_usuario !== "number") {
      res.status(503).json({
        status: "error",
        statusCode: 503,
        msg: "Usuário não autentificado",
      });
      return;
    }

    const response = await UsuarioService.updatePassword(
      id_usuario,
      newPassword,
      oldPassword
    );

    res.status(response.statusCode).json(response);
  }

  static async updateTelefone(req: Request, res: Response) {
    const { telefone } = req.body;
    const id_usuario = req.session.id_usuario;
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
    const id_usuario = req.session.id_usuario;
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
    const id_usuario = req.session.id_usuario;
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

  static async logout(req: Request, res: Response) {
    const id_usuario = req.session.id_usuario;
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
