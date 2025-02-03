Sistema Bancário API
A API do Sistema Bancário permite a realização de transações entre usuários, com funcionalidades como: autenticação, registro de usuário, consulta de transações realizadas e envio de valores entre contas.

Tecnologias
Node.js: Ambiente de execução JavaScript do lado do servidor.
Express.js: Framework web para Node.js.
MongoDB: Banco de dados NoSQL.
Mongoose: ODM para MongoDB.
JWT: Para autenticação e autorização.
Endpoints
Autenticação
POST /sign-in

Descrição: Realiza o login de um usuário.
Body:
json
Copiar
Editar
{
  "email": "usuario@exemplo.com",
  "senha": "senha123"
}
Resposta: Retorna um token JWT.
POST /sign-up

Descrição: Realiza o cadastro de um novo usuário.
Body:
json
Copiar
Editar
{
  "nome": "João Silva",
  "email": "joao.silva@exemplo.com",
  "senha": "senha123",
  "cpf": "12345678901"
}
Resposta: Confirmação de cadastro com status 201.
POST /verification-auth

Descrição: Verifica a validade do token JWT.
Cabeçalho: Authorization: Bearer {token}
Resposta: Status 200 se o token for válido.
Usuários
POST /send-code-verification

Descrição: Envia um código de verificação para o e-mail do usuário.
Body:
json
Copiar
Editar
{
  "email": "usuario@exemplo.com"
}
Resposta: Código de verificação enviado.
POST /email-not-in-use

Descrição: Verifica se um e-mail já está sendo usado.
Body:
json
Copiar
Editar
{
  "email": "usuario@exemplo.com"
}
Resposta: Status indicando se o e-mail está em uso.
POST /cpf-not-in-use

Descrição: Verifica se um CPF já está cadastrado.
Body:
json
Copiar
Editar
{
  "cpf": "12345678901"
}
Resposta: Status indicando se o CPF está em uso.
Transações
POST /set-transacao

Descrição: Realiza uma transação de valor entre dois usuários.
Cabeçalho: Authorization: Bearer {token}
Body:
json
Copiar
Editar
{
  "cpfDestino": "98765432100",
  "valor": 150.00,
  "mensagem": "Pagamento de serviço"
}
Resposta: Status da transação (sucesso ou falha).
GET /get-all-transacao

Descrição: Retorna todas as transações realizadas pelo usuário autenticado.
Cabeçalho: Authorization: Bearer {token}
Resposta: Lista de transações enviadas e recebidas.
GET /get-transacao/{idTransacao}

Descrição: Retorna detalhes de uma transação específica.
Cabeçalho: Authorization: Bearer {token}
Resposta: Detalhes da transação.
Como Usar
Passo 1: Clone o Repositório
Clone o repositório para o seu ambiente local:

bash
Copiar
Editar
git clone https://github.com/seu-usuario/api-sistema-bancario.git
cd api-sistema-bancario
Passo 2: Instale as Dependências
Instale as dependências necessárias com o NPM:

bash
Copiar
Editar
npm install
Passo 3: Configuração do Banco de Dados
Certifique-se de ter o MongoDB em execução ou utilize um banco de dados remoto (como o MongoDB Atlas). Em seguida, defina a URL do banco no arquivo .env:

ini
Copiar
Editar
MONGODB_URI=mongodb://localhost:27017/sistema-bancario
JWT_SECRET=sua-chave-secreta
Passo 4: Inicie o Servidor
Inicie o servidor com o comando:

bash
Copiar
Editar
npm start
O servidor estará disponível em http://localhost:3000.

Exemplos de Uso com Postman
Login:

POST http://localhost:3000/sign-in

json
Copiar
Editar
{
  "email": "usuario@exemplo.com",
  "senha": "senha123"
}
Resposta:

json
Copiar
Editar
{
  "success": true,
  "statusCode": 200,
  "message": "Login realizado com sucesso",
  "token": "JWT_TOKEN_AQUI"
}
Registrar Usuário:

POST http://localhost:3000/sign-up

json
Copiar
Editar
{
  "nome": "João Silva",
  "email": "joao.silva@exemplo.com",
  "senha": "senha123",
  "cpf": "12345678901"
}
Resposta:

json
Copiar
Editar
{
  "success": true,
  "statusCode": 201,
  "message": "Usuário registrado com sucesso"
}
Realizar Transação:

POST http://localhost:3000/set-transacao

Cabeçalho: Authorization: Bearer {JWT_TOKEN}
Body:
json
Copiar
Editar
{
  "cpfDestino": "98765432100",
  "valor": 150.00,
  "mensagem": "Pagamento de serviço"
}
Resposta:

json
Copiar
Editar
{
  "success": true,
  "statusCode": 200,
  "message": "Transação realizada com sucesso"
}
