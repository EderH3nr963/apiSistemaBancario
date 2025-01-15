const User  = require('../models/userModel');
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');

const serviceLogin = async (email, password) => {
    try {
        const user = await User.findOne({ email: email}); // Procura um usuário com email igual ao definido
        if (!user) return { success: false, menssagem: "Email ou senha inválido"}

        const verifyPasswd = await user.comparePassword(password); // Compara a senha com a hash
        if (!verifyPasswd) return { success: false, menssagem: "Email ou senha inválido"}

        const token = jwt.sign({ data: user._id }, process.env.JWT_SECRET , { expiresIn: '48h' }); // Cria um token de login
        return { success: true, menssagem: "Acesso autorizado", token: token}
    } catch (error) {
        return { success: false, menssagem: "Erro interno no servidor: " . error.message }
    }
}

const serviceRegister = async (fullName, email, cpf, birthDay, password) => {
    console.log(await User.isThisCpfInUse(cpf))
    // Procura um usuário com email igual ao definido
    if (!(await User.isThisEmailInUse(email))) return { success: false, menssagem: "Email já existente"}
    
    // Procura um usuário com CPF igual ao definido
    if (!(await User.isThisCpfInUse(cpf))) return { success: false, menssagem: "CPF já existente"} 


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

module.exports = { serviceLogin, serviceRegister }