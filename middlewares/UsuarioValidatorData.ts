import { body } from "express-validator";

const UsuarioValidatorData = {
  updatePassword: [
    body("newPassword")
      .isLength({ min: 8, max: 16 })
      .withMessage("A senha deve conter entre 8 a 16 caracteres.")
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,16}$/)
      .withMessage(
        "A senha deve conter letras maiusculas e minuscular, números e caracteres especiais"
      ),
    body("confirm_newPassword").custom((value, { req }) => {
      if (value !== req.body.newPassword)
        throw new Error("As senha não coincidem");

      return true;
    }),
  ],

  updateTelefone: [
    body("telefone")
      .exists()
      .withMessage("Campo telefone não pode ser nulo.")
      .matches(/^\d{2} 9\d{4}-\d{4}$/)
      .withMessage("O telefone deve seguir o formato XX 9XXXX-XXXX."),
  ],

  updateEndereco: [
    body("field").custom((value) => {
      if (
        value !== "rua" &&
        value !== "numero" &&
        value !== "cidade" &&
        value !== "estado"
      ) {
        throw new Error("Campo de atualização inválido");
      }

      return true;
    }),
    body("value").custom((value, { req }) => {
      if (typeof value !== "number" && req.body.field == "numero") {
        throw new Error(
          "O campo de atualização de rua deve ser numérico inválido"
        );
      }

      return true;
    }),
  ],
};

export default UsuarioValidatorData;
