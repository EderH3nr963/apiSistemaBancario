import { Request, Response } from "express";
import AuthService from "../services/AuthService";

class AuthController {
  static async register(req: Request, res: Response) {
    const { usuario, endereco, conta } = req.body;
    if (
      usuario?.confirm_password &&
      typeof usuario?.confirm_password === "string"
    )
      delete usuario.confirm_password;
    if (conta?.confirm_password && typeof conta?.confirm_password === "string")
      delete conta.confirm_password;

    const response = await AuthService.register(usuario, endereco, conta);

    res.status(response.statusCode).json(response);
  }

  static async login(req: Request, res: Response) {
    const { email, password } = req.body;

    if (
      typeof req.session.tentativa_login?.count === "number" &&
      req.session.tentativa_login?.count > 3 &&
      req.session.tentativa_login?.email === email
    ) {
      res.status(503).json({
        status: "error",
        statusCode: 400,
        msg: "Limite de tentativas de login excedido. Tente novamente mais tarde",
      });
      return;
    }

    if (!req.session.tentativa_login) {
      req.session.tentativa_login = { email, count: 0 };
    }

    const response = await AuthService.login(email, password);

    switch (response.status) {
      case "success":
        if (response.usuario) {
          req.session.id_usuario = response.usuario.id_usuario;
          req.session.id_conta = response.usuario.conta_bancaria?.id_conta;
          req.session.is_admin = response.usuario.is_admin;
          req.session.tentativa_login.count = 0;
        }
        break;

      case "error":
        if (req.session.tentativa_login.email !== email) {
          req.session.tentativa_login = { email, count: 1 };
        } else {
          req.session.tentativa_login.count += 1;
        }
        break;
    }

    res.status(response.statusCode).json(response);
  }

  static async emailInUse(req: Request, res: Response) {
    const { email } = req.body;

    const response = await AuthService.emailInUse(email);

    res.status(response.statusCode).json(response);
  }

  static async cpfInUse(req: Request, res: Response) {
    const { cpf } = req.body;

    const response = await AuthService.cpfInUse(cpf);

    res.status(response.statusCode).json(response);
  }

  static async resetPassword(req: Request, res: Response) {
    const { email, password } = req.body;

    const response = await AuthService.resetPassword(email, password);

    res.status(response.statusCode).json(response);
  }

  static async sendCodeVerification(req: Request, res: Response) {
    const { email } = req.body;

    const response = await AuthService.sendCodeVerification(email);

    res.status(response.statusCode).json(response);
  }

  static async verifyCode(req: Request, res: Response) {
    const { email, code } = req.body;

    const response = await AuthService.verifyCode(email, code);

    res.status(response.statusCode).json(response);
  }
}

export default AuthController;
