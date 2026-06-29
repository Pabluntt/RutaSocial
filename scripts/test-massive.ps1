param(
  [switch]$SkipE2E,
  [switch]$SkipApiSmoke,
  [switch]$SkipRace
)

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot

function Run-Step($Name, $Command, $Workdir) {
  Write-Host "`n==> $Name" -ForegroundColor Cyan
  Push-Location $Workdir
  try {
    powershell -NoProfile -ExecutionPolicy Bypass -Command $Command
    if ($LASTEXITCODE -ne 0) { throw "$Name falló con código $LASTEXITCODE" }
  } finally {
    Pop-Location
  }
}

Run-Step "Backend go vet" "go vet ./..." "$root\Backend"
Run-Step "Backend go test" "go test ./... -count=1" "$root\Backend"
if (-not $SkipRace) {
  Run-Step "Backend go test race" "go test ./... -race -count=1" "$root\Backend"
}
Run-Step "Backend coverage" "go test ./... -coverprofile=coverage.out" "$root\Backend"

Run-Step "FrontendWeb typecheck" "npx tsc --noEmit" "$root\FrontendWeb"
Run-Step "FrontendWeb unit tests" "npm test" "$root\FrontendWeb"
Run-Step "FrontendWeb build" "npm run build" "$root\FrontendWeb"

Run-Step "FrontendMovil typecheck" "npx tsc --noEmit" "$root\FrontendMovil"

if (-not $SkipApiSmoke) {
  Run-Step "API smoke HTTP real" "node scripts/api-smoke.mjs" "$root"
}

if (-not $SkipE2E) {
  Run-Step "FrontendWeb Playwright E2E" "npx playwright test" "$root\FrontendWeb"
}

Write-Host "`nTesting masivo completado" -ForegroundColor Green
