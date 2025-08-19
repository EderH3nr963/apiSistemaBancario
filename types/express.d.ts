import { Usuario } from "../models/UsuarioModel"; // ajuste o caminho para o seu model

declare global {
  namespace Express {
    interface UserPayload {
      id_usuario: number;
      id_conta_bancaria: number
      // qualquer outro campo que você coloca no req.user
    }

    interface Request {
      user?: UserPayload;
    }
  }
}
