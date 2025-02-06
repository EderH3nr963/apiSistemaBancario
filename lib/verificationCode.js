const redisClient = require('../config/redisDB');
const CODE_EXPIRATION_TIME = 15 * 60 * 1000; // 15 minutos

const verificationCode = async (code, email) => {
    // Obtém dados do Redis para o código fornecido
    const storedData = await redisClient.hGetAll(`verification:code:${code}`);
    if (!storedData.email || !storedData.dateCode) {
        return { success: false, statusCode: 410, mensagem: "Código de verificação expirado ou inválido" };
    }
     // Valida se o código pertence ao e-mail e está dentro do prazo
     if (storedData.email !== email) {
         return { success: false, statusCode: 400, mensagem: "Código não corresponde ao e-mail fornecido" };
     }

     const timeElapsed = Date.now() - parseInt(storedData.dateCode, 10);
     if (timeElapsed > CODE_EXPIRATION_TIME) {
         await redisClient.del(`verification:code:${code}`);
         return { success: false, statusCode: 410, mensagem: "Código de verificação expirado"};
     }

     return { success: true };
}

module.exports = verificationCode;