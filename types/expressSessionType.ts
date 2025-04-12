import session from "express-session";

declare module "express-session" {
  interface SessionData {
    id_usuario?: number;
    is_admin?: boolean;
  }
}
