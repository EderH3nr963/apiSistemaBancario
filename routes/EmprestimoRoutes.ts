import express from "express";
import EmprestimoController from "../controllers/EmprestimoController";
import EmprestimoValidatorData from "../middlewares/EmprestimoValidatorData";
import MyValidatorResult from "../middlewares/MyValidatorResult";
import { authMiddleware } from "../middlewares/AuthMiddleware";
import { param } from "express-validator";

const router = express.Router();

router.use(authMiddleware);

router.post(
  "/",
  EmprestimoValidatorData.solicitar,
  MyValidatorResult,
  EmprestimoController.solicitar
);

router.get(
  "/",
  EmprestimoController.listar
);

router.post(
  "/pay/:id_emprestimo",
  [
    param("id_emprestimo")
      .isInt()
      .withMessage("ID do empréstimo inválido"),
    ...EmprestimoValidatorData.pagar,
  ],
  MyValidatorResult,
  EmprestimoController.pagar
);

export default router;