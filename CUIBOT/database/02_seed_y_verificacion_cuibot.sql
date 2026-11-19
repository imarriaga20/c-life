-- ========================================================================
-- PROYECTO: CUIBOT – Asistente Web para el Control de la Diabetes
-- ARCHIVO: 02_seed_y_verificacion_cuibot.sql
-- MOTOR: MySQL 8.0+ / MariaDB 10.4+ | CHARSET: utf8mb4
-- EQUIPO: C-LIFE (Scrum Master: Ian Marriaga)
-- NOTA: Este script se puede ejecutar varias veces; reinicia los datos demo.
-- ========================================================================

SET NAMES utf8mb4;

USE cuibot_db;

-- ========================================================================
-- PARTE 1: LIMPIEZA Y REINICIO DE DATOS
-- ========================================================================
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE Registro_Toma;
TRUNCATE TABLE Recordatorio;
TRUNCATE TABLE Medicamento;
TRUNCATE TABLE Actividad;
TRUNCATE TABLE Alimentacion;
TRUNCATE TABLE Menu_Recomendado;
TRUNCATE TABLE Usuario;
SET FOREIGN_KEY_CHECKS = 1;

-- ========================================================================
-- PARTE 2: DATOS SEMILLA (SEED DATA)
-- ========================================================================

-- 1. Usuarios demo
--    Contraseñas reales (bcrypt, costo 12):
--      admin@cuibot.health        -> AdminClife2026*
--      ian.marriaga@cuibot.health -> Cuibot2026*
--      juanpablo@cuibot.health    -> Cuibot2026*
INSERT INTO Usuario (nombre, correo, contrasena, tipo_diabetes, rol) VALUES
('Administrador Clínico C-LIFE', 'admin@cuibot.health', '$2b$12$lgcy2x4JG0AbgibeCXV7AeWw416dh5PEdZM8C1qrFlwExY6mFtp2i', NULL, 'administrador'),
('Ian Marriaga', 'ian.marriaga@cuibot.health', '$2b$12$ifl2cqKV5TzpbUszUhJHW.NXoEMMt3ITM8xo1k1Bnn52Y4r6PIpou', 'Tipo 2', 'paciente'),
('Juan Pablo Contreras', 'juanpablo@cuibot.health', '$2b$12$ifl2cqKV5TzpbUszUhJHW.NXoEMMt3ITM8xo1k1Bnn52Y4r6PIpou', 'Tipo 1', 'paciente');

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

-- 2.1 Alternativas de menús para que el botón "Actualizar" rote sugerencias
INSERT INTO Menu_Recomendado (tipo_diabetes, momento, descripcion) VALUES
('Tipo 2', 'Desayuno', 'Yogur griego natural sin azúcar con fresas, arándanos y semillas de chía; una tostada de pan integral con aguacate.'),
('Tipo 2', 'Desayuno', 'Revuelto de claras con espinaca, champiñones y queso fresco bajo en grasa; infusión de canela sin azúcar.'),
('Tipo 2', 'Almuerzo', 'Salmón al horno con ensalada de hojas verdes, tomate y pepino; 1/2 taza de quinoa y aderezo de limón con aceite de oliva.'),
('Tipo 2', 'Almuerzo', 'Pollo a la plancha con brócoli, ejotes y ensalada de repollo; porción pequeña de arroz integral.'),
('Tipo 2', 'Merienda', 'Bastones de pepino y zanahoria con 2 cucharadas de guacamole sin azúcar.'),
('Tipo 2', 'Merienda', 'Yogur natural sin azúcar con tres nueces y una infusión de canela.'),
('Tipo 2', 'Cena', 'Sopa de verduras con pollo desmenuzado y una rebanada de pan integral; sin crema ni azúcar añadida.'),
('Tipo 2', 'Cena', 'Tortilla de claras con espinaca y champiñones; ensalada de lechuga y aguacate con limón.'),

('Tipo 1', 'Desayuno', 'Sándwich de pan integral con huevo revuelto, espinaca y tomate; vaso de leche descremada. Anota el pan y la leche en tu conteo de CH.'),
('Tipo 1', 'Desayuno', 'Yogur griego natural sin azúcar con fresas, arándanos y 2 cucharadas de avena; nueces. Registra la avena y la fruta en tu conteo de CH.'),
('Tipo 1', 'Almuerzo', 'Pechuga de pollo asada con arroz integral, brócoli al vapor y ensalada de pepino; aderezo de limón. Cuenta el arroz en tu conteo de CH.'),
('Tipo 1', 'Almuerzo', 'Salmón al horno con puré de camote, ejotes y ensalada de hojas verdes; limón y hierbas. Registra el camote en tu conteo de CH.'),
('Tipo 1', 'Merienda', 'Manzana pequeña con 1 cucharada de mantequilla de maní sin azúcar y una infusión sin azúcar.'),
('Tipo 1', 'Merienda', 'Yogur natural sin azúcar con 15 g de almendras y una porción pequeña de melón.'),
('Tipo 1', 'Cena', 'Sopa de lentejas con verduras y trozos de pollo; porción pequeña de pan integral. Cuenta las lentejas y el pan.'),
('Tipo 1', 'Cena', 'Pescado blanco al vapor con calabacín, pimiento y quinoa; ensalada de lechuga y tomate. Registra la quinoa en tu conteo de CH.'),

('Gestacional', 'Desayuno', 'Avena cocida en leche pasteurizada con canela, plátano pequeño y semillas de lino molidas.'),
('Gestacional', 'Desayuno', 'Huevos revueltos bien cocidos con espinaca y tomate; tostada de pan integral y jugo de naranja natural pequeño.'),
('Gestacional', 'Almuerzo', 'Pollo bien cocido a la plancha con arroz integral, zanahoria y calabacín al vapor; ensalada de lechuga y tomate.'),
('Gestacional', 'Almuerzo', 'Salmón bien cocido al horno con puré de papa, ejotes y ensalada de hojas verdes; aderezo de aceite de oliva.'),
('Gestacional', 'Merienda', 'Yogur pasteurizado natural con fresas y 2 cucharadas de avena; sin azúcar añadida.'),
('Gestacional', 'Merienda', 'Manzana pequeña con 1 cucharada de mantequilla de maní y una infusión sin cafeína.'),
('Gestacional', 'Cena', 'Crema de calabaza y zanahoria sin crema de leche, con pollo desmenuzado bien cocido y una tostada integral.'),
('Gestacional', 'Cena', 'Tortilla de huevo bien cocida con espinaca y queso pasteurizado bajo en grasa; ensalada de pepino y tomate.'),

('General', 'Desayuno', 'Tostadas de pan integral con aguacate, huevo pochado y tomate; infusión sin azúcar.'),
('General', 'Desayuno', 'Yogur natural con avena, fresas y semillas de chía; vaso de agua o infusión sin azúcar.'),
('General', 'Almuerzo', 'Pollo a la plancha con ensalada de quinoa, tomate, pepino y aguacate; aderezo de limón y aceite de oliva.'),
('General', 'Almuerzo', 'Salmón al horno con camote asado, brócoli y ensalada de hojas verdes; limón y hierbas.'),
('General', 'Merienda', 'Yogur natural sin azúcar con fresas y un puñado pequeño de nueces.'),
('General', 'Merienda', 'Bastones de zanahoria y pepino con hummus; infusión sin azúcar.'),
('General', 'Cena', 'Sopa de verduras con lentejas y pollo desmenuzado; rebanada pequeña de pan integral.'),
('General', 'Cena', 'Tortilla de espinaca y champiñones con ensalada de lechuga, tomate y aguacate.');

-- 3. Medicamentos y recordatorios (Ian: id_usuario = 2 | Juan Pablo: id_usuario = 3)
INSERT INTO Medicamento (nombre, dosis, horario, id_usuario) VALUES
('Metformina', '850 mg', '08:00 y 20:00 (Con comidas principales)', 2),
('Empagliflozina', '10 mg', '08:00 (Una vez al día en ayunas)', 2),
('Insulina Glargina', '10 UI', '22:00 (Antes de dormir)', 3),
('Metformina', '500 mg', '08:00 y 20:00 (Con comidas principales)', 3);

INSERT INTO Recordatorio (mensaje, hora, estado, id_medicamento) VALUES
('Tomar Metformina 850 mg con el desayuno', '08:00:00', 'activo', 1),
('Tomar Metformina 850 mg con la cena', '20:00:00', 'activo', 1),
('Tomar Empagliflozina 10 mg', '08:00:00', 'activo', 2),
('Tomar Insulina Glargina 10 UI', '22:00:00', 'activo', 3),
('Tomar Metformina 500 mg con el desayuno', '08:00:00', 'activo', 4),
('Tomar Metformina 500 mg con la cena', '20:00:00', 'activo', 4);

-- 4. Tomas confirmadas de hoy (para que el dashboard muestre adherencia)
INSERT INTO Registro_Toma (fecha_hora, confirmada, id_medicamento) VALUES
(CONCAT(CURDATE(), ' 08:05:00'), TRUE, 1),
(CONCAT(CURDATE(), ' 08:06:00'), TRUE, 2),
(CONCAT(CURDATE(), ' 07:50:00'), TRUE, 3);

-- 5. Alimentación de hoy (fechas dinámicas: el demo siempre muestra datos del día)
INSERT INTO Alimentacion (descripcion, tipo_comida, fecha, hora, id_usuario) VALUES
('Omelette de 2 huevos con espinacas y té negro', 'Desayuno', CURDATE(), '07:45:00', 2),
('Ensalada con pollo asado, aguacate y lentejas', 'Almuerzo', CURDATE(), '12:50:00', 2),
('Avena con leche descremada, chía y manzana verde', 'Desayuno', CURDATE(), '07:30:00', 3),
('Lomo de res magro con quinoa y ensalada de espinacas', 'Almuerzo', CURDATE(), '13:10:00', 3);

-- 6. Actividad física de la semana en curso (90 min acumulados para Ian)
INSERT INTO Actividad (tipo, duracion, fecha, id_usuario) VALUES
('Caminata en cinta', 35, CURDATE(), 2),
('Bicicleta estática', 25, CURDATE(), 2),
('Caminata rápida en parque', 30, CURDATE(), 2),
('Natación', 45, CURDATE(), 3),
('Caminata rápida en parque', 30, CURDATE(), 3);

-- ========================================================================
-- PARTE 3: VALIDACIÓN RÁPIDA
-- ========================================================================
SHOW TABLES;

SELECT id_usuario, nombre, correo, tipo_diabetes, rol FROM Usuario;

SELECT id_menu, tipo_diabetes, momento, descripcion FROM Menu_Recomendado ORDER BY tipo_diabetes, FIELD(momento, 'Desayuno', 'Almuerzo', 'Merienda', 'Cena');

SELECT m.nombre, m.dosis, r.hora, r.mensaje, r.estado
FROM Medicamento m
JOIN Recordatorio r ON m.id_medicamento = r.id_medicamento
WHERE m.id_usuario = 2 AND r.estado = 'activo'
ORDER BY r.hora;

SELECT id_usuario, SUM(duracion) AS total_minutos_semana,
       CASE
           WHEN SUM(duracion) >= 150 THEN 'Meta Cumplida'
           ELSE CONCAT('Faltan ', 150 - SUM(duracion), ' minutos')
       END AS estado_meta
FROM Actividad
WHERE YEARWEEK(fecha, 1) = YEARWEEK(CURDATE(), 1)
GROUP BY id_usuario;
