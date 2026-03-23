CREATE TABLE Usuarios (
    id_usuario INTERGER PRIMARY KEY AUTOINCREMENT,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    SenhaHash VARCHAR(255) NOT NULL,
    DataCriacao DATETIME DEFAULT CURRENTTIMESTAMP
);

CREATE TABLE Grupos (
    id_grupo INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(255) NOT NULL,
    DataInicio DATETIME DEFAULT CURRENT_TIMESTAMP,
    DataFim DATETIME,
    status VARCHAR(20) NOT NULL,
    id_usuario INT,
    FOREIGN KEY (id_usuario) REFERENCES Usuarios(id_usuario)
);

CREATE TABLE Grupos_Usuarios (
    id_grupo INT,
    id_usuario INT,
    PRIMARY KEY (id_grupo, id_usuario),
    FOREIGN KEY id_usuario REFERENCES Usuarios(id_usuario),
    FOREIGN KEY id_grupo REFERENCES Grupos(id_grupo)
);

CREATE TABLE Leituras (
    id_leitura INT PRIMARY KEY AUTO_INCREMENT,
    id_usuario INT,
    id_grupo INT,
    titulo_livro VARCHAR(255) NOT NULL,
    paginas_lidas INT NOT NULL,
    data_leitura DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES Usuarios(id_usuario),
    FOREIGN KEY (id_grupo) REFERENCES Grupos(id_grupo)
);

