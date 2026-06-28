param(
  [int]$MongoPort = 27018,
  [int]$BackendPort = 18080,
  [string]$AdminEmail = "e2e.admin@example.com",
  [string]$AdminPassword = "E2eAdmin123!",
  [switch]$SkipWeather
)

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$containerName = "rutasocial-e2e-mongo-$PID"
$backendOutLog = Join-Path $env:TEMP "rutasocial-backend-e2e-$PID.out.log"
$backendErrLog = Join-Path $env:TEMP "rutasocial-backend-e2e-$PID.err.log"
$backendProcess = $null

function Wait-Http($Url, $Seconds) {
  $deadline = (Get-Date).AddSeconds($Seconds)
  while ((Get-Date) -lt $deadline) {
    try {
      $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 3
      if ($response.StatusCode -ge 200 -and $response.StatusCode -lt 500) { return }
    } catch {}
    Start-Sleep -Seconds 1
  }
  throw "Timeout esperando $Url"
}

try {
  Write-Host "==> Levantando Mongo temporal en Docker" -ForegroundColor Cyan
  docker run --rm -d --name $containerName -p "$MongoPort`:27017" mongo:latest | Out-Null
  Start-Sleep -Seconds 5

  Write-Host "==> Arrancando backend E2E" -ForegroundColor Cyan
  $backendCommand = @"
`$env:MONGODB_URI='mongodb://localhost:$MongoPort';
`$env:MONGODB_DB_NAME='rutasocial_e2e_$PID';
`$env:JWT_SECRET='e2e-local-secret-$PID';
`$env:ADMIN_EMAIL='$AdminEmail';
`$env:ADMIN_PASSWORD='$AdminPassword';
`$env:APP_ENV='test';
`$env:PORT='$BackendPort';
go run ./cmd
"@
  $backendProcess = Start-Process powershell -WorkingDirectory "$root\Backend" -ArgumentList "-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", $backendCommand -RedirectStandardOutput $backendOutLog -RedirectStandardError $backendErrLog -PassThru

  Wait-Http "http://localhost:$BackendPort/swagger/index.html" 60

  Write-Host "==> Ejecutando API smoke real" -ForegroundColor Cyan
  $env:E2E_API_URL = "http://localhost:$BackendPort"
  $env:E2E_EMAIL = $AdminEmail
  $env:E2E_PASSWORD = $AdminPassword
  if ($SkipWeather) { $env:SMOKE_SKIP_WEATHER = '1' } else { Remove-Item Env:\SMOKE_SKIP_WEATHER -ErrorAction SilentlyContinue }
  node "$root\scripts\api-smoke.mjs"

  Write-Host "==> Ejecutando Playwright E2E real" -ForegroundColor Cyan
  Push-Location "$root\FrontendWeb"
  try {
    npx playwright test
    if ($LASTEXITCODE -ne 0) { throw "Playwright falló con código $LASTEXITCODE" }
  } finally {
    Pop-Location
  }

  Write-Host "`nE2E local real completado" -ForegroundColor Green
} finally {
  if ($backendProcess -and -not $backendProcess.HasExited) {
    Stop-Process -Id $backendProcess.Id -Force -ErrorAction SilentlyContinue
  }
  docker rm -f $containerName 2>$null | Out-Null
  Write-Host "Logs backend stdout: $backendOutLog" -ForegroundColor DarkGray
  Write-Host "Logs backend stderr: $backendErrLog" -ForegroundColor DarkGray
}
