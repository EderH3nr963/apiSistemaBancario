const User = require('../models/userModel');
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const sendEmail = require('../lib/sendEmail')
const redisClient = require('../config/redisDB');

const serviceLogin = async (email, password) => {
    try {
        const user = await User.findOne({ email: email }); // Procura um usuário com email igual ao definido
        if (!user) return { success: false, menssagem: "Email ou senha inválido" }

        const verifyPasswd = await user.comparePassword(password); // Compara a senha com a hash
        if (!verifyPasswd) return { success: false, menssagem: "Email ou senha inválido" }

        const token = jwt.sign({ data: user._id }, process.env.JWT_SECRET, { expiresIn: '48h' }); // Cria um token de login
        return { success: true, menssagem: "Acesso autorizado", token: token }
    } catch (error) {
        return { success: false, menssagem: "Erro interno no servidor: ".error.message }
    }
}

const serviceRegister = async (fullName, email, cpf, birthDay, password) => {
    console.log(await User.isThisCpfInUse(cpf))
    // Procura um usuário com email igual ao definido
    if (!(await User.isThisEmailInUse(email))) return { success: false, menssagem: "Email já existente" }

    // Procura um usuário com CPF igual ao definido
    if (!(await User.isThisCpfInUse(cpf))) return { success: false, menssagem: "CPF já existente" }


    const user = await User({
        fullName,
        email,
        cpf,
        birthDay,
        password
    });
    await user.save();

    return { success: true, menssagem: "Usuário cadastrado com sucesso" };
}

const serviceSendCodeVerification = async (email) => {

    try {
        redisClient.connect();
        
        // Verifica se o código foi enviado recentemente
        const dateCreated = await redisClient.get(email);

        if (dateCreated) {
            const today = Date.now(); // Data atual
            const diff = today - dateCreated; // Diferença entre a data atual e a data de criação
            
            // Caso a requisição atual faça menos de 1 minuto da anterior
            if (diff < 60 * 1000) {  // 60 segundos em milissegundos
                return { success: false, menssagem: "Reenviar o código em " + (diff / 1000).toFixed(0) + " segundos" };
            }
            
            // Caso contrário, remove o email da sessão
            await (['DEL', email]);
        }
        
        // Gera um código entre 100000 e 999999
        const code = Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;
        
        const html = "Seu código de verificação é: <b>" + code + "</b>"; // Corpo HTML do email
        
        const responseSendEmail = await sendEmail(email, 'Código de verificação de usuário', html); // Envia o email com o código
        if (!responseSendEmail) {
            return { success: false, menssagem: "Erro ao enviar código de verificação" };
        }
        
        // Armazena o código e a data na sessão
        await redisClient.hSet(code.toString(), { email: email, dateCode: Date.now() });
        await redisClient.set(email, Date.now().toString()); // Atualiza a data de envio
        
        return { success: true, menssagem: "Código de verificação enviado com sucesso" };
    } catch (error) {
        return { success: false, menssagem: "Erro interno no servidor" };
    } finally {
        redisClient.quit();
    }
}

const serviceVerifyCode = async (code) => {
    redisClient.connect();
    try {
        
        // Recupera os dados do código da sessão
        const storedData = await redisClient.hGetAll(code.toString());
        
        if (!storedData) {
            return { success: false, menssagem: "Código de verificação expirado" };
        }
        
        const { email, dateCode } = JSON.parse(storedData); // Converte de volta o JSON para objeto
        
        // Verifica se o código ainda existe na sessão
        if (!dateCode || !email) {
            return { success: false, menssagem: "Código de verificação expirado" };
        }
        
        const today = Date.now();
        const diff = today - dateCode;
        
        // Verifica se o código expirou (15 minutos)
        if (diff > (15 * 60 * 1000)) { // 15 minutos em milissegundos
            await redisClient.sendCommand(['HDEL', code.toString(), 'email', 'dateCode']);
            return { success: false, menssagem: "Código de verificação expirado" };
        }
        
        return { success: true, email: email, menssagem: "Email verificado com sucesso" };
    } catch (error) {
        return { success: false, menssagem: "Erro interno no servidor" };
    } finally {
        redisClient.quit();
    }
}

module.exports = { serviceLogin, serviceRegister, serviceSendCodeVerification, serviceVerifyCode }