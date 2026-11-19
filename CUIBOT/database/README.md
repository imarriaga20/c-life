# Base de datos de CUIBOT

La aplicación en ejecución usa **MySQL/MariaDB** y la base **`cuibot_db`**. El nombre y el
esquema provienen del archivo original `originales/01_schema_cuibot.sql`; no se creó un
esquema distinto ni una base paralela.

## Archivos originales (sin modificar)

| Archivo | Motor | Uso |
|---|---|---|
| `originales/01_schema_cuibot.sql` | MySQL 8.0+ | Esquema original recibido. Crea `cuibot_db` y las 7 tablas. |
| `originales/02_seed_y_verificacion_cuibot.sql` | MySQL 8.0+ | Datos demo originales y consultas de verificación. |
| `originales/01_supabase_postgres_cuibot.sql` | PostgreSQL 15+/Supabase | Variante original para Supabase. **No la usa el backend actual.** |

Estos archivos se conservan tal como se recibieron para que el equipo pueda compararlos o
reutilizarlos. La integridad se verificó con SHA-256.

## Archivos de trabajo

| Archivo | Descripción |
|---|---|
| `01_schema_cuibot.sql` | Esquema de trabajo: las mismas 7 tablas y columnas, con índices integrados y compatibilidad con XAMPP/MariaDB. |
| `02_seed_y_verificacion_cuibot.sql` | Seed de trabajo: hashes bcrypt válidos, fechas relativas a hoy y los 48 menús. |
| `03_menus_variados.sql` | Migración idempotente: agrega 32 menús sin borrar usuarios ni datos de salud. |

Los cambios sobre el seed original son funcionales, no estructurales:

- Los hashes de ejemplo del script original no permiten iniciar sesión; se reemplazaron por
  hashes bcrypt reales para las cuentas demo.
- Se agregaron 32 menús alternativos (48 en total) para que el botón **Actualizar** rote
  sugerencias sin repetir la selección inmediata.
- Las fechas del seed son relativas a `CURDATE()` para que el dashboard siempre tenga datos.
- Los índices se movieron al esquema y se agregó `SET FOREIGN_KEY_CHECKS` para reimportar en
  XAMPP/MariaDB sin errores.

## Instalación desde cero

```powershell
C:\xampp\mysql\bin\mysql.exe --default-character-set=utf8mb4 -u root < database\01_schema_cuibot.sql
C:\xampp\mysql\bin\mysql.exe --default-character-set=utf8mb4 -u root < database\02_seed_y_verificacion_cuibot.sql
```

## Base ya existente (sin borrar datos)

```powershell
C:\xampp\mysql\bin\mysql.exe --default-character-set=utf8mb4 -u root < database\03_menus_variados.sql
```

## Verificación

```sql
USE cuibot_db;

SHOW TABLES;

SELECT id_usuario, nombre, correo, tipo_diabetes, rol
FROM Usuario
ORDER BY id_usuario;

SELECT COUNT(*) AS total_menus FROM Menu_Recomendado;

SELECT tipo_diabetes, momento, COUNT(*) AS opciones
FROM Menu_Recomendado
GROUP BY tipo_diabetes, momento
ORDER BY tipo_diabetes, momento;
```

La app se conecta con `mysql2` usando `server/.env`:

```env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=cuibot_db
```
