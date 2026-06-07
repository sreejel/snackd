# SnackD Feedback — Google Sheet + Apps Script deploy
# Run in PowerShell from this folder after signing in as hello.snackd@gmail.com in your browser.

$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot

Write-Host "Installing clasp (Google Apps Script CLI)..." -ForegroundColor Cyan
npm install @google/clasp --no-save

$clasp = Join-Path $PSScriptRoot "node_modules\.bin\clasp.cmd"
if (-not (Test-Path $clasp)) { throw "clasp install failed" }

if (-not (Test-Path "$env:USERPROFILE\.clasprc.json")) {
  Write-Host ""
  Write-Host "Log in with hello.snackd@gmail.com when the browser opens..." -ForegroundColor Yellow
  & $clasp login
}

if (-not (Test-Path ".clasp.json")) {
  Write-Host "Creating Google Sheet + bound Apps Script project..." -ForegroundColor Cyan
  & $clasp create --type sheets --title "SnackD Feedback" --rootDir .
  & $clasp run setupSheet
}

Write-Host "Pushing Apps Script code..." -ForegroundColor Cyan
& $clasp push --force

Write-Host "Deploying web app..." -ForegroundColor Cyan
$deployJson = & $clasp deploy --description "SnackD feedback form" | Out-String
Write-Host $deployJson

$deployments = & $clasp deployments | Out-String
Write-Host $deployments

$scriptId = (Get-Content ".clasp.json" | ConvertFrom-Json).scriptId
$deploymentId = (($deployments -split "`n") | Where-Object { $_ -match "^\s*- " } | Select-Object -Last 1) -replace "^\s*- ","" -replace "@\d+.*",""
if ($deploymentId -match "@(\d+)") { $deploymentId = $Matches[1] }

$webAppUrl = "https://script.google.com/macros/s/$deploymentId/exec"
Write-Host ""
Write-Host "Web app URL:" -ForegroundColor Green
Write-Host $webAppUrl

$indexPath = Join-Path $PSScriptRoot "..\index.html"
$html = Get-Content $indexPath -Raw
$html = $html -replace "const SNACKD_FEEDBACK_ENDPOINT = '[^']*';", "const SNACKD_FEEDBACK_ENDPOINT = '$webAppUrl';"
Set-Content $indexPath $html -NoNewline

Write-Host "Updated index.html with SNACKD_FEEDBACK_ENDPOINT." -ForegroundColor Green
Write-Host "Open the linked spreadsheet from: https://script.google.com/home/projects/$scriptId/settings" -ForegroundColor Cyan
