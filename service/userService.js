const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const sendEmail = require('../lib/sendEmail');
const verificationCode = require('../lib/verificationCode');
const redisClient = require('../config/redisDB');

const RESEND_LIMIT_TIME = 60 * 1000; // 60 segundos

const serviceLogin = async (email, password) => {
    try {
        const user = await User.findOne({ email: email });
        if (!user) return { success: false, statusCode: 401, mensagem: "Email ou senha inválido" };

        const verifyPasswd = await user.comparePassword(password);
        if (!verifyPasswd) return { success: false, statusCode: 401, mensagem: "Email ou senha inválido" };

        const token = jwt.sign({ data: user._id.toString() }, process.env.JWT_SECRET, { expiresIn: '48h' });
        return { success: true, statusCode: 200, mensagem: "Acesso autorizado", token: token };
    } catch (error) {
        return { success: false, statusCode: 500, mensagem: "Erro interno no servidor: " + error.message };
    }
};

const serviceRegister = async (fullName, email, cpf, birthDay, password, code) => {
    try {
        await redisClient.connect();

        // Verifica se o e-mail e CPF já estão em uso
        if (!(await User.isThisEmailInUse(email))) {
            return { success: false, statusCode: 409, mensagem: "Email já existente" };
        }
        if (!(await User.isThisCpfInUse(cpf))) {
            return { success: false, statusCode: 409, mensagem: "CPF já existente" };
        }

        const response = await verificationCode(code, email);
        if (!response.success) {
            return response;
        }

        // Cria e salva o usuário
        const user = new User({ fullName, email, cpf, birthDay, password });
        await user.save();

        // Remove o código de verificação após o uso
        await redisClient.del(`verification:code:${code}`);

        return { success: true, statusCode: 201, mensagem: "Usuário cadastrado com sucesso" };
    } catch (error) {
        return { success: false, statusCode: 500, mensagem: "Erro interno no servidor: " + error.message };
    } finally {
        redisClient.quit();
    }
};

const serviceSendCodeVerification = async (email) => {
    try {
        await redisClient.connect();
        console.log(email)
        // Verifica o limite de reenvio
        const lastSentTime = await redisClient.get(`verification:email:${email}`);
        if (lastSentTime) {
            const timeElapsed = Date.now() - parseInt(lastSentTime, 10);
            if (timeElapsed < RESEND_LIMIT_TIME) {
                return {
                    success: false,
                    statusCode: 429,
                    mensagem: `Reenviar o código em ${(RESEND_LIMIT_TIME - timeElapsed) / 1000} segundos`,
                };
            }
        }

        // Gera um código aleatório
        const code = Math.floor(100000 + Math.random() * 900000);
        const html = `Seu código de verificação é: <b>${code}</b>`;

        // Envia o e-mail com o código de verificação
        const emailSent = await sendEmail(email, 'Código de Verificação', html);
        if (!emailSent) {
            return { success: false, statusCode: 500, mensagem: "Erro ao enviar código de verificação" };
        }

        // Armazena o código e a data de envio no Redis
        await redisClient.hSet(`verification:code:${code}`, {
            email,
            dateCode: Date.now(),
        });
        await redisClient.set(`verification:email:${email}`, Date.now());

        return { success: true, statusCode: 200, mensagem: "Código de verificação enviado com sucesso" };
    } catch (error) {
        return { success: false, statusCode: 500, mensagem: "Erro interno no servidor: " + error.message };
    } finally {
        redisClient.quit();
    }
};

const emailInNotUseService = async (email) => {
    try {
        const responseDB = await User.isThisEmailInUse(email); // Verifica se o email está em uso
        if (responseDB === false) {
            return { success: false, statusCode: 409, mensagem: "Este e-mail já está em uso" };
        }

        return { success: true, statusCode: 200, mensagem: 'Email não está em uso' };
    } catch {
        return { success: false, statusCode: 500, mensagem: 'Erro interno no servidor. Tente novamente mais tarde' };
    }
};

const serviceUpdatePassword = async (email, password, code) => {
    try {
        await redisClient.connect();
        const user = await User.findOne({ email: email });
        if (!user) {
            return { success: false, statusCode: 404, mensagem: "Usuário não encontrado" };
        }
        const response = await verificationCode(code, user.email);
        if (!response.success) {
            return response;
        }

        const hashPassword = await bcrypt.hash(password, 10);
        await User.updateOne({ email: email }, { $set: { password: hashPassword } });
        
        await redisClient.del(`verification:code:${code}`);

        return { success: true, statusCode: 200, mensagem: "Senha atualizada com sucesso!" };
    } catch (e) {
        console.log(e);
        return { success: false, statusCode: 500, mensagem: 'Erro interno no servidor. Tente novamente mais tarde' };
    }
};

const serviceUpdateEmail = async (idUser, email, code) => {
    try {
        await redisClient.connect();
        const user = await User.findById(idUser);
        if (!user) {
            return { success: false, statusCode: 404, mensagem: "Usuário não encontrado" };
        }

        const response = await verificationCode(code, email);
        if (!response.success) {
            return response;
        }

        await User.updateOne({ _id: idUser }, { $set: { email } });

        await redisClient.del(`verification:code:${code}`);

        return { success: true, statusCode: 200, mensagem: "E-mail atualizado com sucesso!" };
    } catch (e) {
        return { success: false, statusCode: 500, mensagem: 'Erro interno no servidor. Tente novamente mais tarde' };
    }
};


const cpfInNotUseService = async (cpf) => {
    try {
        const responseDB = await User.isThisCpfInUse(cpf); // verifica se o cpf está em uso
        if (responseDB === false) {
            return { success: false, statusCode: 409, mensagem: "Este CPF já está em uso" };
        }

        return { success: true, statusCode: 200, mensagem: 'CPF não está em uso' };
    } catch {
        return { success: false, statusCode: 500, mensagem: 'Erro interno no servidor. Tente novamente mais tarde' };
    }
};

module.exports = {
    serviceLogin,
    serviceRegister,
    serviceSendCodeVerification,
    emailInNotUseService,
    cpfInNotUseService,
    serviceUpdatePassword,
    serviceUpdateEmail
};
