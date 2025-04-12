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

    const response = await AuthService.login(email, password);

    if (response.status == "success" && response.usuario) {
      req.session.id_usuario = response.usuario.id_usuario;
      req.session.is_admin = response.usuario.is_admin;
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
