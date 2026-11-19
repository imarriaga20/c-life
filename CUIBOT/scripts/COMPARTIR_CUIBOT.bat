@echo off
setlocal EnableExtensions
title CUIBOT - Compartir enlace publico
set "TOOLS=%LOCALAPPDATA%\CUIBOT"
set "CF=%TOOLS%\cloudflared.exe"
set "LOG=%TOOLS%\tunnel.log"

echo Verificando que CUIBOT este encendido...
powershell -NoProfile -ExecutionPolicy Bypass -Command "try { $r=Invoke-RestMethod 'http://localhost:4000/api/salud' -TimeoutSec 3; if($r.ok){exit 0} else {exit 1} } catch { exit 1 }"
if errorlevel 1 (
  echo [ERROR] La aplicacion no esta corriendo.
  echo Abre primero INICIAR_CUIBOT.bat y espera a que cargue en el navegador.
  pause
  exit /b 1
)

if not exist "%TOOLS%" mkdir "%TOOLS%"

if not exist "%CF%" (
  echo Descargando Cloudflare Tunnel ^(solo la primera vez^)...
  powershell -NoProfile -ExecutionPolicy Bypass -Command "$ProgressPreference='SilentlyContinue'; try { Invoke-WebRequest 'https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe' -OutFile '%CF%' -TimeoutSec 300; exit 0 } catch { exit 1 }"
  if errorlevel 1 (
    echo [ERROR] No se pudo descargar Cloudflare Tunnel. Revisa tu conexion a internet.
    pause
    exit /b 1
  )
)

if exist "%LOG%" del "%LOG%" >nul 2>&1

echo.
echo Abriendo el tunel publico...
start "CUIBOT TUNEL" cmd /k ""%CF%" tunnel --url http://localhost:4000 --no-autoupdate --protocol http2 --logfile "%LOG%""

echo Esperando el enlace...
powershell -NoProfile -ExecutionPolicy Bypass -Command "$url=$null; for($i=0;$i -lt 40;$i++){ if(Test-Path '%LOG%'){ $m=Select-String -Path '%LOG%' -Pattern 'https://[a-z0-9-]+\.trycloudflare\.com' | Select-Object -First 1; if($m){ $url=$m.Matches[0].Value; break } }; Start-Sleep -Milliseconds 500 }; if($url){ Set-Content -Path '%TOOLS%\url.txt' -Value $url -Encoding ASCII; Write-Host ''; Write-Host 'Comparte este enlace con tus companeros:' -ForegroundColor Green; Write-Host $url -ForegroundColor Cyan; Write-Host ''; exit 0 } else { exit 1 }"
if errorlevel 1 (
  echo [ERROR] No se pudo obtener el enlace automaticamente.
  echo Revisa la ventana "CUIBOT TUNEL": alli aparece la URL.
  pause
  exit /b 1
)

echo Mientras tus companeros usan la aplicacion, deja abiertas:
echo   - la ventana "CUIBOT API"  ^(servidor^)
echo   - la ventana "CUIBOT TUNEL" ^(enlace publico^)
echo.
echo Para dejar de compartir, cierra la ventana "CUIBOT TUNEL".
echo El enlace cambia cada vez que se reinicia el tunel.
echo.
pause
exit /b 0
