import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import session from "express-session";

import AuthRoutes from "./routes/AuthRoutes";
import UsuarioRoutes from "./routes/UsuarioRoutes";
import TransacaoRoutes from "./routes/TransacaoRoutes";
import PagamentoRoutes from "./routes/PagamentoRoutes";
import EmprestimoRoutes from "./routes/EmprestimoRoutes";

import { authMiddleware } from "./middlewares/AuthMiddleware";
import sequelize from "./config/database";

const app = express();

dotenv.config();
app.use(express.json());

app.use(
  cors({
    origin: (origin, callback) => {
      callback(null, origin || "*");
    },
    credentials: true
  })
);

app.use(
  session({
    secret: process.env.SESSION_SECRET || "chave_super_secreta_session",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, 
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 
    }
  })
);

app.use("/api/v1/auth", AuthRoutes);
app.use("/api/v1/usuario", authMiddleware, UsuarioRoutes);
app.use("/api/v1/transacao", authMiddleware, TransacaoRoutes);
app.use("/api/v1/pagamento", authMiddleware, PagamentoRoutes);
app.use("/api/v1/emprestimo", EmprestimoRoutes);

sequelize.sync({ force: false }).then(async () => {
  console.log("Database synced");
  await sequelize.query('PRAGMA foreign_keys = ON;');
  console.log("Foreign keys enabled");
  app.listen(3000, "0.0.0.0", () => {
    console.log("Servidor rodando na porta 3000");
  });
}).catch(err => {
  console.error("Error syncing database:", err);
});
