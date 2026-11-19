============================================================
CUIBOT - Asistente web para el control de la diabetes
============================================================

Este paquete contiene el código fuente completo de CUIBOT: frontend,
backend, scripts de base de datos, documentación y capturas de evidencia.

CONTENIDO
---------
- client/                  Aplicación React + Vite + TypeScript + Tailwind.
- server/                  API REST con Node.js, Express y MySQL.
- database/                Esquema, datos demo y migración de menús.
- database/originales/     Scripts originales recibidos, sin modificar.
- evidencias/              Capturas de pantalla del proyecto.
- README.md                Documentación completa.
- INICIAR_CUIBOT.bat       Lanzador para Windows (MySQL + API + navegador).
- COMPARTIR_CUIBOT.bat     Crea un enlace público temporal con Cloudflare.
- CUIBOT_MANTENER.ps1      Vigilante opcional para mantener los servicios activos.

REQUISITOS
----------
- Windows 10/11.
- Node.js 18 o superior.
- MySQL 8 o MariaDB 10.4 o superior. Se recomienda XAMPP.
- Git es opcional.

PASO 1: BASE DE DATOS
---------------------
1. Abre XAMPP y pulsa Start en MySQL.
2. Para una base nueva, importa en este orden:

   C:\xampp\mysql\bin\mysql.exe --default-character-set=utf8mb4 -u root < database\01_schema_cuibot.sql
   C:\xampp\mysql\bin\mysql.exe --default-character-set=utf8mb4 -u root < database\02_seed_y_verificacion_cuibot.sql

   El script 02 ya incluye los 48 menús y las cuentas demo con contraseñas válidas.

3. Si ya tienes una base con datos y no quieres borrarlos, ejecuta solo:

   C:\xampp\mysql\bin\mysql.exe --default-character-set=utf8mb4 -u root < database\03_menus_variados.sql

4. Verifica:

   C:\xampp\mysql\bin\mysql.exe -u root -e "USE cuibot_db; SHOW TABLES; SELECT id_usuario, nombre, correo FROM Usuario;"

PASO 2: CONFIGURACIÓN DEL BACKEND
---------------------------------
1. Copia server\.env.example como server\.env.
2. Ajusta los datos de MySQL si son distintos:

   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=cuibot_db

3. Genera un JWT_SECRET propio y pégalo en server\.env:

   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

PASO 3: DEPENDENCIAS Y BUILD
----------------------------
Desde la carpeta del proyecto:

   cd server
   npm install

   cd ..\client
   npm install
   npm run build

PASO 4: EJECUTAR
----------------
   cd ..\server
   npm start

Abre http://localhost:4000 en el navegador.

También puedes ejecutar INICIAR_CUIBOT.bat, que verifica MySQL, instala
dependencias si faltan, compila la interfaz y arranca la API. Ese lanzador
asume que XAMPP está en C:\xampp.

CUENTAS DEMO
------------
- Administrador: admin@cuibot.health / AdminClife2026*
- Paciente Tipo 2: ian.marriaga@cuibot.health / Cuibot2026*
- Paciente Tipo 1: juanpablo@cuibot.health / Cuibot2026*

COMPARTIR CON OTRAS PERSONAS
----------------------------
1. Arranca la aplicación con INICIAR_CUIBOT.bat.
2. Ejecuta COMPARTIR_CUIBOT.bat.
3. Copia el enlace https://...trycloudflare.com que aparece.

El enlace de Cloudflare es temporal: cambia si el túnel se reinicia y solo
funciona mientras el computador esté encendido, despierto y con internet.
Para un enlace fijo hace falta un túnel con dominio propio o un servicio
como Tailscale Funnel o ngrok con dominio estático.

SEGURIDAD
---------
- No se incluye server\.env porque contiene secretos. Créalo a partir de
  server\.env.example y usa un JWT_SECRET nuevo.
- Cambia las contraseñas demo si vas a publicar la aplicación.
- No ingreses información médica real: es un entorno de demostración.
- Cualquiera con el enlace público puede abrir la aplicación.

NOTA SOBRE CUIBOT_MANTENER.PS1
------------------------------
El script es opcional. En el computador original se ejecuta con una tarea
programada de Windows llamada CUIBOT-Mantener. En otro equipo puedes
crear tu propia tarea o ejecutarlo manualmente con PowerShell:

   powershell -ExecutionPolicy Bypass -File CUIBOT_MANTENER.ps1

Si no quieres que se abra una ventana, usa el lanzador invisible:

   wscript CUIBOT_MANTENER.vbs

Ese es el metodo que usa la tarea programada en el equipo original. El script
admite una sola instancia: si lo lanzas dos veces, la segunda termina sola.
