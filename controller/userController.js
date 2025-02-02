const UserService = require('../service/userService');

const userLogin = async (req, res) => {
    const { email, password } = req.body;

    const response = await UserService.serviceLogin(email, password);

    res.status(response.statusCode).json(response)
}

const userRegister = async (req, res) => {
    const { fullName, email, cpf, birthDay, password, code } = req.body; 

    const response = await UserService.serviceRegister(fullName, email, cpf, birthDay, password, code);

    res.status(response.statusCode).json(response)
}

const sendCodeVerification = async (req, res) => {
    console.log('ola')
    const { email } = req.body;
    
    const response = await UserService.serviceSendCodeVerification(email);
    
    res.status(response.statusCode).json(response)
}

const emailNotInUse = async (req, res) => {
    const { email } = req.body;

    const response = await UserService.emailInNotUseService(email);

    res.status(response.statusCode).json(response)
}

const cpfNotInUse = async (req, res) => {
    const { cpf } = req.body;

    const response = await UserService.cpfInNotUseService(cpf);

    res.status(response.statusCode).json(response)
}

module.exports = { userLogin, userRegister, sendCodeVerification, emailNotInUse, cpfNotInUse };