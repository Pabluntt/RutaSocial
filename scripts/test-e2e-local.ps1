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
$backendContainerName = "rutasocial-e2e-backend-$PID"
$networkName = "rutasocial-e2e-$PID"
$backendImage = "rutasocial-backend-e2e:$PID"

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
  Write-Host "==> Creando red Docker temporal" -ForegroundColor Cyan
  docker network create $networkName | Out-Null

  Write-Host "==> Levantando Mongo temporal en Docker" -ForegroundColor Cyan
  docker run --rm -d --name $containerName --network $networkName --network-alias mongo -p "$MongoPort`:27017" mongo:latest | Out-Null
  if ($LASTEXITCODE -ne 0) { throw "No se pudo iniciar Mongo E2E en puerto $MongoPort" }
  Start-Sleep -Seconds 5

  Write-Host "==> Construyendo backend E2E" -ForegroundColor Cyan
  docker build -t $backendImage "$root\Backend" | Out-Host
  if ($LASTEXITCODE -ne 0) { throw "No se pudo construir imagen backend E2E" }

  Write-Host "==> Arrancando backend E2E" -ForegroundColor Cyan
  docker run --rm -d --name $backendContainerName --network $networkName -p "$BackendPort`:8080" `
    -e MONGODB_URI="mongodb://mongo:27017" `
    -e MONGODB_DB_NAME="rutasocial_e2e_$PID" `
    -e JWT_SECRET="e2e-local-secret-$PID" `
    -e ADMIN_EMAIL="$AdminEmail" `
    -e ADMIN_PASSWORD="$AdminPassword" `
    -e APP_ENV="test" `
    -e PORT="8080" `
    $backendImage | Out-Null
  if ($LASTEXITCODE -ne 0) { throw "No se pudo iniciar backend E2E en puerto $BackendPort" }

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
  try { docker rm -f $backendContainerName 2>$null | Out-Null } catch {}
  try { docker rm -f $containerName 2>$null | Out-Null } catch {}
  try { docker network rm $networkName 2>$null | Out-Null } catch {}
}
