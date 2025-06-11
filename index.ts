import express from "express";
import session from "express-session";
import dotenv from "dotenv";
import cors from "cors";

import connectRedis from "connect-redis";
import Redis from "ioredis";

import AuthRoutes from "./routes/AuthRoutes";
import UsuarioRoutes from "./routes/UsuarioRoutes";
import TransacaoRoutes from "./routes/TransacaoRoutes";
import PagamentoRoutes from "./routes/PagamentoRoutes";

import "./types/expressSessionType";

const redisClient = new Redis();
const RedisStore = connectRedis(session);
const app = express();

dotenv.config();
app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
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
app.use("/api/v1/usuario", UsuarioRoutes);
app.use("/api/v1/transacao", TransacaoRoutes);
app.use("/api/v1/pagamento", PagamentoRoutes);

app.listen(3000, () => {
  console.log("Servidor rodando na porta 3000");
});
