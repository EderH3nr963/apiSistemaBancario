const UserService = require('../service/userService');

const userLogin = async (req, res) => {
    const { email, password } = req.body;

    const response = await UserService.serviceLogin(email, password);

    res.json(response);
}

const userRegister = async (req, res) => {
    const { fullName, email, cpf, birthDay, password } = req.body; 

    const response = await UserService.serviceRegister(fullName, email, cpf, birthDay, password);

    res.json(response);
}

module.exports = { userLogin, userRegister };