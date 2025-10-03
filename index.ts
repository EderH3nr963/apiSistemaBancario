import express from "express";
import session from "express-session";
import dotenv from "dotenv";
import cors from "cors";

import connectRedis from "connect-redis";
import Redis from "ioredis";

import { AuthRequest } from "./middlewares/AuthMiddleware";

import AuthRoutes from "./routes/AuthRoutes";
import UsuarioRoutes from "./routes/UsuarioRoutes";
import TransacaoRoutes from "./routes/TransacaoRoutes";
import PagamentoRoutes from "./routes/PagamentoRoutes";
import EmprestimoRoutes from "./routes/EmprestimoRoutes";

import "./types/expressSessionType";
import { authMiddleware } from "./middlewares/AuthMiddleware";

const redisClient = new Redis();
const RedisStore = connectRedis(session);
const app = express();

dotenv.config();
app.use(express.json());

app.use(
  cors({
    origin: (origin, callback) => {
      callback(null, origin || "*"); // devolve a origem real
    },
    credentials: true
  })
);

app.use(
  session({
    store: new RedisStore({ client: redisClient }),
    secret: process.env.SECRET_PASS_SESSION || "morango_e_banana",
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: false,
    },
  })
);

app.use("/api/v1/auth", AuthRoutes);
app.use("/api/v1/usuario", authMiddleware, UsuarioRoutes);
app.use("/api/v1/transacao", authMiddleware, TransacaoRoutes);
app.use("/api/v1/pagamento", authMiddleware, PagamentoRoutes);
app.use("/api/v1/emprestimo", EmprestimoRoutes);

app.listen(3000, "0.0.0.0", () => {
  console.log("Servidor rodando na porta 3000");
});
