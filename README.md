# Sistema Bancário API

Uma API RESTful para um sistema bancário desenvolvida em TypeScript com Express.js e Sequelize.

## 🚀 Tecnologias

- Node.js
- TypeScript
- Express.js
- Sequelize (ORM)
- MySQL
- Redis (para sessões e cache)
- Nodemailer (para envio de emails)
- Express Validator (para validação de dados)
- Bcrypt (para criptografia de senhas)

## 📋 Pré-requisitos

- Node.js (versão 14 ou superior)
- MySQL
- Redis
- NPM ou Yarn

## 🔧 Instalação

1. Clone o repositório:
```bash
git clone [URL_DO_REPOSITORIO]
```

2. Instale as dependências:
```bash
npm install
# ou
yarn install
```

3. Configure as variáveis de ambiente:
Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:
```env
SECRET_PASS_SESSION=sua_chave_secreta
EMAIL_NODEMAILER=seu_email@gmail.com
PASS_NODEMAILER=sua_senha_de_app
MAIL_USER=seu_email@gmail.com
```

4. Configure o banco de dados:
- Crie um banco de dados MySQL chamado `banco_financeiro`
- As tabelas serão criadas automaticamente pelo Sequelize

5. Inicie o servidor:
```bash
npm start
# ou
yarn start
```

## 📚 Endpoints

### Autenticação (`/api/v1/auth`)

#### POST /register
Registra um novo usuário no sistema.

**Request Body:**
```json
{
  "usuario": {
    "email": "usuario@exemplo.com",
    "full_name": "João da Silva",
    "password": "Senha@123",
    "confirm_password": "Senha@123",
    "telefone": "11 91234-5678",
    "cpf": "12345678901"
  },
  "endereco": {
    "rua": "Rua Exemplo",
    "numero": 123,
    "cidade": "São Paulo",
    "estado": "SP"
  },
  "conta": {
    "tipo_conta": "corrente",
    "password": "123456",
    "confirm_password": "123456"
  }
}
```

**Response (201 Created):**
```json
{
  "status": "success",
  "statusCode": 201,
  "msg": "Sucesso ao se cadastrar no banco!"
}
```

#### POST /login
Realiza login no sistema.

**Request Body:**
```json
{
  "cpf": "12345678901",
  "password": "Senha@123"
}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "statusCode": 200,
  "msg": "Sucesso fazer login no banco!",
  "usuario": {
    "id_usuario": 1,
    "full_name": "João da Silva",
    "email": "usuario@exemplo.com",
    "telefone": "11 91234-5678",
    "cpf": "12345678901",
    "is_inactive": false,
    "is_admin": false,
    "endereco": {
      "rua": "Rua Exemplo",
      "numero": 123,
      "cidade": "São Paulo",
      "estado": "SP"
    },
    "conta_bancaria": {
      "id_conta": 1,
      "tipo_conta": "corrente",
      "saldo": 0.00,
      "status_conta": "ativa"
    }
  }
}
```

#### GET /email-in-use
Verifica se um email já está em uso.

**Request Body:**
```json
{
  "email": "usuario@exemplo.com"
}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "statusCode": 200,
  "msg": "Email não está em uso."
}
```

#### GET /cpf-in-use
Verifica se um CPF já está em uso.

**Request Body:**
```json
{
  "cpf": "12345678901"
}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "statusCode": 200,
  "msg": "CPF não está em uso."
}
```

#### GET /send-code-verification
Envia código de verificação por email.

**Request Body:**
```json
{
  "email": "usuario@exemplo.com"
}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "statusCode": 200,
  "msg": "Código de verificação enviado com sucesso"
}
```

#### POST /verify-code
Verifica o código enviado por email.

**Request Body:**
```json
{
  "email": "usuario@exemplo.com",
  "code": "123456"
}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "statusCode": 200,
  "msg": "Código verificado com sucesso"
}
```

#### PATCH /reset-password
Redefine a senha do usuário.

**Request Body:**
```json
{
  "email": "usuario@exemplo.com",
  "password": "NovaSenha@123",
  "confirm_password": "NovaSenha@123"
}
```

**Response (201 Created):**
```json
{
  "status": "success",
  "statusCode": 201,
  "msg": "Senha redefinida com sucesso"
}
```

### Usuário (`/api/v1/usuario`)

#### GET /
Obtém dados do usuário logado.

**Response (200 OK):**
```json
{
  "status": "success",
  "statusCode": 200,
  "msg": "Usuário encontrado.",
  "usuario": {
    "id_usuario": 1,
    "full_name": "João da Silva",
    "email": "usuario@exemplo.com",
    "telefone": "11 91234-5678",
    "cpf": "12345678901",
    "is_inactive": false,
    "is_admin": false,
    "endereco": {
      "rua": "Rua Exemplo",
      "numero": 123,
      "cidade": "São Paulo",
      "estado": "SP"
    },
    "conta_bancaria": {
      "id_conta": 1,
      "tipo_conta": "corrente",
      "saldo": 1000.00,
      "status_conta": "ativa"
    }
  }
}
```

#### PATCH /email
Atualiza email do usuário.

**Request Body:**
```json
{
  "email": "novoemail@exemplo.com"
}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "statusCode": 200,
  "msg": "Email atualizado com sucesso"
}
```

#### PATCH /password-login
Atualiza senha do usuário.

**Request Body:**
```json
{
  "oldPassword": "SenhaAntiga@123",
  "newPassword": "NovaSenha@123",
  "confirm_newPassword": "NovaSenha@123"
}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "statusCode": 200,
  "msg": "Senha atualizada com sucesso"
}
```

#### PATCH /password-conta
Atualiza senha da conta(senha de 6 digitos, usada para validar trnasações).

**Request Body:**
```json
{
  "oldPassword": "SenhaAntiga@123",
  "newPassword": "NovaSenha@123",
  "confirm_newPassword": "NovaSenha@123"
}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "statusCode": 200,
  "msg": "Senha atualizada com sucesso"
}
```

#### PATCH /telefone
Atualiza telefone do usuário.

**Request Body:**
```json
{
  "telefone": "11 98765-4321"
}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "statusCode": 200,
  "msg": "Telefone atualizado com sucesso"
}
```

#### PATCH /endereco
Atualiza endereço do usuário.

**Request Body:**
```json
{
  "field": "rua",
  "value": "Nova Rua"
}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "statusCode": 200,
  "msg": "Sucesso ao atualizar rua!"
}
```

#### GET /verify-session
Verifica se a sessão está ativa.

**Response (200 OK):**
```json
{
  "status": "success",
  "statusCode": 200,
  "msg": "Usuário autentificado"
}
```

#### DELETE /logout
Realiza logout.

**Response (200 OK):**
```json
{
  "status": "success",
  "statusCode": 200,
  "msg": "Usuário desautentificado"
}
```

### Transações (`/api/v1/transacao`)

#### POST /
Realiza transferência de dinheiro.

**Request Body:**
```json
{
  "password": "123456",
  "value": 100.50,
  "cpf_destinatario": "98765432109",
  "descricao": "Transferência para amigo"
}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "statusCode": 200,
  "msg": "Saldo enviado com sucesso"
}
```

#### GET /
Lista todas as transações do usuário.

**Response (200 OK):**
```json
{
  "status": "success",
  "statusCode": 200,
  "msg": "Transações coletadas com sucesso",
  "data": {
    "transacoesEnviadas": [
      {
        "id_transacao": 1,
        "valor": 100.50,
        "tipo": "transferência",
        "descricao": "Transferência para amigo",
        "status": "aprovada",
        "conta_destino": {
          "id_conta": 2,
          "tipo_conta": "corrente"
        }
      }
    ],
    "transacoesRecebidas": [
      {
        "id_transacao": 2,
        "valor": 200.75,
        "tipo": "transferência",
        "descricao": "Pagamento de serviço",
        "status": "aprovada",
        "conta_origem": {
          "id_conta": 3,
          "tipo_conta": "poupanca"
        }
      }
    ]
  }
}
```

#### GET /:id_transacao
Obtém detalhes de uma transação específica.

**Response (200 OK):**
```json
{
  "status": "success",
  "statusCode": 200,
  "msg": "Transacao buscada com sucesso",
  "data": {
    "transacao": {
      "id_transacao": 1,
      "valor": 100.50,
      "tipo": "transferência",
      "descricao": "Transferência para amigo",
      "status": "aprovada",
      "conta_origem": {
        "id_conta": 1,
        "tipo_conta": "corrente"
      },
      "conta_destino": {
        "id_conta": 2,
        "tipo_conta": "corrente"
      }
    },
    "usuario_origem": {
      "full_name": "João da Silva",
      "email": "usuario@exemplo.com",
      "telefone": "11 91234-5678"
    },
    "usuario_destino": {
      "full_name": "Maria Oliveira",
      "email": "maria@exemplo.com",
      "telefone": "11 98765-4321"
    }
  }
}
```

### Pagamentos (`/api/v1/pagamento`)

#### POST /
Cria um novo pagamento pendente.

**Request Body:**
```json
{
  "valor": 150.75
}
```

**Response (201 Created):**
```json
{
  "status": "success",
  "statusCode": 201,
  "msg": "Pagamento criado com sucesso",
  "pagamento": {
    "id_pagamento": 1,
    "valor": 150.75,
    "chave_pagamento": "a1b2c3d4e5f6g7h8i9j0",
    "status_pagamento": "pendente",
    "id_conta_destino": 1
  }
}
```

#### GET /:chave_pagamento
Obtém detalhes de um pagamento específico.

**Response (200 OK):**
```json
{
  "status": "success",
  "statusCode": 200,
  "msg": "Pagamento encontrado com sucesso",
  "pagamento": {
    "id_pagamento": 1,
    "valor": 150.75,
    "chave_pagamento": "a1b2c3d4e5f6g7h8i9j0",
    "status_pagamento": "pendente",
    "id_conta_destino": 1
  },
  "conta_cobrador": {
    "id_conta": 1,
    "tipo_conta": "corrente",
    "status_conta": "ativa",
    "usuario": {
      "full_name": "João da Silva",
      "email": "usuario@exemplo.com"
    }
  }
}
```

#### POST /pay
Realiza o pagamento de uma cobrança pendente.

**Request Body:**
```json
{
  "password": "123456",
  "chave_pagamento": "a1b2c3d4e5f6g7h8i9j0"
}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "statusCode": 200,
  "msg": "Pagamento realizado com sucesso"
}
```

#### DELETE /:chave_pagamento
Cancela um pagamento pendente.

**Response (200 OK):**
```json
{
  "status": "success",
  "statusCode": 200,
  "msg": "Pagamento cancelado com sucesso"
}
```

## 🔒 Validações

### Registro de Usuário
- Email válido
- Nome completo obrigatório
- Senha com 8-16 caracteres, incluindo maiúsculas, minúsculas, números e caracteres especiais
- Confirmação de senha
- Telefone no formato XX 9XXXX-XXXX
- CPF com 11 dígitos
- Endereço completo (rua, número, cidade, estado)
- Tipo de conta (corrente ou poupança)
- Senha da conta com 6 dígitos numéricos

### Login
- Email válido
- Senha válida

### Transferência
- Senha da conta válida
- Valor numérico
- CPF do destinatário válido

### Pagamentos
- Valor deve ser numérico
- Senha da conta com 6 dígitos numéricos
- Chave de pagamento válida
- Status do pagamento (pendente, rejeitada, aceita, cancelada)

## 🛠️ Estrutura do Projeto

```
├── config/
│   └── database.ts
├── controllers/
│   ├── AuthController.ts
│   ├── TransacaoController.ts
│   └── UsuarioController.ts
├── middlewares/
│   ├── AuthValidatorData.ts
│   ├── MyValidatorResult.ts
│   ├── TransacaoValidatorData.ts
│   └── UsuarioValidatorData.ts
├── models/
│   ├── associacoes.ts
│   ├── ContaModel.ts
│   ├── EnderecoModel.ts
│   ├── index.ts
│   ├── TransacaoModel.ts
│   └── UsuarioModel.ts
├── routes/
│   ├── AuthRoutes.ts
│   ├── TransacaoRoutes.ts
│   └── UsuarioRoutes.ts
├── services/
│   ├── AuthService.ts
│   ├── TransacaoService.ts
│   └── UsuarioServices.ts
├── types/
│   └── expressSessionType.ts
├── utils/
│   └── sendEmail.ts
├── .env
├── index.ts
└── package.json
```

## 🔐 Segurança

- Senhas criptografadas com bcrypt
- Sessões gerenciadas com Redis
- Validação de dados com express-validator
- Verificação de email para registro e recuperação de senha
- Proteção contra SQL Injection através do Sequelize
- Validação de CPF e telefone

## 📧 Envio de Emails

O sistema utiliza o Nodemailer para enviar:
- Códigos de verificação
- Notificações de transações
- Recuperação de senha

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request
