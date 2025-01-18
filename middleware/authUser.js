const { check, validationResult } = require('express-validator');
const moment = require("moment");

exports.validateUserSignUp = [
    check('fullName')
        .trim()
        .not()
        .isEmpty()
        .withMessage('O campo nome é obrigatório')
        .isString()
        .isLength({ min: 3, max: 40 })
        .withMessage('O nome deve ter entre 3 e 40 caracteres!'),
    check('email')
        .normalizeEmail()
        .isEmail()
        .withMessage('Email inválido'),
    check('cpf')
        .trim()
        .not()
        .isEmpty()
        .withMessage('O campo CPF é obrigatório')
        .isLength({ min: 11, max: 14 })
        .withMessage('CPF deve ter entre 11 e 14 caracteres')
        .custom((value) => {
            // Remover pontuação do CPF
            const cleanCpf = value.replace(/\D/g, ''); // Remove qualquer caracter não numérico
            if (cleanCpf.length !== 11) {
                throw new Error('CPF deve conter exatamente 11 números');
            }

            return true;
        }),
    check('birthDay')
        .trim()
        .not()
        .isEmpty()
        .withMessage('A data é obrigatória!')
        .custom((value) => {
            // Tenta converter o valor para uma instância de Date
            const date = new Date(value);
        
            // Verifica se a data é válida
            if (isNaN(date.getTime())) {
                throw new Error('A data deve ser válida e no formato esperado!');
            }
        
            return true;
        })            
        .custom((value) => {
            // Normaliza a data para o formato yyyy-mm-dd
            let dateParts;
            let formattedDate;

            // Se a data for no formato dd/mm/yyyy
            if (value.includes('/')) {
                dateParts = value.split('/');
                formattedDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`; // Formato yyyy-mm-dd
            } else {
                // Se for no formato yyyy-mm-dd, já está no formato correto
                formattedDate = value;
            }

            // Verifica se a data é válida
            const date = new Date(formattedDate);

            if (isNaN(date.getTime())) {
                throw new Error('Data inválida!');
            }

            // Adicional: verifica se a data não é no futuro
            const today = new Date();
            if (date > today) {
                throw new Error('A data não pode ser no futuro!');
            }

            return true;
        })
        .custom((value) => {
            const birthDate = moment(value);  // Data de nascimento do usuário no formato yyyy-mm-dd

            // Verifica a idade
            const age = moment().diff(birthDate, 'years');  // Calcula a idade do usuário

            if (age < 18) {
                throw new Error('Não pode ser menor de idade');
            }

            return true;
        }),
    check('password')
        .trim()
        .not()
        .isEmpty()
        .withMessage('A senha é obrigatória!')
        .isLength({ min: 8, max: 20 })
        .withMessage('A senha deve ter entre 8 e 20 caracteres!'),
    check('confirmPassword')
        .trim()
        .not()
        .isEmpty()
        .withMessage('A confirmação da senha é obrigatória!')
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error('As senhas precisam ser iguais!');
            }
            return true;
        }),
];

exports.validateUser = (req, res, next) => {
    const result = validationResult(req).array();
    if (!result.length) return next();

    const error = result[0].msg;
    res.status(400).json({ success: false, statusCode: 400, mensagem: error });
}

exports.validateCpf = [
    check('cpf')
        .trim()
        .not()
        .isEmpty()
        .withMessage('O campo CPF é obrigatório')
        .isLength({ min: 11, max: 14 })
        .withMessage('CPF deve ter entre 11 e 14 caracteres')
        .custom((value) => {
            // Remover pontuação do CPF
            const cleanCpf = value.replace(/\D/g, ''); // Remove qualquer caracter não numérico
            if (cleanCpf.length !== 11) {
                throw new Error('CPF deve conter exatamente 11 números');
            }

            return true;
        }),
];

exports.validateEmail = [
    check('email')
        .normalizeEmail()
        .isEmail()
        .withMessage('Email inválido')
]

exports.validateUserSignIn = [
    check('email')
        .trim()
        .isEmail()
        .withMessage('Email ou senha inválido!'),
    check('password')
        .trim()
        .not()
        .isEmpty()
        .withMessage('Email ou senha inválido!'),
];

