const UserService = require('../service/userService');

const updateEmail = async (req, res) => {
    const { email /* Email novo */, code } = req.body;
    const idUser = req.idUser;
    console.log(req.idUser)

    const response = await UserService.serviceUpdateEmail(idUser, email);

    res.status(response.statusCode).json(response)
}

const getUser = async (req, res) => {
    const idUser = req.idUser;

    const response = await UserService.serviceGetUser(idUser);

    res.status(response.statusCode).json(response)
}

const updatePassword = async (req, res) => {
    const { password } = req.body;
    const idUser = req.idUser;

    const response = await UserService.serviceUpdatePassword(idUser, password);

    res.status(response.statusCode).json(response);
 }

 const getUserWithoutSensitiveData = async (req, res) => {
    const { id } = req.params;

    // Chama o serviço para obter o usuário sem dados sensíveis
    const response = await UserService.serviceGetUserWithoutSensitiveData(id);

    res.status(response.statusCode).json(response);
}

module.exports = { updateEmail, getUser, updatePassword, getUserWithoutSensitiveData };