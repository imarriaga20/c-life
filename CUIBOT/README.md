# CUIBOT · Asistente web para el control de la diabetes

Proyecto académico del equipo **C-LIFE** (Scrum Master: Ian Marriaga). CUIBOT es una aplicación web que ayuda a personas con diabetes a registrar su alimentación, actividad física y medicamentos, mantener recordatorios de toma y recibir orientación inmediata mediante un asistente conversacional de hábitos saludables.

> ⚠️ **Aviso ético-médico (RNF-08):** Cuibot es una guía orientativa de hábitos saludables y **NO sustituye la valoración médica profesional**. Ante síntomas severos, desmayo, convulsiones o dificultad para respirar, acude de inmediato a urgencias o llama al **123**.

---

## 1. Funcionalidades

| Pantalla | Descripción |
|---|---|
| **Login / Registro** | Inicio de sesión con JWT, registro con autorización de datos (Ley 1581 de 2012) y cuentas demo. |
| **Dashboard** | Saludo personalizado, recordatorios del día con confirmación de toma, últimas comidas y actividades, resumen diario y meta semanal ADA. |
| **Alimentación** | Registro e historial de comidas, menús recomendados según el tipo de diabetes (con rotación de opciones al actualizar) y administración del catálogo de menús para el rol administrador (RF17). |
| **Actividad física** | Registro de sesiones con barra de progreso hacia la meta de **150 minutos semanales** (ADA). |
| **Medicamentos** | CRUD de medicamentos, hasta 6 recordatorios por fármaco, activar/pausar alarmas, confirmar tomas e historial de adherencia. |
| **Cuibot** | Chat con respuestas basadas en reglas: emergencias, hipoglucemia (regla 15-15), hiperglucemia, alimentación, actividad, medicamentos y glucosa. Siempre incluye el descargo de responsabilidad. |
| **Perfil** | Edición de datos personales y tipo de diabetes, cambio de contraseña, **exportación de datos en JSON** y **eliminación de cuenta en cascada** (derechos de acceso y supresión, Ley 1581). |

### Requisitos no funcionales cubiertos

- **UI:** shadcn/ui (Radix + Tailwind), paleta oficial `#FFFFFF`, `#A8FFE6`, `#6CA69C`, `#121A18`; títulos en Open Sans y cuerpo en Verdana.
- **Animación Pill Halo** obligatoria en los botones primarios (`pill-halo` en `client/src/index.css`).
- **Accesibilidad WCAG 2.1 AA:** foco visible, etiquetas asociadas, contraste, `aria-live` en toasts y chat, navegación por teclado, `prefers-reduced-motion`.
- **Accesibilidad verificada:** **0 violaciones** WCAG 2.1 A/AA (axe-core) en las 7 pantallas y en los diálogos de privacidad, registro de medicamento y eliminación de cuenta.
- **Diseño responsive mobile-first:** barra inferior de navegación en móvil y menú superior en escritorio.
- **Seguridad:** contraseñas con bcrypt (costo 12), JWT con expiración, consultas parametrizadas, `helmet`, CORS restringido, límite de intentos de login.
- **Base de datos:** MySQL/MariaDB con InnoDB, `utf8mb4`, claves foráneas `ON DELETE CASCADE` e índices de rendimiento.

---

## 2. Arquitectura

```
CUIBOT/
├── INICIAR_CUIBOT.bat                    # Lanzador local (MySQL + API + navegador)
├── COMPARTIR_CUIBOT.bat                  # Enlace público temporal para compañeros
├── CUIBOT_MANTENER.ps1                   # Vigilante: mantiene MySQL, API y túnel activos
├── CUIBOT_MANTENER.vbs                   # Lanzador invisible del vigilante (sin ventana)
├── database/
│   ├── originales/                       # Scripts originales recibidos, sin modificar
│   │   ├── 01_schema_cuibot.sql
│   │   ├── 01_supabase_postgres_cuibot.sql
│   │   └── 02_seed_y_verificacion_cuibot.sql
│   ├── 01_schema_cuibot.sql              # Esquema de trabajo (7 tablas e índices)
│   ├── 02_seed_y_verificacion_cuibot.sql # Datos demo + consultas de verificación
│   ├── 03_menus_variados.sql             # Alternativas de menús sin borrar datos existentes
│   └── README.md                         # Origen de la base y guía de importación
├── server/                               # API REST (Node.js + Express + MySQL)
│   ├── src/
│   │   ├── index.js                      # Punto de entrada, CORS, Helmet, montaje de rutas
│   │   ├── db.js                         # Pool mysql2 y helper de transacciones
│   │   ├── auth.js                       # Firma/verificación JWT y middleware de roles
│   │   ├── chatbot.js                    # Motor de respuestas de Cuibot
│   │   ├── routes/                       # auth, dashboard, alimentacion, menus, actividad,
│   │   │                                 # medicamentos, recordatorios, tomas, cuibot, perfil
│   │   └── utils/                        # Manejo de errores, validadores y serializadores
│   ├── .env.example
│   └── package.json
└── client/                               # SPA React + Vite + TypeScript + Tailwind
    ├── src/
    │   ├── components/ui/                # Componentes shadcn/ui
    │   ├── components/layout/AppLayout.tsx
    │   ├── context/AuthContext.tsx
    │   ├── pages/                        # Login, Dashboard, Alimentacion, Actividad,
    │   │                                 # Medicamentos, Cuibot, Perfil
    │   ├── lib/                          # API client, tipos y utilidades de formato
    │   └── index.css                     # Tokens de diseño y animación Pill Halo
    ├── tailwind.config.js
    └── package.json
```

El backend sirve el build del frontend (`client/dist`) si existe, de modo que en producción todo corre en un solo puerto (`4000`). En desarrollo, Vite (`5173`) hace proxy de `/api` hacia `4000`.

---

## 3. Requisitos previos

- **Node.js 18 o superior** (probado con Node.js 26.13.1 portable).
- **MySQL 8** o **MariaDB 10.4+** (probado con MariaDB 10.4.32 de XAMPP).
- Opcional: XAMPP para administrar MySQL desde su panel.

> En Windows, si PowerShell bloquea `npm` por la política de ejecución, usa `npm.cmd`.

---

## 4. Puesta en marcha

### 4.0 Inicio rápido en Windows

Si MySQL está instalado en `C:\xampp\mysql` y ya existen las dependencias (`server/node_modules` y `client/node_modules`), basta con hacer doble clic en:

```text
INICIAR_CUIBOT.bat
```

El lanzador:

1. Inicia MySQL si no está corriendo.
2. Instala dependencias si faltan y compila el frontend si no existe `client/dist`.
3. Arranca la API en `http://localhost:4000` (sirve también la SPA compilada).
4. Abre el navegador en `http://localhost:4000`.

Si tu MySQL está en otra ruta, inícialo manualmente desde XAMPP y luego ejecuta el lanzador.

### 4.0.1 Compartir la aplicación con otras personas

`localhost` solo abre la aplicación en tu propio computador. Para que tus compañeros entren desde cualquier red:

1. Abre `INICIAR_CUIBOT.bat` y espera a que cargue `http://localhost:4000`.
2. Ejecuta `COMPARTIR_CUIBOT.bat`.
3. Copia el enlace `https://...trycloudflare.com` que aparece y compártelo.

El primer uso descarga Cloudflare Tunnel (unos 53 MB) en `%LOCALAPPDATA%\CUIBOT`. El enlace actual queda guardado en `%LOCALAPPDATA%\CUIBOT\url.txt`.

Para que la aplicación siga encendida aunque se cierre la terminal, el proyecto incluye `CUIBOT_MANTENER.ps1`. La tarea programada **CUIBOT-Mantener** lo lanza mediante `CUIBOT_MANTENER.vbs`, un lanzador invisible que evita que aparezca una ventana negra cada vez que la tarea se ejecuta. La tarea arranca al iniciar sesión y se relanza cada 5 minutos si el vigilante no está corriendo; el script usa un mutex para garantizar una sola instancia. El script revisa cada 30 segundos MySQL, la API y el túnel; si alguno se cae, lo vuelve a levantar. MySQL se comprueba con una consulta real, de modo que un servidor colgado también se reinicia. El equipo debe permanecer encendido, despierto y conectado a internet. Con el cargador conectado, la suspensión y la hibernación quedaron desactivadas.

Si MySQL responde con `ERROR 1130` o `Read page with wrong checksum`, sus tablas de privilegios quedaron dañadas por un apagado brusco. El procedimiento de reparación con `aria_chk` está en la sección 15 de `RESUMEN_CUIBOT.md`.

> **Limitación:** los enlaces rápidos de Cloudflare (`trycloudflare.com`) cambian si el túnel se reinicia. Para un enlace fijo hace falta un túnel con nombre (Cloudflare + dominio propio) o un servicio con dominio estático como Tailscale Funnel o ngrok. Si el túnel se reinicia, el nuevo enlace queda en `%LOCALAPPDATA%\CUIBOT\url.txt`.

### 4.0.2 Abrir el proyecto en Visual Studio Code

La carpeta raíz ya incluye la configuración de VS Code en `.vscode/`:

1. Abre VS Code y elige **Archivo → Abrir carpeta**, señalando la carpeta `CUIBOT`.
2. Acepta las extensiones recomendadas (Tailwind, EditorConfig, SQLTools, GitLens, REST Client).
3. Pulsa `Ctrl+Shift+B` para ejecutar la tarea **CUIBOT: preparar todo**, que instala dependencias y compila la interfaz.
4. Pulsa `Ctrl+Shift+P` → **Tasks: Run Task** → **CUIBOT: iniciar API**.
5. Abre `http://localhost:4000`.

Tareas disponibles:

| Tarea | Qué hace |
|---|---|
| `CUIBOT: preparar todo` | Instala dependencias de `server` y `client` y compila la interfaz. |
| `CUIBOT: iniciar API` | Arranca el backend en el puerto 4000. |
| `CUIBOT: API con recarga automática` | Igual, pero reinicia al guardar archivos del backend. |
| `CUIBOT: interfaz en desarrollo` | Vite en el puerto 5173 con recarga en caliente. |
| `CUIBOT: compilar interfaz` | Genera `client/dist`. |

Para depurar, abre el panel **Run and Debug** y elige **CUIBOT: API (depurar)** o el compuesto **CUIBOT: API + interfaz**, que levanta Vite y abre Chrome con puntos de interrupción activos.

La conexión **CUIBOT (MySQL local)** de SQLTools ya está configurada contra `127.0.0.1:3306` y la base `cuibot_db`.

> **Privacidad:** cualquiera que tenga el enlace puede abrir la aplicación. Es un entorno de demostración con datos ficticios: no ingreses información médica real ni reutilices contraseñas personales.

En la misma red Wi-Fi también puedes compartir `http://TU-IP-LOCAL:4000` (por ejemplo `http://192.168.80.151:4000`), siempre que el firewall de Windows permita la conexión entrante.

### 4.1 Crear la base de datos

Con MySQL/MariaDB iniciado, ejecuta los scripts en orden:

```powershell
# Opción A: desde la consola de MySQL
mysql --default-character-set=utf8mb4 -u root -p < database/01_schema_cuibot.sql
mysql --default-character-set=utf8mb4 -u root -p < database/02_seed_y_verificacion_cuibot.sql
```

```sql
-- Opción B: dentro de la consola mysql
SOURCE C:/ruta/a/CUIBOT/database/01_schema_cuibot.sql;
SOURCE C:/ruta/a/CUIBOT/database/02_seed_y_verificacion_cuibot.sql;
```

> Los scripts incluyen `SET NAMES utf8mb4;`, pero en Windows conviene añadir `--default-character-set=utf8mb4` al cliente para que los acentos se guarden correctamente.

> Si tu ruta contiene acentos o espacios, copia los `.sql` a una ruta ASCII (por ejemplo `C:\temp\cuibot_sql\`) antes de usar `SOURCE`, porque el cliente de MySQL en Windows no interpreta bien esas rutas.

El script de seed es **idempotente**: limpia y vuelve a cargar los datos demo con fechas relativas a `CURDATE()`, por lo que el dashboard siempre muestra información del día.

> Si ya tenías la base creada y **no quieres borrar usuarios ni registros**, ejecuta `database/03_menus_variados.sql`. Agrega 32 alternativas de menús de forma idempotente, sin reiniciar los datos.

### 4.2 Configurar el backend

```powershell
cd server
Copy-Item .env.example .env
```

Edita `server/.env` si tu MySQL usa otra contraseña o puerto:

```env
PORT=4000
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=cuibot_db
JWT_SECRET=un-secreto-largo-y-aleatorio
JWT_EXPIRES_IN=8h
CLIENT_ORIGIN=http://localhost:5173
```

Instala dependencias y arranca:

```powershell
npm.cmd install
npm.cmd run dev     # node --watch para desarrollo
# o
npm.cmd start       # producción
```

Comprueba la salud del servicio: <http://localhost:4000/api/salud>

### 4.3 Configurar el frontend

```powershell
cd client
npm.cmd install
npm.cmd run dev
```

Abre <http://localhost:5173>.

Para generar el build de producción:

```powershell
npm.cmd run build
```

Luego el backend servirá la SPA desde <http://localhost:4000>.

---

## 5. Cuentas de demostración

| Rol | Correo | Contraseña |
|---|---|---|
| Paciente (Tipo 2) | `ian.marriaga@cuibot.health` | `Cuibot2026*` |
| Paciente (Tipo 1) | `juanpablo@cuibot.health` | `Cuibot2026*` |
| Administrador | `admin@cuibot.health` | `AdminClife2026*` |

La pantalla de login incluye botones que cargan estas credenciales automáticamente.

---

## 6. API REST

Todas las rutas protegidas requieren `Authorization: Bearer <token>`. Los errores devuelven `{ "mensaje": "..." }` con el código HTTP correspondiente.

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/salud` | Estado del servicio y de la base de datos. |
| `POST` | `/api/auth/login` | Inicio de sesión; devuelve `token` y `usuario`. |
| `POST` | `/api/auth/registro` | Registro de paciente con autorización de datos. |
| `GET` | `/api/auth/me` | Datos del usuario autenticado. |
| `GET` | `/api/dashboard/resumen` | Recordatorios, últimas comidas/actividades, resumen diario y semana. |
| `GET/POST` | `/api/alimentacion` | Listar o crear comidas. |
| `PUT/DELETE` | `/api/alimentacion/:id` | Actualizar o eliminar una comida propia. |
| `GET` | `/api/menus` | Una sugerencia por momento, rotando entre las opciones disponibles (`?tipo_diabetes=` y `?excluir=id1,id2` opcionales). |
| `GET` | `/api/menus?todos=1` | Catálogo completo (solo administrador). |
| `POST/PUT/DELETE` | `/api/menus` · `/api/menus/:id` | Administración de menús (solo administrador, RF17). |
| `GET/POST` | `/api/actividad` | Listar actividades y resumen semanal, o registrar una. |
| `DELETE` | `/api/actividad/:id` | Eliminar una actividad propia. |
| `GET/POST` | `/api/medicamentos` | Listar medicamentos con recordatorios, o crear uno con alarmas. |
| `PUT/DELETE` | `/api/medicamentos/:id` | Actualizar o eliminar un medicamento propio. |
| `GET` | `/api/recordatorios` | Recordatorios del usuario. |
| `PUT` | `/api/recordatorios/:id/toggle` | Activar o pausar un recordatorio (`{ "estado": "activo" }`). |
| `GET/POST` | `/api/tomas` | Historial de tomas o confirmación de una toma. |
| `GET` | `/api/cuibot/sugerencias` | Preguntas rápidas sugeridas. |
| `POST` | `/api/cuibot/consulta` | Respuesta de Cuibot con categoría y bandera de urgencia. |
| `GET/PUT` | `/api/usuarios/perfil` | Consultar o actualizar perfil/contraseña. |
| `GET` | `/api/usuarios/exportar` | Exportar todos los datos del usuario (JSON). |
| `DELETE` | `/api/usuarios/cuenta` | Eliminar la cuenta y sus datos en cascada. |

---

## 7. Modelo de datos

Siete tablas en `cuibot_db`:

> La base en uso es la **original de MySQL**: `cuibot_db`, definida en
> `database/originales/01_schema_cuibot.sql`. Los scripts de trabajo conservan exactamente
> las mismas tablas y columnas; los archivos originales se guardan sin modificar en
> `database/originales/`.

1. **Usuario** – nombre, correo único, contraseña bcrypt, tipo de diabetes, rol.
2. **Alimentacion** – descripción, tipo de comida, fecha, hora, usuario.
3. **Actividad** – tipo, duración (min), fecha, usuario.
4. **Medicamento** – nombre, dosis, horario, usuario.
5. **Recordatorio** – mensaje, hora, estado (`activo`/`inactivo`), medicamento.
6. **Registro_Toma** – fecha/hora, confirmada, medicamento.
7. **Menu_Recomendado** – tipo de diabetes, momento, descripción.

Relaciones principales: todas las tablas de salud referencian a `Usuario` con `ON DELETE CASCADE`; `Recordatorio` y `Registro_Toma` referencian a `Medicamento` con `ON DELETE CASCADE`.

---

## 8. Notas sobre Supabase/PostgreSQL

> **Importante:** la aplicación que se ejecuta con `INICIAR_CUIBOT.bat` guarda todos los datos
> en **MySQL/MariaDB local** (`cuibot_db`), no en Supabase. Si en el panel de Supabase no
> aparecen los usuarios nuevos, es porque Supabase es otra base de datos y **no está conectada**
> al backend. La configuración real está en `server/.env` (`DB_HOST=127.0.0.1`, `DB_NAME=cuibot_db`)
> y el driver es `mysql2` (`server/src/db.js`). Para consultar los usuarios reales:
>
> ```sql
> USE cuibot_db;
> SELECT id_usuario, nombre, correo, tipo_diabetes, rol FROM Usuario;
> ```

El script original de Supabase/PostgreSQL se conserva en
`database/originales/01_supabase_postgres_cuibot.sql`. Es una variante y **no está conectado**
al backend actual.

Los scripts incluidos usan sintaxis MySQL/MariaDB (`AUTO_INCREMENT`, `ENGINE=InnoDB`, `YEARWEEK`, `FIELD`). Si se desea migrar a Supabase (PostgreSQL), hay que adaptar:

- `AUTO_INCREMENT` → `GENERATED ALWAYS AS IDENTITY` o `SERIAL`.
- `ENGINE=InnoDB DEFAULT CHARSET=utf8mb4` → eliminar.
- Tipos `BOOLEAN` se mantienen; `DATETIME` → `TIMESTAMP`.
- Funciones `CURDATE()` → `CURRENT_DATE`; `NOW()` → `NOW()`; `YEARWEEK` → `DATE_TRUNC('week', ...)`;
  `FIELD(...)` → `CASE ... END`.
- El backend usa `mysql2`; para Supabase se requiere un cliente PostgreSQL (`pg`) y ajustar los placeholders `?` a `$1, $2…`.

La versión de este repositorio está probada y verificada sobre MySQL/MariaDB.

---

## 9. Verificación rápida

```powershell
# 1. Salud del backend
Invoke-RestMethod http://localhost:4000/api/salud

# 2. Login demo
$login = Invoke-RestMethod -Method Post -Uri http://localhost:4000/api/auth/login `
  -ContentType 'application/json' `
  -Body '{"correo":"ian.marriaga@cuibot.health","contrasena":"Cuibot2026*"}'

# 3. Dashboard
Invoke-RestMethod http://localhost:4000/api/dashboard/resumen `
  -Headers @{ Authorization = "Bearer $($login.token)" }
```

Consulta también `database/02_seed_y_verificacion_cuibot.sql`, que imprime tablas, usuarios, menús, recordatorios y el acumulado semanal de actividad (Ian: 90 min, Juan Pablo: 75 min).

### 9.1 Evidencias visuales

Las capturas finales están en `evidencias/`:

| Archivo | Contenido |
|---|---|
| `01-login-escritorio.png` | Login y registro con cuentas demo, en escritorio. |
| `02-dashboard-escritorio.png` | Dashboard con recordatorios del día, resumen y meta semanal. |
| `03-alimentacion-menus.png` | Menús recomendados filtrados para Tipo 2. |
| `04-actividad-escritorio.png` | Progreso de 90/150 minutos y formulario de sesión. |
| `05-medicamentos-escritorio.png` | Medicamentos con recordatorios activos y confirmación de tomas. |
| `06-cuibot-chat.png` | Respuesta de Cuibot ante hipoglucemia (regla 15-15) y aviso ético. |
| `07-perfil-escritorio.png` | Datos personales, cambio de contraseña y derechos Ley 1581. |
| `08-login-movil.png` | Vista móvil del login (390 px). |
| `09-dashboard-movil.png` | Vista móvil del dashboard. |
| `09b-dashboard-movil-recordatorios.png` | Recordatorios y confirmación de toma en móvil. |
| `10-medicamentos-movil.png` | Vista móvil de medicamentos. |
| `10b-medicamentos-movil-recordatorios.png` | Recordatorios y switches en móvil. |

Las vistas móviles se generaron a 390×844 px; se comprobó que `scrollWidth === clientWidth` en las 7 pantallas, sin desbordamiento horizontal.

### 9.2 Auditoría de accesibilidad

Se ejecutó **axe-core** con las etiquetas `wcag2a`, `wcag2aa`, `wcag21a` y `wcag21aa` sobre el build de producción:

- 7 pantallas: login, dashboard, alimentación, actividad, medicamentos, Cuibot y perfil.
- 3 diálogos: política de privacidad, registro de medicamento y eliminación de cuenta.
- Resultado: **0 violaciones** en todas las auditorías.

Durante la revisión se corrigieron el contraste de botones y enlaces (texto oscuro sobre `#6CA69C` y token `primary-ink` para texto sobre blanco), los nombres accesibles de las barras de progreso, el botón de actualizar actividad, la navegación móvil y las horas de recordatorio.

---

## 10. Privacidad y ética

- Los datos de salud se tratan conforme a la **Ley 1581 de 2012** (Colombia): autorización explícita en el registro, derecho de acceso (exportación JSON) y derecho de supresión (eliminación en cascada).
- Las contraseñas nunca se almacenan en texto plano.
- El asistente Cuibot es **orientativo** y no emite diagnósticos ni ajustes de dosis; siempre deriva a atención profesional ante señales de alarma.

---

## 11. Equipo

**C-LIFE**
- Ian Marriaga — Scrum Master / desarrollo
- Juan Pablo Contreras — desarrollo
- Administrador clínico demo — validación de menús y catálogo

Proyecto académico · 2026
