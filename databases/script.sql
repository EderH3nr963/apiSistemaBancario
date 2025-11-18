-- SQLite database setup

CREATE TABLE usuario (
    id_usuario INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name TEXT NOT NULL,
    password TEXT NOT NULL,
    cpf TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    telefone TEXT NOT NULL UNIQUE,
    is_inactive INTEGER DEFAULT 0,
    is_admin INTEGER DEFAULT 0,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE endereco (
    id_endereco INTEGER PRIMARY KEY AUTOINCREMENT,
    rua TEXT,
    numero INTEGER,
    cidade TEXT,
    uf TEXT,
    id_usuario INTEGER NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES usuario (id_usuario)
);

CREATE TABLE conta_bancaria (
    id_conta INTEGER PRIMARY KEY AUTOINCREMENT,
    id_usuario INTEGER NOT NULL,
    password TEXT NOT NULL,
    tipo_conta TEXT NOT NULL CHECK (tipo_conta IN ('corrente', 'poupanca')),
    saldo REAL DEFAULT 0.0,
    chave_transferencia TEXT UNIQUE,
    status_conta TEXT DEFAULT 'ativa' CHECK (status_conta IN ('bloqueada', 'fechada', 'ativa')),
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES usuario (id_usuario)
);

CREATE TABLE pagamento (
    id_pagamento INTEGER PRIMARY KEY AUTOINCREMENT,
    id_conta_destino INTEGER NOT NULL,
    valor REAL NOT NULL,
    status_pagamento TEXT CHECK (status_pagamento IN ('pendente', 'rejeitada', 'aceita', 'cancelada')),
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    chave_pagamento TEXT NOT NULL,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_conta_destino) REFERENCES conta_bancaria (id_conta)
);

CREATE TABLE transacao (
    id_transacao INTEGER PRIMARY KEY AUTOINCREMENT,
    id_conta_origem INTEGER NOT NULL,
    id_conta_destino INTEGER NOT NULL,
    tipo TEXT NOT NULL,
    valor REAL NOT NULL,
    descricao TEXT,
    status TEXT DEFAULT 'aprovada' CHECK (status IN ('cancelada', 'aprovada')),
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
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

-- Insert test data
INSERT INTO usuario (full_name, password, cpf, email, telefone) VALUES
('João Silva', '$2b$10$examplehash1', '12345678901', 'joao@email.com', '11987654321'),
('Maria Oliveira', '$2b$10$examplehash2', '98765432109', 'maria@email.com', '11987654322');

INSERT INTO endereco (rua, numero, cidade, uf, id_usuario) VALUES
('Rua A', 123, 'São Paulo', 'SP', 1),
('Rua B', 456, 'Rio de Janeiro', 'RJ', 2);

INSERT INTO conta_bancaria (id_usuario, password, tipo_conta, saldo) VALUES
(1, '123456', 'corrente', 1000.00),
(2, '654321', 'corrente', 500.00);

INSERT INTO transacao (id_conta_origem, id_conta_destino, tipo, valor, descricao) VALUES
(1, 2, 'transferência', 100.00, 'Teste transferência');