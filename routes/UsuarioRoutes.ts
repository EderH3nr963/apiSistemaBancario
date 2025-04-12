import express from "express";
import UsuarioController from "../controllers/UsuarioController";
import { body } from "express-validator";
import MyValidatorResult from "../middlewares/MyValidatorResult";
import UsuarioValidatorData from "../middlewares/UsuarioValidatorData";
const router = express.Router();

router.get("/", UsuarioController.get);

router.patch(
  "/email",
  [body("email").isEmail().withMessage("Email inválido")],
  MyValidatorResult,
  UsuarioController.updateEmail
);
router.patch(
  "/password",
  UsuarioValidatorData.updatePassword,
  MyValidatorResult,
  UsuarioController.updatePassword
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

router.get("/verify-session", UsuarioController.verifySession);
router.delete("/logout", UsuarioController.logout);

export default router;
