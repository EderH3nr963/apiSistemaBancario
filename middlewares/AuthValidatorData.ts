import { body } from "express-validator";

const AuthValidatorData = {
  register: [
    body("usuario.email").isEmail().withMessage("Email inválido"),
    body("usuario.full_name").exists().withMessage("O nome não pode ser nulo"),
    body("usuario.password")
      .isLength({ min: 8, max: 16 })
      .withMessage("A senha deve conter entre 8 a 16 caracteres.")
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,16}$/)
      .withMessage(
        "A senha deve conter letras maiusculas e minuscular, números e caracteres especiais"
      ),
    body("usuario.confirm_password").custom((value, { req }) => {
      if (value !== req.body.usuario.password)
        throw new Error("As senha não coincidem");

      return true;
    }),
    body("usuario.telefone")
      .exists()
      .withMessage("Campo telefone não pode ser nulo.")
      .matches(/^\d{2} 9\d{4}-\d{4}$/)
      .withMessage("O telefone deve seguir o formato XX 9XXXX-XXXX."),
    body("usuario.cpf")
      .exists()
      .withMessage("Campo CPF não pode ser nulo.")
      .matches(/^\d{11}$/)
      .withMessage(
        "CPF deve conter exatamente 11 dígitos numéricos (sem pontos ou traços)."
      ),
    body("endereco.rua")
      .exists()
      .withMessage("O campo rua não pode ser vazio")
      .isString()
      .withMessage("Rua inválida"),
    body("endereco.numero")
      .exists()
      .withMessage("O campo Número não pode ser vazio")
      .isNumeric()
      .withMessage("Número inválida"),
    body("endereco.cidade")
      .exists()
      .withMessage("O campo Cidade não pode ser vazio")
      .isString()
      .withMessage("Cidade inválida"),
    body("endereco.estado")
      .exists()
      .withMessage("O campo Estado não pode ser vazio")
      .isString()
      .withMessage("Estado inválido"),
    body("conta.tipo_conta").custom((value) => {
      if (value !== "corrente" && value !== "poupanca")
        throw new Error("Tipo de conta inválida");

      return true;
    }),
    body("conta.password")
      .matches(/^\d{6}$/)
      .withMessage("A senha deve conter 6 digitos numéricos"),
    body("conta.confirm_password").custom((value, { req }) => {
      if (value !== req.body.conta.password)
        throw new Error("As senha não coincidem");

      return true;
    }),
  ],

  login: [
    body("email").isEmail().withMessage("Email ou senha inválidos"),
    body("password")
      .isLength({ min: 8, max: 16 })
      .withMessage("Email ou senha inválidos")
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,16}$/)
      .withMessage("Email ou senha inválidos"),
  ],

  verifyCode: [
    body("email").isEmail().withMessage("Email inválido"),
    body("code").isLength({ min: 6, max: 6 }).withMessage("Código inválido"),
  ],

  resetPassword: [
    body("password")
      .isLength({ min: 8, max: 16 })
      .withMessage("A senha deve conter entre 8 a 16 caracteres.")
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,16}$/)
      .withMessage(
        "A senha deve conter letras maiusculas e minuscular, números e caracteres especiais"
      ),
    body("confirm_password").custom((value, { req }) => {
      if (value !== req.body.password)
        throw new Error("As senha não coincidem");

      return true;
    }),
  ],
};

export default AuthValidatorData;
