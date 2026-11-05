-- ========================================================================
-- PROYECTO: CUIBOT – Asistente Web para el Control de la Diabetes
-- ARCHIVO: 02_seed_y_verificacion_cuibot.sql
-- MOTOR: MySQL 8.0+ (Oracle) | CHARSET: utf8mb4
-- EQUIPO: C-LIFE (Scrum Master: Ian Marriaga)
-- ========================================================================

USE cuibot_db;

-- ========================================================================
-- PARTE 1: ÍNDICES DE RENDIMIENTO (RNF-03)
-- ========================================================================
CREATE INDEX idx_alimentacion_usuario_fecha ON Alimentacion (id_usuario, fecha DESC);
CREATE INDEX idx_actividad_usuario_fecha ON Actividad (id_usuario, fecha DESC);
CREATE INDEX idx_medicamento_usuario ON Medicamento (id_usuario);
CREATE INDEX idx_recordatorio_med_estado ON Recordatorio (id_medicamento, estado);
CREATE INDEX idx_registro_toma_med_fecha ON Registro_Toma (id_medicamento, fecha_hora DESC);
CREATE INDEX idx_menu_diabetes_momento ON Menu_Recomendado (tipo_diabetes, momento);

-- ========================================================================
-- PARTE 2: DATOS SEMILLA (SEED DATA)
-- ========================================================================

-- 1. Usuarios demo
INSERT INTO Usuario (nombre, correo, contrasena, tipo_diabetes, rol) VALUES
('Administrador Clínico C-LIFE', 'admin@cuibot.health', '$2b$12$7kP2eUqP4p5Z2yX0rB1Oeeo0Xq9eY9z2kM4l9o1P3q5Z2yX0rB1Oe', NULL, 'administrador'),
('Ian Marriaga', 'ian.marriaga@cuibot.health', '$2b$12$8xQ3fVrQ5q6A3zY1sC2Pffp1Yr0fZ0a3lN5m0p2Q4r6A3zY1sC2Pf', 'Tipo 2', 'paciente'),
('Juan Pablo Contreras', 'juanpablo@cuibot.health', '$2b$12$9yR4gWsR6r7B4aZ2tD3Qggq2Zs1ga1b4mO6n1q3R5s7B4aZ2tD3Qg', 'Tipo 1', 'paciente');

-- 2. Menús recomendados (Clasificación ADA)
INSERT INTO Menu_Recomendado (tipo_diabetes, momento, descripcion) VALUES
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
INSERT INTO Medicamento (nombre, dosis, horario, id_usuario) VALUES
('Metformina', '850 mg', '08:00 y 20:00 (Con comidas principales)', 2),
('Empagliflozina', '10 mg', '08:00 (Una vez al día en ayunas)', 2);

INSERT INTO Recordatorio (mensaje, hora, estado, id_medicamento) VALUES
('Tomar Metformina 850 mg con el desayuno', '08:00:00', 'activo', 1),
('Tomar Metformina 850 mg con la cena', '20:00:00', 'activo', 1),
('Tomar Empagliflozina 10 mg', '08:00:00', 'activo', 2);

INSERT INTO Registro_Toma (fecha_hora, confirmada, id_medicamento) VALUES
('2026-10-15 08:05:00', TRUE, 1),
('2026-10-15 08:06:00', TRUE, 2),
('2026-10-15 20:10:00', TRUE, 1);

INSERT INTO Alimentacion (descripcion, tipo_comida, fecha, hora, id_usuario) VALUES
('Omelette de 2 huevos con espinacas y té negro', 'Desayuno', '2026-10-15', '07:45:00', 2),
('Ensalada con pollo asado, aguacate y lentejas', 'Almuerzo', '2026-10-15', '12:50:00', 2);

INSERT INTO Actividad (tipo, duracion, fecha, id_usuario) VALUES
('Caminata en cinta', 35, '2026-10-15', 2),
('Bicicleta estática', 25, '2026-10-16', 2);

-- ========================================================================
-- PARTE 3: VALIDACIÓN RÁPIDA
-- ========================================================================
SHOW TABLES;
SELECT id_usuario, nombre, correo, tipo_diabetes, rol FROM Usuario;
SELECT id_menu, tipo_diabetes, momento, descripcion FROM Menu_Recomendado;
