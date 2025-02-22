const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const sendEmail = require('../lib/sendEmail');
const verificationCode = require('../lib/verificationCode');
const redisClient = require('../config/redisDB');

const RESEND_LIMIT_TIME = 60 * 1000; // 60 segundos, tempo limite entre reenvios do código

// Função de login de usuário
const serviceLogin = async (email, password) => {
    try {
        const user = await User.findOne({ email: email }); // Busca o usuário pelo e-mail
        if (!user) return { success: false, statusCode: 401, mensagem: "Email ou senha inválido" }; // Se o usuário não existir, retorna erro

        const verifyPasswd = await user.comparePassword(password); // Verifica a senha
        if (!verifyPasswd) return { success: false, statusCode: 401, mensagem: "Email ou senha inválido" }; // Se a senha estiver errada, retorna erro

        // Gera um token JWT para o usuário com expiração de 48 horas
        const token = jwt.sign({ data: user._id.toString() }, process.env.JWT_SECRET, { expiresIn: '48h' });
        return { success: true, statusCode: 200, mensagem: "Acesso autorizado", token: token, user: {
            fullName: user.fullName,
            email: user.email,
            cpf: user.cpf,
            birthDay: user.birthDay,
            saldo: user.saldo
        } }; // Retorna sucesso com o token
    } catch (error) {
        return { success: false, statusCode: 500, mensagem: "Erro interno no servidor: " + error.message }; // Em caso de erro no servidor
    }
};

// Função de registro de usuário
const serviceRegister = async (fullName, email, cpf, birthDay, password, code) => {
    try {
        await redisClient.connect(); // Conecta ao Redis

        // Verifica se o e-mail ou CPF já estão em uso
        if (!(await User.isThisEmailInUse(email))) {
            return { success: false, statusCode: 409, mensagem: "Email já existente" };
        }
        if (!(await User.isThisCpfInUse(cpf))) {
            return { success: false, statusCode: 409, mensagem: "CPF já existente" };
        }

        const response = await verificationCode(code, email); // Verifica o código de verificação
        if (!response.success) {
            return response; // Retorna erro caso o código seja inválido
        }

        // Cria e salva o usuário
        const user = new User({ fullName, email, cpf, birthDay, password });
        await user.save();

        // Remove o código de verificação após o uso
        await redisClient.del(`verification:code:${code}`);

        return { success: true, statusCode: 201, mensagem: "Usuário cadastrado com sucesso" }; // Retorna sucesso
    } catch (error) {
        return { success: false, statusCode: 500, mensagem: "Erro interno no servidor: " + error.message }; // Em caso de erro no servidor
    } finally {
        redisClient.quit(); // Fecha a conexão com o Redis
    }
};

// Função de envio do código de verificação por e-mail
const serviceSendCodeVerification = async (email) => {
    try {
        await redisClient.connect(); // Conecta ao Redis

        // Verifica o limite de reenvio
        const lastSentTime = await redisClient.get(`verification:email:${email}`);
        if (lastSentTime) {
            const timeElapsed = Date.now() - parseInt(lastSentTime, 10);
            if (timeElapsed < RESEND_LIMIT_TIME) {
                return {
                    success: false,
                    statusCode: 429,
                    mensagem: `Reenviar o código em ${(RESEND_LIMIT_TIME - timeElapsed) / 1000} segundos`,
                }; // Retorna erro caso esteja dentro do limite de tempo
            }
        }

        // Gera um código aleatório de verificação
        const code = Math.floor(100000 + Math.random() * 900000);
        const html = `Seu código de verificação é: <b>${code}</b>`;

        // Envia o código por e-mail
        const emailSent = await sendEmail(email, 'Código de Verificação', html);
        if (!emailSent) {
            return { success: false, statusCode: 500, mensagem: "Erro ao enviar código de verificação" }; // Caso o e-mail não seja enviado
        }

        // Armazena o código e a data de envio no Redis
        await redisClient.hSet(`verification:code:${code}`, {
            email,
            dateCode: Date.now(),
        });
        await redisClient.set(`verification:email:${email}`, Date.now());

        return { success: true, statusCode: 200, mensagem: "Código de verificação enviado com sucesso" }; // Retorna sucesso
    } catch (error) {
        return { success: false, statusCode: 500, mensagem: "Erro interno no servidor: " + error.message }; // Em caso de erro no servidor
    } finally {
        redisClient.quit(); // Fecha a conexão com o Redis
    }
};

// Função de verificação de e-mail não em uso
const emailInNotUseService = async (email) => {
    try {
        const responseDB = await User.isThisEmailInUse(email); // Verifica se o e-mail está em uso
        if (responseDB === false) {
            return { success: false, statusCode: 409, mensagem: "Este e-mail já está em uso" }; // Caso o e-mail já esteja em uso
        }

        return { success: true, statusCode: 200, mensagem: 'Email não está em uso' }; // Caso o e-mail não esteja em uso
    } catch {
        return { success: false, statusCode: 500, mensagem: 'Erro interno no servidor. Tente novamente mais tarde' }; // Em caso de erro no servidor
    }
};

// Função de recuperação de senha
const serviceForgotPassword = async (email, password, code) => {
    try {
        await redisClient.connect(); // Conecta ao Redis
        const user = await User.findOne({ email: email }); // Busca o usuário pelo e-mail
        if (!user) {
            return { success: false, statusCode: 404, mensagem: "Usuário não encontrado" }; // Caso o usuário não exista
        }
        const response = await verificationCode(code, user.email); // Verifica o código de verificação
        if (!response.success) {
            return response; // Retorna erro caso o código seja inválido
        }

        // Faz o hash da nova senha e atualiza no banco de dados
        const hashPassword = await bcrypt.hash(password, 10);
        await User.updateOne({ email: email }, { $set: { password: hashPassword } });
        
        await redisClient.del(`verification:code:${code}`); // Remove o código de verificação após o uso

        return { success: true, statusCode: 200, mensagem: "Senha atualizada com sucesso!" }; // Retorna sucesso
    } catch (e) {
        console.log(e);
        return { success: false, statusCode: 500, mensagem: 'Erro interno no servidor. Tente novamente mais tarde' }; // Em caso de erro no servidor
    }
};

// Função de verificação de CPF não em uso
const cpfInNotUseService = async (cpf) => {
    try {
        const responseDB = await User.isThisCpfInUse(cpf); // Verifica se o CPF está em uso
        if (responseDB === false) {
            return { success: false, statusCode: 409, mensagem: "Este CPF já está em uso" }; // Caso o CPF já esteja em uso
        }

        return { success: true, statusCode: 200, mensagem: 'CPF não está em uso' }; // Caso o CPF não esteja em uso
    } catch {
        return { success: false, statusCode: 500, mensagem: 'Erro interno no servidor. Tente novamente mais tarde' }; // Em caso de erro no servidor
    }
};

module.exports = {
    serviceLogin,
    serviceRegister,
    serviceSendCodeVerification,
    emailInNotUseService,
    cpfInNotUseService,
    serviceForgotPassword
};
