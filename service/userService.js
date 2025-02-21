const User = require('../models/userModel'); // Importa o modelo de usuário
const bcrypt = require('bcrypt'); // Importa o bcrypt para hash de senhas

const verificationCode = require('../lib/verificationCode'); // Importa a função de verificação de código

// Serviço para atualizar a senha do usuário
const serviceUpdatePassword = async (email, password) => {
    try {
        // Conecta ao Redis
        await redisClient.connect();
        
        // Busca o usuário no banco de dados usando o email
        const user = await User.findOne({ email: email });
        if (!user) {
            // Retorna erro caso o usuário não seja encontrado
            return { success: false, statusCode: 404, mensagem: "Usuário não encontrado" };
        }

        // Criptografa a nova senha usando bcrypt
        const hashPassword = await bcrypt.hash(password, 10);
        
        // Atualiza a senha do usuário no banco de dados
        await User.updateOne({ email: email }, { $set: { password: hashPassword } });

        // Retorna sucesso após atualizar a senha
        return { success: true, statusCode: 200, mensagem: "Senha atualizada com sucesso!" };
    } catch (e) {
        console.log(e); // Exibe erro no console para depuração
        return { success: false, statusCode: 500, mensagem: 'Erro interno no servidor. Tente novamente mais tarde' };
    }
};

// Serviço para atualizar o email do usuário
const serviceUpdateEmail = async (idUser, email) => {
    try {
        // Conecta ao Redis
        await redisClient.connect();

        // Busca o usuário no banco de dados pelo ID
        const user = await User.findById(idUser);
        if (!user) {
            // Retorna erro caso o usuário não seja encontrado
            return { success: false, statusCode: 404, mensagem: "Usuário não encontrado" };
        }

        // Verifica o código de verificação antes de atualizar o email
        const response = await verificationCode(code, user.email);
        if (!response.success) {
            // Retorna erro caso o código não seja válido
            return response;
        }

        // Remove o código de verificação do Redis
        await redisClient.del(`verification:code:${code}`);
        
        // Atualiza o email do usuário no banco de dados
        await User.updateOne({ _id: idUser }, { $set: { email } });

        // Retorna sucesso após atualizar o email
        return { success: true, statusCode: 200, mensagem: "E-mail atualizado com sucesso!" };
    } catch (e) {
        // Retorna erro caso haja alguma exceção
        return { success: false, statusCode: 500, mensagem: 'Erro interno no servidor. Tente novamente mais tarde' };
    }
};

// Serviço para recuperar as informações do usuário
const serviceGetUser = async (id) => {
    try {
        // Busca o usuário no banco de dados pelo ID
        const user = await User.findById(id);
        
        // Exibe as informações do usuário no console (pode ser removido em produção)
        console.log(user.user);

        // Retorna sucesso e os dados do usuário
        return { success: true, statusCode: 200, mensagem: 'Usuário resgatado com sucesso', campos: {
            email: user.email,
            saldo: user.saldo,
            fullName: user.fullName
        }};
    } catch (e) {
        // Retorna erro caso haja alguma exceção
        return { success: false, statusCode: 500, mensagem: 'Erro interno no servidor. Tente novamente mais tarde' };
    }
};

module.exports = {
    serviceUpdatePassword, // Exporta o serviço de atualização de senha
    serviceUpdateEmail, // Exporta o serviço de atualização de email
    serviceGetUser // Exporta o serviço de resgate do usuário
};
