$ErrorActionPreference = 'SilentlyContinue'

# Una sola instancia: si la tarea programada vuelve a lanzar el script mientras
# ya hay un vigilante activo, el nuevo termina de inmediato sin hacer nada.
$mutex = New-Object System.Threading.Mutex($false, 'Global\CUIBOT_MANTENER')
$soyUnico = $false
try {
  $soyUnico = $mutex.WaitOne(0)
}
catch [System.Threading.AbandonedMutexException] {
  $soyUnico = $true
}
if (-not $soyUnico) { exit 0 }

$root = Split-Path -Parent $PSScriptRoot
$nodeDir = "$env:LOCALAPPDATA\Programs\nodejs-portable\node-v26.13.1-win-x64"
if (Test-Path "$nodeDir\node.exe") { $env:PATH = "$nodeDir;$env:PATH" }
$cf = "$env:LOCALAPPDATA\CUIBOT\cloudflared.exe"
$tools = "$env:LOCALAPPDATA\CUIBOT"
$tunnelLog = "$tools\tunnel.log"
$apiLog = "$tools\api.log"
$urlFile = "$tools\url.txt"
$watchLog = "$tools\watchdog.log"
$mysqld = 'C:\xampp\mysql\bin\mysqld.exe'
$mysqlAdmin = 'C:\xampp\mysql\bin\mysqladmin.exe'
$mysqlClient = 'C:\xampp\mysql\bin\mysql.exe'

if (-not (Test-Path $tools)) { New-Item -ItemType Directory -Force -Path $tools | Out-Null }

function Write-Log($message) {
  $line = "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') $message"
  Add-Content -Path $watchLog -Value $line
  # Evita que el log crezca sin limite (rota a 1 MB).
  if ((Get-Item $watchLog -ErrorAction SilentlyContinue).Length -gt 1MB) {
    Move-Item $watchLog "$watchLog.old" -Force
  }
}

function Test-Api {
  try {
    $r = Invoke-RestMethod 'http://localhost:4000/api/salud' -TimeoutSec 4
    return [bool]$r.ok
  }
  catch {
    return $false
  }
}

function Test-MySql {
  # Una consulta real: verifica que el servidor responde Y que las credenciales
  # del backend siguen siendo validas (mysqladmin ping devuelve 0 aunque haya
  # error 1130 de host no permitido).
  $out = & $mysqlClient -u root -h 127.0.0.1 --protocol=TCP -N -B -e 'SELECT 1' 2>&1
  return ($LASTEXITCODE -eq 0 -and ($out -join '') -match '1')
}

function Stop-MySql {
  # Intenta cierre limpio; si no responde, fuerza el proceso.
  & $mysqlAdmin -u root -h 127.0.0.1 --protocol=TCP shutdown 2>$null | Out-Null
  for ($i = 0; $i -lt 10; $i++) {
    if (-not (Get-Process mysqld -ErrorAction SilentlyContinue)) { return }
    Start-Sleep -Seconds 1
  }
  Get-Process mysqld -ErrorAction SilentlyContinue | Stop-Process -Force
  Start-Sleep -Seconds 3
}

function Ensure-MySql {
  if (Test-MySql) { return $true }

  Write-Log 'MySQL no responde; reiniciando el servicio...'
  if (Get-Process mysqld -ErrorAction SilentlyContinue) {
    Write-Log 'Habia un proceso de MySQL colgado; se cierra antes de reiniciar.'
    Stop-MySql
  }

  if (Test-Path $mysqld) {
    Start-Process -FilePath $mysqld -ArgumentList '--defaults-file=C:\xampp\mysql\bin\my.ini', '--standalone' -WindowStyle Hidden
  }
  else {
    Write-Log 'No se encontro mysqld.exe en C:\xampp. MySQL debe iniciarse manualmente.'
    return $false
  }

  for ($i = 0; $i -lt 45; $i++) {
    Start-Sleep -Seconds 1
    if (Test-MySql) {
      Write-Log 'MySQL iniciado correctamente.'
      return $true
    }
  }

  Write-Log 'MySQL no respondio tras 45 s. Revisa C:\xampp\mysql\data\mysql_error.log.'
  return $false
}

function Ensure-Api {
  if (Test-Api) { return $true }
  if (-not (Test-MySql)) {
    Write-Log 'La API no se inicia porque MySQL no responde.'
    return $false
  }

  Write-Log 'API no responde; iniciando...'
  if (Test-Path $apiLog) { Move-Item $apiLog "$apiLog.old" -Force }
  Start-Process -FilePath 'node.exe' -ArgumentList 'src/index.js' `
    -WorkingDirectory (Join-Path $root 'server') -WindowStyle Hidden `
    -RedirectStandardOutput $apiLog -RedirectStandardError "$apiLog.err"

  for ($i = 0; $i -lt 40; $i++) {
    Start-Sleep -Seconds 1
    if (Test-Api) {
      Write-Log 'API iniciada correctamente.'
      return $true
    }
  }
  Write-Log "La API no respondio tras 40 s. Revisa $apiLog"
  return $false
}

function Ensure-Tunnel {
  if (Get-Process cloudflared -ErrorAction SilentlyContinue) { return $true }
  if (-not (Test-Api)) {
    Write-Log 'El tunel no se inicia porque la API no responde.'
    return $false
  }
  if (-not (Test-Path $cf)) {
    Write-Log "No se encontro cloudflared en $cf"
    return $false
  }

  Write-Log 'Tunel no esta corriendo; iniciando...'
  if (Test-Path $tunnelLog) { Move-Item $tunnelLog "$tunnelLog.old" -Force }
  Start-Process -FilePath $cf -ArgumentList 'tunnel', '--url', 'http://localhost:4000', '--no-autoupdate', '--protocol', 'http2', '--logfile', $tunnelLog -WindowStyle Hidden

  for ($i = 0; $i -lt 90; $i++) {
    Start-Sleep -Milliseconds 500
    if (Test-Path $tunnelLog) {
      $match = Select-String -Path $tunnelLog -Pattern 'https://[a-z0-9-]+\.trycloudflare\.com' | Select-Object -First 1
      if ($match) {
        $url = $match.Matches[0].Value
        Set-Content -Path $urlFile -Value $url -Encoding ASCII
        Write-Log "URL publica nueva: $url"
        return $true
      }
    }
  }
  Write-Log 'No se pudo obtener la URL del tunel.'
  return $false
}

Write-Log 'Watchdog CUIBOT iniciado.'
while ($true) {
  if (Ensure-MySql) {
    if (Ensure-Api) { Ensure-Tunnel | Out-Null }
  }
  Start-Sleep -Seconds 30
}
