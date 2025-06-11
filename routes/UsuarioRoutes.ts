import express from "express";
import UsuarioController from "../controllers/UsuarioController";
import { body } from "express-validator";
import MyValidatorResult from "../middlewares/MyValidatorResult";
import UsuarioValidatorData from "../middlewares/UsuarioValidatorData";

const router = express.Router();

// Rotas fixas primeiro
router.get("/", UsuarioController.get);
router.get("/verify-session", UsuarioController.verifySession);
router.delete("/logout", UsuarioController.logout);

router.patch(
  "/email",
  [body("email").isEmail().withMessage("Email inválido")],
  MyValidatorResult,
  UsuarioController.updateEmail
);
router.patch(
  "/password-login",
  UsuarioValidatorData.updatePassword,
  MyValidatorResult,
  UsuarioController.updatePasswordUsuario
);
router.patch(
  "/password-conta",
  UsuarioValidatorData.updatePassword,
  MyValidatorResult,
  UsuarioController.updatePasswordConta
);
router.patch(
  "/telefone",
  UsuarioValidatorData.updateTelefone,
  MyValidatorResult,
  UsuarioController.updateTelefone
);
router.patch(
  "/endereco",
  UsuarioValidatorData.updateEndereco,
  MyValidatorResult,
  UsuarioController.updateEndereco
);

// Rotas dinâmicas por último
router.get("/:chave_transferencia", UsuarioController.getByChaveTransferencia);

export default router;
