-- Active: 1743824447804@@127.0.0.1@3306@test

drop database banco_financeiro

Create database banco_financeiro;

use banco_financeiro;

Create Table usuario (
    id_usuario int primary key auto_increment,
    full_name varchar(100) not null,
    password varchar(100) not null unique,
    cpf char(11) not null unique,
    email varchar(100) not null unique,
    telefone varchar(14) not null unique,
    is_inactive BOOLEAN DEFAULT false,
    is_admin BOOLEAN DEFAULT false
);

ALTER TABLE usuario
ADD COLUMN createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;


Create table endereco (
    id_endereco int PRIMARY KEY AUTO_INCREMENT,
    rua varchar(120),
    numero int,
    cidade varchar(50),
    estado varchar(20),
    id_usuario int not null,
    FOREIGN KEY (id_usuario) REFERENCES usuario (id_usuario)
);

ALTER TABLE endereco
ADD COLUMN createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

drop table if exists usuario,
conta_bancaria,
agencia,
emprestimo,
instituicao,
transacao,
cartao,
fatura,
investimento,
extrato,
cofrinho;

Create Table conta_bancaria (
    id_conta int primary key auto_increment,
    id_usuario int not null, -- chave estrangeira da tabela usuario
    password char(6) not null,
    tipo_conta ENUM("corrente", "poupanca") not null, -- serve pra ver se é conta corrente ou poupança
    saldo decimal(13, 2) default 0.0,
    status_conta ENUM(
        "bloqueada",
        "fechada",
        "ativa"
    ) DEFAULT "ativa", -- tipo bloqueada, fechada, ativa. Por que assim os cara pode fazer o cara pagar multa ou não
    FOREIGN KEY (id_usuario) REFERENCES usuario (id_usuario)
);

ALTER TABLE conta_bancaria
ADD COLUMN createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

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

Create Table instituicao (
    id_instituicao int primary key auto_increment,
    nome varchar(100) not null,
    codigo_banco int not null unique,
    tipo_instituicao varchar(50),
    email varchar(100),
    tipo_servicos varchar(100)
);

Create Table transacao (
    id_transacao int primary key auto_increment,
    id_conta_origem int not null,
    id_conta_destino int not null,
    tipo varchar(50) not null,
    valor decimal(10, 2) NOT NULL,
    descricao TEXT,
    status ENUM("cancelada", "aprovada") DEFAULT "aprovada",
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    Foreign key (id_conta_origem) references conta_bancaria (id_conta)
    Foreign key (id_conta_destino) references conta_bancaria (id_conta)
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

update usuario set email = "ederhenriquevicentejust963@gmail.com" where id_usuario = 1;
SELECT id_usuario, cpf, nome, email, telefone, hash_password_login FROM usuario WHERE email = "ederh@gmail.com"