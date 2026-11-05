-- ========================================================================
-- PROYECTO: CUIBOT – Asistente Web para el Control de la Diabetes
-- ARCHIVO: 01_schema_cuibot.sql
-- MOTOR: MySQL 8.0+ (Oracle) | ENGINE: InnoDB | CHARSET: utf8mb4
-- EQUIPO: C-LIFE (Scrum Master: Ian Marriaga)
-- ========================================================================

-- 1. Creación y selección de la base de datos
CREATE DATABASE IF NOT EXISTS cuibot_db
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE cuibot_db;

-- 2. Eliminación de tablas en orden inverso de dependencias (para evitar errores de FK)
DROP TABLE IF EXISTS Registro_Toma;
DROP TABLE IF EXISTS Recordatorio;
DROP TABLE IF EXISTS Medicamento;
DROP TABLE IF EXISTS Actividad;
DROP TABLE IF EXISTS Alimentacion;
DROP TABLE IF EXISTS Menu_Recomendado;
DROP TABLE IF EXISTS Usuario;

-- ------------------------------------------------------------------------
-- TABLA 1: Usuario
-- ------------------------------------------------------------------------
CREATE TABLE Usuario (
    id_usuario INT AUTO_INCREMENT NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    correo VARCHAR(100) NOT NULL,
    contrasena VARCHAR(255) NOT NULL,
    tipo_diabetes VARCHAR(50) NULL,
    rol VARCHAR(20) NOT NULL DEFAULT 'paciente',
    CONSTRAINT pk_usuario PRIMARY KEY (id_usuario),
    CONSTRAINT uq_usuario_correo UNIQUE (correo),
    CONSTRAINT chk_usuario_rol CHECK (rol IN ('paciente', 'administrador')),
    CONSTRAINT chk_usuario_diabetes CHECK (tipo_diabetes IS NULL OR tipo_diabetes IN ('Tipo 1', 'Tipo 2', 'Gestacional', 'Otro'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------
-- TABLA 2: Alimentacion
-- ------------------------------------------------------------------------
CREATE TABLE Alimentacion (
    id_alimento INT AUTO_INCREMENT NOT NULL,
    descripcion VARCHAR(255) NOT NULL,
    tipo_comida VARCHAR(30) NULL,
    fecha DATE NOT NULL,
    hora TIME NOT NULL,
    id_usuario INT NOT NULL,
    CONSTRAINT pk_alimentacion PRIMARY KEY (id_alimento),
    CONSTRAINT fk_alimentacion_usuario FOREIGN KEY (id_usuario) 
        REFERENCES Usuario(id_usuario) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT chk_tipo_comida CHECK (tipo_comida IS NULL OR tipo_comida IN ('Desayuno', 'Almuerzo', 'Cena', 'Merienda'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------
-- TABLA 3: Actividad
-- ------------------------------------------------------------------------
CREATE TABLE Actividad (
    id_actividad INT AUTO_INCREMENT NOT NULL,
    tipo VARCHAR(100) NOT NULL,
    duracion INT NOT NULL,
    fecha DATE NOT NULL,
    id_usuario INT NOT NULL,
    CONSTRAINT pk_actividad PRIMARY KEY (id_actividad),
    CONSTRAINT fk_actividad_usuario FOREIGN KEY (id_usuario) 
        REFERENCES Usuario(id_usuario) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT chk_actividad_duracion CHECK (duracion > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------
-- TABLA 4: Medicamento
-- ------------------------------------------------------------------------
CREATE TABLE Medicamento (
    id_medicamento INT AUTO_INCREMENT NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    dosis VARCHAR(100) NOT NULL,
    horario VARCHAR(50) NOT NULL,
    id_usuario INT NOT NULL,
    CONSTRAINT pk_medicamento PRIMARY KEY (id_medicamento),
    CONSTRAINT fk_medicamento_usuario FOREIGN KEY (id_usuario) 
        REFERENCES Usuario(id_usuario) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------
-- TABLA 5: Recordatorio
-- ------------------------------------------------------------------------
CREATE TABLE Recordatorio (
    id_recordatorio INT AUTO_INCREMENT NOT NULL,
    mensaje VARCHAR(255) NOT NULL,
    hora TIME NOT NULL,
    estado VARCHAR(10) NOT NULL DEFAULT 'activo',
    id_medicamento INT NOT NULL,
    CONSTRAINT pk_recordatorio PRIMARY KEY (id_recordatorio),
    CONSTRAINT fk_recordatorio_medicamento FOREIGN KEY (id_medicamento) 
        REFERENCES Medicamento(id_medicamento) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT chk_recordatorio_estado CHECK (estado IN ('activo', 'inactivo'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------
-- TABLA 6: Registro_Toma
-- ------------------------------------------------------------------------
CREATE TABLE Registro_Toma (
    id_toma INT AUTO_INCREMENT NOT NULL,
    fecha_hora DATETIME NOT NULL,
    confirmada BOOLEAN NOT NULL DEFAULT FALSE,
    id_medicamento INT NOT NULL,
    CONSTRAINT pk_registro_toma PRIMARY KEY (id_toma),
    CONSTRAINT fk_registro_toma_medicamento FOREIGN KEY (id_medicamento) 
        REFERENCES Medicamento(id_medicamento) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------
-- TABLA 7: Menu_Recomendado
-- ------------------------------------------------------------------------
CREATE TABLE Menu_Recomendado (
    id_menu INT AUTO_INCREMENT NOT NULL,
    tipo_diabetes VARCHAR(50) NOT NULL,
    momento VARCHAR(30) NOT NULL,
    descripcion VARCHAR(255) NOT NULL,
    CONSTRAINT pk_menu_recomendado PRIMARY KEY (id_menu),
    CONSTRAINT chk_menu_diabetes CHECK (tipo_diabetes IN ('Tipo 1', 'Tipo 2', 'Gestacional', 'General')),
    CONSTRAINT chk_menu_momento CHECK (momento IN ('Desayuno', 'Almuerzo', 'Cena', 'Merienda'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
