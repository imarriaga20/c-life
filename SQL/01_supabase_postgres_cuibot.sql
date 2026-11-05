-- ========================================================================
-- PROYECTO: CUIBOT – Asistente Web para el Control de la Diabetes
-- ARCHIVO: 01_supabase_postgres_cuibot.sql
-- MOTOR: PostgreSQL 15+ (Supabase)
-- EQUIPO: C-LIFE (Scrum Master: Ian Marriaga)
-- ========================================================================

-- 1. Eliminación en cascada de versiones previas
DROP TABLE IF EXISTS registro_toma CASCADE;
DROP TABLE IF EXISTS recordatorio CASCADE;
DROP TABLE IF EXISTS medicamento CASCADE;
DROP TABLE IF EXISTS actividad CASCADE;
DROP TABLE IF EXISTS alimentacion CASCADE;
DROP TABLE IF EXISTS menu_recomendado CASCADE;
DROP TABLE IF EXISTS usuario CASCADE;

-- ------------------------------------------------------------------------
-- TABLA 1: usuario
-- ------------------------------------------------------------------------
CREATE TABLE usuario (
    id_usuario SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    correo VARCHAR(100) NOT NULL UNIQUE,
    contrasena VARCHAR(255) NOT NULL,
    tipo_diabetes VARCHAR(50) NULL,
    rol VARCHAR(20) NOT NULL DEFAULT 'paciente',
    CONSTRAINT chk_usuario_rol CHECK (rol IN ('paciente', 'administrador')),
    CONSTRAINT chk_usuario_diabetes CHECK (tipo_diabetes IS NULL OR tipo_diabetes IN ('Tipo 1', 'Tipo 2', 'Gestacional', 'Otro'))
);

-- ------------------------------------------------------------------------
-- TABLA 2: alimentacion
-- ------------------------------------------------------------------------
CREATE TABLE alimentacion (
    id_alimento SERIAL PRIMARY KEY,
    descripcion VARCHAR(255) NOT NULL,
    tipo_comida VARCHAR(30) NULL,
    fecha DATE NOT NULL,
    hora TIME NOT NULL,
    id_usuario INT NOT NULL,
    CONSTRAINT fk_alimentacion_usuario FOREIGN KEY (id_usuario) 
        REFERENCES usuario(id_usuario) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT chk_tipo_comida CHECK (tipo_comida IS NULL OR tipo_comida IN ('Desayuno', 'Almuerzo', 'Cena', 'Merienda'))
);

-- ------------------------------------------------------------------------
-- TABLA 3: actividad
-- ------------------------------------------------------------------------
CREATE TABLE actividad (
    id_actividad SERIAL PRIMARY KEY,
    tipo VARCHAR(100) NOT NULL,
    duracion INT NOT NULL,
    fecha DATE NOT NULL,
    id_usuario INT NOT NULL,
    CONSTRAINT fk_actividad_usuario FOREIGN KEY (id_usuario) 
        REFERENCES usuario(id_usuario) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT chk_actividad_duracion CHECK (duracion > 0)
);

-- ------------------------------------------------------------------------
-- TABLA 4: medicamento
-- ------------------------------------------------------------------------
CREATE TABLE medicamento (
    id_medicamento SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    dosis VARCHAR(100) NOT NULL,
    horario VARCHAR(50) NOT NULL,
    id_usuario INT NOT NULL,
    CONSTRAINT fk_medicamento_usuario FOREIGN KEY (id_usuario) 
        REFERENCES usuario(id_usuario) ON DELETE CASCADE ON UPDATE CASCADE
);

-- ------------------------------------------------------------------------
-- TABLA 5: recordatorio
-- ------------------------------------------------------------------------
CREATE TABLE recordatorio (
    id_recordatorio SERIAL PRIMARY KEY,
    mensaje VARCHAR(255) NOT NULL,
    hora TIME NOT NULL,
    estado VARCHAR(10) NOT NULL DEFAULT 'activo',
    id_medicamento INT NOT NULL,
    CONSTRAINT fk_recordatorio_medicamento FOREIGN KEY (id_medicamento) 
        REFERENCES medicamento(id_medicamento) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT chk_recordatorio_estado CHECK (estado IN ('activo', 'inactivo'))
);

-- ------------------------------------------------------------------------
-- TABLA 6: registro_toma
-- ------------------------------------------------------------------------
CREATE TABLE registro_toma (
    id_toma SERIAL PRIMARY KEY,
    fecha_hora TIMESTAMP NOT NULL,
    confirmada BOOLEAN NOT NULL DEFAULT FALSE,
    id_medicamento INT NOT NULL,
    CONSTRAINT fk_registro_toma_medicamento FOREIGN KEY (id_medicamento) 
        REFERENCES medicamento(id_medicamento) ON DELETE CASCADE ON UPDATE CASCADE
);

-- ------------------------------------------------------------------------
-- TABLA 7: menu_recomendado
-- ------------------------------------------------------------------------
CREATE TABLE menu_recomendado (
    id_menu SERIAL PRIMARY KEY,
    tipo_diabetes VARCHAR(50) NOT NULL,
    momento VARCHAR(30) NOT NULL,
    descripcion VARCHAR(255) NOT NULL,
    CONSTRAINT chk_menu_diabetes CHECK (tipo_diabetes IN ('Tipo 1', 'Tipo 2', 'Gestacional', 'General')),
    CONSTRAINT chk_menu_momento CHECK (momento IN ('Desayuno', 'Almuerzo', 'Cena', 'Merienda'))
);

-- ------------------------------------------------------------------------
-- ÍNDICES DE RENDIMIENTO (RNF-03)
-- ------------------------------------------------------------------------
CREATE INDEX idx_alimentacion_usuario_fecha ON alimentacion (id_usuario, fecha DESC);
CREATE INDEX idx_actividad_usuario_fecha ON actividad (id_usuario, fecha DESC);
CREATE INDEX idx_medicamento_usuario ON medicamento (id_usuario);
CREATE INDEX idx_recordatorio_med_estado ON recordatorio (id_medicamento, estado);
CREATE INDEX idx_registro_toma_med_fecha ON registro_toma (id_medicamento, fecha_hora DESC);
CREATE INDEX idx_menu_diabetes_momento ON menu_recomendado (tipo_diabetes, momento);

-- ------------------------------------------------------------------------
-- DATOS SEMILLA (SEED DATA)
-- ------------------------------------------------------------------------

-- 1. Usuarios demo
INSERT INTO usuario (nombre, correo, contrasena, tipo_diabetes, rol) VALUES
('Administrador Clínico C-LIFE', 'admin@cuibot.health', '$2b$12$7kP2eUqP4p5Z2yX0rB1Oeeo0Xq9eY9z2kM4l9o1P3q5Z2yX0rB1Oe', NULL, 'administrador'),
('Ian Marriaga', 'ian.marriaga@cuibot.health', '$2b$12$8xQ3fVrQ5q6A3zY1sC2Pffp1Yr0fZ0a3lN5m0p2Q4r6A3zY1sC2Pf', 'Tipo 2', 'paciente'),
('Juan Pablo Contreras', 'juanpablo@cuibot.health', '$2b$12$9yR4gWsR6r7B4aZ2tD3Qggq2Zs1ga1b4mO6n1q3R5s7B4aZ2tD3Qg', 'Tipo 1', 'paciente');

-- 2. Menús según lineamientos ADA
INSERT INTO menu_recomendado (tipo_diabetes, momento, descripcion) VALUES
('Tipo 2', 'Desayuno', 'Huevos revueltos con espinacas y tomate, una rebanada de pan integral 100% y té verde o café sin azúcar.'),
('Tipo 2', 'Almuerzo', 'Pechuga de pollo a la plancha con ensalada mixta (pepino, lechuga, aguacate con aceite de oliva) y 1/2 taza de lentejas.'),
('Tipo 2', 'Merienda', 'Un puñado de almendras o nueces naturales (30g) y un yogur griego natural sin azúcar añadida.'),
('Tipo 2', 'Cena', 'Filete de pescado blanco al vapor con brócoli y calabacín salteados, acompañado de infusión de manzanilla.'),

('Tipo 1', 'Desayuno', 'Avena cocida en leche descremada o vegetal con canela, semillas de chía y 1/2 manzana verde en cubos (con conteo de CH).'),
('Tipo 1', 'Almuerzo', 'Lomo de res magro con ensalada de quinoa, espinacas frescas, tomate cherry y vinagreta de limón.'),
('Tipo 1', 'Merienda', 'Bastones de apio y zanahoria con 2 cucharadas de hummus tradicional.'),
('Tipo 1', 'Cena', 'Tortilla de claras de huevo con champiñones y espárragos, acompañada de ensalada fresca de hojas verdes.'),

('Gestacional', 'Desayuno', 'Tostada de pan integral con queso fresco bajo en grasa, aguacate y rodajas de tomate.'),
('Gestacional', 'Almuerzo', 'Pavo a la plancha con puré de calabaza, ensalada de espinacas y aderezo de aceite de oliva extravirgen.'),
('Gestacional', 'Merienda', 'Yogur natural con semillas de lino molidas y una porción pequeña de fresas frescas.'),
('Gestacional', 'Cena', 'Sopa de verduras con trozos de pechuga de pollo y guarnición de ensalada de pepino.'),

('General', 'Desayuno', 'Batido verde con espinaca, pepino, jengibre y proteína vegetal, con una rebanada de pan de centeno.'),
('General', 'Almuerzo', 'Plato saludable 50/25/25: 50% vegetales sin almidón, 25% proteína magra (salmón o pollo), 25% carbohidratos complejos.'),
('General', 'Merienda', 'Manzana pequeña con una cucharadita de mantequilla de maní sin azúcar.'),
('General', 'Cena', 'Crema de calabacín y puerro sin crema de leche, acompañada de dados de tofu o pollo desmenuzado.');

-- 3. Medicamentos y recordatorios del paciente (id_usuario = 2)
INSERT INTO medicamento (nombre, dosis, horario, id_usuario) VALUES
('Metformina', '850 mg', '08:00 y 20:00 (Con comidas principales)', 2),
('Empagliflozina', '10 mg', '08:00 (Una vez al día en ayunas)', 2);

INSERT INTO recordatorio (mensaje, hora, estado, id_medicamento) VALUES
('Tomar Metformina 850 mg con el desayuno', '08:00:00', 'activo', 1),
('Tomar Metformina 850 mg con la cena', '20:00:00', 'activo', 1),
('Tomar Empagliflozina 10 mg', '08:00:00', 'activo', 2);

INSERT INTO registro_toma (fecha_hora, confirmada, id_medicamento) VALUES
('2026-10-15 08:05:00', TRUE, 1),
('2026-10-15 08:06:00', TRUE, 2),
('2026-10-15 20:10:00', TRUE, 1);

INSERT INTO alimentacion (descripcion, tipo_comida, fecha, hora, id_usuario) VALUES
('Omelette de 2 huevos con espinacas y té negro', 'Desayuno', '2026-10-15', '07:45:00', 2),
('Ensalada con pollo asado, aguacate y lentejas', 'Almuerzo', '2026-10-15', '12:50:00', 2);

INSERT INTO actividad (tipo, duracion, fecha, id_usuario) VALUES
('Caminata en cinta', 35, '2026-10-15', 2),
('Bicicleta estática', 25, '2026-10-16', 2);
