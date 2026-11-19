# CUIBOT — Resumen completo del proyecto

**Proyecto:** CUIBOT – Asistente web para el control de la diabetes  
**Equipo:** C-LIFE  
**Fecha de este resumen:** 17 de noviembre de 2026  
**Repositorio local:** `CUIBOT`  
**Repositorio remoto previsto:** `https://github.com/imarriaga20/c-life`

---

## 1. Estado actual

La aplicación está completa y funcionando en local sobre MySQL/MariaDB:

- Frontend React + Vite + TypeScript + Tailwind, compilado en `client/dist`.
- Backend Node.js + Express + MySQL (`mysql2`), escuchando en `http://localhost:4000`.
- Base de datos MySQL `cuibot_db` con las 7 tablas del esquema original.
- Enlace público temporal mediante Cloudflare Quick Tunnel.
- Repositorio Git local con historial de commits.
- Documentación, capturas de evidencia y scripts de instalación incluidos.

> **Pendiente:** subir el repositorio local al remoto de GitHub. El código ya está
> versionado; falta autenticarse y hacer `git push`.

---

## 2. Funcionalidades implementadas

| Módulo | Descripción |
|---|---|
| Autenticación | Registro, inicio de sesión, cierre de sesión, JWT, contraseñas bcrypt y autorización de datos (Ley 1581). |
| Dashboard | Resumen diario, recordatorios, últimas comidas/actividades, progreso semanal y accesos rápidos. |
| Alimentación | Registro e historial de comidas, edición/eliminación y menús clínicos recomendados. |
| Menús | 48 menús (3 por tipo de diabetes y momento), rotación al pulsar “Actualizar” y CRUD para administrador. |
| Actividad | Registro de actividad física, historial y acumulado semanal. |
| Medicamentos | CRUD de medicamentos con horarios y recordatorios asociados. |
| Recordatorios | Activación/pausa de alarmas y confirmación de tomas. |
| Tomas | Historial y registro de tomas confirmadas. |
| Cuibot | Chat de orientación con categorías, respuestas sugeridas y bandera de urgencia. |
| Perfil | Actualización de datos, cambio de contraseña, exportación de datos y eliminación de cuenta. |
| Administración | Catálogo completo de menús y gestión de menús para el rol administrador. |

---

## 3. Diseño y accesibilidad

- Paleta: `#FFFFFF`, `#A8FFE6`, `#6CA69C`, `#121A18`.
- Tipografías: Open Sans para títulos, Verdana para cuerpo.
- Efecto **Pill Halo** obligatorio en los botones principales.
- Diseño mobile-first, probado a 390 px sin desbordamiento horizontal.
- WCAG 2.1 AA: auditoría con axe-core con **0 violaciones** en 7 páginas y 3 diálogos.
- Aviso médico y derechos de datos visibles en la interfaz.

---

## 4. Base de datos

### Motor y base en uso

- Motor: **MySQL 8 / MariaDB 10.4** (XAMPP).
- Base: **`cuibot_db`**.
- Driver del backend: `mysql2`.
- Configuración: `server/.env` (`DB_HOST=127.0.0.1`, `DB_PORT=3306`, `DB_NAME=cuibot_db`).

### Tablas

1. `Usuario`
2. `Alimentacion`
3. `Actividad`
4. `Medicamento`
5. `Recordatorio`
6. `Registro_Toma`
7. `Menu_Recomendado`

Las tablas de salud referencian a `Usuario` con `ON DELETE CASCADE`. `Recordatorio` y
`Registro_Toma` referencian a `Medicamento` con `ON DELETE CASCADE`.

### Scripts

| Archivo | Uso |
|---|---|
| `database/01_schema_cuibot.sql` | Esquema de trabajo, 7 tablas e índices. |
| `database/02_seed_y_verificacion_cuibot.sql` | Seed de trabajo: usuarios demo, 48 menús, medicamentos, recordatorios, comidas y actividades. |
| `database/03_menus_variados.sql` | Migración idempotente: agrega 32 menús sin borrar datos. |
| `database/originales/` | Scripts originales recibidos, sin modificar (MySQL y Supabase/PostgreSQL). |
| `database/README.md` | Explicación del origen de la base y guía de importación. |

### Aclaración importante sobre Supabase

La aplicación en ejecución usa **MySQL**, no Supabase. El script
`database/originales/01_supabase_postgres_cuibot.sql` es la variante PostgreSQL y
**no está conectado** al backend. Los usuarios nuevos se guardan en `cuibot_db`; por eso
pueden no aparecer en el panel de Supabase.

### Menús

- 16 menús originales del seed, conservados con ids 1–16.
- 32 menús adicionales agregados para la rotación.
- Total: **48 menús**, exactamente 3 por cada tipo de diabetes y momento.
- El botón “Actualizar” envía los ids visibles mediante `?excluir=` y el backend elige
  una opción diferente para desayuno, almuerzo, merienda y cena.

---

## 5. Cambios y correcciones principales

1. **Variedad de menús:** se agregaron 32 alternativas y se implementó la rotación con
   `?excluir=id1,id2` para no repetir la selección inmediata. Probado durante 5
   actualizaciones consecutivas en Tipo 1 y Tipo 2 sin repeticiones.
2. **Registro de usuarios:** se verificó que los registros se guardan en MySQL. Se creó y
   eliminó una cuenta de prueba (id 5) y se confirmó que el usuario real id 4 permanece.
3. **Límite de intentos de login:** el throttle es por correo, no por IP. Solo cuenta los
   intentos fallidos y se limpia al iniciar sesión correctamente. El intento 21 devuelve 429.
4. **Scripts originales:** se conservaron sin modificar en `database/originales/` y se
   documentó la diferencia con los scripts de trabajo.
5. **Vigilante de disponibilidad:** `CUIBOT_MANTENER.ps1` revisa MySQL, la API y el túnel
   cada 30 segundos. Comprueba MySQL con una consulta real (`SELECT 1`), no solo con el
   proceso, porque un servidor colgado puede seguir apareciendo en la lista de procesos.
   La tarea `CUIBOT-Mantener` lo ejecuta al iniciar sesión y además cada 5 minutos, con
   reinicio automático si el propio vigilante termina. Se lanza a través de
   `CUIBOT_MANTENER.vbs` para que no aparezca ninguna ventana, y un mutex impide que se
   ejecuten dos instancias a la vez.
6. **Enlace público:** `COMPARTIR_CUIBOT.bat` crea el túnel y guarda la URL actual en
   `%LOCALAPPDATA%\CUIBOT\url.txt`.
7. **Documentación:** README principal, guía rápida `LEEME_PRIMERO.txt`, README de base de
   datos y este resumen.

---

## 6. Seguridad y privacidad

- Contraseñas con bcrypt (coste 12).
- Sesiones con JWT y expiración configurable.
- Helmet, CORS restringido y validación de datos de entrada.
- Autorización explícita para el tratamiento de datos de salud (Ley 1581 de 2012).
- Aviso médico: la aplicación no sustituye la consulta con un profesional.
- `server/.env` no se incluye en el paquete porque contiene secretos.
- No se deben ingresar datos médicos reales en el entorno de demostración.

---

## 7. Cómo ejecutar en otro computador

### Requisitos

- Windows 10/11.
- Node.js 18 o superior.
- MySQL/MariaDB (XAMPP recomendado).
- Git opcional.

### Pasos

1. Instalar dependencias y compilar:

   ```powershell
   cd server
   npm install

   cd ..\client
   npm install
   npm run build
   ```

2. Crear `server\.env` a partir de `server\.env.example` y ajustar:

   ```env
   PORT=4000
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=cuibot_db
   JWT_SECRET=<secreto-largo-y-aleatorio>
   JWT_EXPIRES_IN=8h
   CLIENT_ORIGIN=http://localhost:5173
   ```

3. Importar la base nueva:

   ```powershell
   C:\xampp\mysql\bin\mysql.exe --default-character-set=utf8mb4 -u root < database\01_schema_cuibot.sql
   C:\xampp\mysql\bin\mysql.exe --default-character-set=utf8mb4 -u root < database\02_seed_y_verificacion_cuibot.sql
   ```

4. Arrancar:

   ```powershell
   cd server
   npm start
   ```

5. Abrir `http://localhost:4000`.

También se puede usar `INICIAR_CUIBOT.bat` si XAMPP está en `C:\xampp`.

---

## 8. Cuentas demo

| Rol | Correo | Contraseña |
|---|---|---|
| Administrador | `admin@cuibot.health` | `AdminClife2026*` |
| Paciente Tipo 2 | `ian.marriaga@cuibot.health` | `Cuibot2026*` |
| Paciente Tipo 1 | `juanpablo@cuibot.health` | `Cuibot2026*` |

---

## 9. Pruebas realizadas

- Build de producción del frontend correcto.
- API local y pública respondiendo en `/api/salud`.
- Login, dashboard, alimentación, menús, actividad, medicamentos, recordatorios, tomas,
  Cuibot, perfil, exportación y eliminación de cuenta.
- CRUD de menús como administrador: 48 → 49 → 48 tras crear, editar y eliminar.
- Rotación de menús: 5 actualizaciones consecutivas sin repetir la selección anterior.
- Registro de usuario desde el enlace público y verificación en MySQL.
- Límite de intentos de login: 20 fallos → 401; intento 21 → 429.
- Auditoría axe-core: 0 violaciones en 7 páginas y 3 diálogos.
- Vista móvil a 390 px sin desplazamiento horizontal.
- 12 capturas de evidencia en `evidencias/`.

---

## 10. Estructura del repositorio

```text
CUIBOT/
├── client/                  # React + Vite + TypeScript + Tailwind
├── server/                  # API Node.js + Express + MySQL
├── database/                # Esquema, seed, migración y scripts originales
├── evidencias/              # Capturas de pantalla
├── README.md                # Documentación principal
├── LEEME_PRIMERO.txt        # Guía rápida para otro equipo
├── RESUMEN_CUIBOT.md        # Este documento
├── INICIAR_CUIBOT.bat       # Lanzador local
├── COMPARTIR_CUIBOT.bat     # Enlace público temporal
├── CUIBOT_MANTENER.ps1      # Vigilante de servicios
└── CUIBOT_MANTENER.vbs      # Lanzador invisible del vigilante
```

---

## 11. Historial Git local

Commits principales:

| Commit | Descripción |
|---|---|
| `5c0df23` | Commit inicial de CUIBOT. |
| `a8bb3ed` | Aclarar que la app usa MySQL local y no Supabase. |
| `8525ac0` | Conservar los scripts originales de la base de datos. |
| `331585b` | Mantener CUIBOT activo y guardar el enlace público. |
| `24a0d11` | Guía rápida para ejecutar CUIBOT en otro equipo. |

El repositorio local está limpio. Para subirlo a GitHub:

```powershell
git remote add origin https://github.com/imarriaga20/c-life.git
git push -u origin main
```

> Si el repositorio remoto ya tiene archivos o commits, primero hay que integrarlos.
> No usar `git push --force` sin revisar el contenido del remoto.

---

## 12. Enlace público y limitaciones

El enlace público actual es temporal:

```text
https://nurses-starting-scanners-either.trycloudflare.com
```

- Funciona mientras el computador esté encendido, despierto y con internet.
- El enlace cambia si el túnel se reinicia.
- El nuevo enlace se guarda en `%LOCALAPPDATA%\CUIBOT\url.txt`.
- Para un enlace fijo se necesita un túnel con dominio propio, Tailscale Funnel, ngrok con
  dominio estático o un despliegue en la nube.

---

## 13. Evidencias

Las capturas están en `evidencias/`:

- Login de escritorio y móvil.
- Dashboard de escritorio y móvil.
- Alimentación y menús recomendados.
- Actividad, medicamentos y recordatorios.
- Chat de Cuibot.
- Perfil.

---

## 14. Nota final

El proyecto está listo para la entrega y para subirse a GitHub. La base de datos en uso es
la original de MySQL (`cuibot_db`), con los ajustes funcionales documentados. La variante de
Supabase/PostgreSQL se conserva como referencia, pero no está conectada al backend.

---

## 15. Solución de problemas

### La aplicación no abre y `mysql.exe` responde `ERROR 1130`

Síntoma: el backend no arranca y al probar MySQL aparece
`Host 'localhost' is not allowed to connect to this MariaDB server`.

Causa observada: apagado brusco del equipo que dejó corruptas las tablas de privilegios
del motor Aria (`mysql.global_priv`, sobre la que se apoya la vista `mysql.user`).

Solución aplicada:

```powershell
# 1. Detener MySQL
Get-Process mysqld -ErrorAction SilentlyContinue | Stop-Process -Force

# 2. Respaldar las tablas del sistema
Copy-Item 'C:\xampp\mysql\data\mysql\*' 'D:\respaldo-mysql' -Recurse -Force

# 3. Reparar la tabla de privilegios
C:\xampp\mysql\bin\aria_chk.exe --recover --force C:\xampp\mysql\data\mysql\global_priv.MAI

# 4. Arrancar MySQL y verificar
C:\xampp\mysql\bin\mysqld.exe --defaults-file=C:\xampp\mysql\bin\my.ini --standalone
C:\xampp\mysql\bin\mysql.exe -u root -e "SELECT User, Host FROM mysql.user;"
```

La reparación recuperó los 4 registros (root en `localhost`, `127.0.0.1`, `::1` y `pma`) y
la base `cuibot_db` quedó intacta: 7 tablas, 4 usuarios y 48 menús.

### Dónde revisar cuando algo falla

| Recurso | Ruta |
|---|---|
| Log del vigilante | `%LOCALAPPDATA%\CUIBOT\watchdog.log` |
| Log de la API | `%LOCALAPPDATA%\CUIBOT\api.log` |
| Log del túnel | `%LOCALAPPDATA%\CUIBOT\tunnel.log` |
| Log de errores de MySQL | `C:\xampp\mysql\data\mysql_error.log` |
| Enlace público actual | `%LOCALAPPDATA%\CUIBOT\url.txt` |

### Comprobar el estado completo

```powershell
# MySQL responde y autentica
C:\xampp\mysql\bin\mysql.exe -u root -h 127.0.0.1 --protocol=TCP -e "SELECT 1"

# API local
Invoke-RestMethod http://localhost:4000/api/salud

# Enlace público
Invoke-RestMethod "$(Get-Content "$env:LOCALAPPDATA\CUIBOT\url.txt")/api/salud"
```

