import session from "express-session";

interface TentativaLogin {
  count: number;
  cpf: string;
}

declare module "express-session" {
  interface SessionData {
    id_usuario?: number;
    id_conta?: number;
    is_admin?: boolean;
    tentativa_login?: TentativaLogin;
  }
}
