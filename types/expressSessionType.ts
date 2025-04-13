import session from "express-session";

declare module "express-session" {
  interface SessionData {
    id_usuario?: number;
    id_conta?: number;
    is_admin?: boolean;
  }
}
