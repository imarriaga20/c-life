-- ========================================================================
-- PROYECTO: CUIBOT – Asistente Web para el Control de la Diabetes
-- ARCHIVO: 03_menus_variados.sql
-- MOTOR: MySQL 8.0+ / MariaDB 10.4+ | CHARSET: utf8mb4
-- OBJETIVO: Agregar alternativas de menús a una base ya existente SIN borrar
--           usuarios, comidas, actividades ni medicamentos.
-- NOTA: Es idempotente: solo inserta los menús que aún no existen.
-- ========================================================================

SET NAMES utf8mb4;

USE cuibot_db;

CREATE TEMPORARY TABLE menus_nuevos (
    tipo_diabetes VARCHAR(50) NOT NULL,
    momento VARCHAR(30) NOT NULL,
    descripcion VARCHAR(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO menus_nuevos (tipo_diabetes, momento, descripcion) VALUES
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

CREATE TEMPORARY TABLE menus_faltantes AS
SELECT n.tipo_diabetes, n.momento, n.descripcion
FROM menus_nuevos n
LEFT JOIN Menu_Recomendado m
  ON m.tipo_diabetes = n.tipo_diabetes
 AND m.momento = n.momento
 AND m.descripcion = n.descripcion
WHERE m.id_menu IS NULL;

INSERT INTO Menu_Recomendado (tipo_diabetes, momento, descripcion)
SELECT tipo_diabetes, momento, descripcion FROM menus_faltantes;

SELECT ROW_COUNT() AS menus_insertados;

DROP TEMPORARY TABLE menus_faltantes;
DROP TEMPORARY TABLE menus_nuevos;

SELECT COUNT(*) AS total_menus FROM Menu_Recomendado;

SELECT tipo_diabetes, momento, COUNT(*) AS opciones
FROM Menu_Recomendado
GROUP BY tipo_diabetes, momento
ORDER BY FIELD(tipo_diabetes, 'Tipo 1', 'Tipo 2', 'Gestacional', 'General'),
         FIELD(momento, 'Desayuno', 'Almuerzo', 'Merienda', 'Cena');
