drop database banco_financeiro

Create database banco_financeiro;

use banco_financeiro;

CREATE TABLE usuario (
    id_usuario INT PRIMARY KEY AUTO_INCREMENT,
    full_name VARCHAR(100) NOT NULL,
    password VARCHAR(100) NOT NULL, -- Removi o UNIQUE (senhas podem coincidir, especialmente se forem hashes)
    cpf CHAR(11) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    telefone VARCHAR(14) NOT NULL UNIQUE,
    is_inactive BOOLEAN DEFAULT FALSE,
    is_admin BOOLEAN DEFAULT FALSE,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE endereco (
    id_endereco INT PRIMARY KEY AUTO_INCREMENT,
    rua VARCHAR(120),
    numero INT,
    cidade VARCHAR(50),
    uf CHAR(2),
    id_usuario INT NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES usuario (id_usuario)
);

CREATE TABLE conta_bancaria (
    id_conta INT PRIMARY KEY AUTO_INCREMENT,
    id_usuario INT NOT NULL,
    password CHAR(6) NOT NULL,
    tipo_conta ENUM('corrente', 'poupanca') NOT NULL,
    saldo DECIMAL(13, 2) DEFAULT 0.0,
    chave_transferencia VARCHAR(100) UNIQUE, -- você pode gerar isso no app e usar cpf/email etc
    status_conta ENUM(
        'bloqueada',
        'fechada',
        'ativa'
    ) DEFAULT 'ativa',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES usuario (id_usuario)
);

CREATE TABLE pagamento (
    id_pagamento INT PRIMARY KEY AUTO_INCREMENT,
    id_conta_destino INT NOT NULL,
    valor DECIMAL(10, 2) NOT NULL,
    status_pagamento ENUM(
        'pendente',
        'rejeitada',
        'aceita',
        'cancelada'
    ), -- troquei " por '
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    chave_pagamento VARCHAR(150) NOT NULL,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_conta_destino) REFERENCES conta_bancaria (id_conta)
);

CREATE TABLE transacao (
    id_transacao INT PRIMARY KEY AUTO_INCREMENT,
    id_conta_origem INT NOT NULL,
    id_conta_destino INT NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    valor DECIMAL(10, 2) NOT NULL,
    descricao TEXT,
    status ENUM('cancelada', 'aprovada') DEFAULT 'aprovada',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_conta_origem) REFERENCES conta_bancaria (id_conta),
    FOREIGN KEY (id_conta_destino) REFERENCES conta_bancaria (id_conta)
);

Create Table agencia (
    id_agencia int primary key auto_increment,
    numero int not null unique,
    nome_agencia varchar(50) not null,
    telefone char(20),
    email varchar(100) not null,
    cnpj char(14) not null unique
);

Create Table emprestimo (
    id_empréstimo int primary key auto_increment,
    valor double(13, 2) not null,
    juros double(6, 2),
    qtde_parcela int,
    data_emp date not null
);

Create Table cartao (
    id_cartao int primary key auto_increment,
    numero varchar(16) not null unique,
    titular varchar(100) not null,
    validade date not null,
    tipo varchar(50) not null,
    id_conta int not null, -- chave estrangeira
    Foreign key (id_conta) references conta_bancaria (id_conta)
);

Create Table fatura (
    id_fatura int primary key auto_increment,
    cartao_id int not null, -- chave estrangeira
    mes_fatura date not null,
    valor decimal(10, 2) not null,
    data_venc date not null
);

Create table investimento (
    id_invest int primary key auto_increment,
    id_usuario int not null,
    tipo varchar(100) not null,
    valor double not null,
    data_aplic date not null,
    data_venc date not null,
    montante decimal(5, 2),
    Foreign key (id_usuario) references usuario (id_usuario)
);

Create Table extrato (
    id_extrato int primary key auto_increment,
    id_conta int not null,
    data_hora datetime,
    descricao varchar(100) not null,
    tipo varchar(50) not null,
    Foreign key (id_conta) references conta_bancaria (id_conta)
);

Create Table cofrinho (
    id_cofre int primary key auto_increment,
    meta varchar(100) not null,
    dinheiro_econ double not null
);

select * from usuario, endereco;

update usuario
set
    email = "ederhenriquevicentejust963@gmail.com"
where
    id_usuario = 1;

SELECT
    id_usuario,
    cpf,
    nome,
    email,
    telefone,
    hash_password_login
FROM usuario
WHERE
    email = "ederh@gmail.com"