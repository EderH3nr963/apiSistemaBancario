const jwt = require('jsonwebtoken');

exports.validateAuth = (req, res, next) => {
    try {
        const token = req.headers['authorization'] && req.headers['authorization'].split(' ')[1];

        // Verifica se o token não é nulo
        if (!token) {
            return res.status(401).json({ success: false, mensagem: "Acesso negado, token não fornecido" });
        }

        // Verifica se o token é válido
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                return res.status(401).json({ success: false, mensagem: "Token inválido ou expirado" });
            }

            console.log(decoded)
            // Se o token for válido, você pode passar os dados do usuário decodificados para a requisição
            req.idUser = decoded.data ;  // Aqui estamos assumindo que o id do usuário está no "data" do payload
            // Chama o próximo middleware
            next();
        });

    } catch (error) {
        return res.status(401).json({ success: false, mensagem: "Acesso negado, erro ao verificar o token" });
    }
};
