# Sistema Bancário API

A API do **Sistema Bancário** permite a realização de transações entre usuários, com funcionalidades como: autenticação, registro de usuário, consulta de transações realizadas e envio de valores entre contas, simulação de compra de cripto moedas com valores convertidos em tempo real, login com dados biométricos.

## Tecnologias

- **Node.js**: Ambiente de execução JavaScript do lado do servidor.
- **Express.js**: Framework web para Node.js.
- **MongoDB**: Banco de dados NoSQL.
- **Mongoose**: ODM para MongoDB.
- **JWT**: Para autenticação e autorização.

---

## Endpoints

### **Autenticação**

- **POST** `/api/profile/sign-in`
  - **Descrição**: Realiza o login de um usuário.
  - **Body**:
    ```json
    {
      "email": "usuario@exemplo.com",
      "senha": "senha123"
    }
    ```
  - **Resposta**: Retorna um token JWT.
  
- **POST** `/api/profile/sign-up`
  - **Descrição**: Realiza o cadastro de um novo usuário.
  - **Body**:
    ```json
    {
      "fullName": "João Silva",
      "email": "joao.silva@exemplo.com",
      "senha": "senha123",
      "confirmPassword": "senha123",
      "cpf": "12345678901",
      "code": 000000
    }
    ```
  - **Resposta**: Confirmação de cadastro com status 201.

- **POST** `/api/profile/verification-auth`
  - **Descrição**: Verifica a validade do token JWT.
  - **Cabeçalho**: `Authorization: Bearer {token}`
  - **Resposta**: Status 200 se o token for válido.

### **Usuários**

- **POST** `/api/profile/send-code-verification`
  - **Descrição**: Envia um código de verificação para o e-mail do usuário.
  - **Body**:
    ```json
    {
      "email": "usuario@exemplo.com"
    }
    ```
  - **Resposta**: Código de verificação enviado.

- **POST** `/api/profile/email-not-in-use`
  - **Descrição**: Verifica se um e-mail já está sendo usado.
  - **Body**:
    ```json
    {
      "email": "usuario@exemplo.com"
    }
    ```
  - **Resposta**: Status indicando se o e-mail está em uso.

- **PATCH** `/api/profile/update-password`
  - **Cabeçalho**: `Authorization: Bearer {token}`
  - **Descrição**: Altera a senha de acesso do usuário.
  - **Body**:
    ```json
    {
      "password": "password123",
      "confirmPassword": "password123",
      "code": 000000
    }
    ```
  - **Resposta**: Satus 200 se a troca de senha foi realizada com sucesso.

- **PATCH** `/api/profile/update-email`
  - **Cabeçalho**: `Authorization: Bearer {token}`
  - **Descrição**: Altera o email do usuário.
  - **Body**:
    ```json
    {
      "email": "example@example.com",
      "code": 000000
    }
    ```
  - **Resposta**: Satus 200 se a troca de email foi realizada com sucesso.

- **POST** `/api/profile/cpf-not-in-use`
  - **Descrição**: Verifica se um CPF já está cadastrado.
  - **Body**:
    ```json
    {
      "cpf": "123.456.789-01"
    }
    ```
  - **Resposta**: Status indicando se o CPF está em uso.

### **Transações**

- **POST** `/api/transactions/transfer`
  - **Descrição**: Realiza uma transação de valor entre dois usuários.
  - **Cabeçalho**: `Authorization: Bearer {token}`
  - **Body**:
    ```json
    {
      "cpfDestino": "98765432100",
      "valor": 150.00,
      "mensagem": "Pagamento de serviço"
    }
    ```
  - **Resposta**: Status da transação (sucesso ou falha).

- **GET** `/api/transactions/history`
  - **Descrição**: Retorna o histórico de transações realizadas pelo usuário autenticado.
  - **Cabeçalho**: `Authorization: Bearer {token}`
  - **Resposta**: Lista de transações enviadas e recebidas.

- **GET** `/api/transactions/{idTransacao}`
  - **Descrição**: Retorna detalhes de uma transação específica.
  - **Cabeçalho**: `Authorization: Bearer {token}`
  - **Resposta**: Detalhes da transação.

- **POST** `/api/transactions/deposit`
  - **Descrição**: Realiza um deposito em sua conta bancária.
  - **Cabeçalho**: `Authorization: Bearer {token}`
  - **Resposta**: Status de sucesso ou falha na requisição de depósito.
  ```json
    {
      "valor": 150.00,
    }
    ```

- **POST** `/api/transactions/withdraw`
  - **Descrição**: Realiza um saque em sua conta bancária.
  - **Cabeçalho**: `Authorization: Bearer {token}`
  - **Resposta**: Status de sucesso ou falha na requisição de saque.
  ```json
    {
      "valor": 150.00,
    }
    ```
---

## Como Usar

### **Passo 1: Clone o Repositório**

Clone o repositório para o seu ambiente local:

```bash
git clone https://github.com/seu-usuario/api-sistema-bancario.git
cd api-sistema-bancario
```

### **Passo 2: Instale as Dependências**

Instale as dependências necessárias com o NPM:

```bash
npm install
```

### **Passo 3: Configuração do Banco de Dados**

Certifique-se de ter o **MongoDB** em execução ou utilize um banco de dados remoto (como o MongoDB Atlas). Em seguida, defina a URL do banco no arquivo `.env`:

```
MONGODB_URI=mongodb://localhost:27017/sistema-bancario
JWT_SECRET=sua-chave-secreta

NODE_MAILER_PASS=sua-chave-de-aplicação
NODE_MAILER_EMAIL=example@example.com
```

### **Passo 4: Inicie o Servidor**

Inicie o servidor com o comando:

```bash
npm start
```

O servidor estará disponível em `http://localhost:3000`.

---

## Exemplos de Uso com Postman

1. **Login:**

   **POST** `http://localhost:3000/api/profile/sign-in`
   ```json
   {
     "email": "usuario@exemplo.com",
     "senha": "senha123"
   }
   ```
   **Resposta**:
   ```json
   {
     "success": true,
     "statusCode": 200,
     "message": "Login realizado com sucesso",
     "token": "JWT_TOKEN_AQUI"
   }
   ```

2. **Registrar Usuário:**

   **POST** `http://localhost:3000/api/profile/sign-up`
   ```json
   {
      "fullName": "João Silva",
      "email": "joao.silva@exemplo.com",
      "senha": "senha123",
      "confirmSenha": "senha123",
      "cpf": "12345678901",
      "code": 000000
    }
   ```
   **Resposta**:
   ```json
   {
     "success": true,
     "statusCode": 201,
     "message": "Usuário registrado com sucesso"
   }
   ```

3. **Realizar Transação:**

   **POST** `http://localhost:3000/api/transactions/transfer`
   - **Cabeçalho**: `Authorization: Bearer {JWT_TOKEN}`
   - **Body**:
   ```json
   {
     "cpfDestino": "98765432100",
     "valor": 150.00,
     "mensagem": "Pagamento de serviço"
   }
   ```
   **Resposta**:
   ```json
   {
     "success": true,
     "statusCode": 200,
     "message": "Transação realizada com sucesso"
   }
   ```

---

