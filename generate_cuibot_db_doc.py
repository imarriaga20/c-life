import os
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import parse_xml
from docx.oxml.ns import nsdecls

def create_document():
    doc = docx.Document()
    
    # Margins 0.75 in
    for section in doc.sections:
        section.top_margin = Inches(0.75)
        section.bottom_margin = Inches(0.75)
        section.left_margin = Inches(0.75)
        section.right_margin = Inches(0.75)
        section.page_width = Inches(8.5)
        section.page_height = Inches(11.0)
        
        header = section.header
        hp = header.paragraphs[0]
        hp.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        hrun = hp.add_run("CUIBOT — Especificación Técnica de Base de Datos (PostgreSQL · Supabase)")
        hrun.font.name = "Calibri"
        hrun.font.size = Pt(8.5)
        hrun.font.color.rgb = RGBColor(148, 163, 184)
        
        footer = section.footer
        fp = footer.paragraphs[0]
        fp.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        frun = fp.add_run("Equipo C-LIFE · Documentación de Ingeniería de Software · CUIBOT")
        frun.font.name = "Calibri"
        frun.font.size = Pt(8.5)
        frun.font.color.rgb = RGBColor(148, 163, 184)

    COLOR_PRIMARY = RGBColor(27, 54, 93)     # #1B365D Deep Navy
    COLOR_SECONDARY = RGBColor(13, 148, 136) # #0D9488 Teal
    COLOR_DARK = RGBColor(15, 23, 42)        # #0F172A Slate Dark
    COLOR_MUTED = RGBColor(100, 116, 139)    # #64748B Slate Muted
    COLOR_CODE = RGBColor(30, 41, 59)        # #1E293B

    def set_cell_background(cell, hex_color):
        shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{hex_color}"/>')
        cell._tc.get_or_add_tcPr().append(shd)

    def set_cell_margins(cell, top=100, bottom=100, left=140, right=140):
        tcMar = parse_xml(f'''
            <w:tcMar {nsdecls("w")}>
                <w:top w:w="{top}" w:type="dxa"/>
                <w:bottom w:w="{bottom}" w:type="dxa"/>
                <w:left w:w="{left}" w:type="dxa"/>
                <w:right w:w="{right}" w:type="dxa"/>
            </w:tcMar>
        ''')
        cell._tc.get_or_add_tcPr().append(tcMar)

    def set_table_borders(table, color="CBD5E1", sz="4", val="single"):
        tblPr = table._tbl.tblPr
        tblBorders = parse_xml(f'''
            <w:tblBorders {nsdecls("w")}>
                <w:top w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>
                <w:bottom w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>
                <w:insideH w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>
                <w:insideV w:val="none"/>
                <w:left w:val="none"/>
                <w:right w:val="none"/>
            </w:tblBorders>
        ''')
        tblPr.append(tblBorders)

    def add_heading_1(text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(16)
        p.paragraph_format.space_after = Pt(6)
        p.paragraph_format.keep_with_next = True
        run = p.add_run(text)
        run.font.name = "Calibri"
        run.font.size = Pt(15)
        run.font.bold = True
        run.font.color.rgb = COLOR_PRIMARY
        return p

    def add_heading_2(text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(12)
        p.paragraph_format.space_after = Pt(4)
        p.paragraph_format.keep_with_next = True
        run = p.add_run(text)
        run.font.name = "Calibri"
        run.font.size = Pt(12)
        run.font.bold = True
        run.font.color.rgb = COLOR_SECONDARY
        return p

    def add_heading_3(text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(9)
        p.paragraph_format.space_after = Pt(3)
        p.paragraph_format.keep_with_next = True
        run = p.add_run(text)
        run.font.name = "Calibri"
        run.font.size = Pt(10.5)
        run.font.bold = True
        run.font.color.rgb = COLOR_PRIMARY
        return p

    def add_body_paragraph(text, bold_prefix=None, space_after=5):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(0)
        p.paragraph_format.space_after = Pt(space_after)
        p.paragraph_format.line_spacing = 1.15
        if bold_prefix:
            brun = p.add_run(bold_prefix)
            brun.font.name = "Calibri"
            brun.font.size = Pt(9.5)
            brun.font.bold = True
            brun.font.color.rgb = COLOR_DARK
        run = p.add_run(text)
        run.font.name = "Calibri"
        run.font.size = Pt(9.5)
        run.font.color.rgb = COLOR_DARK
        return p

    def add_bullet_item(text, bold_prefix=None):
        p = doc.add_paragraph(style='List Bullet')
        p.paragraph_format.space_before = Pt(0)
        p.paragraph_format.space_after = Pt(2.5)
        p.paragraph_format.line_spacing = 1.15
        if bold_prefix:
            brun = p.add_run(bold_prefix)
            brun.font.name = "Calibri"
            brun.font.size = Pt(9.5)
            brun.font.bold = True
            brun.font.color.rgb = COLOR_DARK
        run = p.add_run(text)
        run.font.name = "Calibri"
        run.font.size = Pt(9.5)
        run.font.color.rgb = COLOR_DARK
        return p

    def add_code_block(code_text):
        tbl = doc.add_table(rows=1, cols=1)
        tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
        tbl.autofit = False
        cell = tbl.cell(0, 0)
        cell.width = Inches(7.0)
        set_cell_background(cell, "F8FAFC")
        set_cell_margins(cell, top=100, bottom=100, left=160, right=140)
        
        tblPr = tbl._tbl.tblPr
        tblBorders = parse_xml(f'''
            <w:tblBorders {nsdecls("w")}>
                <w:top w:val="none"/>
                <w:bottom w:val="none"/>
                <w:left w:val="single" w:sz="24" w:space="0" w:color="0D9488"/>
                <w:right w:val="none"/>
                <w:insideH w:val="none"/>
                <w:insideV w:val="none"/>
            </w:tblBorders>
        ''')
        tblPr.append(tblBorders)
        
        p = cell.paragraphs[0]
        p.paragraph_format.space_before = Pt(0)
        p.paragraph_format.space_after = Pt(0)
        p.paragraph_format.line_spacing = 1.05
        
        lines = code_text.strip().split('\n')
        for i, line in enumerate(lines):
            run = p.add_run(line + ("\n" if i < len(lines) - 1 else ""))
            run.font.name = "Consolas"
            run.font.size = Pt(8.5)
            run.font.color.rgb = COLOR_CODE
        
        sp = doc.add_paragraph()
        sp.paragraph_format.space_before = Pt(0)
        sp.paragraph_format.space_after = Pt(4)

    def add_callout_box(title, text, hex_border="0284C7", hex_bg="F0F9FF"):
        tbl = doc.add_table(rows=1, cols=1)
        tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
        tbl.autofit = False
        cell = tbl.cell(0, 0)
        cell.width = Inches(7.0)
        set_cell_background(cell, hex_bg)
        set_cell_margins(cell, top=120, bottom=120, left=160, right=140)
        
        tblPr = tbl._tbl.tblPr
        tblBorders = parse_xml(f'''
            <w:tblBorders {nsdecls("w")}>
                <w:top w:val="none"/>
                <w:bottom w:val="none"/>
                <w:left w:val="single" w:sz="24" w:space="0" w:color="{hex_border}"/>
                <w:right w:val="none"/>
                <w:insideH w:val="none"/>
                <w:insideV w:val="none"/>
            </w:tblBorders>
        ''')
        tblPr.append(tblBorders)
        
        p = cell.paragraphs[0]
        p.paragraph_format.space_before = Pt(0)
        p.paragraph_format.space_after = Pt(2)
        trun = p.add_run(f"📌 {title}\n")
        trun.font.name = "Calibri"
        trun.font.size = Pt(9.5)
        trun.font.bold = True
        trun.font.color.rgb = COLOR_PRIMARY
        
        brun = p.add_run(text)
        brun.font.name = "Calibri"
        brun.font.size = Pt(9)
        brun.font.color.rgb = COLOR_DARK
        
        sp = doc.add_paragraph()
        sp.paragraph_format.space_before = Pt(0)
        sp.paragraph_format.space_after = Pt(4)

    # ----------------------------------------------------
    # TITLE & HEADER
    # ----------------------------------------------------
    p_title = doc.add_paragraph()
    p_title.paragraph_format.space_before = Pt(4)
    p_title.paragraph_format.space_after = Pt(2)
    run_title = p_title.add_run("CUIBOT — Especificación y Documentación de Base de Datos")
    run_title.font.name = "Calibri"
    run_title.font.size = Pt(20)
    run_title.font.bold = True
    run_title.font.color.rgb = COLOR_PRIMARY

    p_meta = doc.add_paragraph()
    p_meta.paragraph_format.space_before = Pt(0)
    p_meta.paragraph_format.space_after = Pt(12)
    run_meta = p_meta.add_run("Noviembre 2026 · Versión 1.3 (Verificada y Funcional) · Plataforma Cloud: Supabase (PostgreSQL 15+) · Equipo C-LIFE")
    run_meta.font.name = "Calibri"
    run_meta.font.size = Pt(10)
    run_meta.font.color.rgb = COLOR_MUTED

    # ----------------------------------------------------
    # 1. INFORMACIÓN GENERAL
    # ----------------------------------------------------
    add_heading_1("Información General")
    add_body_paragraph(
        "El presente documento técnico establece el diseño, especificación, diccionario de datos y scripts de "
        "construcción de la base de datos relacional para el sistema CUIBOT (Asistente web para el control de la diabetes). "
        "Constituye la guía oficial y estandarizada para el equipo de desarrollo, garantizando que el almacenamiento "
        "de datos de salud sensibles cumpla con altos estándares de integridad referencial, consistencia transaccional "
        "y apego a la normatividad de protección de datos personales."
    )

    meta_table_data = [
        ("Proyecto", "CUIBOT – Asistente web para el control de la diabetes"),
        ("Grupo de Desarrollo", "C-LIFE (Proyecto de Ingeniería de Software)"),
        ("Motor de Base de Datos", "PostgreSQL 15+ (Plataforma Cloud: Supabase)"),
        ("Herramienta de Administración", "Supabase SQL Editor / Table Editor / Dashboard C-Life"),
        ("Motor de Almacenamiento", "Relacional ACID con soporte estricto de Foreign Keys y transacciones"),
        ("Codificación de Caracteres", "UTF-8 (utf8mb4 nativo)"),
        ("Entorno de Conexión", "Supabase Cloud Database (Organización ianmarriaga727, Proyecto 'C-Life')"),
        ("Normativa de Protección de Datos", "Ley 1581 de 2012 (Colombia - Protección de datos sensibles de salud) y OWASP Top 10")
    ]

    t_meta = doc.add_table(rows=len(meta_table_data) + 1, cols=2)
    t_meta.alignment = WD_TABLE_ALIGNMENT.CENTER
    t_meta.autofit = False
    set_table_borders(t_meta)

    hdr_cells = t_meta.rows[0].cells
    hdr_cells[0].width = Inches(2.2)
    hdr_cells[1].width = Inches(4.8)
    for i, title in enumerate(["Elemento", "Valor"]):
        set_cell_background(hdr_cells[i], "F1F5F9")
        set_cell_margins(hdr_cells[i], top=100, bottom=100, left=140, right=140)
        p = hdr_cells[i].paragraphs[0]
        run = p.add_run(title)
        run.font.name = "Calibri"
        run.font.size = Pt(9.5)
        run.font.bold = True
        run.font.color.rgb = COLOR_DARK

    for row_idx, (elem, val) in enumerate(meta_table_data, start=1):
        row_cells = t_meta.rows[row_idx].cells
        row_cells[0].width = Inches(2.2)
        row_cells[1].width = Inches(4.8)
        bg = "FFFFFF" if row_idx % 2 != 0 else "F8FAFC"
        for i, val_text in enumerate([elem, val]):
            set_cell_background(row_cells[i], bg)
            set_cell_margins(row_cells[i], top=70, bottom=70, left=140, right=140)
            p = row_cells[i].paragraphs[0]
            run = p.add_run(val_text)
            run.font.name = "Calibri"
            run.font.size = Pt(9)
            if i == 0:
                run.font.bold = True
                run.font.color.rgb = COLOR_PRIMARY
            else:
                run.font.color.rgb = COLOR_DARK

    p_sp = doc.add_paragraph()
    p_sp.paragraph_format.space_before = Pt(4)
    p_sp.paragraph_format.space_after = Pt(4)

    # ----------------------------------------------------
    # EQUIPO SCRUM
    # ----------------------------------------------------
    add_heading_2("Equipo de Trabajo y Asignación de Roles")
    team_data = [
        ("Juan de la Hoz", "Product Owner", "Definición de visión del producto, priorización del Product Backlog, validación de criterios médicos y aprobación de incrementos."),
        ("Ian Marriaga", "Scrum Master", "Facilitador del marco Scrum, eliminación de impedimentos, provisión del material técnico y control de ejecución del equipo."),
        ("Felipe Morales", "Developer", "Diseño de la lógica backend, integración del modelo de datos y desarrollo de endpoints transaccionales."),
        ("Mayra Orozco", "Developer", "Diseño y construcción de la interfaz frontend, consumo de APIs y validación de componentes de usuario."),
        ("Juan Pablo Contreras", "Developer", "Arquitectura del sistema, ejecución de scripts de base de datos, pruebas funcionales y de integración."),
        ("Alejandro Berdugo", "Developer", "Construcción de módulos de datos, pruebas unitarias del sistema, documentación técnica y aseguramiento de calidad.")
    ]

    t_team = doc.add_table(rows=len(team_data) + 1, cols=3)
    t_team.alignment = WD_TABLE_ALIGNMENT.CENTER
    t_team.autofit = False
    set_table_borders(t_team)

    t_team_hdr = t_team.rows[0].cells
    t_team_hdr[0].width = Inches(1.8)
    t_team_hdr[1].width = Inches(1.4)
    t_team_hdr[2].width = Inches(3.8)
    for i, title in enumerate(["Integrante", "Rol en el Proyecto", "Responsabilidades Principales"]):
        set_cell_background(t_team_hdr[i], "F1F5F9")
        set_cell_margins(t_team_hdr[i], top=100, bottom=100, left=140, right=140)
        p = t_team_hdr[i].paragraphs[0]
        run = p.add_run(title)
        run.font.name = "Calibri"
        run.font.size = Pt(9.5)
        run.font.bold = True
        run.font.color.rgb = COLOR_DARK

    for row_idx, (nombre, rol, resp) in enumerate(team_data, start=1):
        row_cells = t_team.rows[row_idx].cells
        row_cells[0].width = Inches(1.8)
        row_cells[1].width = Inches(1.4)
        row_cells[2].width = Inches(3.8)
        bg = "FFFFFF" if row_idx % 2 != 0 else "F8FAFC"
        for i, text_val in enumerate([nombre, rol, resp]):
            set_cell_background(row_cells[i], bg)
            set_cell_margins(row_cells[i], top=70, bottom=70, left=140, right=140)
            p = row_cells[i].paragraphs[0]
            run = p.add_run(text_val)
            run.font.name = "Calibri"
            run.font.size = Pt(9)
            if i == 0:
                run.font.bold = True
                run.font.color.rgb = COLOR_DARK
            elif i == 1:
                run.font.bold = True
                run.font.color.rgb = COLOR_SECONDARY
            else:
                run.font.color.rgb = COLOR_DARK

    p_sp = doc.add_paragraph()
    p_sp.paragraph_format.space_before = Pt(4)
    p_sp.paragraph_format.space_after = Pt(4)

    # ----------------------------------------------------
    # INTRODUCCIÓN Y CONTEXTO
    # ----------------------------------------------------
    add_heading_1("Introducción y Contexto del Proyecto")
    add_body_paragraph(
        "La diabetes mellitus representa uno de los desafíos más críticos de salud pública. Según la Federación "
        "Internacional de Diabetes (IDF), más de 537 millones de adultos conviven con esta condición. En Colombia se reportan "
        "cerca de 1,8 millones de personas diagnosticadas, con un subdiagnóstico estimado del 35%. El autocuidado exitoso "
        "descansa sobre tres pilares descritos por la American Diabetes Association (ADA): control riguroso de la alimentación, "
        "práctica regular de actividad física y estricta adherencia a la medicación. CUIBOT centraliza estos aspectos en una "
        "plataforma web integral conectada a una base de datos segura y de alto desempeño."
    )
    add_callout_box(
        "Infraestructura Cloud Verificada: Supabase (PostgreSQL 15+)",
        "Para acelerar el desarrollo del MVP y permitir acceso colaborativo en la nube a todo el equipo C-LIFE, "
        "la base de datos se encuentra desplegada y probada en Supabase (PostgreSQL 15+). Este entorno ofrece almacenamiento "
        "seguro en la nube, autenticación integrada, copias de seguridad automáticas y compatibilidad total con la lógica backend en Node.js.",
        hex_border="0D9488",
        hex_bg="F0FDF4"
    )

    # ----------------------------------------------------
    # RESUMEN DE TABLAS Y ENTIDADES
    # ----------------------------------------------------
    add_heading_1("Resumen de Tablas y Entidades del Sistema")
    catalog_data = [
        ("usuario", "Gestión de cuentas, autenticación segura, tipo de diabetes y asignación de rol (paciente/admin).", "id_usuario", "Ninguna (Entidad Maestra)", "RF01 a RF04"),
        ("alimentacion", "Bitácora diaria de comidas consumidas por el paciente con fecha, hora y descripción.", "id_alimento", "id_usuario -> usuario(id_usuario) [CASCADE]", "RF05, RF06"),
        ("actividad", "Registro de ejercicios realizados, tipo y duración para control de meta semanal (150 min).", "id_actividad", "id_usuario -> usuario(id_usuario) [CASCADE]", "RF08, RF09"),
        ("medicamento", "Fichero de fármacos prescritos al paciente con dosis declarada y horario de administración.", "id_medicamento", "id_usuario -> usuario(id_usuario) [CASCADE]", "RF10"),
        ("recordatorio", "Avisos y alarmas programadas en horas específicas vinculadas a cada medicamento.", "id_recordatorio", "id_medicamento -> medicamento(id_medicamento) [CASCADE]", "RF11, RF12"),
        ("registro_toma", "Historial de tomas efectivas o pendientes, fecha/hora y confirmación por el usuario.", "id_toma", "id_medicamento -> medicamento(id_medicamento) [CASCADE]", "RF13"),
        ("menu_recomendado", "Catálogo institucional de menús nutricionales por tipo de diabetes y momento del día.", "id_menu", "Relación lógica con usuario.tipo_diabetes (sin FK)", "RF07, RF17")
    ]

    t_cat = doc.add_table(rows=len(catalog_data) + 1, cols=5)
    t_cat.alignment = WD_TABLE_ALIGNMENT.CENTER
    t_cat.autofit = False
    set_table_borders(t_cat)

    cat_hdr = t_cat.rows[0].cells
    cat_hdr[0].width = Inches(1.4)
    cat_hdr[1].width = Inches(2.4)
    cat_hdr[2].width = Inches(1.0)
    cat_hdr[3].width = Inches(1.4)
    cat_hdr[4].width = Inches(0.8)
    for i, title in enumerate(["Tabla", "Descripción Funcional", "PK", "Clave Foránea (FK)", "RFs"]):
        set_cell_background(cat_hdr[i], "F1F5F9")
        set_cell_margins(cat_hdr[i], top=90, bottom=90, left=120, right=120)
        p = cat_hdr[i].paragraphs[0]
        run = p.add_run(title)
        run.font.name = "Calibri"
        run.font.size = Pt(9)
        run.font.bold = True
        run.font.color.rgb = COLOR_DARK

    for row_idx, (tname, desc, pk, fk, rfs) in enumerate(catalog_data, start=1):
        row_cells = t_cat.rows[row_idx].cells
        row_cells[0].width = Inches(1.4)
        row_cells[1].width = Inches(2.4)
        row_cells[2].width = Inches(1.0)
        row_cells[3].width = Inches(1.4)
        row_cells[4].width = Inches(0.8)
        bg = "FFFFFF" if row_idx % 2 != 0 else "F8FAFC"
        for i, text_val in enumerate([tname, desc, pk, fk, rfs]):
            set_cell_background(row_cells[i], bg)
            set_cell_margins(row_cells[i], top=65, bottom=65, left=120, right=120)
            p = row_cells[i].paragraphs[0]
            run = p.add_run(text_val)
            run.font.name = "Calibri"
            run.font.size = Pt(8.5)
            if i == 0:
                run.font.bold = True
                run.font.color.rgb = COLOR_PRIMARY
            elif i == 2:
                run.font.bold = True
                run.font.color.rgb = COLOR_SECONDARY
            else:
                run.font.color.rgb = COLOR_DARK

    p_sp = doc.add_paragraph()
    p_sp.paragraph_format.space_before = Pt(4)
    p_sp.paragraph_format.space_after = Pt(4)

    # ----------------------------------------------------
    # DICCIONARIO DE DATOS DETALLADO POR TABLA
    # ----------------------------------------------------
    add_heading_1("Diccionario de Datos Detallado y Especificación de Tablas")
    add_body_paragraph(
        "A continuación se presenta la ficha técnica formal de cada una de las 7 tablas del sistema, "
        "con tipos nativos PostgreSQL (SERIAL, TIMESTAMP, BOOLEAN), restricciones de dominio CHECK y DDL validado."
    )

    tables_detail = [
        {
            "name": "usuario",
            "desc": "Almacena la información de los usuarios registrados en el sistema, permitiendo su autenticación segura, clasificación clínica según el tipo de diabetes padecido y privilegios de acceso (paciente o administrador).",
            "rf": "RF01, RF02, RF03, RF04, RF16 | RNF-05, RNF-07, RNF-10, RNF-11",
            "fields": [
                ("id_usuario", "SERIAL", "Entero auto-incremental", "Sí", "PK", "Identificador único del usuario."),
                ("nombre", "VARCHAR(100)", "100 caracteres", "Sí", "—", "Nombre completo del usuario."),
                ("correo", "VARCHAR(100)", "100 caracteres", "Sí", "UQ", "Correo de acceso único en el sistema."),
                ("contrasena", "VARCHAR(255)", "255 caracteres", "Sí", "—", "Hash criptográfico de la contraseña (bcrypt/argon2)."),
                ("tipo_diabetes", "VARCHAR(50)", "50 caracteres", "No", "—", "Valores: 'Tipo 1', 'Tipo 2', 'Gestacional', 'Otro'."),
                ("rol", "VARCHAR(20)", "20 caracteres", "Sí", "—", "Valores: 'paciente' (por defecto) o 'administrador'.")
            ],
            "ddl": """CREATE TABLE usuario (
    id_usuario SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    correo VARCHAR(100) NOT NULL UNIQUE,
    contrasena VARCHAR(255) NOT NULL,
    tipo_diabetes VARCHAR(50) NULL,
    rol VARCHAR(20) NOT NULL DEFAULT 'paciente',
    CONSTRAINT chk_usuario_rol CHECK (rol IN ('paciente', 'administrador')),
    CONSTRAINT chk_usuario_diabetes CHECK (tipo_diabetes IS NULL OR tipo_diabetes IN ('Tipo 1', 'Tipo 2', 'Gestacional', 'Otro'))
);""",
            "sample": """INSERT INTO usuario (nombre, correo, contrasena, tipo_diabetes, rol) 
VALUES ('Juan Pablo Contreras', 'juanpablo@cuibot.health', '$2b$12$...', 'Tipo 1', 'paciente');"""
        },
        {
            "name": "alimentacion",
            "desc": "Registra las comidas consumidas por el paciente con fecha, hora, tipo de ingesta y descripción textual. Sirve como bitácora clínica para entender el balance nutricional.",
            "rf": "RF05, RF06 | RNF-01, RNF-03, RNF-07",
            "fields": [
                ("id_alimento", "SERIAL", "Entero auto-incremental", "Sí", "PK", "Identificador único de la comida."),
                ("descripcion", "VARCHAR(255)", "255 caracteres", "Sí", "—", "Detalle de los alimentos ingeridos."),
                ("tipo_comida", "VARCHAR(30)", "30 caracteres", "No", "—", "Valores: 'Desayuno', 'Almuerzo', 'Cena', 'Merienda'."),
                ("fecha", "DATE", "YYYY-MM-DD", "Sí", "—", "Fecha en que se consumió el alimento."),
                ("hora", "TIME", "HH:MM:SS", "Sí", "—", "Hora de consumo."),
                ("id_usuario", "INT", "Entero", "Sí", "FK", "Referencia a usuario(id_usuario) [CASCADE].")
            ],
            "ddl": """CREATE TABLE alimentacion (
    id_alimento SERIAL PRIMARY KEY,
    descripcion VARCHAR(255) NOT NULL,
    tipo_comida VARCHAR(30) NULL,
    fecha DATE NOT NULL,
    hora TIME NOT NULL,
    id_usuario INT NOT NULL,
    CONSTRAINT fk_alimentacion_usuario FOREIGN KEY (id_usuario) 
        REFERENCES usuario(id_usuario) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT chk_tipo_comida CHECK (tipo_comida IS NULL OR tipo_comida IN ('Desayuno', 'Almuerzo', 'Cena', 'Merienda'))
);""",
            "sample": """INSERT INTO alimentacion (descripcion, tipo_comida, fecha, hora, id_usuario)
VALUES ('Omelette de claras con espinacas y té verde', 'Desayuno', '2026-10-15', '07:45:00', 1);"""
        },
        {
            "name": "actividad",
            "desc": "Registra las sesiones de ejercicio físico (tipo, duración y fecha) para validar el avance frente a la meta semanal de 150 minutos recomendada por la ADA.",
            "rf": "RF08, RF09 | RNF-01, RNF-03",
            "fields": [
                ("id_actividad", "SERIAL", "Entero auto-incremental", "Sí", "PK", "Identificador único de la actividad."),
                ("tipo", "VARCHAR(100)", "100 caracteres", "Sí", "—", "Tipo de actividad (Caminar, Bicicleta, etc.)."),
                ("duracion", "INT", "Entero (minutos)", "Sí", "—", "Duración en minutos (debe ser > 0)."),
                ("fecha", "DATE", "YYYY-MM-DD", "Sí", "—", "Fecha de realización."),
                ("id_usuario", "INT", "Entero", "Sí", "FK", "Referencia a usuario(id_usuario) [CASCADE].")
            ],
            "ddl": """CREATE TABLE actividad (
    id_actividad SERIAL PRIMARY KEY,
    tipo VARCHAR(100) NOT NULL,
    duracion INT NOT NULL,
    fecha DATE NOT NULL,
    id_usuario INT NOT NULL,
    CONSTRAINT fk_actividad_usuario FOREIGN KEY (id_usuario) 
        REFERENCES usuario(id_usuario) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT chk_actividad_duracion CHECK (duracion > 0)
);""",
            "sample": """INSERT INTO actividad (tipo, duracion, fecha, id_usuario)
VALUES ('Caminata rápida en cinta', 35, '2026-10-15', 1);"""
        },
        {
            "name": "medicamento",
            "desc": "Gestiona los medicamentos prescritos al paciente (antidiabéticos orales, insulinas, complementos). Registra el nombre, la dosis indicada por su médico y el horario general.",
            "rf": "RF10 | RNF-01, RNF-07",
            "fields": [
                ("id_medicamento", "SERIAL", "Entero auto-incremental", "Sí", "PK", "Identificador único del medicamento."),
                ("nombre", "VARCHAR(100)", "100 caracteres", "Sí", "—", "Nombre comercial o genérico del fármaco."),
                ("dosis", "VARCHAR(100)", "100 caracteres", "Sí", "—", "Dosis indicada (ej. '850 mg', '10 UI')."),
                ("horario", "VARCHAR(50)", "50 caracteres", "Sí", "—", "Horario general (ej. '08:00 y 20:00')."),
                ("id_usuario", "INT", "Entero", "Sí", "FK", "Referencia a usuario(id_usuario) [CASCADE].")
            ],
            "ddl": """CREATE TABLE medicamento (
    id_medicamento SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    dosis VARCHAR(100) NOT NULL,
    horario VARCHAR(50) NOT NULL,
    id_usuario INT NOT NULL,
    CONSTRAINT fk_medicamento_usuario FOREIGN KEY (id_usuario) 
        REFERENCES usuario(id_usuario) ON DELETE CASCADE ON UPDATE CASCADE
);""",
            "sample": """INSERT INTO medicamento (nombre, dosis, horario, id_usuario)
VALUES ('Metformina', '850 mg', '08:00 y 20:00', 1);"""
        },
        {
            "name": "recordatorio",
            "desc": "Avisos y alarmas programadas en horas específicas asociadas a un medicamento. Permite activar o desactivar notificaciones sin eliminar el fármaco.",
            "rf": "RF11, RF12 | RNF-01, RNF-07",
            "fields": [
                ("id_recordatorio", "SERIAL", "Entero auto-incremental", "Sí", "PK", "Identificador del recordatorio."),
                ("mensaje", "VARCHAR(255)", "255 caracteres", "Sí", "—", "Texto descriptivo de la notificación."),
                ("hora", "TIME", "HH:MM:SS", "Sí", "—", "Hora exacta del aviso."),
                ("estado", "VARCHAR(10)", "10 caracteres", "Sí", "—", "Valores: 'activo' o 'inactivo'."),
                ("id_medicamento", "INT", "Entero", "Sí", "FK", "Referencia a medicamento(id_medicamento) [CASCADE].")
            ],
            "ddl": """CREATE TABLE recordatorio (
    id_recordatorio SERIAL PRIMARY KEY,
    mensaje VARCHAR(255) NOT NULL,
    hora TIME NOT NULL,
    estado VARCHAR(10) NOT NULL DEFAULT 'activo',
    id_medicamento INT NOT NULL,
    CONSTRAINT fk_recordatorio_medicamento FOREIGN KEY (id_medicamento) 
        REFERENCES medicamento(id_medicamento) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT chk_recordatorio_estado CHECK (estado IN ('activo', 'inactivo'))
);""",
            "sample": """INSERT INTO recordatorio (mensaje, hora, estado, id_medicamento)
VALUES ('Tomar Metformina 850 mg con el desayuno', '08:00:00', 'activo', 1);"""
        },
        {
            "name": "registro_toma",
            "desc": "Historial de tomas efectivas de medicamentos con fecha y hora y si el paciente confirmó explícitamente la administración para verificar adherencia terapéutica.",
            "rf": "RF13 | RNF-01, RNF-07",
            "fields": [
                ("id_toma", "SERIAL", "Entero auto-incremental", "Sí", "PK", "Identificador de la toma."),
                ("fecha_hora", "TIMESTAMP", "YYYY-MM-DD HH:MM:SS", "Sí", "—", "Momento en que se registró la toma."),
                ("confirmada", "BOOLEAN", "TRUE / FALSE", "Sí", "—", "TRUE = confirmada; FALSE = omitida."),
                ("id_medicamento", "INT", "Entero", "Sí", "FK", "Referencia a medicamento(id_medicamento) [CASCADE].")
            ],
            "ddl": """CREATE TABLE registro_toma (
    id_toma SERIAL PRIMARY KEY,
    fecha_hora TIMESTAMP NOT NULL,
    confirmada BOOLEAN NOT NULL DEFAULT FALSE,
    id_medicamento INT NOT NULL,
    CONSTRAINT fk_registro_toma_medicamento FOREIGN KEY (id_medicamento) 
        REFERENCES medicamento(id_medicamento) ON DELETE CASCADE ON UPDATE CASCADE
);""",
            "sample": """INSERT INTO registro_toma (fecha_hora, confirmada, id_medicamento)
VALUES ('2026-10-15 08:05:00', TRUE, 1);"""
        },
        {
            "name": "menu_recomendado",
            "desc": "Catálogo institucional de menús nutricionales saludables clasificados por tipo de diabetes (Tipo 1, Tipo 2, Gestacional o General) y momento del día.",
            "rf": "RF07, RF17 | RNF-02, RNF-07, RNF-08",
            "fields": [
                ("id_menu", "SERIAL", "Entero auto-incremental", "Sí", "PK", "Identificador único del menú."),
                ("tipo_diabetes", "VARCHAR(50)", "50 caracteres", "Sí", "—", "Valores: 'Tipo 1', 'Tipo 2', 'Gestacional', 'General'."),
                ("momento", "VARCHAR(30)", "30 caracteres", "Sí", "—", "Valores: 'Desayuno', 'Almuerzo', 'Cena', 'Merienda'."),
                ("descripcion", "VARCHAR(255)", "255 caracteres", "Sí", "—", "Detalle de la combinación de alimentos.")
            ],
            "ddl": """CREATE TABLE menu_recomendado (
    id_menu SERIAL PRIMARY KEY,
    tipo_diabetes VARCHAR(50) NOT NULL,
    momento VARCHAR(30) NOT NULL,
    descripcion VARCHAR(255) NOT NULL,
    CONSTRAINT chk_menu_diabetes CHECK (tipo_diabetes IN ('Tipo 1', 'Tipo 2', 'Gestacional', 'General')),
    CONSTRAINT chk_menu_momento CHECK (momento IN ('Desayuno', 'Almuerzo', 'Cena', 'Merienda'))
);""",
            "sample": """INSERT INTO menu_recomendado (tipo_diabetes, momento, descripcion)
VALUES ('Tipo 2', 'Almuerzo', 'Pechuga de pollo a la plancha con ensalada verde y 1/2 taza de lentejas.');"""
        }
    ]

    for tinfo in tables_detail:
        add_heading_2(f"Tabla: {tinfo['name']}")
        add_body_paragraph(tinfo['desc'])
        add_body_paragraph(f"Trazabilidad de Requisitos: {tinfo['rf']}", bold_prefix="Requisitos Asociados: ")
        
        f_table = doc.add_table(rows=len(tinfo['fields']) + 1, cols=6)
        f_table.alignment = WD_TABLE_ALIGNMENT.CENTER
        f_table.autofit = False
        set_table_borders(f_table)

        f_hdr = f_table.rows[0].cells
        f_hdr[0].width = Inches(1.3)
        f_hdr[1].width = Inches(1.1)
        f_hdr[2].width = Inches(1.1)
        f_hdr[3].width = Inches(0.6)
        f_hdr[4].width = Inches(0.6)
        f_hdr[5].width = Inches(2.3)
        for i, title in enumerate(["Campo", "Tipo Postgres", "Formato", "Req.", "Clave", "Descripción / Restricciones"]):
            set_cell_background(f_hdr[i], "F1F5F9")
            set_cell_margins(f_hdr[i], top=80, bottom=80, left=100, right=100)
            p = f_hdr[i].paragraphs[0]
            run = p.add_run(title)
            run.font.name = "Calibri"
            run.font.size = Pt(8.5)
            run.font.bold = True
            run.font.color.rgb = COLOR_DARK

        for r_idx, f_row in enumerate(tinfo['fields'], start=1):
            row_cells = f_table.rows[r_idx].cells
            row_cells[0].width = Inches(1.3)
            row_cells[1].width = Inches(1.1)
            row_cells[2].width = Inches(1.1)
            row_cells[3].width = Inches(0.6)
            row_cells[4].width = Inches(0.6)
            row_cells[5].width = Inches(2.3)
            bg = "FFFFFF" if r_idx % 2 != 0 else "F8FAFC"
            for c_idx, c_val in enumerate(f_row):
                set_cell_background(row_cells[c_idx], bg)
                set_cell_margins(row_cells[c_idx], top=55, bottom=55, left=100, right=100)
                p = row_cells[c_idx].paragraphs[0]
                run = p.add_run(c_val)
                run.font.name = "Calibri"
                run.font.size = Pt(8.5)
                if c_idx == 0:
                    run.font.bold = True
                    run.font.color.rgb = COLOR_PRIMARY
                elif c_idx == 4 and c_val in ("PK", "FK", "UQ"):
                    run.font.bold = True
                    run.font.color.rgb = COLOR_SECONDARY
                else:
                    run.font.color.rgb = COLOR_DARK

        add_heading_3(f"Sentencia DDL — Creación de la Tabla {tinfo['name']}")
        add_code_block(tinfo['ddl'])

        add_heading_3("Ejemplo de Inserción (DML)")
        add_code_block(tinfo['sample'])

    # ----------------------------------------------------
    # SCRIPT SQL COMPLETO Y VERIFICADO (SUPABASE / POSTGRES)
    # ----------------------------------------------------
    add_heading_1("Script SQL Completo y Verificado para Supabase (PostgreSQL 15+)")
    add_body_paragraph(
        "Este es el script definitivo y probado con éxito por el equipo. Incluye la eliminación ordenada con CASCADE, "
        "la definición de las 7 tablas, índices y datos iniciales de catálogo clínico y usuarios demo:"
    )

    with open(r"C:\Users\Admin\.gemini\antigravity\scratch\cuibot-database-doc\01_supabase_postgres_cuibot.sql", "r", encoding="utf-8") as f:
        supabase_sql_text = f.read()

    add_code_block(supabase_sql_text)

    # ----------------------------------------------------
    # APARTADO PARA ADJUNTAR IMÁGENES DE LA BASE DE DATOS FUNCIONANDO
    # ----------------------------------------------------
    add_heading_1("Adjuntar Imágenes de la Base de Datos Funcionando")
    add_body_paragraph(
        "Este apartado está reservado para que el equipo de desarrollo (Mayra, Felipe, Juan Pablo y Alejandro), "
        "bajo la supervisión del Scrum Master (Ian Marriaga) y Product Owner (Juan de la Hoz), incorpore las capturas "
        "de pantalla que certifiquen que la base de datos en Supabase ha sido creada, poblada y verificada exitosamente."
    )

    def add_image_placeholder_box(box_id, title, instructions):
        tbl = doc.add_table(rows=1, cols=1)
        tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
        tbl.autofit = False
        cell = tbl.cell(0, 0)
        cell.width = Inches(7.0)
        set_cell_background(cell, "F8FAFC")
        set_cell_margins(cell, top=140, bottom=140, left=160, right=140)
        
        tblPr = tbl._tbl.tblPr
        tblBorders = parse_xml(f'''
            <w:tblBorders {nsdecls("w")}>
                <w:top w:val="dashed" w:sz="12" w:space="0" w:color="94A3B8"/>
                <w:bottom w:val="dashed" w:sz="12" w:space="0" w:color="94A3B8"/>
                <w:left w:val="dashed" w:sz="12" w:space="0" w:color="94A3B8"/>
                <w:right w:val="dashed" w:sz="12" w:space="0" w:color="94A3B8"/>
                <w:insideH w:val="none"/>
                <w:insideV w:val="none"/>
            </w:tblBorders>
        ''')
        tblPr.append(tblBorders)
        
        p = cell.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p.paragraph_format.space_before = Pt(8)
        p.paragraph_format.space_after = Pt(4)
        
        r_num = p.add_run(f"[{box_id}] — {title}\n")
        r_num.font.name = "Calibri"
        r_num.font.size = Pt(11)
        r_num.font.bold = True
        r_num.font.color.rgb = COLOR_PRIMARY
        
        r_inst = p.add_run(f"{instructions}\n\n")
        r_inst.font.name = "Calibri"
        r_inst.font.size = Pt(9)
        r_inst.font.color.rgb = COLOR_MUTED
        
        p2 = cell.add_paragraph()
        p2.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p2.paragraph_format.space_before = Pt(16)
        p2.paragraph_format.space_after = Pt(24)
        r_box = p2.add_run("📸 [ PEGAR CAPTURA DE PANTALLA AQUÍ ]")
        r_box.font.name = "Calibri"
        r_box.font.size = Pt(10.5)
        r_box.font.bold = True
        r_box.font.color.rgb = RGBColor(148, 163, 184)

        sp = doc.add_paragraph()
        sp.paragraph_format.space_before = Pt(4)
        sp.paragraph_format.space_after = Pt(6)

    add_image_placeholder_box(
        "EVIDENCIA 1",
        "Ejecución Exitosa del Script en Supabase SQL Editor",
        "Instrucción: Tomar captura de pantalla en Supabase donde se visualice la pestaña SQL Editor con el resultado verde 'Success. No rows returned' tras la ejecución del script unificado."
    )

    add_image_placeholder_box(
        "EVIDENCIA 2",
        "Listado de Tablas Creadas en Supabase (Table Editor / Schema)",
        "Instrucción: Ir al menú 'Table Editor' en la barra lateral izquierda de Supabase y tomar captura donde se aprecien las 7 tablas del sistema creadas y operativas (usuario, alimentacion, actividad, medicamento, recordatorio, registro_toma, menu_recomendado)."
    )

    add_image_placeholder_box(
        "EVIDENCIA 3",
        "Verificación de Datos Iniciales (menu_recomendado / usuario)",
        "Instrucción: En Table Editor o SQL Editor, abrir la tabla 'menu_recomendado' o 'usuario' y tomar captura demostrando que los datos semilla (menús para Tipo 1, Tipo 2, Gestacional y General) se encuentran correctamente cargados."
    )

    # Checklist
    add_heading_2("Checklist de Aprobación de Base de Datos (Sprint 1)")
    chk_data = [
        ("Ejecución limpia del script DDL sin errores de sintaxis en Supabase.", "[ X ] Aprobado", "Felipe Morales / Alejandro Berdugo"),
        ("Creación exitosa de las 7 tablas relacionales en Supabase.", "[ X ] Aprobado", "Mayra Orozco / Juan Pablo Contreras"),
        ("Validación de restricciones UNIQUE (correo) y CHECK (duración, roles, estados).", "[ X ] Aprobado", "Ian Marriaga (Scrum Master)"),
        ("Validación de integridad referencial y borrado en cascada (ON DELETE CASCADE).", "[ X ] Aprobado", "Felipe Morales (Developer)"),
        ("Inserción y verificación de datos semilla (Seed Data de menús ADA y usuarios).", "[ X ] Aprobado", "Juan de la Hoz (Product Owner)"),
        ("Evidencias gráficas adjuntas en los tres recuadros superiores.", "[   ] Pendiente de captura", "Equipo C-LIFE")
    ]

    t_chk = doc.add_table(rows=len(chk_data) + 1, cols=3)
    t_chk.alignment = WD_TABLE_ALIGNMENT.CENTER
    t_chk.autofit = False
    set_table_borders(t_chk)

    chk_hdr = t_chk.rows[0].cells
    chk_hdr[0].width = Inches(4.2)
    chk_hdr[1].width = Inches(1.5)
    chk_hdr[2].width = Inches(1.3)
    for i, title in enumerate(["Criterio de Validación Técnica", "Estado", "Responsable de Aprobación"]):
        set_cell_background(chk_hdr[i], "F1F5F9")
        set_cell_margins(chk_hdr[i], top=80, bottom=80, left=100, right=100)
        p = chk_hdr[i].paragraphs[0]
        run = p.add_run(title)
        run.font.name = "Calibri"
        run.font.size = Pt(9)
        run.font.bold = True
        run.font.color.rgb = COLOR_DARK

    for row_idx, (crit, st, resp) in enumerate(chk_data, start=1):
        row_cells = t_chk.rows[row_idx].cells
        row_cells[0].width = Inches(4.2)
        row_cells[1].width = Inches(1.5)
        row_cells[2].width = Inches(1.3)
        bg = "FFFFFF" if row_idx % 2 != 0 else "F8FAFC"
        for i, val in enumerate([crit, st, resp]):
            set_cell_background(row_cells[i], bg)
            set_cell_margins(row_cells[i], top=60, bottom=60, left=100, right=100)
            p = row_cells[i].paragraphs[0]
            run = p.add_run(val)
            run.font.name = "Calibri"
            run.font.size = Pt(8.5)
            if i == 1:
                run.font.bold = True
                run.font.color.rgb = COLOR_SECONDARY
            else:
                run.font.color.rgb = COLOR_DARK

    output_path = r"C:\Users\Admin\.gemini\antigravity\scratch\cuibot-database-doc\CUIBOT_Documentacion_Base_de_Datos.docx"
    doc.save(output_path)
    print(f"Document updated successfully and saved at: {output_path}")

if __name__ == "__main__":
    create_document()
