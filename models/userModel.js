const mongoose = require("mongoose");
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    cpf: {
        type: String,
        required: true,
    },
    saldo: {
        type: Double,
        default: 0,
        required: false
    },
    birthDay: {
        type: Date,
        required: true
    },
    password: {
        type: String,
        required: true
    }
});

// Método de instância para comparar senhas
userSchema.methods.comparePassword = async function(password) {
    if (!password) throw new Error('Password is missing, cannot compare!');
    
    try {
        const result = await bcrypt.compare(password, this.password); // Comparando a senha fornecida com a hash armazenada
        return result;
    } catch (error) {
        return false;
    }
}

// Método estático para verificar se o CPF está em uso
userSchema.statics.isThisCpfInUse = async function(cpf) {
    try {
        const user = await this.findOne({ cpf }); // 'this' refere-se ao modelo aqui
        if (user) return false; // CPF já está em uso
        return true; // CPF disponível
    } catch (error) {
        return false; // Se houver erro, CPF não está em uso
    }
}

// Método estático para verificar se o Email está em uso
userSchema.statics.isThisEmailInUse = async function(email) {
    try {
        const user = await this.findOne({ email }); // 'this' refere-se ao modelo aqui
        if (user) return false; // Email já está em uso
        return true; // Email disponível
    } catch (error) {
        console.log(error);
        return false; // Se houver erro, o email não está em uso
    }
}

// Hash da senha antes de salvar o usuário
userSchema.pre('save', async function(next) {
    try {
        if (this.isModified('password')) {  // Verifica se a senha foi modificada
            this.password = await bcrypt.hash(this.password, 10); // 10 é o saltRounds
        }
        next(); // Chama a próxima função
    } catch (error) {
        next(error); // Passa o erro para o próximo middleware
    }
});

// Exporta o modelo de Usuário
module.exports = mongoose.model('User', userSchema); 
