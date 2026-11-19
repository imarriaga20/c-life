@echo off
setlocal EnableExtensions
title CUIBOT - Iniciar aplicacion
set "ROOT=%~dp0"
set "NODE_DIR=%LOCALAPPDATA%\Programs\nodejs-portable\node-v26.13.1-win-x64"
if exist "%NODE_DIR%\node.exe" set "PATH=%NODE_DIR%;%PATH%"

where node >nul 2>&1
if errorlevel 1 (
  echo [ERROR] No se encontro Node.js. Instala Node.js 18 o superior y vuelve a intentarlo.
  pause
  exit /b 1
)

echo [1/4] Verificando MySQL...
tasklist /FI "IMAGENAME eq mysqld.exe" 2>nul | find /I "mysqld.exe" >nul
if errorlevel 1 (
  if exist "C:\xampp\mysql\bin\mysqld.exe" (
    echo       Iniciando MySQL de XAMPP...
    start "CUIBOT MySQL" /min "C:\xampp\mysql\bin\mysqld.exe" --defaults-file="C:\xampp\mysql\bin\my.ini" --standalone
  ) else (
    echo [ERROR] MySQL no esta iniciado. Abre XAMPP y pulsa Start en MySQL.
    pause
    exit /b 1
  )
)

set /a INTENTOS=0
:ESPERAR_MYSQL
"C:\xampp\mysql\bin\mysqladmin.exe" -u root ping >nul 2>&1
if not errorlevel 1 goto MYSQL_LISTO
set /a INTENTOS+=1
if %INTENTOS% GEQ 25 (
  echo [ERROR] MySQL no respondio en 25 segundos. Revisa el panel de XAMPP.
  pause
  exit /b 1
)
ping -n 2 127.0.0.1 >nul
goto ESPERAR_MYSQL

:MYSQL_LISTO
echo       MySQL listo.

echo [2/4] Verificando dependencias del servidor...
if not exist "%ROOT%server\node_modules" (
  pushd "%ROOT%server"
  call npm.cmd install
  popd
)

echo [3/4] Verificando interfaz compilada...
if not exist "%ROOT%client\dist\index.html" (
  if not exist "%ROOT%client\node_modules" (
    pushd "%ROOT%client"
    call npm.cmd install
    popd
  )
  pushd "%ROOT%client"
  call npm.cmd run build
  popd
) else (
  echo       Build encontrado en client\dist.
)

echo [4/4] Iniciando API...
powershell -NoProfile -ExecutionPolicy Bypass -Command "try { $r=Invoke-RestMethod 'http://localhost:4000/api/salud' -TimeoutSec 2; if($r.ok){exit 0} else {exit 1} } catch { exit 1 }"
if errorlevel 1 (
  start "CUIBOT API" /D "%ROOT%server" cmd /k npm.cmd start
) else (
  echo       La API ya esta en ejecucion; se reutiliza.
)

echo Esperando a que la API responda...
powershell -NoProfile -ExecutionPolicy Bypass -Command "$ok=$false; for($i=0;$i -lt 40;$i++){ try { $r=Invoke-RestMethod 'http://localhost:4000/api/salud' -TimeoutSec 1; if($r.ok){$ok=$true;break} } catch {}; Start-Sleep -Milliseconds 500 }; if(-not $ok){exit 1}"
if errorlevel 1 (
  echo [ERROR] La API no respondio. Revisa la ventana "CUIBOT API".
  pause
  exit /b 1
)

if /I not "%CUIBOT_NO_BROWSER%"=="1" start "" "http://localhost:4000"
echo.
echo CUIBOT esta disponible en http://localhost:4000
echo Para cerrar la aplicacion, cierra la ventana "CUIBOT API".
ping -n 7 127.0.0.1 >nul
exit /b 0
